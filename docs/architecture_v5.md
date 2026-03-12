# pAIr v5 — Architecture Redesign
## AI Regulatory Intelligence Companion for MSMEs
### SAP Code Unnati Innovation Marathon

---

## Executive Summary

pAIr v5 transforms from a **document analyzer** into a **real-time regulatory intelligence platform**.

**Core Shift**: Upload-based analysis → Autonomous policy discovery + intelligence system

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React + Vite)                     │
│  Login → Onboarding → Dashboard → Alerts → Roadmap → Settings   │
└───────────────────────────────┬──────────────────────────────────┘
                                │ REST API
┌───────────────────────────────▼──────────────────────────────────┐
│                     API GATEWAY (FastAPI)                         │
│  Auth Middleware │ Rate Limiter │ CORS │ Health Monitor           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              POLICY DISCOVERY LAYER                      │     │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐ │     │
│  │  │ Tavily   │  │ Serper   │  │ Gov Portal Scrapers   │ │     │
│  │  │ Search   │  │ Search   │  │ (msme/pib/rbi/gst)    │ │     │
│  │  └────┬─────┘  └────┬─────┘  └──────────┬────────────┘ │     │
│  │       └──────────────┼───────────────────┘              │     │
│  │                      ▼                                   │     │
│  │          ┌───────────────────────┐                      │     │
│  │          │  Change Detector      │                      │     │
│  │          │  (SHA-256 + Semantic) │                      │     │
│  │          └──────────┬────────────┘                      │     │
│  └─────────────────────┼───────────────────────────────────┘     │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │            VECTOR INTELLIGENCE LAYER                     │     │
│  │  ┌──────────────┐  ┌─────────┐  ┌──────────────────┐  │     │
│  │  │ Gemini       │  │ FAISS   │  │ Deduplication    │  │     │
│  │  │ Embeddings   │  │ Index   │  │ Engine           │  │     │
│  │  └──────────────┘  └─────────┘  └──────────────────┘  │     │
│  └─────────────────────┬───────────────────────────────────┘     │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │           MULTI-AGENT AI PIPELINE                        │     │
│  │                                                          │     │
│  │  Orchestrator                                            │     │
│  │    ├── Ingestion Agent  (PDF + Web text extraction)      │     │
│  │    ├── Reasoning Agent  (Policy analysis + LLM)          │     │
│  │    ├── Planning Agent   (Compliance action plans)        │     │
│  │    ├── Scoring Engines  (Risk/Sustain/Profit in parallel)│     │
│  │    ├── Execution Agent  (Roadmap + calendar generation)  │     │
│  │    ├── Verification Agent (Hallucination checks)         │     │
│  │    └── Explanation Agent  (Plain-language output)        │     │
│  └─────────────────────┬───────────────────────────────────┘     │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              SCORING & IMPACT LAYER                      │     │
│  │  ┌──────────┐ ┌───────────────┐ ┌───────────────────┐  │     │
│  │  │Compliance│ │Sustainability │ │ Profitability      │  │     │
│  │  │Risk 0-100│ │Score 0-100    │ │ ROI Analysis       │  │     │
│  │  └──────────┘ └───────────────┘ └───────────────────┘  │     │
│  │  ┌──────────────────────────────────────────────────┐   │     │
│  │  │ IMPACT ENGINE (Composite 0-100)                   │   │     │
│  │  │ 30% Risk + 25% Profit + 20% Sustain + 15% Time  │   │     │
│  │  │ + 10% Cost                                        │   │     │
│  │  └──────────────────────────────────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              INNOVATION LAYER                            │     │
│  │  Policy Diff │ Predictive Alerts │ Sector Benchmark     │     │
│  │  Voice Assist │ SMS Notifications │ Compliance Calendar │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              DATA LAYER                                  │     │
│  │  Firestore (prod) │ Local JSON (dev) │ FAISS Vectors    │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## New Product Flow

