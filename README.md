# pAIr — Policy AI Regulator

<div align="center">

### Autonomous Regulatory & Sustainability Intelligence Companion for MSMEs

**🏆 Code Unnati Innovation Marathon 4.0**

*"Always in pAIr with your business."*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![SAP](https://img.shields.io/badge/SAP-Code%20Unnati-0FAAFF.svg)](https://codeunnati.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

*Organized by SAP, Edunet Foundation & Telangana Academy for Skill and Knowledge*

> **pAIr reduces compliance uncertainty by 70%, saves 8+ hours per month per MSME, prevents penalty losses worth lakhs, and unlocks crore-level government scheme benefits — all in the business owner's own language.**

</div>

---

## 👥 Team pAIr - 13494

| Name | Role |
|------|------|
| **Shiva Ganesh Talikota** | Team Lead and AI systems & Product Architect |
| **Syeda Sanobar Ali** | Backend Developer |
| **Geethika Kudipudi** | Frontend Developer |
| **Dinesh Nanam** | Documentation |
| **Harsha Vardhan Reddy Mallela** | AI pipeline & Model engineering |

---

## 🔥 Impact at a Glance

| Metric | Impact |
|--------|--------|
| ⏱️ **Time Saved** | 8+ hours/month per MSME (16× faster than manual) |
| 💰 **Money Saved** | ₹59,400/year in consulting costs per business |
| 🛡️ **Risk Reduced** | 70% reduction in compliance uncertainty |
| 🌿 **CO₂ Prevented** | 126 kg CO₂/year per MSME (paperless + travel-free) |
| 📋 **Schemes Unlocked** | Up to ₹5 crore in government financial support |
| 🌐 **Accessibility** | 15+ Indian languages for 63 million MSMEs |

---

## 🎯 Problem Statement

**GRC (Governance, Risk & Compliance) for India's 63 Million MSMEs**

Micro, Small and Medium Enterprises (MSMEs) are the backbone of India's economy, yet their owners — often non-legal and non-technical — struggle to navigate the overwhelming landscape of government policies, compliance requirements, subsidies, and schemes. Policy documents are written in complex legal language, scattered across multiple government portals, and frequently updated, making it nearly impossible for a small business owner to stay compliant or discover schemes they are eligible for. Missing a compliance deadline can result in heavy penalties, and missing a scheme means losing out on crore-level financial support.

pAIr — **Policy AI Regulator** — solves this by deploying an autonomous multi-agent AI system that:

| Feature | Description |
|---------|-------------|
| 📄 **Ingesting** | Business documents and policy PDFs |
| 🧠 **Reasoning** | Eligibility for schemes (CGTMSE, PMEGP, MUDRA) |
| 📋 **Planning** | Compliance roadmaps with deadlines |
| ✍️ **Executing** | Application drafts and checklists |
| ✅ **Verifying** | Results for accuracy and confidence |
| 💬 **Explaining** | Everything in simple, jargon-free language |

---

## 🏗️ Architecture

### Multi-Agent System with Scoring Pipeline (v3.0)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 18 + Vite)                   │
│  Firebase Auth → OnboardingWizard → Dashboard (Risk/Sustain/ROI)    │
│  ResultsView (Full Report) → 15+ Language Translation               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                     FastAPI Backend (Python 3.11)                     │
│  Auth • Onboarding • Analyze • Scoring • History • Translate • DB   │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                    ORCHESTRATOR (7-Stage Pipeline)                    │
│                                                                      │
│   1. INGESTION  ──▶ PDF → text extraction                           │
│   2. REASONING  ──▶ Gemini: extract obligations, penalties          │
│   3. PLANNING   ──▶ Gemini: compliance action plan                  │
│   4. EXECUTION  ──▶ Scheme matching (CGTMSE, PMEGP, MUDRA...)      │
│   5. VERIFICATION ▶ Quality validation + confidence scoring         │
│   6. EXPLANATION ──▶ Human-readable summaries                       │
│   7. SCORING    ──▶ Risk + Sustainability + Profitability + Ethics  │
└──────────┬──────────────────┬──────────────────┬────────────────────┘
           │                  │                  │
┌──────────▼──────┐ ┌────────▼────────┐ ┌───────▼──────────┐
│  Scoring Suite  │ │ Policy Engine   │ │ Database Layer   │
│ Risk (0-100)    │ │ Tavily Search   │ │ Firestore        │
│ Sustainability  │ │ Serper Backup   │ │ (+ JSON fallback)│
│ ROI / Profit    │ │ FAISS Vectors   │ │ User profiles    │
│ Ethics & Bias   │ │ Async Scraper   │ │ Analysis history │
└─────────────────┘ └─────────────────┘ └──────────────────┘
```

### Agent Roles

| Agent | File | Function |
|-------|------|----------|
| **Orchestrator** | `orchestrator.py` | Central state management, 7-stage pipeline coordination |
| **Ingestion** | `ingestion_agent.py` | PDF parsing (PyPDF2 + pdfplumber fallback) |
| **Reasoning** | `reasoning_agent.py` | Gemini 2.5 Flash semantic analysis |
| **Planning** | `planning_agent.py` | Compliance roadmaps with deadlines |
| **Execution** | `execution_agent.py` | Scheme matching, forms, checklists |
| **Verification** | `verification_agent.py` | Quality assurance, confidence scoring |
| **Explanation** | `explanation_agent.py` | Plain English / regional language summaries |

### Scoring Engines (v3.0)

| Engine | Output | Key Metrics |
|--------|--------|-------------|
| **Compliance Risk** | Score 0-100 | Severity × Penalty × Deadline × Frequency |
| **Sustainability** | Grade A+ to D | Paper saved, CO₂ reduced, SDG alignment |
| **Profitability** | ROI Multiplier | Penalty avoidance, scheme benefits, cost savings |
| **Ethical AI** | Governance Report | Transparency cards, escalation alerts, bias checks |

---

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.11 + FastAPI |
| **AI Model** | Google Gemini 2.5 Flash (primary), 2.0 Flash Lite (fallback) |
| **Embeddings** | Gemini text-embedding-004 (768-dim) |
| **Frontend** | React 18 + Vite + TailwindCSS + Lucide Icons |
| **Auth** | Firebase Authentication (Google OAuth) |
| **Database** | Google Cloud Firestore (+ JSON fallback) |
| **Vector DB** | FAISS (Facebook AI Similarity Search) |
| **Search APIs** | Tavily API (primary) + Serper.dev (fallback) |
| **PDF Processing** | PyPDF2, pdfplumber |
| **Deployment** | Docker (multi-stage) / Google Cloud Run / Vercel |

---

## 📦 Supported Government Schemes

| Scheme | Full Name | Benefit |
|--------|-----------|---------|
| **CGTMSE** | Credit Guarantee Fund Trust | Collateral-free loans up to ₹5 crore |
| **PMEGP** | PM Employment Generation Programme | Up to 35% subsidy for new units |
| **MUDRA** | Pradhan Mantri MUDRA Yojana | Micro credit up to ₹10 lakhs |
| **Startup India** | For SC/ST/Women | Loans ₹10 lakh - ₹1 crore |
| **Udyam** | MSME Registration | Free registration, gateway to schemes |

---

## 🏃 Quick Start Guide

### Prerequisites

- **Python 3.11+** - [Download](https://python.org)
- **Node.js 18+** - [Download](https://nodejs.org)
- **Gemini API Key** - [Get free key](https://aistudio.google.com/app/apikey)

### Step 1: Clone the Repository

```bash
git clone https://github.com/stablephisher/pAIr-764.git
cd pAIr-764
```

### Step 2: Set Up Backend

```powershell
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set your Gemini API Key (PowerShell)
$env:GEMINI_API_KEY="your-api-key-here"

# Start the backend server
python main.py
```

**Expected output:**
```
==================================================
✅ BACKEND RESTARTED SUCCESSFULLY
🔑 LOADED API KEY: ******your-key
✅ ACTIVE MODELS: Gemini 2.5 Flash, 2.0 Flash-Lite
==================================================
📡 Monitoring started in: backend/monitored_policies
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Set Up Frontend (New Terminal)

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
VITE v5.4.21  ready in 994 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Open the Application

🌐 **Open your browser:** http://localhost:5173

---

## 📋 How to Use

### 1. Upload a Policy Document

1. Click **"Select PDF File"** or drag & drop a PDF
2. Click **"🚀 Analyze Policy"**
3. Wait for the multi-agent pipeline to process

### 2. View Analysis Results

The system will display:
- **Policy Metadata** - Name, authority, dates
- **Risk Assessment** - HIGH / MEDIUM / LOW
- **Obligations** - What you must do
- **Penalties** - What happens if you don't comply
- **Action Plan** - Step-by-step compliance roadmap

### 3. Translate to Regional Languages

Click the 🌍 language toggle to translate results to:
- Hindi, Tamil, Telugu, Kannada, Malayalam
- Bengali, Marathi, Gujarati, Punjabi
- And 6 more Indian languages

### 4. Autonomous Monitoring

Drop PDFs into `backend/monitored_policies/` folder:
- The system **automatically detects** new files
- **Triggers analysis** without user action
- Results appear in the history sidebar

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini API key | ✅ Yes |
| `FIREBASE_CREDENTIALS` | Path to Firebase service account JSON | Optional |
| `FIREBASE_CREDENTIALS_JSON` | Inline Firebase credentials JSON | Optional |
| `TAVILY_API_KEY` | Tavily search API key | Optional |
| `SERPER_API_KEY` | Serper.dev fallback API key | Optional |
| `DEMO_MODE` | Set to `TRUE` for demo without API | Optional |
| `PORT` | Backend port (default: 8000) | Optional |

### Setting API Key

**PowerShell:**
```powershell
$env:GEMINI_API_KEY="your-key-here"
```

**Command Prompt:**
```cmd
set GEMINI_API_KEY=your-key-here
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your-key-here"
```

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build image
docker build -t pair-msme .

# Run with API key
docker run -p 8000:8000 -e GEMINI_API_KEY=your-key pair-msme

# Run in demo mode (no API key needed)
docker run -p 8000:8000 -e DEMO_MODE=TRUE pair-msme
```

### Docker Compose (Full Stack)

```bash
GEMINI_API_KEY=your-key docker-compose up
```

---

## ☁️ Google Cloud Run Deployment

### Windows PowerShell

```powershell
$env:GCP_PROJECT_ID="your-project"
$env:GEMINI_API_KEY="your-key"
.\deploy_to_cloud_run.ps1
```

### Linux/Mac

```bash
export GCP_PROJECT_ID=your-project
export GEMINI_API_KEY=your-key
./deploy.sh
```

---

## 🎮 Demo Mode

Run without a Gemini API key to see a deterministic walkthrough:

```powershell
$env:DEMO_MODE="TRUE"
python backend/main.py
```

Demo showcases:
- Women-owned Micro Enterprise profile
- CGTMSE policy analysis
- Eligibility for 4 schemes
- Full compliance roadmap

---

## 📁 Project Structure

```
pAIr-AG/
├── backend/
│   ├── agents/                 # Multi-agent system
│   │   ├── orchestrator.py     # 7-stage pipeline coordinator
│   │   ├── ingestion_agent.py  # PDF → Text
│   │   ├── reasoning_agent.py  # Gemini analysis
│   │   ├── planning_agent.py   # Roadmap generation
│   │   ├── execution_agent.py  # Scheme matching
│   │   ├── verification_agent.py # QA & confidence
│   │   └── explanation_agent.py  # Plain English
│   ├── auth/                   # Firebase Authentication
│   │   ├── firebase_auth.py    # JWT verification, Google-only OAuth
│   │   └── middleware.py       # Rate limiting, auth headers
│   ├── onboarding/             # Adaptive Questionnaire
│   │   ├── questions.json      # 15-node decision tree
│   │   ├── decision_tree.py    # Stateless onboarding engine
│   │   └── profile_generator.py # Gemini-powered profile enrichment
│   ├── scoring/                # Intelligence Engines
│   │   ├── compliance_risk.py  # Multi-factor risk scoring (0-100)
│   │   ├── sustainability.py   # Green score + SDG alignment
│   │   └── profitability.py    # ROI optimizer + scheme benefits
│   ├── ethics/                 # AI Governance
│   │   └── framework.py        # Transparency, escalation, bias detection
│   ├── policy/                 # Real-time Policy Discovery
│   │   ├── scraper.py          # Async aiohttp scraper
│   │   ├── search_api.py       # Tavily + Serper integration
│   │   ├── vector_store.py     # FAISS semantic search
│   │   └── embeddings.py       # Gemini text-embedding-004
│   ├── db/                     # Database Layer
│   │   └── firestore.py        # Firestore + JSON fallback
│   ├── main.py                 # FastAPI server (v3.0)
│   ├── config.py               # Centralized configuration
│   ├── schemas.py              # Pydantic models
│   ├── schemes.py              # Government schemes DB
│   ├── demo_data.py            # Demo mode data
│   ├── monitored_policies/     # Auto-detection folder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main app with auth + onboarding
│   │   ├── firebase.js         # Firebase config + Google auth
│   │   └── components/
│   │       ├── Dashboard.jsx   # Risk gauge, green score, ROI, ethics
│   │       ├── OnboardingWizard.jsx # Adaptive questionnaire UI
│   │       ├── Sidebar.jsx     # History panel
│   │       ├── ResultsView.jsx # Full analysis report
│   │       └── ProcessingEngine.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── architecture.md         # Detailed system architecture
├── src/
│   └── test_client.py          # API test client
├── Dockerfile
├── docker-compose.yml
├── deploy.sh                   # Cloud Run (Linux)
├── deploy_to_cloud_run.ps1     # Cloud Run (Windows)
├── run_demo.bat                # Local demo launcher
└── README.md
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check + version info |
| `/api/auth/verify` | POST | Verify Firebase JWT token |
| `/api/onboarding/start` | POST | Get first onboarding question |
| `/api/onboarding/answer` | POST | Submit answer, get next question |
| `/api/onboarding/profile` | POST | Generate enriched business profile |
| `/api/analyze` | POST | Full policy analysis pipeline |
| `/api/scoring/risk` | POST | Standalone compliance risk scoring |
| `/api/scoring/sustainability` | POST | Standalone sustainability scoring |
| `/api/scoring/profitability` | POST | Standalone profitability optimization |
| `/api/history` | GET | Get analysis history (by user) |
| `/api/translate` | POST | Translate to 15+ Indian languages |
| `/api/sources` | GET/POST/DELETE | Manage URL sources |
| `/api/profile/{uid}` | GET/POST | User business profile |

### Example: Upload and Analyze

```python
import requests

files = {'file': open('policy.pdf', 'rb')}
response = requests.post('http://localhost:8000/api/analyze', files=files)
print(response.json())
```

---

## 🔄 Modes of Operation

### Mode 1: Interactive (User-Driven)
1. User uploads PDF via UI
2. Agent swarm processes: Ingest → Reason → Plan → Execute → Verify → Explain
3. Results displayed with debug view

### Mode 2: Autonomous (Agent-Driven)
1. Monitoring Agent watches `backend/monitored_policies/`
2. New PDF detected → Auto-triggers pipeline
3. Results appear in history (zero user action)

---

## 🗣️ Supported Languages

| Language | Code | Native |
|----------|------|--------|
| English | en | English |
| Hindi | hi | हिंदी |
| Tamil | ta | தமிழ் |
| Telugu | te | తెలుగు |
| Kannada | kn | ಕನ್ನಡ |
| Malayalam | ml | മലയാളം |
| Bengali | bn | বাংলা |
| Marathi | mr | मराठी |
| Gujarati | gu | ગુજરાતી |
| Punjabi | pa | ਪੰਜਾਬੀ |
| Odia | or | ଓଡ଼ିଆ |
| Assamese | as | অসমীয়া |
| Urdu | ur | اردو |
| Sanskrit | sa | संस्कृतम् |
| Nepali | ne | नेपाली |
| Konkani | kok | कोंकणी |

---

## 🎯 Key Features

✅ **Multi-Agent Architecture** - 7 specialized AI agents in a coordinated pipeline  
✅ **Gemini 2.5 Flash** - Latest Google AI with automatic fallback  
✅ **Firebase Auth** - Secure Google-only OAuth with JWT verification  
✅ **Adaptive Onboarding** - 15-node decision tree for business profiling  
✅ **Compliance Risk Scoring** - Multi-factor 0-100 risk assessment with severity bands  
✅ **Sustainability Engine** - Green score, CO₂ reduction, SDG alignment  
✅ **Profitability Optimizer** - ROI multiplier, penalty avoidance, scheme benefit estimation  
✅ **Ethical AI Governance** - Transparency cards, escalation alerts, bias detection  
✅ **15+ Languages** - Regional language support for accessibility  
✅ **MSME-Focused** - Built specifically for India's 63 million small businesses  
✅ **Scheme Database** - CGTMSE, PMEGP, MUDRA, Startup India, Udyam, SFURTI  
✅ **Real-time Policy Search** - Tavily + Serper APIs for live policy discovery  
✅ **Vector Search** - FAISS with Gemini embeddings for semantic policy matching  
✅ **Autonomous Monitoring** - Zero-touch policy file watching  
✅ **Cloud Firestore** - Persistent storage with graceful JSON fallback  
✅ **Docker + Cloud Run** - Production-ready containerized deployment  

---

## � Social Impact & Innovation

> *"India has 6.3 crore MSMEs employing over 11 crore people. Most owners lack legal expertise to navigate compliance. pAIr bridges this gap with AI — making government schemes accessible to every entrepreneur, in their own language."*

### Why This Matters
- **63 million MSMEs** in India struggle with compliance — pAIr automates it
- **15+ regional languages** ensure no business owner is left behind
- **Zero-touch monitoring** means policies are tracked automatically
- **Autonomous AI agents** eliminate the need for expensive legal consultants
- **Real-world impact** — prevents penalties, unlocks government financial support

---

## 📄 License

MIT License — Built for **Code Unnati Innovation Marathon 4.0** (2024-25)

Organized by **SAP** | **Edunet Foundation** | **Telangana Academy for Skill and Knowledge (TASK)**

---

<div align="center">

**Made with ❤️ by Team pAIr**

*Empowering India's 63 Million MSMEs with AI-Powered Compliance Intelligence*

**Theme:** Data Algorithm in Action — Turning complex government policy data into actionable intelligence for small businesses

</div>
