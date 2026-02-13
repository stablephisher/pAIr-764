# pAIr v3.0 — System Architecture

## Overview

pAIr is a production-grade, AI-powered MSME Compliance & Scheme Navigator built for Code Unnati Innovation Marathon 4.0. It uses a multi-agent pipeline orchestrated by Google Gemini 2.5 Flash to analyze Indian government policy PDFs, generate compliance plans, score risks, measure sustainability impact, and optimize profitability — all delivered in 15+ Indian languages.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 18 + Vite)                   │
│  ┌──────────┐  ┌──────────────────┐  ┌───────────┐  ┌────────────┐  │
│  │ Firebase  │  │ OnboardingWizard │  │ Dashboard │  │ ResultsView│  │
│  │ Google    │  │ Adaptive Q&A     │  │ Risk/Sust │  │ Full Report│  │
│  │ Auth      │  │ Decision Tree    │  │ /ROI/Ethics│ │ + Translate│  │
│  └─────┬────┘  └────────┬─────────┘  └─────┬─────┘  └─────┬──────┘  │
│        │                │                   │              │         │
└────────┼────────────────┼───────────────────┼──────────────┼─────────┘
         │                │                   │              │
    ─────▼────────────────▼───────────────────▼──────────────▼─────
                        FastAPI Backend (Python 3.11)
    ────────────────────────────────────────────────────────────────
         │
