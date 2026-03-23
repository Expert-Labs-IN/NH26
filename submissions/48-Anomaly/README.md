# 🔍 DocNerve — AI Forensic Document Intelligence

> "Other tools summarize documents. We interrogate them."

DocNerve is an AI-powered forensic auditing system that investigates document collections — finding contradictions between documents, detecting missing workflow steps, and surfacing entities that are suspiciously absent.

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd docnerve/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Or just run: `start_backend.bat`

### 2. Frontend Setup

```bash
cd docnerve/frontend
npm install
npm run dev
```

Or just run: `start_frontend.bat`

### 3. Open the app

Navigate to: **http://localhost:5173**

---

## 📁 Project Structure

```
docnerve/
├── backend/
│   ├── main.py                  ← FastAPI app + routes
│   ├── config.py                ← Model paths, thresholds
│   ├── store.py                 ← In-memory job store
│   ├── requirements.txt
│   ├── pipeline/
│   │   ├── orchestrator.py      ← Master pipeline runner
│   │   ├── preprocessor.py      ← Step 0: OpenCV + PyMuPDF
│   │   ├── parser.py            ← Step 1: Docling
│   │   ├── classifier.py        ← Step 2: Phi-4-mini
│   │   ├── extractor.py         ← Step 3: NuExtract 2.0
│   │   ├── graph_builder.py     ← Step 4: Doc graph
│   │   ├── contradiction.py     ← Step 5: Rules + NLI
│   │   ├── chain_detector.py    ← Step 6: Missing chains
│   │   ├── ghost_detector.py    ← Step 7: Ghost entities
│   │   ├── trust_scorer.py      ← Step 8: Trust heuristics
│   │   └── reasoner.py          ← Step 9: Phi-4-mini report
│   ├── models/
│   │   └── router.py            ← LLM VRAM manager
│   ├── schemas/
│   │   └── document_schemas.py  ← NuExtract schemas per doc type
│   └── utils/
│       ├── parsers.py           ← parse_amount, parse_date, etc.
│       └── report_generator.py  ← reportlab PDF export
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── UploadPage.tsx   ← Upload + processing screen
│       │   └── ResultsPage.tsx  ← Results dashboard
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── FindingsView.tsx ← Contradictions, chains, ghosts, trust
│       │   ├── TimelineView.tsx ← Chronological event timeline
│       │   └── DocumentsView.tsx← Per-document detail view
│       ├── api/client.ts        ← Axios API calls
│       ├── hooks/useJobPolling.ts
│       ├── types/index.ts       ← All TypeScript types
│       └── lib/utils.ts         ← Helper functions
├── sample_docs/                 ← Put your 8 demo PDFs here
├── .env                         ← Model paths config
└── models/ → ../../models/      ← Points to root models/ folder
```

---

## 🤖 AI Models Used

| Model | Role | VRAM |
|---|---|---|
| Docling | Document parsing + OCR | ~2GB (evicted after) |
| Phi-4-mini 3.8B Q4_K_M | Classification + Reasoning | ~3GB (evicted after each use) |
| NuExtract 2.0 2B Q4_K_M | Structured field extraction | ~1.5GB (evicted after) |
| DeBERTa v3 small | NLI contradiction detection | CPU only, ~180MB RAM |

**Max VRAM at any point: 3GB** — runs comfortably on RTX 4060 8GB.

---

## 🎯 Features

1. **⚡ Cross-Document Contradiction Detector** — Amount mismatches, date conflicts, semantic disagreements
2. **🔗 Missing Document Chain Detector** — Gaps in procurement workflows (missing GRN, no approval, etc.)
3. **👻 Ghost Entity Detection** — People/orgs suspiciously absent from document series
4. **🛡️ Document Trust Scorer** — 0-100 score with explainable signals per document
5. **📅 Timeline View** — Auto-reconstructed chronological event view
6. **📄 PDF Report Export** — Professional forensic investigation report

---

*DocNerve v1.0 — Built for National Hackathon P2 | March 2026*
*"Your documents have secrets. We find them."*
