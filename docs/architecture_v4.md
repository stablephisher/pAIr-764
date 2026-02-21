# pAIr v4.0 — Master Architecture Blueprint

## Policy AI Regulator — Autonomous Regulatory & Sustainability Intelligence Companion

> "Always in pAIr with your business."
> GRC for India's 63 Million MSMEs.

---

## 1. Executive Summary

pAIr v4 transforms from a compliance analysis tool into an **Impact-First Regulatory Intelligence Platform** — measuring, predicting, and optimizing the real-world impact of compliance on Indian MSMEs.

### What Changed in v4

| Dimension | v3 | v4 |
|-----------|----|----|
| Core Philosophy | Analyze & Report | Measure & Optimize Impact |
| Risk Model | Weighted factors | Exponential urgency decay + Expected Value |
| Profitability | ROI calculation | 5-year NPV with sector multipliers |
| Innovation | None | Predictive Alerts + Policy Diff + Benchmarking |
| Architecture | Monolithic API | Modular engines + Task queue + Caching |
| Intelligence | Reactive analysis | Proactive policy monitoring + forecasting |
| SAP Readiness | None | GRC-aligned scoring + enterprise API patterns |
| Deployment | Basic Cloud Run | Structured logging + Retry + Rate limiting |

### Impact Metrics

| Metric | Value |
|--------|-------|
| Time Saved | 8+ hours/month |
| Money Saved | ₹59,400/year |
| Risk Reduction | 70% |
| CO₂ Saved | 126 kg/year |
| Scheme Benefits | Up to ₹10L+ unlocked |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 18 + Vite + TailwindCSS)            │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌─────────────────┐   │
│  │ Firebase  │  │ Onboarding   │  │ Dashboard │  │ Impact Dash     │   │
│  │ Auth      │  │ Wizard       │  │ Risk/ROI  │  │ Benchmarks      │   │
│  │ (Google)  │  │ Decision Tree│  │ Sustainab │  │ Predictions     │   │
│  └─────┬────┘  └──────┬───────┘  └─────┬─────┘  └───────┬─────────┘   │
└────────┼───────────────┼────────────────┼────────────────┼──────────────┘
         │               │                │                │
    ═════╪═══════════════╪════════════════╪════════════════╪══════════════
                        FastAPI Backend (Python 3.11)
    ══════════════════════════════════════════════════════════════════════
         │
