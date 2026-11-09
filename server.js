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

// Serve client if built
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

// Helpers to read / write projects
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

// Helper: resolve URL path to local file path
function resolveToDisk(urlPath) {
  if (!urlPath) return null;
  const clean = urlPath.split('?')[0].replace(/^\//, '');
  if (clean.startsWith('projects-files/')) {
    const relative = clean.replace(/^projects-files\//, '');
    return path.join(DATA_DIR, relative);
  }
  return path.join(__dirname, clean);
}

// ======================== API ROUTES ========================

// 1. Get All Projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = [];
    if (fs.existsSync(DATA_DIR)) {
      const dirs = fs.readdirSync(DATA_DIR);
      for (const dir of dirs) {
        const projPath = path.join(DATA_DIR, dir, 'project-data.json');
        if (fs.existsSync(projPath)) {
          projects.push(JSON.parse(fs.readFileSync(projPath, 'utf8')));
        }
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
      paperSize: paperSize || 'US Letter, 8.5 × 11 inches',
      style: style || 'Pure black outlines, pure white background, thick lines, no grayscale',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cover: cover || {
        title: title || 'My Little Animal World',
        subtitle: 'A Fun Printable Coloring Experience For Kids Ages 4–8 years',
        author: 'ColoringBook Studio',
        coverImage: null,
        bgColor: '#fffbeb'
      },
      pages: pages || []
    };

    saveProject(id, newProject);
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Project by ID
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

// 7. AI Image Generation
app.post('/api/generate-ai-image', async (req, res) => {
  try {
    const { projectId, conceptPrompt } = req.body;
    
    const cleanPrompt = `black ink line art, coloring book sheet of ${conceptPrompt}, thick black contour outlines, clean empty white background, uncolored, line drawing, 2d cartoon stencil for kids to color in with crayons, white paper`;

    console.log(`🎨 Generating B&W line sheet for: "${conceptPrompt}"...`);

    const seed = Math.floor(Math.random() * 999999);
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

    await sharp(buffer)
      .grayscale()
      .linear(1.4, -40)
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

// 8. Quality Audit Verification
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

    // US Letter: 8.5 x 11 inches at 72 pt/in = 612 x 792 pt
    const PAGE_WIDTH = 612;
    const PAGE_HEIGHT = 792;
    const MARGIN = 36; // 0.5 inch margin

    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // ================= 1. COVER PAGE =================
    const coverPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: rgb(0.99, 0.98, 0.92)
    });

    const coverTitle = project.cover?.title || project.title;
    const titleFontSize = coverTitle.length > 32 ? 20 : 24;
    coverPage.drawText(coverTitle, {
      x: MARGIN,
      y: PAGE_HEIGHT - 80,
      size: titleFontSize,
      font: helveticaBold,
      color: rgb(0.12, 0.12, 0.12),
      maxWidth: PAGE_WIDTH - MARGIN * 2
    });

    if (project.cover?.subtitle) {
      coverPage.drawText(project.cover.subtitle, {
        x: MARGIN,
        y: PAGE_HEIGHT - 115,
        size: 13,
        font: helvetica,
        color: rgb(0.35, 0.35, 0.35),
        maxWidth: PAGE_WIDTH - MARGIN * 2
      });
    }

    // Embed Cover Image if available
    const coverImagePath = resolveToDisk(project.cover?.coverImage);
    if (coverImagePath && fs.existsSync(coverImagePath)) {
      console.log(`📘 Embedding Cover Image from: ${coverImagePath}`);
      const rawCoverBytes = fs.readFileSync(coverImagePath);
      const pngCoverBytes = await sharp(rawCoverBytes).png().toBuffer();
      const embeddedCover = await pdfDoc.embedPng(pngCoverBytes);

      const maxCoverW = PAGE_WIDTH - MARGIN * 2;
      const maxCoverH = PAGE_HEIGHT - 240;
      const scaledCover = embeddedCover.scaleToFit(maxCoverW, maxCoverH);

      coverPage.drawImage(embeddedCover, {
        x: (PAGE_WIDTH - scaledCover.width) / 2,
        y: (PAGE_HEIGHT - scaledCover.height) / 2 - 20,
        width: scaledCover.width,
        height: scaledCover.height
      });
    }

    if (project.cover?.author) {
      coverPage.drawText(`Created by ${project.cover.author}`, {
        x: MARGIN,
        y: 40,
        size: 11,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4)
      });
    }

    // ================= 2. COPYRIGHT NOTICE PAGE =================
    const noticePage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    noticePage.drawText(project.title, { 
      x: MARGIN, 
      y: PAGE_HEIGHT - 120, 
      size: 18, 
      font: helveticaBold 
    });
    noticePage.drawText('Printable Coloring Book Edition', { 
      x: MARGIN, 
      y: PAGE_HEIGHT - 145, 
      size: 13, 
      font: helvetica 
    });
    noticePage.drawText('All rights reserved. For personal and educational use only.', { 
      x: MARGIN, 
      y: PAGE_HEIGHT - 180, 
      size: 10, 
      font: helvetica 
    });
    noticePage.drawText('Recommended printing: 8.5 x 11 inches (US Letter) at 100% scale.', { 
      x: MARGIN, 
      y: PAGE_HEIGHT - 200, 
      size: 10, 
      font: helvetica 
    });

    // ================= 3. COLORING PAGES =================
    console.log(`📄 Compiling ${project.pages.length} coloring pages into PDF...`);

    for (let i = 0; i < project.pages.length; i++) {
      const pageData = project.pages[i];
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

      if (isPreview) {
        page.drawText('PREVIEW ONLY - NOT FOR RESALE', {
          x: 70,
          y: PAGE_HEIGHT / 2,
          size: 26,
          font: helveticaBold,
          color: rgb(0.88, 0.88, 0.88),
          rotate: { type: 'degrees', angle: 45 }
        });
      }

      const imgDiskPath = resolveToDisk(pageData.imageUrl);

      if (imgDiskPath && fs.existsSync(imgDiskPath)) {
        let rawBytes = fs.readFileSync(imgDiskPath);
        const cleanPngBytes = await sharp(rawBytes).png().toBuffer();
        const embeddedImg = await pdfDoc.embedPng(cleanPngBytes);

        const maxW = PAGE_WIDTH - MARGIN * 2;
        const maxH = PAGE_HEIGHT - MARGIN * 2 - 40;
        const scaled = embeddedImg.scaleToFit(maxW, maxH);

        page.drawImage(embeddedImg, {
          x: (PAGE_WIDTH - scaled.width) / 2,
          y: (PAGE_HEIGHT - scaled.height) / 2 + 10,
          width: scaled.width,
          height: scaled.height
        });
      }

      const footerNum = `${i + 1}`;
      page.drawText(footerNum, {
        x: PAGE_WIDTH / 2 - 4,
        y: 22,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5)
      });
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `${project.id}-${isPreview ? 'preview' : 'print-ready'}.pdf`;
    const exportPath = path.join(DATA_DIR, project.id, 'exports', filename);

    fs.writeFileSync(exportPath, pdfBytes);
    console.log(`✅ PDF successfully generated: ${filename}`);

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
    res.send('ColoringBook Studio Backend running.');
  }
});

// Listen on Port (Keeps Server Alive)
app.listen(PORT, () => {
  console.log(`🎨 ColoringBook Studio server listening on http://localhost:${PORT}`);
});