```
User Login (Firebase Google Auth)
        │
        ▼
Adaptive Onboarding Questionnaire
        │
        ▼
Business Profile Generation (AI-enriched)
        │
        ▼
┌───────┴───────┐
│               │
▼               ▼
Policy      Smart Analysis
Discovery   (Profile-based,
(Background  no upload needed)
 crawl)
│               │
└───────┬───────┘
        ▼
Multi-Agent AI Analysis Pipeline
        │
        ▼
Scoring: Compliance + Sustainability + Profitability
        │
        ▼
Impact Score (0-100 composite)
        │
        ▼
Actionable Business Roadmap
        │
        ▼
Alerts & Monitoring (Real-time)
```

---

## Policy Discovery Layer

### Sources
| Source | URL | Type |
|--------|-----|------|
| MSME Ministry | msme.gov.in | Notifications/Circulars |
| Press Information Bureau | pib.gov.in | Press releases |
| Reserve Bank of India | rbi.org.in | Circulars/Guidelines |
| GST Council | gst.gov.in | GST notifications |
| Startup India | startupindia.gov.in | Scheme updates |
| e-Gazette | egazette.nic.in | Official gazette |
| CGTMSE | cgtmse.in | Guarantee scheme updates |
| KVIC/PMEGP | kviconline.gov.in | Employment programme |
| Udyam Portal | udyamregistration.gov.in | Registration updates |

### Discovery Pipeline
1. **Scheduled Crawl** — Every 6 hours, scrape all configured sources
2. **Domain-Restricted Search** — Tavily/Serper with `include_domains` filter
3. **Change Detection** — SHA-256 content hashing + semantic similarity
4. **Deduplication** — FAISS cosine similarity > 0.92 = duplicate
5. **Version Comparison** — Policy Diff Engine for amendments
6. **Impact Assessment** — LLM-powered relevance scoring per business profile
7. **Alert Generation** — Push notifications to affected users

### API Endpoint
```
POST /api/discover/policies
  - Triggers on-demand policy scan
  - Uses Tavily (primary) + Serper (fallback)
  - Returns discovered policies with relevance scores

GET /api/discover/status
  - Returns last scan time, policies found, next scheduled scan
```

---

## Scoring Engine Formulas

### Compliance Risk Score (0-100)
```
RiskScore = Σ(wᵢ × factorᵢ × sectorMult × regionalMult)

where:
  severity_weight    = 0.35
  penalty_weight     = 0.25
  deadline_urgency   = 0.25
  frequency_weight   = 0.15

  DeadlineUrgency = 100 × e^(-0.033 × days_remaining)
  ExpectedPenalty = P(enforcement) × PenaltyAmount × (1+r)^(-t)
```

### Sustainability Score (0-100)
```
GreenScore = (PaperReduction × 25%) + (CarbonReduction × 30%)
           + (EfficiencyGain × 25%) + (DigitalMaturity × 20%)
```

### Profitability Score
```
TotalROI = PenaltyAvoidance + SchemeeBenefits + CostSavings
ROIMultiplier = TotalROI / PlatformCost
NPV_5yr = Σ(YearlyBenefit × (1+growth)^t / (1+discount)^t)
```

### Impact Score (0-100)
```
ImpactScore = (RiskReduction × 30%) + (ProfitabilityGain × 25%)
            + (SustainabilityImprovement × 20%) + (TimeSaved × 15%)
            + (CostSaved × 10%)
```

---

## Deployment Architecture

### Production (Cloud Run)
```
Cloud Run (Backend API)
  ├── Stateless FastAPI instances (auto-scaling)
  ├── Background tasks via asyncio
  └── Health checks at /api/health

Vercel (Frontend)
  ├── React SPA with Vite
  └── Rewrites to index.html

Firebase
  ├── Authentication (Google OAuth)
  ├── Firestore (user data, analyses)
  └── Cloud Messaging (push notifications)
```

### Scalability Path
```
Current (v5)                    Future (v6)
─────────────                   ────────────
In-memory task queue    →       Cloud Tasks / Pub/Sub
In-memory cache         →       Redis / Memorystore
FAISS local             →       Vertex AI Vector Search
Single instance         →       Cloud Run auto-scale
Local file monitoring   →       Cloud Scheduler + Pub/Sub
```

