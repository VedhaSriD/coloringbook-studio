# 🎨 ColoringBook Studio

> **A full-stack generative AI publishing platform engineered to design, process, and compile print-ready children's coloring books as instant digital download PDF products for Etsy.**

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/VedhaSriD/coloringbook-studio)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.3-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

> 💡 **Project Scope & Reference Notice:**  
> This project was developed as an end-to-end full-stack **practice use-case and reference architecture**. It serves as a working blueprint and foundational codebase for developers, designers, and entrepreneurs looking to build automated digital printable generators, SaaS content pipelines, or e-commerce automation systems. You are welcome to fork, customize, and use this codebase as a technical reference for your own commercial products.

---

<img width="1907" height="907" alt="Screenshot 2026-11-09 190304" src="https://github.com/user-attachments/assets/e758bbc0-4a22-48e1-aa72-ab7eb7d39d2b" />
<img width="1905" height="906" alt="Screenshot 2026-11-09 185822" src="https://github.com/user-attachments/assets/b56592c6-c100-4276-8a8c-3516fe0d8b8c" />
<img width="1882" height="917" alt="Screenshot 2026-11-09 184447" src="https://github.com/user-attachments/assets/4d644b6c-1676-4a3c-b1f2-29a96f3f0892" />
<img width="1632" height="522" alt="image" src="https://github.com/user-attachments/assets/44afe671-fd15-4986-94fe-8174dc35f085" />
<img width="1641" height="821" alt="Screenshot 2026-11-09 184848" src="https://github.com/user-attachments/assets/0a41fdf1-2cb0-44e0-ab4b-a55fba26f529" />
<img width="1903" height="917" alt="Screenshot 2026-11-09 185759" src="https://github.com/user-attachments/assets/722e118a-b21b-4491-8f89-2ee6f5763e63" />






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
│   Automated Delivery    │       │   13 Tags & Sales Copy  │       │   300 DPI US Letter     │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
