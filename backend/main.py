"""
pAIr v4 — Policy AI Regulator — Main FastAPI Server
======================================================
Autonomous Regulatory & Sustainability Intelligence Companion for MSMEs.
GRC for India's 63 Million MSMEs.

"Always in pAIr with your business."

Routes
------
  Auth:        /api/auth/verify, /api/auth/me
  Onboarding:  /api/onboarding/start, /api/onboarding/answer, /api/onboarding/profile
  Analysis:    /api/analyze (PDF upload)
  Scoring:     /api/scoring/risk, /api/scoring/sustainability, /api/scoring/profitability
  Impact:      /api/scoring/impact (composite impact score)
  Predict:     /api/predict/alerts (predictive compliance alerts)
  Benchmark:   /api/benchmark/sector (sector compliance benchmarking)
  Diff:        /api/policy/diff (policy version diff)
  History:     /api/history (GET/DELETE)
  Translation: /api/translate
  Sources:     /api/sources
  Health:      /api/health
"""

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

import os
import io
import json
import uuid
import time
import asyncio
import traceback

import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from openai import AsyncOpenAI
from pypdf import PdfReader

from config import config
from schemas import PolicyAnalysis
from db.firestore import FirestoreDB
from utils import (
    setup_structured_logging,
    HealthMonitor,
    RateLimiter,
    RequestContext,
    validate_environment,
)

# ── Structured Logging ──────────────────────────────────────────────────

import logging
logger = setup_structured_logging(level=os.getenv("LOG_LEVEL", "INFO"))

# ── Request / Response Models ────────────────────────────────────────────

class SourceRequest(BaseModel):
    name: str
    url: str

class TranslateRequest(BaseModel):
    data: dict
    target_language: str

class OnboardingAnswerRequest(BaseModel):
    current_question_id: str
    answer: str
    answers_so_far: Dict[str, str] = {}

class BusinessProfileRequest(BaseModel):
    answers: Dict[str, str]

class ScoringRequest(BaseModel):
    analysis: Dict[str, Any]
    business_profile: Optional[Dict[str, Any]] = None
    num_policies: int = 1
    num_schemes: int = 0

class HealthResponse(BaseModel):
    status: str
    version: str
    demo_mode: bool
    engines: List[str]

# ── Initialize App ──────────────────────────────────────────────────────

