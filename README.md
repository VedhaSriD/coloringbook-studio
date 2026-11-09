# 🎨 ColoringBook Studio

> **A full-stack generative AI publishing platform engineered to design, process, and compile print-ready children's coloring books as instant digital download PDF products for Etsy.**

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/VedhaSriD/coloringbook-studio)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.3-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---


<img width="1907" height="907" alt="Screenshot 2026-11-09 190304" src="https://github.com/user-attachments/assets/e758bbc0-4a22-48e1-aa72-ab7eb7d39d2b" />
<img width="1905" height="906" alt="Screenshot 2026-11-09 185822" src="https://github.com/user-attachments/assets/b56592c6-c100-4276-8a8c-3516fe0d8b8c" />
<img width="1882" height="917" alt="Screenshot 2026-11-09 184447" src="https://github.com/user-attachments/assets/4d644b6c-1676-4a3c-b1f2-29a96f3f0892" />
<img width="1632" height="522" alt="image" src="https://github.com/user-attachments/assets/44afe671-fd15-4986-94fe-8174dc35f085" />
<img width="1641" height="821" alt="Screenshot 2026-11-09 184848" src="https://github.com/user-attachments/assets/0a41fdf1-2cb0-44e0-ab4b-a55fba26f529" />
<img width="1903" height="917" alt="Screenshot 2026-11-09 185759" src="https://github.com/user-attachments/assets/722e118a-b21b-4491-8f89-2ee6f5763e63" />






> 💡 **Reference Architecture & Practice Use-Case Notice**  
> This project was developed as an end-to-end full-stack **practice use-case and reference architecture**. It demonstrates how to automate content creation and media compilation into commercial digital products. Developers, designers, and entrepreneurs can take this repository as a working blueprint and foundational codebase to build their own digital printable SaaS, content engines, or automated Etsy fulfillment systems.

---

## 📌 Executive Overview

**ColoringBook Studio** solves the fragmented workflow of creating commercial digital printable products for platforms like Etsy. Instead of manually stitching together AI image generation tools, graphic design software, and desktop publishing suites, this application centralizes the entire lifecycle:

1. **Curated Concept Structuring:** Pre-loaded with a high-demand, age-appropriate 30-page theme (*"My Little Animal World"* for ages 4–8).
2. **AI Line-Art Generation:** Combines customized prompt formulas with server-side raster filtering to deliver bold, clean black marker outlines with hollow white coloring areas.
3. **Full-Color Cover Studio:** Dynamically renders vibrant, full-color front covers while keeping all interior coloring sheets strictly black-and-white.
4. **Print-Ready Document Compilation:** Generates standardized US Letter (8.5" × 11") PDFs with 0.5" print margins, aspect ratio preservation, and optional preview watermarking.
5. **Etsy Marketplace Kit:** Instant copy tools for high-ranking listing titles, 13 SEO search tags, formatted sales copy, and required AI policy disclosures.

---

## 🛍️ Built for the Etsy Digital Seller Workflow