┌────────▼─────────────────────────────────────────────────────────┐
│                        API LAYER (main.py)                        │
│  /api/auth/verify  /api/onboarding/*  /api/analyze  /api/scoring/*│
│  /api/history      /api/translate     /api/sources  /api/profile  │
└────────┬─────────────────────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (orchestrator.py)                  │
│                                                                   │
│   Stage 1: INGESTION ──▶ IngestionAgent (PDF → text)             │
│   Stage 2: REASONING  ──▶ ReasoningAgent (Gemini: extract oblig) │
│   Stage 3: PLANNING   ──▶ PlanningAgent  (Gemini: compliance plan)│
│   Stage 4: EXECUTION  ──▶ ExecutionAgent (scheme matching)       │
│   Stage 5: VERIFICATION ▶ VerificationAgent (quality check)      │
│   Stage 6: EXPLANATION ──▶ ExplanationAgent (human-readable)     │
│   Stage 7: SCORING    ──▶ Risk + Sustainability + Profitability  │
│             + Ethics Framework (transparency, escalation, bias)   │
└──────────────────────────────────────────────────────────────────┘
         │                    │                    │
┌────────▼──────┐  ┌─────────▼────────┐  ┌───────▼──────────┐
│  Scoring      │  │  Policy Engine    │  │  Database Layer  │
│  ┌──────────┐ │  │  ┌─────────────┐  │  │  ┌────────────┐ │
│  │Risk 0-100│ │  │  │Tavily Search│  │  │  │ Firestore   │ │
│  │Sustain A+│ │  │  │Serper Backup│  │  │  │ (+ JSON     │ │
│  │ROI Calc  │ │  │  │FAISS Vector │  │  │  │  fallback)  │ │
│  │Ethics    │ │  │  │Async Scraper│  │  │  │            │ │
│  └──────────┘ │  │  └─────────────┘  │  │  └────────────┘ │
└───────────────┘  └──────────────────┘  └────────────────┘
```

---

## Core Components

### 1. Authentication (`backend/auth/`)

| File | Purpose |
|------|---------|
| `firebase_auth.py` | Firebase Admin SDK integration, Google-only OAuth, JWT verification, FastAPI dependency injection |
| `middleware.py` | Rate limiting (30 req/60s), auth header extraction, public path whitelist |

- **Provider**: Google-only OAuth (enforced)
- **Token flow**: Client signs in via Firebase JS SDK → sends ID token in `Authorization: Bearer <token>` → backend verifies with Firebase Admin SDK
- **Demo mode**: Bypasses auth when `DEMO_MODE=true`

### 2. Adaptive Onboarding (`backend/onboarding/`)

| File | Purpose |
|------|---------|
| `questions.json` | 15-node decision tree defining the questionnaire flow |
| `decision_tree.py` | Stateless engine: `get_first_question()`, `get_next_question()`, `generate_profile()` |
| `profile_generator.py` | Gemini-powered profile enrichment (business summary, compliance priorities) |

**Decision Tree Flow**:
```
Q1 (Business Type) → Q2_MFG / Q2_SVC / Q2_TRD / Q2_CRAFT
  → Q3 (Turnover) → Q4 (Employees) → Q5 (Location)
  → Q6 (State, free text) → Q7 (Owner Category, multi-choice)
  → Q8 (Udyam) → Q9 (Business Age) → Q10/Q10_NEW
  → Q11 (Environmental) → Q12 (Filings) → Q13 (Language) → COMPLETE
```

**Output**: Enterprise classification (Micro/Small/Medium) + pre-screened schemes + business profile.

### 3. Multi-Agent Pipeline (`backend/agents/`)

| Agent | Role | AI Model |
|-------|------|----------|
| `IngestionAgent` | PDF → text extraction (PyPDF2 + pdfplumber fallback) | None |
| `ReasoningAgent` | Extract structured legal obligations from text | Gemini 2.5 Flash |
| `PlanningAgent` | Generate actionable compliance plan | Gemini 2.5 Flash |
| `ExecutionAgent` | Match applicable government schemes | Rule-based |
| `VerificationAgent` | Quality validation and completeness check | Gemini 2.5 Flash |
| `ExplanationAgent` | Convert to human-readable explanations | Gemini 2.5 Flash |

**Orchestrator** (`orchestrator.py`) manages the pipeline via `PipelineContext` with `AgentState` enum tracking progress through all 7 stages including the new SCORING stage.

### 4. Scoring Engines (`backend/scoring/`)

#### Compliance Risk Scorer (`compliance_risk.py`)
- **Multi-factor**: severity (35%), penalty magnitude (25%), deadline urgency (25%), frequency (15%)
- **Score**: 0–100 with `RiskBand` enum (CRITICAL ≥80, HIGH ≥60, MEDIUM ≥40, LOW ≥20, MINIMAL <20)
- **Top-heavy weighting**: Exponentially weights highest-risk obligations
- **Indian number parsing**: Handles crore/lakh/thousand formats

#### Sustainability Engine (`sustainability.py`)
- **Paper impact**: 25 pages/policy × total policies analyzed
- **Carbon reduction**: 0.21 kg CO₂/km × 50km avg travel saved
- **Efficiency**: 8h traditional vs 0.5h digital processing time
- **Green score**: 30% paper + 30% carbon + 25% efficiency + 15% scale → Grade A+/A/B/C/D
- **SDG alignment**: Maps to relevant UN Sustainable Development Goals

#### Profitability Optimizer (`profitability.py`)
- **Penalty avoidance**: expected_loss = penalty_amount × probability
- **Scheme benefits**: Per-scheme estimation (CGTMSE guarantee, PMEGP subsidy, MUDRA tier, etc.)
- **Cost comparison**: ₹2,500/hr CA traditional vs ₹50/analysis digital
- **ROI multiplier**: (total_benefits + penalty_avoidance) / platform_cost

### 5. Ethical AI Framework (`backend/ethics/`)

| Feature | Description |
|---------|-------------|
| Transparency Cards | Data sources, AI model, confidence level, processing time |
| Escalation Alerts | Criminal penalties, high financial risk, cross-state operations, expired deadlines |
| Bias Detection | Gender, caste language scanning in AI outputs |
| Human-in-the-Loop | Triggered when confidence < 0.6 or critical risk detected |
| DPDP Act 2023 | Data handling compliance statement |

### 6. Policy Engine (`backend/policy/`)

| File | Purpose |
|------|---------|
| `scraper.py` | Async aiohttp scraper for government websites, hash-based deduplication |
| `search_api.py` | Tavily (primary) + Serper.dev (fallback) for real-time policy discovery |
| `vector_store.py` | FAISS IndexFlatIP (768-dim, cosine similarity) for semantic policy search |
| `embeddings.py` | Gemini `text-embedding-004` model for document/query embeddings |

### 7. Database Layer (`backend/db/`)

- **Primary**: Google Cloud Firestore
- **Fallback**: Local JSON files in `data/` directory
- **Collections**: `users/{uid}`, `users/{uid}/analyses/{id}`, `users/{uid}/onboarding`, `global_stats`

### 8. Frontend (`frontend/src/`)

| Component | Purpose |
|-----------|---------|
| `App.jsx` | Main app shell, auth state, routing, API integration |
| `OnboardingWizard.jsx` | Adaptive questionnaire UI with progress bar |
| `Dashboard.jsx` | Risk gauge (SVG), green score badge, ROI stats, ethics governance |
| `ResultsView.jsx` | Full analysis report rendering |
| `ProcessingEngine.jsx` | Loading animation during analysis |
| `Sidebar.jsx` | Analysis history panel |
| `firebase.js` | Firebase config + Google auth helpers |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + version info |
| POST | `/api/auth/verify` | Verify Firebase JWT token |
| POST | `/api/onboarding/start` | Get first onboarding question |
| POST | `/api/onboarding/answer` | Submit answer, get next question |
| POST | `/api/onboarding/profile` | Generate enriched business profile |
| POST | `/api/analyze` | Full policy analysis pipeline |
| POST | `/api/scoring/risk` | Standalone compliance risk scoring |
| POST | `/api/scoring/sustainability` | Standalone sustainability scoring |
| POST | `/api/scoring/profitability` | Standalone profitability optimization |
| GET | `/api/history` | Get analysis history (optionally by user) |
| POST | `/api/translate` | Translate results to any of 15+ languages |
| GET/POST/DELETE | `/api/sources` | Manage custom policy source URLs |
| GET/POST | `/api/profile/{user_uid}` | Get/save user business profile |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| AI Model | Google Gemini 2.5 Flash (primary), Gemini 2.0 Flash Lite (fallback) |
| Embeddings | Gemini `text-embedding-004` (768-dim) |
| Backend | Python 3.11, FastAPI, uvicorn |
| Frontend | React 18, Vite, TailwindCSS, Lucide Icons |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Google Cloud Firestore + JSON fallback |
| Vector DB | FAISS (Facebook AI Similarity Search) |
| Search APIs | Tavily API, Serper.dev API |
| PDF Processing | PyPDF2, pdfplumber |
| Deployment | Docker (multi-stage), Google Cloud Run, Vercel |

---

## Data Flow

```
User uploads PDF
    │
    ▼
Firebase Auth verifies identity
    │
    ▼
IngestionAgent extracts text from PDF
    │
    ▼
ReasoningAgent (Gemini) extracts obligations, penalties, deadlines
    │
    ▼
PlanningAgent (Gemini) creates compliance action plan
    │
    ▼
ExecutionAgent matches applicable government schemes
    │
    ▼
VerificationAgent validates completeness and accuracy
    │
    ▼
ExplanationAgent generates human-readable summaries
    │
    ▼
Scoring Engines run in parallel:
    ├── ComplianceRiskScorer → Risk score 0-100
    ├── SustainabilityEngine → Green score + SDG alignment
    ├── ProfitabilityOptimizer → ROI multiplier + savings
    └── EthicalAIFramework → Transparency + escalation
    │
    ▼
Results saved to Firestore + returned to frontend
    │
    ▼
Dashboard renders visual scorecards
    │
    ▼
User can translate to 15+ Indian languages
```

---

## Environment Variables

```env
# Required
GEMINI_API_KEY=           # Google AI Studio API key

# Optional – Firebase
FIREBASE_CREDENTIALS=     # Path to Firebase service account JSON
FIREBASE_CREDENTIALS_JSON= # Or inline JSON string

# Optional – Policy Search
TAVILY_API_KEY=           # Tavily search API key
SERPER_API_KEY=           # Serper.dev fallback API key

# Optional – Config
DEMO_MODE=true            # Bypass auth for development
PORT=8000                 # Server port
```

---

## Deployment

### Docker
```bash
docker-compose up --build
```

### Google Cloud Run
```bash
./deploy.sh
```

### Local Development
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```
