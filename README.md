# pAIr - MSME Compliance & Grant Navigator

<div align="center">

**🏆 Agentathon 2025 Entry**

*An Autonomous Agentic AI System for Indian MSMEs*

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 👥 Team pAIr

| Name | Role | Organization |
|------|------|--------------|
| **Shiva Ganesh Talikota** | Team Lead | matriXO India |
| **Chandra Bose Pechetti** | Developer | Skynet |
| **Karthik Chinthakindi** | Developer | matriXO |

---

## 🎯 Problem Statement

**MSME Compliance & Grant Navigator**

Small and Medium Enterprises (MSMEs) in India often struggle to navigate the complex landscape of government schemes, subsidies, and compliance requirements. This autonomous agentic system solves this by:

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

### Multi-Agent System (Antigravity Core)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                           │
│                   (Antigravity Core)                            │
│            Manages state and agent delegation                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌────────┐         ┌──────────┐         ┌──────────┐
│INGEST  │────────▶│ REASON   │────────▶│  PLAN    │
│ Agent  │         │  Agent   │         │  Agent   │
└────────┘         │(Gemini)  │         └────┬─────┘
                   └──────────┘              │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌────────┐         ┌──────────┐         ┌──────────┐
│EXECUTE │────────▶│ VERIFY   │────────▶│ EXPLAIN  │
│ Agent  │         │  Agent   │         │  Agent   │
└────────┘         └──────────┘         └──────────┘
```

### Agent Roles

| Agent | File | Function |
|-------|------|----------|
| **Orchestrator** | `orchestrator.py` | Central state management and delegation |
| **Ingestion** | `ingestion_agent.py` | PDF parsing, OCR, data intake |
| **Reasoning** | `reasoning_agent.py` | Gemini 2.5 semantic analysis |
| **Planning** | `planning_agent.py` | Compliance roadmaps, timelines |
| **Execution** | `execution_agent.py` | Forms, drafts, checklists |
| **Verification** | `verification_agent.py` | Quality assurance, confidence scoring |
| **Explanation** | `explanation_agent.py` | Plain English summaries |

---

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.11 + FastAPI |
| **AI Model** | Google Gemini 2.5 Flash |
| **Frontend** | React 18 + Vite |
| **Styling** | TailwindCSS |
| **Deployment** | Docker / Google Cloud Run |

---

## 📦 Supported Government Schemes

| Scheme | Full Name | Benefit |
|--------|-----------|---------|
| **CGTMSE** | Credit Guarantee Fund Trust | Collateral-free loans up to ₹5 crore |
| **PMEGP** | PM Employment Generation Programme | Up to 35% subsidy for new units |
| **MUDRA** | Pradhan Mantri MUDRA Yojana | Micro credit up to ₹10 lakhs |
| **Stand Up India** | For SC/ST/Women | Loans ₹10 lakh - ₹1 crore |
| **Udyam** | MSME Registration | Free registration, gateway to schemes |

---

## 🏃 Quick Start Guide

### Prerequisites

- **Python 3.11+** - [Download](https://python.org)
- **Node.js 18+** - [Download](https://nodejs.org)
- **Gemini API Key** - [Get free key](https://aistudio.google.com/app/apikey)

### Step 1: Clone the Repository

```bash
git clone https://github.com/shivaganesht/pAIr-764.git
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
│   │   ├── __init__.py
│   │   ├── orchestrator.py     # Central coordinator
│   │   ├── ingestion_agent.py  # PDF → Text
│   │   ├── reasoning_agent.py  # Gemini analysis
│   │   ├── planning_agent.py   # Roadmap generation
│   │   ├── execution_agent.py  # Forms & drafts
│   │   ├── verification_agent.py # QA & confidence
│   │   └── explanation_agent.py  # Plain English
│   ├── main.py                 # FastAPI server
│   ├── schemas.py              # Pydantic models
│   ├── schemes.py              # Government schemes DB
│   ├── demo_data.py            # Demo mode data
│   ├── monitored_policies/     # Auto-detection folder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main application
│   │   └── components/
│   │       ├── Sidebar.jsx     # History panel
│   │       ├── ResultsView.jsx # Analysis display
│   │       └── ProcessingEngine.jsx
│   ├── package.json
│   └── vite.config.js
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
| `/api/analyze` | POST | Upload PDF for analysis |
| `/api/history` | GET | Get analysis history |
| `/api/history/{id}` | DELETE | Delete history item |
| `/api/translate` | POST | Translate to regional language |
| `/api/sources` | GET/POST/DELETE | Manage URL sources |

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

✅ **Multi-Agent Architecture** - 7 specialized AI agents working together  
✅ **Gemini 2.5 Flash** - Latest Google AI for semantic understanding  
✅ **Autonomous Operation** - Zero-touch policy monitoring  
✅ **15+ Languages** - Regional language support for accessibility  
✅ **MSME-Focused** - Built specifically for Indian small businesses  
✅ **Scheme Database** - CGTMSE, PMEGP, MUDRA, Stand Up India  
✅ **Compliance Roadmaps** - Prioritized action plans with deadlines  
✅ **Dark/Light Mode** - Modern UI with theme support  
✅ **Docker Ready** - One-command deployment  
✅ **Cloud Run** - Scalable serverless deployment  

---

## 🎯 Final Goal

To empower non-legal MSME owners to say:

> *"This system continuously monitors policy sources and automatically triggers analysis and compliance planning without user input."*

---

## 📄 License

MIT License - Built for Agentathon 2025

---

<div align="center">

**Made with ❤️ by Team pAIr**

*Empowering Indian MSMEs with AI-powered compliance intelligence*

</div>