```text
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│   1. Studio Setup       │ ────> │   2. Page Generation    │ ────> │   3. Color Cover        │
│   30 Animal Concept Grid│       │   Clean B&W Line Art    │       │   Branding & Typography │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
                                                                                 │
                                                                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│   6. Publish to Etsy    │ <──── │   5. Copy Listing Kit   │ <──── │   4. Export PDF         │
│   Instant Digital Sales │       │   13 Tags & Sales Copy  │       │   300 DPI US Letter     │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
Zero Physical Shipping: The finished product is a digital PDF delivered automatically by Etsy upon purchase.
Calibrated for Standard Printing: Sized for 8.5" × 11" paper so customers can print at 100% scale on home printers.
Turnkey Metadata: Includes 13 ready-to-use search tags to help listings rank in Etsy search.
🚀 Core Features
Automated Line-Art Engine: Generates clean contour illustrations designed specifically for children's crayons and markers (pure white backgrounds, no gray gradients, no dark fills).
Custom Cover Designer: Create a vibrant, full-color 8.5" × 11" front cover with custom titles, subtitles, and shop branding.
Pre-Flight Quality Audit: Automatically scans all pages prior to export, verifying image integrity, checking for duplicate prompts, and validating document layout.
Dual PDF Export Pipeline:
Full Print-Ready PDF: Lossless, uncompressed 300-DPI document ready to be uploaded directly as the Etsy download file.
Watermarked Preview PDF: Lightweight, diagonally watermarked copy for customer previews and social media mockups.
Resilient API Architecture: Built-in queue management, automatic retry logic with backoff, and local image upload fallbacks to prevent workflow interruptions.
🛠️ Tech Stack & Architecture
Layer	Technologies Used	Purpose
Frontend UI	React 18, Vite, Tailwind CSS	Responsive, fast component-driven client interface
Icons & UI Assets	Lucide React	Modern, lightweight iconography
Backend API	Node.js, Express	RESTful API, media routing, file system management
Document Engine	pdf-lib	Low-level, coordinate-exact PDF compilation
Image Processing	sharp (libvips)	Server-side raster conversion, grayscale normalization
File Handling	Multer	Secure multipart upload and file type validation
Data Storage	Local JSON Store	Self-contained, directory-based project persistence
📁 Project Organization
Text
coloringbook-studio/
├── .env.example               # Environment variables specification
├── package.json               # Backend dependency definitions & scripts
├── server.js                  # Express API, media pipeline & PDF engine
├── projects/                  # Persistent project assets & JSON storage
│   └── [project-id]/
│       ├── cover/             # Cover artwork assets
│       ├── illustrations/     # Processed line-art PNGs
│       ├── exports/           # Generated print & preview PDFs
│       └── project-data.json  # Complete book schema & page states
└── client/
    ├── index.html             # Vite SPA entry point
    ├── vite.config.js         # API proxy & build configuration
    ├── tailwind.config.js     # Design tokens & styling configuration
    └── src/
        ├── main.jsx           # React DOM root
        ├── App.jsx            # Application shell & state router
        ├── defaultConcepts.js # 30 curated educational coloring concepts
        └── components/
            ├── Dashboard.jsx        # Project overview & workspace manager
            ├── NewBookModal.jsx     # Wizard for project configuration
            ├── Studio.jsx           # Workspace canvas & page manager
            ├── CoverDesigner.jsx    # Live 8.5" x 11" cover art editor
            ├── QualityAudit.jsx     # Pre-flight check & PDF export engine
            ├── EtsyListingPrep.jsx  # SEO listing kit & tag generator
            └── ZoomModal.jsx        # Line-quality inspection viewer
⚡ Quickstart Guide
1. Prerequisites
Node.js (v18.0.0 or higher recommended)
npm (v9.0.0 or higher)
2. Installation
Clone the repository and install dependencies for both backend and client:
Bash
git clone https://github.com/VedhaSriD/coloringbook-studio.git
cd coloringbook-studio

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
3. Environment Setup
Create a .env file in the root directory:
Bash
cp .env.example .env
Ensure your .env contains:
Env
PORT=5000
4. Running the Studio
Run both the backend server and frontend client in separate terminals:
Terminal 1 (Backend Server):
Bash
node server.js
# Runs on http://localhost:5000
Terminal 2 (Frontend Client):
Bash
cd client
npm run dev
# Runs on http://localhost:3000
Open http://localhost:3000 in your browser.
🔌 API Reference
Method	Endpoint	Description
GET	/api/projects	Fetch all existing coloring book projects
POST	/api/projects	Initialize a new project schema with 30 page slots
GET	/api/projects/:id	Retrieve project details and page states
PUT	/api/projects/:id	Update project metadata, page ordering, or cover
DELETE	/api/projects/:id	Delete project and remove all associated disk assets
POST	/api/upload	Multipart upload for custom user line-art files
POST	/api/generate-ai-image	Generate a black-and-white coloring page via AI
POST	/api/projects/:id/audit	Execute pre-flight validation on pages and cover
POST	/api/projects/:id/export-pdf	Compile 30-page Print-Ready or Preview PDF
🛡️ License
This project is licensed under the MIT License — feel free to use it as a reference, customize it, or build upon it for your own projects.
👩‍💻 Author
Built by VedhaSriD
GitHub: @VedhaSriD
