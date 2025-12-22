# pAIr - MSME Compliance & Grant Navigator

**Agentathon 2025 Entry**

**Team Name:** pAIr

**Team Members:**
- Shiva Ganesh Talikota (Team Lead) - matriXO India
- Chandra Bose Pechetti - Skynet
- Karthik Chinthakindi - matriXO

---

## 🎯 Problem Statement

**MSME Compliance & Grant Navigator**

Small and Medium Enterprises (MSMEs) in India often struggle to navigate the complex landscape of government schemes, subsidies, and compliance requirements. This autonomous agentic system solves this by:

- 📄 **Ingesting** business documents and descriptions
- 🧠 **Reasoning** about eligibility for various government schemes (e.g., CGTMSE, PMEGP)
- 📋 **Planning** a compliance roadmap
- ✍️ **Executing** application drafts or compliance checks
- ✅ **Verifying** results for accuracy
- 💬 **Explaining** everything in simple, jargon-free language

---

## 🏗️ Architecture

The system uses a **multi-agent architecture** orchestrated by "Antigravity":

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

| Agent | Role | Function |
|-------|------|----------|
| **Orchestrator** | Core | Manages state and agent delegation |
| **Ingestion** | Gateway | Handles PDF parsing, OCR, data intake |
| **Reasoning** | Legal Expert | Semantic understanding with Gemini 2.5 |
| **Planning** | Strategist | Generates compliance roadmaps |
| **Execution** | Preparer | Creates forms, drafts, checklists |
| **Verification** | QA | Validates results, confidence scoring |
| **Explanation** | Translator | Simple, jargon-free summaries |

---

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| **Language** | Python (FastAPI) |
| **AI Model** | Google Gemini 2.5 Flash |
| **Frontend** | React + Vite |
| **Orchestration** | Custom Antigravity Core |
| **Deployment** | Docker / Google Cloud Run |

---

## 📦 Supported Government Schemes

- **CGTMSE** - Credit Guarantee Fund Trust for MSMEs
- **PMEGP** - Prime Minister's Employment Generation Programme
- **MUDRA** - Pradhan Mantri MUDRA Yojana
- **Stand Up India** - For SC/ST/Women entrepreneurs
- **Udyam Registration** - MSME registration portal

---

## 🏃 How to Run

### Local Demo (Quickest)

```bash
# Install dependencies and run demo
run_demo.bat
```

This will:
1. Install Python dependencies
2. Start the backend server
3. Run the test client with demo output

### Manual Run

**Terminal 1 - Start the server:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Send a request:**
```bash
python src/test_client.py
```

### Frontend (Optional)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🐳 Deployment

### Docker

```bash
# Build image
docker build -t pair-msme .

# Run with demo mode
docker run -p 8000:8000 -e DEMO_MODE=TRUE pair-msme

# Run with real API
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key pair-msme
```

### Docker Compose (Full Stack)

```bash
GEMINI_API_KEY=your_key docker-compose up
```

### Google Cloud Run

**Linux/Mac:**
```bash
export GCP_PROJECT_ID=your-project
export GEMINI_API_KEY=your-key
./deploy.sh
```

**Windows PowerShell:**
```powershell
$env:GCP_PROJECT_ID="your-project"
$env:GEMINI_API_KEY="your-key"
./deploy_to_cloud_run.ps1
```

---

## 🎮 Demo Mode

Set `DEMO_MODE=TRUE` to see a deterministic walkthrough of the system's capabilities without needing a Gemini API key.

Demo mode showcases:
- Sample MSME business profile (Women-owned Micro Enterprise)
- CGTMSE policy analysis
- Eligibility determination
- Compliance roadmap generation
- Multi-language support

**This is enabled by default in Docker.**

---

## 🔄 Modes of Operation

### Mode 1: Interactive (User-Driven)
1. User uploads a PDF via the UI
2. Agent swarm processes: Ingest → Reason → Plan → Execute
3. Results displayed with "Check AI Logic" debug view

### Mode 2: Autonomous (Agent-Driven)
1. Monitoring Agent watches `backend/monitored_policies/`
2. New PDF detected → Auto-triggers analysis
3. Results pushed to history (no user action needed)
4. Frontend auto-refreshes with new results

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Upload PDF for analysis |
| `/api/history` | GET | Get analysis history |
| `/api/history/{id}` | DELETE | Delete history item |
| `/api/translate` | POST | Translate analysis to regional language |
| `/api/sources` | GET/POST | Manage URL sources |

---

## 🗣️ Supported Languages

The system supports 15+ Indian languages:

Hindi • Tamil • Telugu • Kannada • Malayalam • Bengali • Marathi • Gujarati • Punjabi • Odia • Assamese • Urdu • Sanskrit • Nepali • Konkani

---

## 📁 Project Structure

```
pAIr-AG/
├── backend/
│   ├── agents/           # Multi-agent system
│   │   ├── orchestrator.py
│   │   ├── ingestion_agent.py
│   │   ├── reasoning_agent.py
│   │   ├── planning_agent.py
│   │   ├── execution_agent.py
│   │   ├── verification_agent.py
│   │   └── explanation_agent.py
│   ├── main.py           # FastAPI server
│   ├── schemas.py        # Pydantic models
│   ├── schemes.py        # Government schemes DB
│   ├── demo_data.py      # Demo mode data
│   └── requirements.txt
├── frontend/             # React + Vite UI
├── src/
│   └── test_client.py    # API test client
├── Dockerfile
├── docker-compose.yml
├── deploy.sh             # Cloud Run (Linux)
├── deploy_to_cloud_run.ps1  # Cloud Run (Windows)
├── run_demo.bat          # Local demo launcher
└── README.md
```

---

## 🎯 Final Goal

To empower non-legal MSME owners to say:

> *"This system continuously monitors policy sources and automatically triggers analysis and compliance planning without user input."*

---

## 📄 License

MIT License - Built for Agentathon 2025

---

**Made with ❤️ by Team pAIr**