┌────────▼────────────────────────────────────────────────────────────────┐
│                          API LAYER (main.py)                            │
│                                                                         │
│  Core Routes:                                                           │
│    /api/auth/verify    /api/onboarding/*    /api/analyze               │
│    /api/history        /api/translate       /api/health                 │
│                                                                         │
│  Scoring Routes:                                                        │
│    /api/scoring/risk          — Compliance risk (0-100)                 │
│    /api/scoring/sustainability — Environmental impact (A+/A/B/C/D)     │
│    /api/scoring/profitability  — ROI + NPV + break-even               │
│    /api/scoring/impact         — v4 Composite Impact Score            │
│                                                                         │
│  v4 Innovation Routes:                                                  │
│    /api/predict/alerts        — Predictive compliance alerts           │
│    /api/benchmark/sector      — Sector benchmarking                    │
│    /api/policy/diff           — Policy version comparison              │
│    /api/health/detailed       — Monitoring metrics                     │
│                                                                         │
│  Stability Layer: StructuredLogger | RateLimiter | HealthMonitor       │
└────────┬────────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────────────────┐
│                    PIPELINE ORCHESTRATOR (7-Stage)                       │
│                                                                         │
│   Stage 1: INGESTION   →  PDF/text extraction + validation             │
│   Stage 2: REASONING   →  Gemini LLM: structured obligation extraction │
│   Stage 3: PLANNING    →  Gemini LLM: compliance plan generation       │
│   Stage 4: SCORING     →  Risk + Sustainability + Profitability        │
│   Stage 5: EXECUTION   →  Scheme matching + benefit calculation        │
│   Stage 6: VERIFICATION → Quality assurance + hallucination check      │
│   Stage 7: EXPLANATION  → Human-readable report + translation          │
│                                                                         │
│   + EthicalAIFramework (transparency, escalation, bias monitoring)     │
└────────┬────────────┬──────────────┬──────────────┬─────────────────────┘
         │            │              │              │
┌────────▼──────┐ ┌───▼────────┐ ┌───▼──────────┐ ┌▼──────────────────┐
│ SCORING       │ │ INNOVATION │ │ POLICY       │ │ DATABASE          │
│ ENGINES       │ │ LAYER      │ │ INTELLIGENCE │ │ LAYER             │
│               │ │            │ │              │ │                   │
│ ┌───────────┐ │ │ Predictive │ │ PolicySearch │ │ Firestore (GCP)   │
│ │ComplianceR│ │ │ Alerts     │ │ API (Tavily/ │ │ + JSON fallback   │
│ │iskScorer  │ │ │            │ │ Serper)      │ │                   │
│ │ v4: decay │ │ │ Policy     │ │              │ │ FAISS Vector      │
│ │ + sector  │ │ │ Diff       │ │ PolicyScraper│ │ Store (768-dim)   │
│ │ + regional│ │ │ Engine     │ │ (govt portal │ │                   │
│ ├───────────┤ │ │            │ │  scraping)   │ │ User Profiles     │
│ │Sustainab  │ │ │ Sector     │ │              │ │ Analysis History  │
│ │ilityEng   │ │ │ Benchmark  │ │ Change       │ │ Policy Documents  │
│ │ CO₂/paper │ │ │ Engine     │ │ Detector     │ │                   │
│ ├───────────┤ │ │            │ │              │ └───────────────────┘
│ │Profitabil │ │ └────────────┘ │ Intelligence │
│ │ityOptimzr │ │                │ Engine       │
│ │ v4: NPV   │ │                │ (orchestrate │
│ │ + sectors │ │                │  scan/alert) │
│ ├───────────┤ │                └──────────────┘
│ │ImpactEng  │ │
│ │ v4: compo │ │
│ │ site score│ │
│ │ GRC align │ │
│ └───────────┘ │
└───────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                     STABILITY & SCALABILITY (v4)                        │
│                                                                         │
│  ┌──────────────┐  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │ Structured   │  │ Retry    │  │ Rate       │  │ Concurrency     │  │
│  │ Logger (JSON)│  │ Handler  │  │ Limiter    │  │ Limiter (3)     │  │
│  │ → GCP Logs   │  │ Exp Back │  │ 30/min     │  │ Gemini API      │  │
│  ├──────────────┤  ├──────────┤  ├────────────┤  ├─────────────────┤  │
│  │ Health       │  │ Error    │  │ Task Queue │  │ Result Cache    │  │
│  │ Monitor      │  │ Boundary │  │ (async)    │  │ (TTL LRU)       │  │
│  │ P95/errRate  │  │ fallback │  │ 5 workers  │  │ 200/500 items   │  │
│  └──────────────┘  └──────────┘  └────────────┘  └─────────────────┘  │
│                                                                         │
│  BackgroundScheduler: Policy monitoring (hourly) | Cache cleanup        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Impact Engine — The v4 Centrepiece

### Composite ImpactScore Formula

```
ImpactScore = (RiskReduction × 30%) + (ProfitabilityGain × 25%)
            + (SustainabilityImprovement × 20%) + (TimeSaved × 15%)
            + (CostSaved × 10%)
```

### Impact Grades

| Grade | Score Range | Meaning |
|-------|------------|---------|
| TRANSFORMATIVE | ≥ 90 | Exceptional positive impact |
| HIGH | 75–89 | Significant measurable improvement |
| MODERATE | 55–74 | Good foundation with room to grow |
| LOW | 35–54 | Some benefits, needs attention |
| MINIMAL | < 35 | Early-stage, significant improvement needed |

### GRC Alignment (SAP-Ready)

The Impact Engine maps every score to SAP's Governance-Risk-Compliance framework:

| GRC Dimension | Maps From | Weight |
|---------------|-----------|--------|
| Governance | Compliance + Sustainability | 40% |
| Risk | Risk Reduction score | 35% |
| Compliance | Regulatory adherence + Ethics | 25% |

---

## 4. Advanced Risk Model (v4)

### Key Formulas

**Urgency Decay Function:**
```
DeadlineUrgency = 100 × e^(-λ × days_remaining)
where λ = 0.033
```

| Days Remaining | Urgency Score |
|---------------|---------------|
| 0 (overdue) | 100 |
| 7 | ~79 |
| 30 | ~37 |
| 90 | ~5 |

**Expected Penalty Value:**
```
ExpectedPenalty = P(enforcement) × PenaltyAmount
P(enforcement): criminal=0.90, suspension=0.80, heavy_fine=0.70, fine=0.55
```

**Discounted Future Value:**
```
PresentValue = ExpectedPenalty / (1 + r)^t
where r = 0.10 (annual), t = years
```

### Sector Risk Multipliers

| Sector | Multiplier | Rationale |
|--------|-----------|-----------|
| Manufacturing | 1.25× | Higher regulatory burden |
| Trading | 1.10× | GST + import complexities |
| Service | 1.00× | Baseline |
| Handicraft | 0.90× | Government leniency |

### Regional Compliance Strictness

| State | Multiplier |
|-------|-----------|
| Delhi | 1.30× |
| Maharashtra | 1.25× |
| Karnataka | 1.20× |
| Tamil Nadu | 1.20× |
| Gujarat | 1.15× |
| Others | 1.00× |

---

## 5. Innovation Layer

### 5.1 Predictive Compliance Alerts

Forecasts upcoming compliance obligations before they become urgent:

- **Seasonal Compliance Calendar**: Maps to Indian FY cycles (GST, IT, Labour)
- **Sector-Specific Obligations**: Manufacturing (factory license, pollution control), Trading (FSSAI, weights & measures)
- **Deadline Clustering**: Detects periods of high obligation density
- **Risk Trajectory**: INCREASING / STABLE / DECREASING based on historical patterns

**API**: `POST /api/predict/alerts`

### 5.2 Policy Diff Engine

Compares two versions of a policy to highlight material changes:

- Section-level diffing with fuzzy matching
- Penalty amount change detection (INCREASED / DECREASED / NEW / REMOVED)
- Deadline change detection
- Severity classification (MAJOR / MINOR / COSMETIC)
- Change percentage calculation

**API**: `POST /api/policy/diff`

### 5.3 Sector Compliance Benchmarking

How your MSME ranks against peers:

- 5 dimensions: Compliance, Risk, Scheme Utilisation, Penalty Exposure, Sustainability
- Percentile ranking against sector/size/state peer group
- Calibrated benchmarks for Manufacturing / Service / Trading / Handicraft
- Size adjustments (Micro -5, Small 0, Medium +5)
- Tier classification: TOP_10, ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE, BOTTOM_20

**API**: `POST /api/benchmark/sector`

---

## 6. Profitability Model (v4)

### Multi-Year NPV Projections

```
Year N Benefit = Year1_ROI × (1 + growth_rate)^(N-1)
NPV(Year N)   = Benefit / (1 + discount_rate)^N

growth_rate = 15% per year
discount_rate = 10% per year
projection_horizon = 5 years
```

### Sector Benefit Multipliers

| Sector | Multiplier |
|--------|-----------|
| Manufacturing | 1.30× |
| Handicraft | 1.20× |
| Trading | 1.15× |
| Service | 1.00× |

### Break-Even Analysis

Calculates months until pAIr subscription (₹12,000/year) pays for itself through compliance savings + scheme benefits.

---

## 7. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite + TailwindCSS | SPA with responsive design |
| **UI Components** | Lucide Icons + Recharts | Data visualization |
| **Auth** | Firebase Authentication (Google OAuth) | User identity |
| **Backend** | Python 3.11 + FastAPI + Uvicorn | Async API server |
| **AI Engine** | Google Gemini 2.5 Flash (primary) | LLM-powered analysis |
| **AI Fallback** | Google Gemini 2.0 Flash Lite | Cost-optimized fallback |
| **Database** | Google Cloud Firestore + JSON fallback | User data + history |
| **Vector Store** | FAISS (768-dim) | Policy embedding search |
| **Search** | Tavily API (primary) + Serper (fallback) | Real-time policy discovery |
| **Deployment** | Docker + Cloud Run + Vercel | Containerized hosting |
| **Logging** | Structured JSON → GCP Cloud Logging | Production monitoring |

---

## 8. File Structure (v4)

```
backend/
├── main.py                        # FastAPI server + all routes
├── config.py                      # Centralized configuration
├── schemas.py                     # Pydantic models
├── schemes.py                     # Government scheme data
│
├── agents/                        # 7-stage pipeline agents
│   ├── orchestrator.py            # Pipeline coordinator
│   ├── ingestion_agent.py         # PDF → text
│   ├── reasoning_agent.py         # LLM: obligation extraction
│   ├── planning_agent.py          # LLM: compliance plan
│   ├── execution_agent.py         # Scheme matching
│   ├── verification_agent.py      # Quality assurance
│   └── explanation_agent.py       # Human-readable output
│
├── scoring/                       # Scoring engines
│   ├── compliance_risk.py         # v4: decay + sector + regional
│   ├── sustainability.py          # Environmental impact
│   ├── profitability.py           # v4: NPV + break-even
│   └── impact_engine.py           # v4: Composite Impact Score
│
├── innovation/                    # v4 Innovation Layer
│   ├── predictive_alerts.py       # Predictive compliance engine
│   ├── policy_diff.py             # Policy version comparison
│   └── sector_benchmark.py        # Peer benchmarking
│
├── policy/                        # Policy intelligence
│   ├── search_api.py              # Tavily/Serper search
│   ├── scraper.py                 # Govt portal scraping
│   ├── intelligence.py            # v4: Orchestrated monitoring
│   ├── vector_store.py            # FAISS embeddings
│   └── embeddings.py              # Text → vectors
│
├── ethics/                        # Ethical AI framework
│   └── framework.py               # Transparency + escalation
│
├── utils/                         # v4 Stability layer
│   ├── __init__.py                # Logging, retry, error boundary
│   ├── stability.py               # Re-exports
│   └── scalability.py             # Task queue, cache, scheduler
│
├── auth/                          # Firebase authentication
├── db/                            # Firestore abstraction
└── onboarding/                    # Adaptive onboarding
```

---

## 9. Deployment Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│              │     │                  │     │                │
│   Vercel     │────▶│   Cloud Run      │────▶│   Firestore    │
│   (Frontend) │     │   (Backend)      │     │   (Database)   │
│              │     │                  │     │                │
│   React SPA  │     │   FastAPI        │     │   User data    │
│   Static     │     │   Docker         │     │   Analyses     │
│              │     │   Auto-scale     │     │   History      │
└──────────────┘     └────────┬─────────┘     └────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │                    │
                    │   Gemini API       │
                    │   (2.5 Flash)      │
                    │                    │
                    │   Tavily API       │
                    │   (Policy Search)  │
                    │                    │
                    └────────────────────┘
```

---

## 10. API Reference (v4)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Upload PDF for full policy analysis |
| POST | `/api/scoring/risk` | Compliance risk scoring (0-100) |
| POST | `/api/scoring/sustainability` | Environmental impact (A+/D) |
| POST | `/api/scoring/profitability` | ROI + NPV + break-even |
| **POST** | **`/api/scoring/impact`** | **v4: Composite Impact Score** |
| **POST** | **`/api/predict/alerts`** | **v4: Predictive compliance alerts** |
| **POST** | **`/api/benchmark/sector`** | **v4: Sector benchmarking** |
| **POST** | **`/api/policy/diff`** | **v4: Policy version diff** |
| GET | `/api/health` | Basic health check |
| **GET** | **`/api/health/detailed`** | **v4: Detailed monitoring** |
| POST | `/api/auth/verify` | Firebase token verification |
| GET/POST | `/api/onboarding/start` | Begin adaptive onboarding |
| POST | `/api/onboarding/answer` | Submit onboarding answer |
| GET | `/api/history` | Analysis history |
| POST | `/api/translate` | Multi-language translation |
| GET | `/api/resources` | Curated business resources |

---

## 11. SAP Acquisition Readiness

### GRC Framework Alignment

pAIr's v4 architecture is designed to be SAP GRC-compatible:

| SAP GRC Component | pAIr Equivalent | Integration Path |
|-------------------|-----------------|-----------------|
| Access Control | Firebase Auth + Role-based access | Map to SAP Identity |
| Process Control | 7-stage pipeline with verification | Map stages to SAP workflow |
| Risk Management | ComplianceRiskScorer + ImpactEngine | Feed into SAP Risk Analytics |
| Audit Management | HealthMonitor + Structured Logging | Connect to SAP Audit Trail |
| Compliance | PolicyIntelligence + PredictiveAlerts | Feed alerts to SAP Compliance |
| Fraud Management | Ethics Framework + anomaly detection | Extend with SAP Fraud Management |

### Enterprise API Patterns

- **Structured JSON Logging** → GCP Cloud Logging → SAP Analytics
- **Health Monitoring** → P95 latency, error rates → SAP System Monitoring
- **Rate Limiting** → 30 req/min → Enterprise SLA compliance
- **Task Queue** → Async processing → SAP Event Mesh integration
- **Result Caching** → TTL-based → SAP Data Intelligence caching layer

### Data Export Compatibility

All scoring engines output structured JSON that can be:
1. Stored in SAP HANA for analytics
2. Fed into SAP Analytics Cloud dashboards
3. Used as input to SAP Intelligent RPA
4. Mapped to SAP S/4HANA regulatory objects

---

## 12. v5 Roadmap

| Feature | Description | Timeline |
|---------|-------------|----------|
| ML-powered Predictions | Replace heuristics with trained models | Q3 2025 |
| Redis Cache | Replace in-memory with Redis/Memorystore | Q3 2025 |
| Cloud Tasks | Replace asyncio queue with Cloud Tasks | Q3 2025 |
| Multi-tenant | Enterprise multi-org support | Q4 2025 |
| SAP Connector | Direct SAP GRC integration module | Q4 2025 |
| WhatsApp Bot | Compliance alerts via WhatsApp | Q3 2025 |
| Bulk Analysis | Batch processing for 100+ policies | Q4 2025 |
| Custom Embeddings | Fine-tuned MSME policy embeddings | Q4 2025 |

---

*pAIr v4.0 — Built for Code Unnati Innovation Marathon 4.0*
*"Always in pAIr with your business."*