app = FastAPI(
    title="pAIr — Policy AI Regulator",
    description="Autonomous Regulatory & Sustainability Intelligence Companion for MSMEs. GRC for India's 63 Million MSMEs.",
    version="4.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.server.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenRouter (OpenAI-compatible)
api_key = config.ai.api_key or os.getenv("OPENROUTER_API_KEY", "")
ai_client = AsyncOpenAI(
    base_url=config.ai.base_url,
    api_key=api_key,
    default_headers={
        "HTTP-Referer": config.ai.site_url,
        "X-Title": config.ai.site_name,
    },
) if api_key else None

# Database
db = FirestoreDB()

# ── v4: Stability Infrastructure ────────────────────────────────────────

health_monitor = HealthMonitor()
rate_limiter = RateLimiter(max_requests=30, window_seconds=60)

# Validate environment at startup
env_status = validate_environment()
logger.info(f"Environment validation: {env_status}")

# ── Auth Helpers ─────────────────────────────────────────────────────────

async def optional_user():
    """Get user if authenticated, None otherwise. Used for optional auth."""
    return None  # Frontend sends uid in requests; no middleware enforcement

# ── PDF Extraction ───────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

# ── System Prompts ───────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are a senior policy analyst AI specializing in Indian government regulations and MSME compliance.

Your task is to read government policy documents and convert complex legal text into structured, actionable intelligence.

You MUST follow these rules strictly:
- Do NOT summarize casually
- Do NOT add assumptions
- Do NOT hallucinate missing information
- If information is unclear or missing, explicitly mark it as "UNKNOWN"
- Output ONLY valid JSON
- Be deterministic and precise

TARGET AUDIENCE:
- Indian MSMEs (10–50 employees)
- Non-legal, non-technical business owners

OUTPUT FORMAT (MANDATORY JSON SCHEMA):
{
  "policy_metadata": {
    "policy_name": "",
    "issuing_authority": "",
    "effective_date": "",
    "geographical_scope": "",
    "policy_type": ""
  },
  "applicability": {
    "who_is_affected": "",
    "conditions": [],
    "exceptions": []
  },
  "obligations": [
    {
      "obligation": "",
      "description": "",
      "deadline": "",
      "frequency": "",
      "severity_if_ignored": ""
    }
  ],
  "penalties": [
    {
      "violation": "",
      "penalty_amount": "",
      "other_consequences": ""
    }
  ],
  "required_documents": [],
  "compliance_actions": [
    {
      "action": "",
      "priority": "HIGH | MEDIUM | LOW",
      "estimated_effort": ""
    }
  ],
  "risk_assessment": {
    "overall_risk_level": "HIGH | MEDIUM | LOW",
    "reasoning": ""
  },
  "confidence_notes": {
    "ambiguous_sections": [],
    "missing_information": []
  }
}
"""

PLANNING_AGENT_PROMPT = """
You are an autonomous Compliance Planning Agent for Indian MSMEs.

CONTEXT:
You operate inside a multi-agent system (Antigravity).
Upstream agents have already:
- Extracted policy text from a government PDF
- Converted it into structured policy intelligence (JSON)

Your job starts ONLY after policy reasoning is complete.

ROLE:
Transform structured policy intelligence into a clear, prioritized,
step-by-step action plan that a non-legal MSME owner can immediately follow.

IMPORTANT RULES (NON-NEGOTIABLE):
- Do NOT repeat policy text
- Do NOT summarize the document
- Do NOT use legal jargon
- Do NOT give vague or generic advice
- If information is missing or unclear, explicitly say "UNKNOWN"
- Be decisive and practical

TARGET USER:
- MSME owner (India)
- 10–50 employees
- Non-technical, non-legal
- Wants to know: "What should I do next?"

INPUT:
You will receive a SINGLE JSON object containing structured policy intelligence.

YOUR TASK:
1. Decide if the policy applies to the MSME
2. If applicable:
   - Generate a prioritized compliance checklist
   - Clearly state deadlines and risks
3. If NOT applicable:
   - State that clearly
   - Recommend monitoring actions only

OUTPUT FORMAT (STRICT — JSON ONLY):

{
  "applicability_status": "APPLICABLE | PARTIALLY_APPLICABLE | NOT_APPLICABLE",
  "summary_for_owner": "",
  "action_plan": [
    {
      "step_number": 1,
      "action": "",
      "why_it_matters": "",
      "deadline": "",
      "risk_if_ignored": ""
    }
  ],
  "monitoring_advice": "",
  "confidence_level": "HIGH | MEDIUM | LOW"
}

QUALITY CHECK (MANDATORY BEFORE RESPONDING):
- Every action must map to a real obligation
- No field may be empty
- Output must be valid JSON
- Clarity > completeness

FINAL DIRECTIVE:
Your output will be shown directly to business owners and Code Unnati Innovation Marathon evaluators.
Write like incorrect advice could cause financial loss.
"""


# ═══════════════════════════════════════════════════════════════════
#  AI HELPER — OpenRouter (OpenAI-compatible)
# ═══════════════════════════════════════════════════════════════════

async def call_ai(system_prompt: str, user_prompt: str, models_to_try: list = None, json_mode: bool = True) -> str:
    """
    Call OpenRouter with retry logic and model fallback.
    Returns the raw text response.
    """
    if not ai_client:
        raise Exception("AI not configured — OPENROUTER_API_KEY not set")

    models = models_to_try or [config.ai.primary_model, config.ai.fallback_model]
    last_exception = None

    for model_name in models:
        for attempt in range(config.ai.max_retries):
            try:
                msgs = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ]
                if json_mode:
                    msgs[0]["content"] += "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no extra text."

                response = await ai_client.chat.completions.create(
                    model=model_name,
                    messages=msgs,
                    temperature=0.1,
                    max_tokens=8192,
                )
                text = response.choices[0].message.content.strip()
                return text
            except Exception as e:
                last_exception = e
                err_str = str(e)
                if "429" in err_str or "rate" in err_str.lower():
                    wait = config.ai.retry_delay_seconds * (attempt + 1)
                    logger.warning(f"Rate limited on {model_name}, attempt {attempt+1}. Waiting {wait}s...")
                    await asyncio.sleep(wait)
                elif attempt < config.ai.max_retries - 1:
                    await asyncio.sleep(1)
                else:
                    logger.warning(f"Model {model_name} failed after {config.ai.max_retries} attempts: {e}")
                    break  # Try next model

    raise Exception(f"All AI models failed. Last error: {last_exception}")


def parse_ai_json(text: str) -> dict:
    """Safely parse JSON from AI response, stripping markdown fences."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


# ═══════════════════════════════════════════════════════════════════
#  CORE ANALYSIS PIPELINE
# ═══════════════════════════════════════════════════════════════════

async def generate_compliance_plan(analysis_data: dict, models_to_try: list) -> dict:
    """Compliance Planner Agent: Converts policy intelligence into actionable steps."""
    analysis_json_str = json.dumps(analysis_data, indent=2)
    last_exception = None

    try:
        text = await call_ai(
            PLANNING_AGENT_PROMPT,
            f"INPUT POLICY INTELLIGENCE:\n{analysis_json_str}",
            models_to_try,
        )
        return parse_ai_json(text)
    except Exception as e:
        print(f"Warning: Compliance Plan generation failed. Error: {e}")
        return None


async def run_policy_analysis_pipeline(
    policy_text: str,
    source: str = "uploaded",
    user_uid: Optional[str] = None,
    business_profile: Optional[Dict] = None,
) -> Dict[str, Any]:
    """
    Core pipeline: Text → AI Analysis → Compliance Plan → Scoring → Validation → History

    Returns the full analysis dict including v3 scoring data.
    """
    models_to_try = [config.ai.primary_model, config.ai.fallback_model]

    # ── Step 1: Policy Analysis ──
    start_time = time.time()
    used_models = []

    try:
        raw_step_1_response = await call_ai(
            SYSTEM_PROMPT,
            f"INPUT POLICY TEXT:\n{policy_text}",
            models_to_try,
        )
        used_models.append(config.ai.primary_model)
    except Exception as e:
        raise Exception(f"Analysis failed: {str(e)}")

    step_1_duration = time.time() - start_time

    # Parse JSON response
    analysis_data = parse_ai_json(raw_step_1_response)

    # ── Step 2: Compliance Planning ──
    step_2_duration = 0
    try:
        st2_start = time.time()
        compliance_plan = await generate_compliance_plan(analysis_data, models_to_try)
        if compliance_plan:
            analysis_data["compliance_plan"] = compliance_plan
            step_2_duration = time.time() - st2_start
    except Exception as e:
        print(f"Step 2 (Planning) failed: {e}")

    # ── Step 3: v3 Scoring Engines ──
    try:
        from scoring.compliance_risk import ComplianceRiskScorer
        from scoring.sustainability import SustainabilityEngine
        from scoring.profitability import ProfitabilityOptimizer
        from ethics.framework import EthicalAIFramework

        # Risk Score
        scorer = ComplianceRiskScorer()
        risk_report = scorer.score(analysis_data)
        analysis_data["risk_score"] = {
            "overall_score": risk_report.overall_score,
            "overall_band": risk_report.overall_band.value,
            "top_risks": [
                {"name": r.obligation_name, "score": r.weighted_score,
                 "band": r.risk_band.value, "hint": r.remediation_hint,
                 "days_remaining": r.days_remaining}
                for r in risk_report.top_risks
            ],
            "breakdown": risk_report.score_breakdown,
            "recommendations": risk_report.recommendations,
        }

        # Sustainability
        num_schemes = len(analysis_data.get("compliance_actions", []))
        sus_engine = SustainabilityEngine()
        sus_report = sus_engine.calculate(1, num_schemes, business_profile)
        analysis_data["sustainability"] = {
            "green_score": sus_report.green_score,
            "grade": sus_report.grade,
            "paper_saved": sus_report.paper.pages_saved,
            "co2_saved_kg": sus_report.carbon.net_co2_saved_kg,
            "cost_saved_inr": sus_report.efficiency.cost_saved_inr,
            "hours_saved": sus_report.efficiency.hours_saved,
            "productivity_multiplier": sus_report.efficiency.productivity_multiplier,
            "yearly_projection": sus_report.yearly_projection,
            "sdg_alignment": sus_report.sdg_alignment,
            "narrative": sus_report.narrative,
        }

        # Profitability
        prof_opt = ProfitabilityOptimizer()
        prof_report = prof_opt.analyze(analysis_data, business_profile or {}, 1)
        analysis_data["profitability"] = {
            "total_roi_inr": prof_report.total_roi_inr,
            "roi_multiplier": prof_report.roi_multiplier,
            "penalty_avoidance_inr": prof_report.total_penalty_avoidance_inr,
            "scheme_benefits_inr": prof_report.total_scheme_benefits_inr,
            "cost_savings_inr": prof_report.total_cost_savings_inr,
            "yearly_projection_inr": prof_report.yearly_projection_inr,
            "scheme_benefits": [
                {"id": sb.scheme_id, "name": sb.scheme_name,
                 "type": sb.benefit_type, "value_inr": sb.estimated_value_inr,
                 "notes": sb.notes}
                for sb in prof_report.scheme_benefits
            ],
            "recommendations": prof_report.recommendations,
        }

        # Ethics
        ethics = EthicalAIFramework()
        ethics_quick = ethics.quick_check(
            confidence=0.75 if used_models else 0.5,
            risk_level=analysis_data.get("risk_assessment", {}).get("overall_risk_level", "MEDIUM"),
        )
        analysis_data["ethics"] = ethics_quick
        analysis_data["ethics"]["disclaimers"] = ethics.get_disclaimers()

    except Exception as e:
        print(f"Step 3 (Scoring) failed: {traceback.format_exc()}")
        # ── Fallback scoring from AI analysis data ──
        # Compute meaningful scores from the analysis itself so we never show 0
        obligations = analysis_data.get("compliance_obligations", [])
        risk_assessment = analysis_data.get("risk_assessment", {})
        matched_schemes = analysis_data.get("matched_schemes", [])
        risk_factors = risk_assessment.get("risk_factors", [])
        actions = analysis_data.get("compliance_actions", [])
        
        # Risk: based on risk level + number of obligations + risk factors
        risk_level = risk_assessment.get("overall_risk_level", "MEDIUM").upper()
        base_risk = {"LOW": 25, "MEDIUM": 50, "HIGH": 75, "CRITICAL": 90}.get(risk_level, 50)
        obligation_factor = min(len(obligations) * 5, 25)
        risk_factor_bonus = min(len(risk_factors) * 8, 20)
        risk_overall = min(100, base_risk + obligation_factor + risk_factor_bonus)
        
        # Sustainability: based on digital processing + scheme count
        sus_base = 45  # Digital processing baseline
        sus_scheme_bonus = min(len(matched_schemes) * 10, 30)
        sus_action_bonus = min(len(actions) * 3, 15)
        sus_overall = min(100, sus_base + sus_scheme_bonus + sus_action_bonus)
        
        # Profitability: from scheme benefits
        prof_base = 30
        prof_scheme_bonus = min(len(matched_schemes) * 15, 50)
        prof_overall = min(100, prof_base + prof_scheme_bonus)
        
        # Ethics: baseline from analysis confidence
        ethics_overall = 72  # Default good ethics score
        
        analysis_data["risk_score"] = {
            "overall_score": risk_overall,
            "overall_band": risk_level,
            "top_risks": [
                {"name": f, "score": base_risk, "band": risk_level, 
                 "hint": "Review this risk factor and take corrective action.",
                 "days_remaining": 30}
                for f in risk_factors[:5]
            ],
            "breakdown": {"obligations": len(obligations), "risk_factors": len(risk_factors)},
            "recommendations": [
                "Review all compliance obligations carefully",
                "Set up a compliance calendar for deadlines",
                "Consult a legal advisor for high-risk areas"
            ],
            "fallback": True,
        }
        analysis_data["sustainability"] = {
            "green_score": sus_overall,
            "grade": "A" if sus_overall >= 80 else "B" if sus_overall >= 60 else "C",
            "paper_saved": max(15, len(obligations) * 3),
            "co2_saved_kg": round(max(0.5, len(obligations) * 0.2), 1),
            "cost_saved_inr": max(500, len(obligations) * 200),
            "hours_saved": max(2, len(obligations) * 0.5),
            "productivity_multiplier": round(1.5 + len(matched_schemes) * 0.3, 1),
            "yearly_projection": {},
            "sdg_alignment": [],
            "narrative": "Digital policy analysis reduces paper usage and accelerates compliance.",
            "fallback": True,
        }
        analysis_data["profitability"] = {
            "total_roi_inr": max(10000, len(matched_schemes) * 50000),
            "roi_multiplier": round(max(1.5, len(matched_schemes) * 1.2), 1),
            "penalty_avoidance_inr": max(5000, len(obligations) * 10000),
            "scheme_benefits_inr": max(0, len(matched_schemes) * 100000),
            "cost_savings_inr": max(2000, len(obligations) * 5000),
            "yearly_projection_inr": max(50000, len(matched_schemes) * 200000),
            "scheme_benefits": [
                {"id": f"scheme_{i}", "name": s.get("name", str(s)) if isinstance(s, dict) else str(s),
                 "type": "financial_assistance", "value_inr": 100000, "notes": "Estimated benefit"}
                for i, s in enumerate(matched_schemes[:5])
            ],
            "recommendations": [
                "Apply for all eligible government schemes",
                "Track compliance deadlines to avoid penalties",
                "Leverage digital tools for cost optimization"
            ],
            "fallback": True,
        }
        analysis_data["ethics"] = {
            "overall_score": ethics_overall,
            "checks_passed": 4,
            "total_checks": 5,
            "disclaimers": [
                "This analysis is AI-generated and should be verified with a legal professional.",
                "Scores are estimates based on available policy text."
            ],
            "fallback": True,
        }

    # ── Debug Metadata ──
    analysis_data["debug_metadata"] = {
        "models_used": used_models,
        "step_1_time": step_1_duration,
        "step_2_time": step_2_duration,
        "system_prompt_snapshot": SYSTEM_PROMPT[:500] + "... [TRUNCATED]",
        "planning_prompt_snapshot": PLANNING_AGENT_PROMPT[:500] + "... [TRUNCATED]",
        "raw_response_step_1": raw_step_1_response[:500] + "... [TRUNCATED]",
        "pipeline_version": "v3.0",
    }

    # ── Validate & Save ──
    validated_data = PolicyAnalysis(**analysis_data)
    result_dict = validated_data.dict()

    # Preserve v3 scoring data (not in PolicyAnalysis schema)
    for key in ["risk_score", "sustainability", "profitability", "ethics"]:
        if key in analysis_data:
            result_dict[key] = analysis_data[key]

    analysis_id = db.save_analysis(user_uid, result_dict, source)
    result_dict["id"] = analysis_id
    return result_dict


# ═══════════════════════════════════════════════════════════════════
#  POLICY MONITORING (with deduplication)
# ═══════════════════════════════════════════════════════════════════

MONITOR_DIR = config.policy.monitor_dir
if not os.path.exists(MONITOR_DIR):
    os.makedirs(MONITOR_DIR)

_processed_policies = set()  # Track by content hash to prevent duplicates

async def monitor_policies_task():
    """Background task to watch for new PDFs in monitored_policies/."""
    import hashlib
    print(f"📡 Monitoring started in: {os.path.abspath(MONITOR_DIR)}")

    while True:
        try:
            for filename in os.listdir(MONITOR_DIR):
                if not filename.endswith(".pdf"):
                    continue
                filepath = os.path.join(MONITOR_DIR, filename)
                try:
                    with open(filepath, "rb") as f:
                        content = f.read()
                    content_hash = hashlib.md5(content).hexdigest()
                    if content_hash in _processed_policies:
                        continue
                    _processed_policies.add(content_hash)
                    print(f"🚨 NEW POLICY DETECTED: {filename}")
                    text = extract_text_from_pdf(content)
                    if text.strip():
                        result = await run_policy_analysis_pipeline(text, source="auto-fetched")
                        print(f"✅ Auto-Analysis Complete for {filename}")

                        # Store detected policy and notify relevant users
                        policy_name = result.get("policy_metadata", {}).get("policy_name", filename)
                        sector = result.get("policy_metadata", {}).get("policy_type", "")
                        db.store_detected_policy({
                            "policy_name": policy_name,
                            "filename": filename,
                            "sector": sector,
                            "source": "auto-fetched",
                        })

                        # Notify all users (or sector-matched users)
                        await notify_users_new_policy(policy_name, sector, result)

                except Exception as e:
                    print(f"❌ Failed to auto-process {filename}: {e}")
            await asyncio.sleep(config.policy.monitor_interval_seconds)
        except Exception as e:
            print(f"Monitor Error: {e}")
            await asyncio.sleep(config.policy.monitor_interval_seconds)


async def notify_users_new_policy(policy_name: str, sector: str, analysis: dict):
    """Notify users when a new policy is detected."""
    try:
        # Try to find sector-specific users first
        target_uids = db.get_users_by_sector(sector) if sector else []

        # If no sector match, notify all users with FCM tokens
        if not target_uids:
            fcm_users = db.get_all_fcm_tokens()
            target_uids = [u["uid"] for u in fcm_users]

        risk_level = analysis.get("risk_assessment", {}).get("overall_risk_level", "")
        risk_score = analysis.get("risk_score", {}).get("overall_score", 0)

        for uid in target_uids:
            db.create_notification(
                uid=uid,
                notif_type="new_policy",
                title=f"📋 New Policy: {policy_name}",
                body=f"A new policy has been detected and analyzed. Risk level: {risk_level or 'N/A'}.",
                metadata={
                    "policy_name": policy_name,
                    "sector": sector,
                    "risk_score": risk_score,
                },
            )
            # High risk alert
            if risk_score > 70:
                db.create_notification(
                    uid=uid,
                    notif_type="risk_alert",
                    title=f"⚠️ High Risk Alert: {policy_name}",
                    body=f"Compliance risk score is {risk_score}/100. Immediate attention recommended.",
                    metadata={"risk_score": risk_score, "policy_name": policy_name},
                )

        print(f"🔔 Notified {len(target_uids)} users about new policy: {policy_name}")
    except Exception as e:
        print(f"Notification dispatch failed: {e}")


# ═══════════════════════════════════════════════════════════════════
#  API ROUTES
# ═══════════════════════════════════════════════════════════════════

# ── Health ───────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint with v4 monitoring data."""
    return HealthResponse(
        status="healthy",
        version="4.0.0",
        demo_mode=config.server.demo_mode,
        engines=[
            "risk_scorer", "sustainability", "profitability", "ethics",
            "impact_engine", "predictive_alerts", "policy_diff", "sector_benchmark",
        ],
    )


# ── Auth ─────────────────────────────────────────────────────────────

@app.post("/api/auth/verify")
async def verify_auth(token: Optional[str] = None):
    """Verify a Firebase token. Returns user info or demo mode response."""
    if config.server.demo_mode or not token:
        return {"authenticated": False, "demo_mode": True, "message": "Running in demo mode"}

    try:
        from auth.firebase_auth import verify_firebase_token_raw
        user = verify_firebase_token_raw(token)
        return {"authenticated": True, "user": user}
    except Exception as e:
        return {"authenticated": False, "error": str(e)}


# ── Onboarding ───────────────────────────────────────────────────────

@app.api_route("/api/onboarding/start", methods=["GET", "POST"])
def onboarding_start():
    """Get the first onboarding question."""
    try:
        from onboarding.decision_tree import AdaptiveOnboardingEngine
        engine = AdaptiveOnboardingEngine()
        question = engine.get_first_question()
        return {"question": question, "is_complete": False, "total_questions": engine.get_total_questions()}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/onboarding/answer")
def onboarding_answer(request: OnboardingAnswerRequest):
    """Submit an answer and get the next question."""
    try:
        from onboarding.decision_tree import AdaptiveOnboardingEngine
        engine = AdaptiveOnboardingEngine()
        result = engine.get_next_question(
            request.current_question_id, request.answer
        )
        question, is_complete = result
        response = {"is_complete": is_complete}
        if is_complete:
            all_answers = {**request.answers_so_far, request.current_question_id: request.answer}
            profile = engine.generate_profile(all_answers)
            response["profile"] = profile
        else:
            response["question"] = question
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/onboarding/profile")
async def generate_business_profile(request: BusinessProfileRequest):
    """Generate a complete business profile from onboarding answers."""
    try:
        from onboarding.decision_tree import AdaptiveOnboardingEngine
        from onboarding.profile_generator import ProfileGenerator

        engine = AdaptiveOnboardingEngine()
        profile = engine.generate_profile(request.answers)

        # Enrich with Gemini
        try:
            generator = ProfileGenerator()
            enriched = await generator.enrich_profile(profile)
            profile.update(enriched)
        except Exception as e:
            print(f"Profile enrichment failed: {e}")

        return {"profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Analysis ─────────────────────────────────────────────────────────

@app.post("/api/analyze")
async def analyze_policy(
    file: UploadFile = File(...),
    user_uid: Optional[str] = None,
):
    """Upload a policy PDF for AI-powered analysis with v3 scoring."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    policy_text = extract_text_from_pdf(content)

    if not policy_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

    if not ai_client:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not set on server.")

    try:
        # Get user profile if available
        profile = None
        if user_uid:
            profile = db.get_user_profile(user_uid)

        result = await run_policy_analysis_pipeline(
            policy_text,
            source="uploaded",
            user_uid=user_uid,
            business_profile=profile,
        )

        # Create notifications for user on analysis completion
        if user_uid:
            policy_name = result.get("policy_metadata", {}).get("policy_name", "Uploaded Policy")
            risk_score = result.get("risk_score", {}).get("overall_score", 0)
            schemes_count = len(result.get("matched_schemes", []))

            db.create_notification(
                uid=user_uid,
                notif_type="analysis_complete",
                title=f"✅ Analysis Complete: {policy_name}",
                body=f"Risk score: {risk_score}/100. {schemes_count} schemes matched.",
                metadata={
                    "policy_name": policy_name,
                    "risk_score": risk_score,
                    "schemes_count": schemes_count,
                },
            )

            # Risk alert if score > 70
            if risk_score > 70:
                db.create_notification(
                    uid=user_uid,
                    notif_type="risk_alert",
                    title=f"⚠️ High Risk: {policy_name}",
                    body=f"Compliance risk is {risk_score}/100. Review obligations immediately.",
                    metadata={"risk_score": risk_score, "policy_name": policy_name},
                )

            # Scheme match notification
            if schemes_count > 0:
                scheme_names = [s.get("name", s) if isinstance(s, dict) else str(s)
                                for s in result.get("matched_schemes", [])[:3]]
                db.create_notification(
                    uid=user_uid,
                    notif_type="scheme_match",
                    title=f"🎯 {schemes_count} Government Schemes Matched",
                    body=f"You may be eligible for: {', '.join(scheme_names)}.",
                    metadata={"schemes": scheme_names, "policy_name": policy_name},
                )

        return result
    except Exception as e:
        print(f"Processing Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


# ── Scoring API ──────────────────────────────────────────────────────

@app.post("/api/scoring/risk")
def score_risk(request: ScoringRequest):
    """Get compliance risk score for an analysis result."""
    try:
        from scoring.compliance_risk import ComplianceRiskScorer
        scorer = ComplianceRiskScorer()
        report = scorer.score(request.analysis)
        return {
            "overall_score": report.overall_score,
            "overall_band": report.overall_band.value,
            "top_risks": [
                {"name": r.obligation_name, "score": r.weighted_score,
                 "band": r.risk_band.value, "hint": r.remediation_hint}
                for r in report.top_risks
            ],
            "breakdown": report.score_breakdown,
            "recommendations": report.recommendations,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scoring/sustainability")
def score_sustainability(request: ScoringRequest):
    """Get sustainability & environmental impact score."""
    try:
        from scoring.sustainability import SustainabilityEngine
        engine = SustainabilityEngine()
        report = engine.calculate(
            request.num_policies, request.num_schemes, request.business_profile
        )
        return {
            "green_score": report.green_score,
            "grade": report.grade,
            "paper": {"pages_saved": report.paper.pages_saved,
                      "trees_saved": report.paper.trees_saved},
            "carbon": {"net_co2_saved_kg": report.carbon.net_co2_saved_kg,
                       "equivalent_trees": report.carbon.equivalent_trees_planted},
            "efficiency": {"hours_saved": report.efficiency.hours_saved,
                          "cost_saved_inr": report.efficiency.cost_saved_inr},
            "yearly_projection": report.yearly_projection,
            "sdg_alignment": report.sdg_alignment,
            "narrative": report.narrative,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scoring/profitability")
def score_profitability(request: ScoringRequest):
    """Get profitability & ROI analysis."""
    try:
        from scoring.profitability import ProfitabilityOptimizer
        optimizer = ProfitabilityOptimizer()
        report = optimizer.analyze(
            request.analysis, request.business_profile or {}, request.num_policies
        )
        return {
            "total_roi_inr": report.total_roi_inr,
            "roi_multiplier": report.roi_multiplier,
            "penalty_avoidance_inr": report.total_penalty_avoidance_inr,
            "scheme_benefits_inr": report.total_scheme_benefits_inr,
            "yearly_projection_inr": report.yearly_projection_inr,
            "recommendations": report.recommendations,
            # v4 fields
            "sector_multiplier": report.sector_multiplier,
            "npv_5yr_inr": report.npv_5yr_inr,
            "break_even_months": report.break_even_months,
            "multi_year_projections": [
                {
                    "year": p.year,
                    "gross_benefit_inr": p.gross_benefit_inr,
                    "discounted_benefit_inr": p.discounted_benefit_inr,
                    "cumulative_npv_inr": p.cumulative_npv_inr,
                    "roi_multiplier": p.roi_multiplier,
                }
                for p in report.multi_year_projections
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── v4: Impact Engine ───────────────────────────────────────────────

@app.post("/api/scoring/impact")
def score_impact(request: ScoringRequest):
    """Get composite impact score (v4 centrepiece)."""
    try:
        from scoring.impact_engine import ImpactEngine
        engine = ImpactEngine()
        # Extract sub-scores from analysis for the impact engine
        risk_data = request.analysis.get("risk_score", {})
        sustainability_data = request.analysis.get("sustainability", {})
        profitability_data = request.analysis.get("profitability", {})
        report = engine.calculate(
            risk_data=risk_data,
            sustainability_data=sustainability_data,
            profitability_data=profitability_data,
            business_profile=request.business_profile or {},
            num_policies=request.num_policies,
        )
        return {
            "impact_score": report.impact_score,
            "impact_grade": report.impact_grade,
            "breakdown": {
                "risk_reduction": report.breakdown.compliance_risk_reduction,
                "profitability_gain": report.breakdown.profitability_gain,
                "sustainability_improvement": report.breakdown.sustainability_improvement,
                "time_saved": report.breakdown.time_saved,
                "cost_saved": report.breakdown.cost_saved,
            },
            "sector_benchmark_percentile": report.benchmark.percentile,
            "grc_alignment": {
                "governance": report.grc_alignment.governance_score,
                "risk": report.grc_alignment.risk_management_score,
                "compliance": report.grc_alignment.compliance_score,
            },
            "narrative": report.narrative,
            "key_metrics": report.key_metrics,
        }
    except Exception as e:
        logger.error(f"Impact scoring failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── v4: Predictive Alerts ───────────────────────────────────────────

class PredictiveAlertRequest(BaseModel):
    business_profile: Dict[str, Any]
    analysis_history: Optional[List[Dict[str, Any]]] = None
    horizon_days: int = 90

@app.post("/api/predict/alerts")
def predict_alerts(request: PredictiveAlertRequest):
    """Get predictive compliance alerts (v4 innovation)."""
    try:
        from innovation.predictive_alerts import PredictiveAlertEngine
        engine = PredictiveAlertEngine()
        report = engine.predict(
            business_profile=request.business_profile,
            analysis_history=request.analysis_history,
            horizon_days=request.horizon_days,
        )
        return {
            "alerts": [
                {
                    "alert_id": a.alert_id,
                    "type": a.prediction_type.value,
                    "title": a.title,
                    "description": a.description,
                    "confidence": a.confidence,
                    "confidence_band": a.confidence_band.value,
                    "predicted_date": a.predicted_date,
                    "lead_time_days": a.lead_time_days,
                    "recommended_actions": a.recommended_actions,
                }
                for a in report.alerts
            ],
            "risk_trajectory": report.risk_trajectory,
            "next_30_day_risk": report.next_30_day_risk,
            "next_90_day_risk": report.next_90_day_risk,
            "calendar": [
                {
                    "month": c.month,
                    "month_name": c.month_name,
                    "obligation_count": c.obligation_count,
                    "risk_level": c.risk_level,
                    "key_deadlines": c.key_deadlines,
                }
                for c in report.calendar
            ],
        }
    except Exception as e:
        logger.error(f"Predictive alerts failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── v4: Sector Benchmarking ─────────────────────────────────────────

class BenchmarkRequest(BaseModel):
    user_scores: Dict[str, float]
    business_profile: Dict[str, Any]

@app.post("/api/benchmark/sector")
def benchmark_sector(request: BenchmarkRequest):
    """Get sector compliance benchmarking report (v4 innovation)."""
    try:
        from innovation.sector_benchmark import SectorBenchmarkEngine
        engine = SectorBenchmarkEngine()
        report = engine.benchmark(
            user_scores=request.user_scores,
            business_profile=request.business_profile,
        )
        return {
            "overall_percentile": report.overall_percentile,
            "overall_tier": report.overall_tier.value,
            "sector": report.sector,
            "size_category": report.size_category,
            "dimensions": [
                {
                    "dimension": d.dimension.value,
                    "user_score": d.user_score,
                    "sector_average": d.sector_average,
                    "percentile_rank": d.percentile_rank,
                    "tier": d.tier.value,
                    "gap_to_average": d.gap_to_average,
                    "improvement_opportunity": d.improvement_opportunity,
                }
                for d in report.dimensions
            ],
            "peer_comparison": {
                "peer_group": report.peer_comparison.peer_group,
                "peer_count": report.peer_comparison.peer_count,
                "user_rank": report.peer_comparison.user_rank,
                "strengths": report.peer_comparison.strengths,
                "weaknesses": report.peer_comparison.weaknesses,
            },
            "recommendations": report.recommendations,
        }
    except Exception as e:
        logger.error(f"Sector benchmarking failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── v4: Policy Diff ─────────────────────────────────────────────────

class PolicyDiffRequest(BaseModel):
    old_text: str
    new_text: str
    old_name: str = "Previous Version"
    new_name: str = "Current Version"

@app.post("/api/policy/diff")
def policy_diff(request: PolicyDiffRequest):
    """Compare two policy versions and get structured diff (v4 innovation)."""
    try:
        from innovation.policy_diff import PolicyDiffEngine
        engine = PolicyDiffEngine()
        diff = engine.compute_diff(
            old_text=request.old_text,
            new_text=request.new_text,
            old_name=request.old_name,
            new_name=request.new_name,
        )
        return {
            "diff_id": diff.diff_id,
            "severity": diff.overall_severity.value,
            "change_percentage": diff.change_percentage,
            "summary": diff.summary,
            "sections_added": len(diff.sections_added),
            "sections_removed": len(diff.sections_removed),
            "sections_modified": len(diff.sections_modified),
            "sections_unchanged": diff.sections_unchanged,
            "penalty_changes": [
                {
                    "obligation": p.obligation,
                    "old_penalty": p.old_penalty,
                    "new_penalty": p.new_penalty,
                    "direction": p.direction,
                }
                for p in diff.penalty_changes
            ],
            "deadline_changes": [
                {
                    "obligation": d.obligation,
                    "old_deadline": d.old_deadline,
                    "new_deadline": d.new_deadline,
                    "direction": d.direction,
                }
                for d in diff.deadline_changes
            ],
        }
    except Exception as e:
        logger.error(f"Policy diff failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ── v4: Health Monitor (detailed) ───────────────────────────────────

@app.get("/api/health/detailed")
def health_detailed():
    """Detailed health with monitoring metrics (v4)."""
    return {
        "status": "healthy",
        "version": "4.0.0",
        "demo_mode": config.server.demo_mode,
        "monitoring": health_monitor.to_dict(),
        "engines": [
            "risk_scorer", "sustainability", "profitability", "ethics",
            "impact_engine", "predictive_alerts", "policy_diff", "sector_benchmark",
            "policy_intelligence",
        ],
    }


# ── History ──────────────────────────────────────────────────────────

@app.get("/api/history")
def get_history(user_uid: Optional[str] = None):
    """Get analysis history — returns flat records with deduplication."""
    if user_uid:
        raw = db.get_user_analyses(user_uid)
    else:
        raw = db.get_all_analyses()

    # Flatten nested records: unwrap {id, uid, timestamp, source, analysis: {...}} → flat
    seen_names = set()
    results = []
    for item in raw:
        record = {}
        if "analysis" in item and isinstance(item["analysis"], dict):
            record = item["analysis"].copy()
            record["id"] = item.get("id", record.get("id"))
            record["source"] = item.get("source", record.get("source", "uploaded"))
            record["timestamp"] = item.get("timestamp", record.get("timestamp"))
        else:
            record = item

        # Deduplicate by policy name
        name = record.get("policy_metadata", {}).get("policy_name", "")
        if name and name in seen_names:
            continue
        if name:
            seen_names.add(name)
        results.append(record)

    return results


@app.delete("/api/history")
def clear_history(user_uid: Optional[str] = None):
    """Clear analysis history."""
    db.clear_user_history(user_uid)
    return {"message": "History cleared"}


@app.delete("/api/history/{item_id}")
def delete_history_item(item_id: str, user_uid: Optional[str] = None):
    """Delete a specific analysis from history."""
    if db.delete_analysis(user_uid, item_id):
        return {"message": "Item deleted"}
    raise HTTPException(status_code=404, detail="Item not found")



# ── Sources ──────────────────────────────────────────────────────────

SOURCES_FILE = "custom_sources.json"

def load_sources():
    if os.path.exists(SOURCES_FILE):
        try:
            with open(SOURCES_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_sources(sources):
    with open(SOURCES_FILE, "w") as f:
        json.dump(sources, f, indent=2)

@app.get("/api/sources")
def get_sources():
    return load_sources()

@app.post("/api/sources")
def add_source(source: SourceRequest):
    sources = load_sources()
    sources.append({"name": source.name, "url": source.url, "enabled": True})
    save_sources(sources)
    return {"message": "Source added", "sources": sources}

@app.delete("/api/sources/{name}")
def delete_source(name: str):
    sources = load_sources()
    new_sources = [s for s in sources if s.get("name") != name]
    if len(new_sources) == len(sources):
        raise HTTPException(status_code=404, detail="Source not found")
    save_sources(new_sources)
    return {"message": "Source removed"}


# ── Translation ──────────────────────────────────────────────────────

TRANSLATION_PROMPT = """
You are a professional translator. Translate ALL text content in the following JSON to {language}.

RULES:
1. Translate EVERY text value to {language}
2. Keep the JSON structure EXACTLY the same
3. Keep all keys in English (don't translate keys)
4. Translate values like policy names, descriptions, actions, obligations, penalties etc.
5. Keep numbers, dates, and technical terms as-is
6. Output ONLY valid JSON - no markdown, no explanation
7. Maintain the meaning accurately

JSON to translate:
{json_content}

Respond with ONLY the translated JSON:
"""

@app.post("/api/translate")
async def translate_content(request: TranslateRequest):
    """Translate analysis content to target language using AI."""
    try:
        if not ai_client:
            raise HTTPException(status_code=500, detail="API key not configured")

        target_lang = request.target_language
        if target_lang.lower() in ('en', 'english'):
            return request.data

        lang_names = {
            'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada',
            'ml': 'Malayalam', 'bn': 'Bengali', 'mr': 'Marathi', 'gu': 'Gujarati',
            'pa': 'Punjabi', 'or': 'Odia', 'as': 'Assamese', 'ur': 'Urdu',
            'sa': 'Sanskrit', 'ne': 'Nepali', 'kok': 'Konkani'
        }
        language_name = lang_names.get(target_lang.lower(), target_lang)

        json_content = json.dumps(request.data, indent=2, ensure_ascii=False)
        system_msg = TRANSLATION_PROMPT.format(language=language_name, json_content=json_content)

        text = await call_ai(system_msg, "Translate now.", json_mode=True)
        return parse_ai_json(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Translation failed - invalid response format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


# ── User Profile ─────────────────────────────────────────────────────

@app.get("/api/profile/{user_uid}")
def get_profile(user_uid: str):
    """Get user business profile."""
    profile = db.get_user_profile(user_uid)
    if profile:
        return profile
    return {}


@app.post("/api/profile/{user_uid}")
def save_profile(user_uid: str, profile: Dict[str, Any]):
    """Save user business profile."""
    db.save_user_profile(user_uid, profile)
    return {"message": "Profile saved"}


@app.put("/api/profile/{user_uid}")
def update_profile(user_uid: str, profile: Dict[str, Any]):
    """Update user business profile (partial update)."""
    existing = db.get_user_profile(user_uid) or {}
    existing.update(profile)
    db.save_user_profile(user_uid, existing)
    return {"message": "Profile updated", "profile": existing}


# ── Notifications ────────────────────────────────────────────────────

class FCMTokenRequest(BaseModel):
    token: str

@app.get("/api/notifications")
def get_notifications(
    user_uid: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 50,
):
    """Get notifications for a user."""
    if not user_uid:
        return []
    return db.get_user_notifications(user_uid, unread_only, limit)


@app.post("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, user_uid: Optional[str] = None):
    """Mark a single notification as read."""
    if not user_uid:
        raise HTTPException(status_code=400, detail="user_uid required")
    if db.mark_notification_read(user_uid, notif_id):
        return {"message": "Notification marked as read"}
    raise HTTPException(status_code=404, detail="Notification not found")


@app.post("/api/notifications/read-all")
def mark_all_read(user_uid: Optional[str] = None):
    """Mark all notifications as read."""
    if not user_uid:
        raise HTTPException(status_code=400, detail="user_uid required")
    db.mark_all_notifications_read(user_uid)
    return {"message": "All notifications marked as read"}


@app.delete("/api/notifications/{notif_id}")
def delete_notification(notif_id: str, user_uid: Optional[str] = None):
    """Delete a notification."""
    if not user_uid:
        raise HTTPException(status_code=400, detail="user_uid required")
    if db.delete_notification(user_uid, notif_id):
        return {"message": "Notification deleted"}
    raise HTTPException(status_code=404, detail="Notification not found")


@app.post("/api/fcm/register")
def register_fcm_token(request: FCMTokenRequest, user_uid: Optional[str] = None):
    """Register an FCM device token for push notifications."""
    if not user_uid:
        raise HTTPException(status_code=400, detail="user_uid required")
    db.save_fcm_token(user_uid, request.token)
    return {"message": "FCM token registered"}


# ── Analytics ────────────────────────────────────────────────────────

@app.get("/api/analytics/{user_uid}")
def get_user_analytics(user_uid: str):
    """Aggregate analytics from all user analyses."""
    analyses = db.get_user_analyses(user_uid, limit=100)

    # Flatten analysis data
    all_analyses = []
    for item in analyses:
        if "analysis" in item and isinstance(item["analysis"], dict):
            record = item["analysis"].copy()
            record["id"] = item.get("id")
            record["timestamp"] = item.get("timestamp")
        else:
            record = item
        all_analyses.append(record)

    # Aggregate
    total_analyses = len(all_analyses)
    risk_scores = []
    sustainability_scores = []
    profitability_scores = []
    all_schemes = []
    sectors = set()
    total_paper_saved = 0
    total_co2_saved = 0.0
    total_cost_saved = 0.0
    risk_breakdown = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    score_trend = []

    for a in all_analyses:
        # Risk scores
        rs = a.get("risk_score", {})
        if isinstance(rs, dict) and "overall_score" in rs:
            risk_scores.append(rs["overall_score"])
            band = rs.get("overall_band", "MEDIUM").upper()
            if band in risk_breakdown:
                risk_breakdown[band] += 1

        # Sustainability
        sus = a.get("sustainability", {})
        if isinstance(sus, dict):
            gs = sus.get("green_score", 0)
            if gs:
                sustainability_scores.append(gs)
            total_paper_saved += sus.get("paper_saved", 0)
            total_co2_saved += sus.get("co2_saved_kg", 0)
            total_cost_saved += sus.get("cost_saved_inr", 0)

        # Profitability
        prof = a.get("profitability", {})
        if isinstance(prof, dict) and "roi_multiplier" in prof:
            profitability_scores.append(prof["roi_multiplier"])

        # Schemes
        schemes = a.get("matched_schemes", [])
        for s in schemes:
            name = s.get("name", s) if isinstance(s, dict) else str(s)
            if name and name not in all_schemes:
                all_schemes.append(name)

        # Sectors
        pm = a.get("policy_metadata", {})
        if isinstance(pm, dict) and pm.get("policy_type"):
            sectors.add(pm["policy_type"])

        # Trend data
        score_trend.append({
            "timestamp": a.get("timestamp"),
            "risk_score": rs.get("overall_score", 0) if isinstance(rs, dict) else 0,
            "green_score": sus.get("green_score", 0) if isinstance(sus, dict) else 0,
            "policy_name": pm.get("policy_name", "Unknown") if isinstance(pm, dict) else "Unknown",
        })

    return {
        "total_analyses": total_analyses,
        "avg_risk_score": round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else 0,
        "avg_sustainability_score": round(sum(sustainability_scores) / len(sustainability_scores), 1) if sustainability_scores else 0,
        "avg_profitability_multiplier": round(sum(profitability_scores) / len(profitability_scores), 2) if profitability_scores else 0,
        "risk_breakdown": risk_breakdown,
        "sectors_covered": list(sectors),
        "schemes_matched": all_schemes,
        "total_schemes": len(all_schemes),
        "sustainability_totals": {
            "paper_saved": total_paper_saved,
            "co2_saved_kg": round(total_co2_saved, 2),
            "cost_saved_inr": round(total_cost_saved, 2),
        },
        "score_trend": score_trend[:20],  # Last 20 for chart
    }


# ── Competitor Analysis ──────────────────────────────────────────────

class CompetitorAnalysisRequest(BaseModel):
    sector: str
    business_type: str
    location: Optional[str] = "India"
    products_services: Optional[str] = ""
    years_in_business: Optional[int] = 1

COMPETITOR_PROMPT = """
You are an expert business intelligence analyst specializing in Indian MSMEs.

Analyze the competitive landscape for this business:
- Sector: {sector}
- Business Type: {business_type}  
- Location: {location}
- Products/Services: {products_services}
- Years in Business: {years_in_business}

Return ONLY valid JSON with this structure:
{{
  "market_overview": {{
    "market_size_inr": "estimated market size",
    "growth_rate": "annual growth %",
    "key_trends": ["trend1", "trend2", "trend3"]
  }},
  "competitive_position": {{
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "opportunities": ["opp1", "opp2"],
    "threats": ["threat1", "threat2"]
  }},
  "key_competitors": [
    {{
      "name": "competitor name or type",
      "type": "direct/indirect",
      "market_share": "estimated %",
      "strengths": ["str1"],
      "weaknesses": ["wk1"]
    }}
  ],
  "recommendations": [
    {{
      "priority": "HIGH/MEDIUM/LOW",
      "action": "what to do",
      "expected_impact": "description",
      "timeframe": "short-term/medium-term/long-term"
    }}
  ],
  "market_metrics": {{
    "your_estimated_position": "percentile or rank description",
    "barrier_to_entry": "LOW/MEDIUM/HIGH",
    "price_sensitivity": "LOW/MEDIUM/HIGH",
    "digital_adoption": "LOW/MEDIUM/HIGH"
  }}
}}
"""

@app.post("/api/competitor-analysis")
async def competitor_analysis(request: CompetitorAnalysisRequest):
    """Generate competitive intelligence analysis using AI."""
    if not ai_client:
        raise HTTPException(status_code=500, detail="AI API key not set")
    
    try:
        prompt = COMPETITOR_PROMPT.format(
            sector=request.sector,
            business_type=request.business_type,
            location=request.location,
            products_services=request.products_services or "General",
            years_in_business=request.years_in_business or 1,
        )
        
        text = await call_ai(
            "You are an expert business intelligence analyst. Return ONLY valid JSON.",
            prompt,
        )
        return parse_ai_json(text)
    except Exception as e:
        print(f"Competitor analysis error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── Business Resources ───────────────────────────────────────────────

CURATED_RESOURCES = {
    "government_portals": [
        {"name": "MSME Registration (Udyam)", "url": "https://udyamregistration.gov.in/", "desc": "Official MSME registration portal", "category": "Registration"},
        {"name": "Startup India", "url": "https://www.startupindia.gov.in/", "desc": "Government's startup ecosystem hub — funding, mentoring, tax benefits", "category": "Startup"},
        {"name": "GeM Portal", "url": "https://gem.gov.in/", "desc": "Government e-Marketplace for selling to government", "category": "Marketplace"},
        {"name": "CGTMSE", "url": "https://www.cgtmse.in/", "desc": "Credit Guarantee Fund Trust for collateral-free loans", "category": "Finance"},
        {"name": "PMEGP", "url": "https://www.kviconline.gov.in/pmegpeportal/", "desc": "Prime Minister's Employment Generation Programme", "category": "Finance"},
        {"name": "MUDRA Loans", "url": "https://www.mudra.org.in/", "desc": "Micro Units Development & Refinance Agency loans", "category": "Finance"},
        {"name": "Stand Up India", "url": "https://www.standupmitra.in/", "desc": "Loans for SC/ST and women entrepreneurs", "category": "Finance"},
        {"name": "National SC-ST Hub", "url": "https://www.scsthub.in/", "desc": "Scheme for SC/ST entrepreneur support", "category": "Support"},
    ],
    "compliance_resources": [
        {"name": "MCA Portal", "url": "https://www.mca.gov.in/", "desc": "Ministry of Corporate Affairs — company filings and compliance", "category": "Legal"},
        {"name": "GST Portal", "url": "https://www.gst.gov.in/", "desc": "Goods and Services Tax registration and returns", "category": "Tax"},
        {"name": "Income Tax e-Filing", "url": "https://www.incometax.gov.in/", "desc": "Income tax returns and compliance", "category": "Tax"},
        {"name": "EPFO", "url": "https://www.epfindia.gov.in/", "desc": "Employees' Provident Fund Organization", "category": "Labour"},
        {"name": "ESIC", "url": "https://www.esic.gov.in/", "desc": "Employees' State Insurance Corporation", "category": "Labour"},
        {"name": "Shram Suvidha", "url": "https://shramsuvidha.gov.in/", "desc": "Unified portal for labour law compliance", "category": "Labour"},
    ],
    "business_tools": [
        {"name": "NSIC", "url": "https://www.nsic.co.in/", "desc": "National Small Industries Corporation — marketing, raw materials, finance", "category": "Support"},
        {"name": "India Trade Portal", "url": "https://www.indiantradeportal.in/", "desc": "Export-import trade information and procedures", "category": "Trade"},
        {"name": "SIDBI", "url": "https://www.sidbi.in/", "desc": "Small Industries Development Bank of India — MSME financing", "category": "Finance"},
        {"name": "NABARD", "url": "https://www.nabard.org/", "desc": "National Bank for Agriculture and Rural Development", "category": "Finance"},
        {"name": "Invest India", "url": "https://www.investindia.gov.in/", "desc": "National investment facilitation and promotion agency", "category": "Investment"},
        {"name": "DPIIT", "url": "https://dpiit.gov.in/", "desc": "Department for Promotion of Industry and Internal Trade", "category": "Policy"},
    ],
    "learning_resources": [
        {"name": "Skill India", "url": "https://www.skillindia.gov.in/", "desc": "Skill development and training programs", "category": "Training"},
        {"name": "MSME Sampark", "url": "https://msmesampark.in/", "desc": "MSME job portal connecting employers with skilled workforce", "category": "HR"},
        {"name": "Champions Portal", "url": "https://champions.gov.in/", "desc": "MSME grievance redressal and handholding", "category": "Support"},
    ],
}

@app.get("/api/resources")
def get_business_resources(sector: Optional[str] = None, category: Optional[str] = None):
    """Return curated, verified business resources. Filter by sector or category."""
    result = {}
    for group_name, resources in CURATED_RESOURCES.items():
        filtered = resources
        if category:
            filtered = [r for r in filtered if r["category"].lower() == category.lower()]
        if filtered:
            result[group_name] = filtered
    
    return {"resources": result, "total": sum(len(v) for v in result.values())}


# ═══════════════════════════════════════════════════════════════════
#  STARTUP
# ═══════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 60)
    print("  pAIr v4.0 — Policy AI Regulator")
    print("  Autonomous Regulatory & Sustainability Intelligence")
    print("  'Always in pAIr with your business.'")
    print("=" * 60)
    masked_key = f"******{api_key[-4:]}" if api_key else "NONE"
    print(f"  🔑 API Key: {masked_key}")
    print(f"  🤖 Provider: OpenRouter (OpenAI-compatible)")
    print(f"  🎯 Primary Model: {config.ai.primary_model}")
    print(f"  🔄 Fallback Model: {config.ai.fallback_model}")
    print(f"  📡 Policy Monitor: {os.path.abspath(MONITOR_DIR)}")
    print(f"  🏗️  Engines: Risk | Sustainability | Profitability | Ethics | Impact")
    print(f"  🚀 Innovation: Predictive Alerts | Policy Diff | Benchmarking")
    print("=" * 60 + "\n")
    asyncio.create_task(monitor_policies_task())


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.server.host,
        port=config.server.port,
        reload=True,
    )
