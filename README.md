# 🗂️ FINDATHON — DedupeIQ

> **A smart cleaner for your computer that finds files which are exactly the same or almost the same, tells you which copy is best, and helps you safely remove unnecessary copies.**

---

## 📖 What is this?

Think of your computer like a messy bedroom. Over time you accumulate:

```
photo.jpg
photo_copy.jpg
photo_whatsapp.jpg
photo_small.jpg
report.docx
report_final.docx
report_final2.pdf
```

Most of these are basically **the same thing** with small differences — a resize, a compression, a re-export. Ordinary duplicate finders only catch *exact* copies (same bytes). **DedupeIQ goes further**: it looks *inside* files and understands what they actually contain.

---

## 🧠 How it works

**You give it a folder. It asks for every file:**

> *"Have I seen something almost the same as this before?"*

For images, it compares **what the image looks like** (perceptual fingerprints). For documents, it compares **what the document says** (text embeddings + n-gram similarity). So even when:

```
hello.docx  →  submission.pdf
```

...the system understands: *"These contain almost the same information."*

### The 4-Stage Pipeline

```
Stage 1: SHA-256 Exact Match        → byte-for-byte identical files
Stage 2: Perceptual Hash (pHash)    → visually similar images (resized, compressed, cropped)
Stage 3: Text Embedding + N-Gram    → semantically similar documents (DOCX ↔ PDF ↔ TXT)
Stage 4: Louvain Graph Clustering   → groups everything, picks the best master copy
```

---

## 🖼️ Photo Example

Given:
```
Original.jpg      5 MB   ← full resolution, original EXIF
WhatsApp.jpg    500 KB   ← WhatsApp compression
Small.jpg       200 KB   ← resized thumbnail
```

DedupeIQ groups them and says:

```
📸 Duplicate Group — "Summer Trip Photo"
Similarity: 97%

★ KEEP   Original.jpg     (5 MB)   — Highest resolution, original metadata
  REMOVE WhatsApp.jpg   (500 KB)   — WhatsApp compressed copy
  REMOVE Small.jpg      (200 KB)   — Resized thumbnail

💾 Recoverable: 700 KB
```

---

## 📄 Document Example

Given:
```
assignment.docx
assignment_final.docx
assignment_final2.docx
assignment_submission.pdf
```

DedupeIQ finds the version chain:

```
assignment.docx  →  assignment_final.docx  →  assignment_final2.docx  →  assignment_submission.pdf
     v1                   v2                         v3                        PDF export

★ KEEP: assignment_final2.docx
  WHY:  Most content, newest changes, all info from earlier drafts preserved
```

---

## ✨ Key Features

| Feature | What it does |
|---|---|
| **Perceptual Image Hashing** | pHash + dHash detect visually similar photos even after resize, crop, or WhatsApp compression |
| **Cross-Format Document NLP** | Compares DOCX, PDF, TXT, Markdown regardless of file format |
| **Louvain Graph Communities** | Groups files into duplicate clusters using graph theory |
| **Master Copy Recommendation** | Explains *why* one file is better (quality, size, recency, content coverage) |
| **File Version Lineage** | Shows the chain: v1 → v2 → final → PDF export |
| **Safe Quarantine** | Files are *never* deleted automatically — moved to a 30-day soft staging area |
| **One-Click Restore** | Any quarantined file can be restored instantly |
| **Per-User Workspaces** | Each account has isolated scan history, groups, and quarantine |
| **Real-Time Progress** | Live scan progress with 4-stage pipeline status |

---

## 🖥️ Tech Stack

### Backend
- **Python / Flask** — REST API server
- **MongoDB** — stores scan records, duplicate groups, quarantine entries
- **imagehash** — perceptual image fingerprinting (pHash, dHash, wHash)
- **python-docx / pdfminer** — document text extraction
- **scikit-learn / networkx** — cosine similarity + Louvain graph clustering
- **Celery / threading** — async background scan workers

### Frontend
- **React 18 + TypeScript** — component architecture
- **Vite** — build tooling
- **TailwindCSS** — utility-first styling
- **Framer Motion** — animations and transitions
- **TanStack Query** — server state management and caching
- **Recharts** — storage breakdown visualizations
- **Lucide React** — icons

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env          # add your MONGO_URI
python run.py                 # starts on http://localhost:5000
```

### Frontend Setup
```bash
npm install
npm run dev                   # starts on http://localhost:5173
```

### Demo Accounts
| Email | Password | Role |
|---|---|---|
| `alex.morgan@workspace.io` | `password123` | Admin (full dataset) |
| `jordan.lee@storage.dev` | `analyst2026` | Analyst (full dataset) |
| Any new email | Any password | Fresh isolated workspace |

---

## 📁 Project Structure

```
FINDATHON/
├── backend/
│   ├── app/
│   │   ├── routes/       # Flask API endpoints
│   │   ├── services/     # hashing, scanning, similarity, quarantine
│   │   ├── repositories/ # MongoDB store layer
│   │   └── models.py     # data models
│   └── run.py
├── src/
│   ├── pages/            # React page components
│   ├── components/       # shared UI + modals
│   ├── lib/              # API client, utils
│   ├── context/          # auth context
│   └── types.ts          # TypeScript interfaces
└── README.md
```

---

## 🔒 Privacy & Safety

- **100% on-device** — no files leave your machine, ever
- **No telemetry** — zero analytics or tracking
- **Non-destructive** — quarantine is a soft staging area, never a permanent delete
- **Encrypted metadata** — file hashes and embeddings stored locally

---

## 💡 The One-Line Summary

> **Input:** messy folder → **Brain:** intelligent multi-modal file comparison → **Output:** grouped duplicates + best copy recommendation + storage freed

---

*Built for FINDATHON Hackathon — because your storage deserves better.*
