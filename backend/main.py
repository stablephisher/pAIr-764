"""
pAIr v3 — Main FastAPI Server
================================
Production-grade MSME compliance & scheme navigator.

Routes
------
  Auth:        /api/auth/verify, /api/auth/me
  Onboarding:  /api/onboarding/start, /api/onboarding/answer, /api/onboarding/profile
  Analysis:    /api/analyze (PDF upload)
  Scoring:     /api/scoring/risk, /api/scoring/sustainability, /api/scoring/profitability
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
import google.generativeai as genai
from pypdf import PdfReader

from config import config
from schemas import PolicyAnalysis
from db.firestore import FirestoreDB

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
    title="pAIr — MSME Compliance & Scheme Navigator",
    description="AI-powered policy analysis platform for Indian MSMEs",
    version="3.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.server.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = config.gemini.api_key or os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Database
db = FirestoreDB()

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
#  CORE ANALYSIS PIPELINE
# ═══════════════════════════════════════════════════════════════════

async def generate_compliance_plan(analysis_data: dict, models_to_try: list) -> dict:
    """Compliance Planner Agent: Converts policy intelligence into actionable steps."""
    analysis_json_str = json.dumps(analysis_data, indent=2)
    last_exception = None

    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            max_retries = config.gemini.max_retries
            for attempt in range(max_retries):
                try:
                    response = model.generate_content(
                        f"{PLANNING_AGENT_PROMPT}\n\nINPUT POLICY INTELLIGENCE:\n{analysis_json_str}",
                        generation_config={"response_mime_type": "application/json"}
                    )
                    plan_text = response.text
                    if plan_text.startswith("```json"): plan_text = plan_text[7:-3]
                    elif plan_text.startswith("```"): plan_text = plan_text[3:-3]
                    return json.loads(plan_text)
                except Exception as inner_e:
                    last_exception = inner_e
                    if "429" in str(inner_e):
                        print(f"⚠️ Rate limited on {model_name} (Planning). Retrying in {config.gemini.retry_delay_seconds}s...")
                        await asyncio.sleep(config.gemini.retry_delay_seconds)
                    else:
                        raise inner_e
        except Exception as e:
            last_exception = e

    print(f"Warning: Compliance Plan generation failed. Last error: {last_exception}")
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
    models_to_try = [config.gemini.primary_model, config.gemini.fallback_model]

    # ── Step 1: Policy Analysis ──
    start_time = time.time()
    response = None
    last_exception = None
    used_models = []

    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            for attempt in range(config.gemini.max_retries):
                try:
                    genai.configure(api_key=api_key)
                    response = model.generate_content(
                        f"{SYSTEM_PROMPT}\n\nINPUT POLICY TEXT:\n{policy_text}",
                        generation_config={"response_mime_type": config.gemini.response_mime_type}
                    )
                    used_models.append(model_name)
                    break
                except Exception as inner_e:
                    last_exception = inner_e
                    if "429" in str(inner_e):
                        await asyncio.sleep(config.gemini.retry_delay_seconds)
                    else:
                        raise inner_e
            if response:
                break
        except Exception as e:
            last_exception = e

    if not response:
        raise Exception(f"Analysis failed. Last error: {str(last_exception)}")

    step_1_duration = time.time() - start_time

    # Parse JSON response
    response_text = response.text
    raw_step_1_response = response_text
    if response_text.startswith("```json"): response_text = response_text[7:-3]
    elif response_text.startswith("```"): response_text = response_text[3:-3]
    analysis_data = json.loads(response_text)

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
        analysis_data["risk_score"] = {"error": str(e)}
        analysis_data["sustainability"] = {"error": str(e)}
        analysis_data["profitability"] = {"error": str(e)}

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

    db.save_analysis(user_uid, result_dict, source)
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
                        await run_policy_analysis_pipeline(text, source="auto-fetched")
                        print(f"✅ Auto-Analysis Complete for {filename}")
                except Exception as e:
                    print(f"❌ Failed to auto-process {filename}: {e}")
            await asyncio.sleep(config.policy.monitor_interval_seconds)
        except Exception as e:
            print(f"Monitor Error: {e}")
            await asyncio.sleep(config.policy.monitor_interval_seconds)


# ═══════════════════════════════════════════════════════════════════
#  API ROUTES
# ═══════════════════════════════════════════════════════════════════

# ── Health ───────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="3.0.0",
        demo_mode=config.server.demo_mode,
        engines=["risk_scorer", "sustainability", "profitability", "ethics"],
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

    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set on server.")

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
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    """Translate analysis content to target language using Gemini."""
    try:
        if not api_key:
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
        prompt = TRANSLATION_PROMPT.format(language=language_name, json_content=json_content)

        model = genai.GenerativeModel(config.gemini.primary_model)
        response = model.generate_content(prompt)

        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()

        return json.loads(response_text)
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
    return {"message": "No profile found", "has_profile": False}


@app.post("/api/profile/{user_uid}")
def save_profile(user_uid: str, profile: Dict[str, Any]):
    """Save user business profile."""
    db.save_user_profile(user_uid, profile)
    return {"message": "Profile saved"}


# ═══════════════════════════════════════════════════════════════════
#  STARTUP
# ═══════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 60)
    print("  pAIr v3.0 — MSME Compliance & Scheme Navigator")
    print("=" * 60)
    masked_key = f"******{api_key[-4:]}" if api_key else "NONE"
    print(f"  🔑 API Key: {masked_key}")
    print(f"  🎯 Primary Model: {config.gemini.primary_model}")
    print(f"  🔄 Demo Mode: {config.server.demo_mode}")
    print(f"  📡 Policy Monitor: {os.path.abspath(MONITOR_DIR)}")
    print(f"  🏗️  Engines: Risk | Sustainability | Profitability | Ethics")
    print("=" * 60 + "\n")
    asyncio.create_task(monitor_policies_task())


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.server.host,
        port=config.server.port,
        reload=True,
    )
