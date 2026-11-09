const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const sharp = require('sharp');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Base directories
const DATA_DIR = path.join(__dirname, 'projects');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Serve static project files
app.use('/projects-files', express.static(DATA_DIR));

// Serve client in production
if (fs.existsSync(path.join(__dirname, 'client/dist'))) {
  app.use(express.static(path.join(__dirname, 'client/dist')));
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { projectId, subfolder } = req.body;
    const dest = path.join(DATA_DIR, projectId || 'temp', subfolder || 'illustrations');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = `${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
    cb(null, cleanName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only PNG, JPG, or WEBP images are allowed!'));
  }
});

// Helper: Read / Write Project Data
function getProjectFilePath(projectId) {
  return path.join(DATA_DIR, projectId, 'project-data.json');
}

function loadProject(projectId) {
  const p = getProjectFilePath(projectId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveProject(projectId, data) {
  const projDir = path.join(DATA_DIR, projectId);
  fs.mkdirSync(projDir, { recursive: true });
  fs.writeFileSync(getProjectFilePath(projectId), JSON.stringify(data, null, 2), 'utf8');
}

// ======================== API ROUTES ========================

// 1. Get All Projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = [];
    const dirs = fs.readdirSync(DATA_DIR);
    for (const dir of dirs) {
      const projPath = path.join(DATA_DIR, dir, 'project-data.json');
      if (fs.existsSync(projPath)) {
        projects.push(JSON.parse(fs.readFileSync(projPath, 'utf8')));
      }
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Project
app.post('/api/projects', (req, res) => {
  try {
    const { id, title, theme, targetAge, pageCount, paperSize, style, pages, cover } = req.body;
    const projDir = path.join(DATA_DIR, id);
    ['cover', 'illustrations', 'previews', 'exports'].forEach(sub => {
      fs.mkdirSync(path.join(projDir, sub), { recursive: true });
    });

    const newProject = {
      id,
      title: title || 'Untitled Coloring Book',
      theme: theme || 'Cute Animals and Nature',
      targetAge: targetAge || '4-8 years',
      pageCount: pageCount || 30,
      paperSize: paperSize || 'US Letter (8.5 x 11 inches)',
      style: style || 'Clean thick outlines, pure black and white cartoon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cover: cover || {
        title: title || 'My Little Animal World',
        subtitle: 'A Cute Animals Coloring Book for Kids Ages 4-8',
        author: 'ColoringBook Studio',
        coverImage: null,
        bgColor: '#fef08a',
        textColor: '#1f2937'
      },
      pages: pages || []
    };

    saveProject(id, newProject);
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Project
app.get('/api/projects/:id', (req, res) => {
  const project = loadProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// 4. Update Project
app.put('/api/projects/:id', (req, res) => {
  try {
    const project = loadProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const updated = { ...project, ...req.body, updatedAt: new Date().toISOString() };
    saveProject(req.params.id, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const projDir = path.join(DATA_DIR, req.params.id);
    if (fs.existsSync(projDir)) {
      fs.rmSync(projDir, { recursive: true, force: true });
    }
    res.json({ success: true, message: 'Project removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Direct File Upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const { projectId, subfolder } = req.body;
    const fileUrl = `/projects-files/${projectId}/${subfolder || 'illustrations'}/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 7. AI Image Generation (Enforced Black & White Coloring Sheets)
app.post('/api/generate-ai-image', async (req, res) => {
  try {
    const { projectId, conceptPrompt } = req.body;
    
    // Prompt formula specifically targeting black ink lines on white paper
    const cleanPrompt = `black ink line art, coloring book sheet of ${conceptPrompt}, thick black contour outlines, clean empty white background, uncolored, line drawing, 2d cartoon stencil for kids to color in with crayons, white paper`;

    console.log(`🎨 Generating B&W line sheet for: "${conceptPrompt}"...`);

    const seed = Math.floor(Math.random() * 999999);
    // Add negative filter to stop color, dark backgrounds, and 3d renders
    const freeUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=768&height=1024&seed=${seed}&nologo=true&negative=color,colors,green,red,yellow,blue,dark background,black background,shading,realistic,photo,render`;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let buffer = null;
    let attempts = 0;

    while (attempts < 3) {
      const response = await fetch(freeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*'
        }
      });

      if (response.status === 402) {
        attempts++;
        console.log(`⏳ Server busy (402). Waiting 10s (Attempt ${attempts}/3)...`);
        await sleep(10000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Generation server returned status ${response.status}`);
      }

      buffer = Buffer.from(await response.arrayBuffer());
      break;
    }

    if (!buffer) {
      return res.status(429).json({
        error: 'Server is busy. Please wait 15 seconds and try again.'
      });
    }

    const filename = `page-${Date.now()}.png`;
    const destDir = path.join(DATA_DIR, projectId, 'illustrations');
    fs.mkdirSync(destDir, { recursive: true });
    const localPath = path.join(destDir, filename);

    // Enforce pure black and white & boost contrast to blow out any background tones to white
    await sharp(buffer)
      .grayscale() // Completely removes all green, yellow, and colors
      .linear(1.4, -40) // Makes dark outlines darker and light background pure white
      .toFormat('png')
      .toFile(localPath);

    console.log(`✅ Saved B&W coloring sheet: ${filename}`);

    res.json({
      success: true,
      url: `/projects-files/${projectId}/illustrations/${filename}`,
      filename
    });
  } catch (err) {
    console.error('AI Generation Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Quality Audit Verification Endpoint
app.post('/api/projects/:id/audit', async (req, res) => {
  try {
    const project = loadProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const issues = [];
    const missingPages = [];
    const duplicateMap = {};

    project.pages.forEach((p, idx) => {
      if (!p.imageUrl) {
        missingPages.push(p.pageNumber || idx + 1);
      }
      if (duplicateMap[p.concept]) {
        issues.push(`Duplicate concept found on page ${idx + 1}: "${p.concept}"`);
      } else {
        duplicateMap[p.concept] = true;
      }
    });

    if (missingPages.length > 0) {
      issues.push(`Missing illustrations on pages: ${missingPages.join(', ')}.`);
    }

    if (!project.cover?.coverImage) {
      issues.push('The cover does not have an assigned cover illustration image.');
    }

    res.json({
      passed: issues.length === 0,
      issues,
      totalPages: project.pages.length,
      completedPages: project.pages.filter(p => !!p.imageUrl).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Generate High-Res PDF & Low-Res Preview PDF
app.post('/api/projects/:id/export-pdf', async (req, res) => {
  try {
    const { isPreview = false } = req.body;
    const project = loadProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // US Letter: 8.5 x 11 inches at 72 pt/inch = 612 x 792 pt
    const PAGE_WIDTH = 612;
    const PAGE_HEIGHT = 792;
    const MARGIN = 36; // 0.5 inch safety margin

    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 1. COVER PAGE
    const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    // Draw optional cover background color
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: rgb(0.99, 0.96, 0.89) // soft gentle cream
    });

    // Cover Title
    coverPage.drawText(project.cover.title || project.title, {
      x: MARGIN,
      y: PAGE_HEIGHT - 90,
      size: 28,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1)
    });

    // Cover Subtitle
    if (project.cover.subtitle) {
      coverPage.drawText(project.cover.subtitle, {
        x: MARGIN,
        y: PAGE_HEIGHT - 125,
        size: 15,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3)
      });
    }

    // Cover Image if provided
    if (project.cover.coverImage) {
      const coverImgPath = path.join(__dirname, project.cover.coverImage.replace(/^\//, ''));
      if (fs.existsSync(coverImgPath)) {
        const imgBytes = fs.readFileSync(coverImgPath);
        const embeddedImg = coverImgPath.endsWith('.png') ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);

        const imgDim = embeddedImg.scaleToFit(PAGE_WIDTH - MARGIN * 2, PAGE_HEIGHT - 260);
        coverPage.drawImage(embeddedImg, {
          x: (PAGE_WIDTH - imgDim.width) / 2,
          y: (PAGE_HEIGHT - imgDim.height) / 2 - 20,
          width: imgDim.width,
          height: imgDim.height
        });
      }
    }

    // Author / Brand
    if (project.cover.author) {
      coverPage.drawText(`Created by ${project.cover.author}`, {
        x: MARGIN,
        y: 45,
        size: 12,
        font: helvetica,
        color: rgb(0.35, 0.35, 0.35)
      });
    }

    // 2. COPYRIGHT & PRINTING NOTICE PAGE
    const noticePage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    noticePage.drawText(project.title, { x: MARGIN, y: PAGE_HEIGHT - 120, size: 20, font: helveticaBold });
    noticePage.drawText('Printable Coloring Book Edition', { x: MARGIN, y: PAGE_HEIGHT - 145, size: 13, font: helvetica });
    noticePage.drawText('All rights reserved. For personal and educational use only.', { x: MARGIN, y: PAGE_HEIGHT - 180, size: 10, font: helvetica });
    noticePage.drawText('Recommended printing: 8.5 x 11 inches (US Letter) at 100% scale.', { x: MARGIN, y: PAGE_HEIGHT - 200, size: 10, font: helvetica });

    // 3. COLORING PAGES
    for (let i = 0; i < project.pages.length; i++) {
      const pageData = project.pages[i];
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

      // If user requested preview low-res watermark
      if (isPreview) {
        page.drawText('PREVIEW ONLY - NOT FOR RESALE', {
          x: MARGIN + 40,
          y: PAGE_HEIGHT / 2,
          size: 26,
          font: helveticaBold,
          color: rgb(0.85, 0.85, 0.85),
          rotate: { type: 'degrees', angle: 45 }
        });
      }

      if (pageData.imageUrl) {
        const relPath = pageData.imageUrl.replace(/^\//, '');
        const fullImgPath = path.join(__dirname, relPath);

        if (fs.existsSync(fullImgPath)) {
          let imgBytes = fs.readFileSync(fullImgPath);

          // If low-res preview, optimize size
          if (isPreview) {
            imgBytes = await sharp(imgBytes).resize(800).jpeg({ quality: 60 }).toBuffer();
          }

          const embedded = fullImgPath.endsWith('.png') && !isPreview ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);

          // Maintain portrait aspect ratio without distortion
          const maxW = PAGE_WIDTH - MARGIN * 2;
          const maxH = PAGE_HEIGHT - MARGIN * 2 - 30; // Leave room for caption/page num
          const scaled = embedded.scaleToFit(maxW, maxH);

          page.drawImage(embedded, {
            x: (PAGE_WIDTH - scaled.width) / 2,
            y: (PAGE_HEIGHT - scaled.height) / 2 + 10,
            width: scaled.width,
            height: scaled.height
          });
        }
      }

      // Page Number Footer
      const footerText = `${i + 1}`;
      page.drawText(footerText, {
        x: PAGE_WIDTH / 2 - 4,
        y: 25,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5)
      });
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `${project.id}-${isPreview ? 'preview' : 'print-ready'}.pdf`;
    const exportPath = path.join(DATA_DIR, project.id, 'exports', filename);

    fs.writeFileSync(exportPath, pdfBytes);

    res.json({
      success: true,
      downloadUrl: `/projects-files/${project.id}/exports/${filename}`,
      filename
    });
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ error: 'PDF generation failed: ' + err.message });
  }
});

// Root fallback for Vite client
app.get('*', (req, res) => {
  const indexFile = path.join(__dirname, 'client/dist/index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.send('ColoringBook Studio Backend running. Run Vite frontend in /client or run npm run dev:client');
  }
});

app.listen(PORT, () => {
  console.log(`🎨 ColoringBook Studio server listening on http://localhost:${PORT}`);
});