---

## Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Firebase Google Auth
- [x] Adaptive onboarding questionnaire
- [x] Business profile generation
- [x] Core analysis pipeline
- [x] Scoring engines
- [x] Impact engine

### Phase 2: Intelligence (Week 3-4)
- [x] Policy discovery (Tavily + Serper)
- [x] Web scraper for gov portals
- [x] FAISS vector store
- [x] Gemini embeddings integration
- [x] Change detection engine
- [x] Smart analysis (no upload needed)

### Phase 3: Innovation (Week 5-6)
- [x] Policy Diff Engine
- [x] Predictive Compliance Alerts
- [x] Sector Benchmarking
- [x] Translation (15 Indian languages)
- [x] Notification system

### Phase 4: Production (Week 7-8)
- [x] Deployment stability fixes
- [x] CORS + env variable hardening
- [x] Structured logging (GCP-compatible)
- [x] Rate limiting
- [x] Health monitoring
- [x] Error boundaries + retry logic
- [x] Background policy discovery service

### Phase 5: Scale & Innovate (Week 9-10)
- [x] Voice Assist module (multilingual intent detection)
- [x] SMS Notification engine (template-based, pluggable gateway)
- [x] Central error handler middleware (structured JSON errors)
- [x] Orchestrator text pipeline (discovery → analysis without upload)
- [x] Frontend Policy Discovery page (search + voice + auto-discover)
- [ ] Twilio/MSG91 SMS gateway integration (production)
- [ ] Google Cloud TTS for voice responses
- [ ] WebSocket real-time discovery notifications
- [ ] Multi-tenant data isolation
- [ ] CI/CD pipeline (GitHub Actions → Cloud Run)

---

## API Reference (v5)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/discover/policies` | Trigger policy discovery scan |
| GET | `/api/discover/status` | Get discovery system status |
| POST | `/api/discover/analyze` | Discover + auto-analyze pipeline |
| POST | `/api/search/policies` | Semantic search across indexed policies |
| POST | `/api/voice/query` | Process voice query (text input) |
| POST | `/api/analyze` | Upload PDF for analysis |
| GET | `/api/health` | System health check |
| POST | `/api/scoring/risk` | Compliance risk scoring |
| POST | `/api/scoring/sustainability` | Sustainability scoring |
| POST | `/api/scoring/profitability` | Profitability analysis |
| POST | `/api/scoring/impact` | Composite impact score |
| POST | `/api/predict/alerts` | Predictive compliance alerts |
| POST | `/api/benchmark/sector` | Sector benchmarking |
| POST | `/api/policy/diff` | Policy version diff |
| POST | `/api/translate` | Translate to 16 Indian languages |

---

## Files Changed (v5 Redesign)

### New Files
- `backend/policy/discovery.py` — Autonomous policy discovery engine (9 gov sources)
- `backend/middleware/__init__.py` — Middleware package
- `backend/middleware/error_handler.py` — Central exception handlers
- `backend/innovation/voice_assist.py` — Voice interaction engine
- `backend/innovation/sms_notify.py` — SMS notification engine
- `frontend/src/pages/PolicyDiscovery.jsx` — Discovery UI page

### Modified Files
- `backend/main.py` — v5 endpoints, error handler registration, version bump
- `backend/config.py` — CORS from env, discovery/Gemini config
- `backend/requirements.txt` — aiohttp, numpy, faiss-cpu, firebase-admin
- `backend/policy/embeddings.py` — Gemini text-embedding-004 integration
- `backend/agents/orchestrator.py` — `run_text_pipeline()` for web-sourced text
- `backend/agents/ingestion_agent.py` — Web text processing + quality scoring
- `backend/utils/__init__.py` — GEMINI_API_KEY in env validation
- `Dockerfile` — Runtime data dirs, healthcheck fix
- `docker-compose.yml` — All env vars (OPENROUTER, GEMINI, TAVILY, SERPER, CORS)
- `frontend/src/App.jsx` — `/discover` route
- `frontend/src/components/Navbar.jsx` — Discover nav link
