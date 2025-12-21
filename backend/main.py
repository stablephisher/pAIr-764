import os
import io
import json
import uvicorn
import time
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
import google.generativeai as genai
from pypdf import PdfReader
from schemas import PolicyAnalysis

# Initialize App
app = FastAPI(title="Policy Ingestion Agent API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Bypass-Tunnel-Reminder", "bypass-tunnel-reminder"],
)

# Configure Gemini
# NOTE: In a real scenario, use python-dotenv. 
# Here we assume the key is in the environment or set it explicitly.
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

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

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

# History Persistence
HISTORY_FILE = "history.json"

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    except:
        return []

import uuid

# ... (Previous code)

def save_to_history(data: PolicyAnalysis):
    history = load_history()
    # Prepend new item with ID
    record = data.dict()
    record['id'] = str(uuid.uuid4())
    record['timestamp'] = time.time()
    
    history.insert(0, record)
    # Limit to last 50 items
    history = history[:50]
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

@app.get("/api/history")
def get_history():
    history = load_history()
    dirty = False
    for item in history:
        if 'id' not in item:
            item['id'] = str(uuid.uuid4())
            dirty = True
        # Also ensure timestamp exists
        if 'timestamp' not in item:
            item['timestamp'] = time.time()
            dirty = True
            
    if dirty:
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)
            
    return history

@app.delete("/api/history")
def clear_history():
    if os.path.exists(HISTORY_FILE):
        os.remove(HISTORY_FILE)
    return {"message": "History cleared"}

@app.delete("/api/history/{item_id}")
def delete_history_item(item_id: str):
    history = load_history()
    new_history = [item for item in history if item.get('id') != item_id]
    
    if len(new_history) == len(history):
        raise HTTPException(status_code=404, detail="Item not found")
        
    with open(HISTORY_FILE, "w") as f:
        json.dump(new_history, f, indent=2)
    return {"message": "Item deleted"}



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
Your output will be shown directly to business owners and hackathon judges.
Write like incorrect advice could cause financial loss.
"""

def generate_compliance_plan(analysis_data: dict, models_to_try: list) -> dict:
    """
    Compliance Planner Agent
    Converts policy intelligence into actionable steps for MSME owners
    """
    analysis_json_str = json.dumps(analysis_data, indent=2)
    last_exception = None

    for model_name in models_to_try:
        try:
            print(f"Trying Model (Planning): {model_name}")
            model = genai.GenerativeModel(model_name)
            # Rate Limit Retry Loop (Planning)
            max_retries = 3
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
                    if "429" in str(inner_e):
                        print(f"⚠️ Quota exceeded for {model_name} (Planning). Waiting 20s... (Attempt {attempt+1}/{max_retries})")
                        await asyncio.sleep(20)
                    else:
                        raise inner_e # Re-raise to try next model

        except Exception as e:
            print(f"Model {model_name} failed (Planning): {e}")
            last_exception = e
            
    print(f"Warning: Compliance Plan generation failed. Last error: {last_exception}")
    return None

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

# ... (History logic remains here) ...

import asyncio

# ... (rest of imports)

# ... (keep extract_text_from_pdf, save_to_history, etc.)

MONITOR_DIR = "monitored_policies"
if not os.path.exists(MONITOR_DIR):
    os.makedirs(MONITOR_DIR)

async def run_policy_analysis_pipeline(policy_text: str) -> PolicyAnalysis:
    """Core logic: Text -> AI Analysis -> Compliance Plan -> Validation -> History"""
    
    # Using Flash-Lite for "Turbo" performance, with verified stable fallbacks
    models_to_try = [
        "models/gemini-2.0-flash-lite-preview-02-05", 
        "models/gemini-2.5-flash", 
        "models/gemini-2.0-flash",
        "models/gemini-flash-latest"
    ]

    # --- Step 1: Policy Analysis ---
    start_time = time.time()
    step_1_duration = 0
    step_2_duration = 0
    used_models = []
    raw_step_1_response = ""

    print("--- [START] Step 1: Policy Analysis ---")
    response = None
    last_exception = None

    for model_name in models_to_try:
        try:
            print(f"Trying Model: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            # Rate Limit Retry Loop
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = model.generate_content(
                        f"{SYSTEM_PROMPT}\n\nINPUT POLICY TEXT:\n{policy_text}",
                        generation_config={"response_mime_type": "application/json"}
                    )
                    used_models.append(model_name)
                    break # Success, exit retry loop
                    
                except Exception as inner_e:
                    if "429" in str(inner_e):
                        print(f"⚠️ Quota exceeded for {model_name}. Waiting 20s... (Attempt {attempt+1}/{max_retries})")
                        await asyncio.sleep(20) # Non-blocking sleep
                    else:
                        raise inner_e # Re-raise other errors to move to next model

            if response:
                break # Success, exit model loop

        except Exception as e:
            print(f"Model {model_name} failed (Analysis): {e}")
            last_exception = e
    
    if not response:
        raise Exception(f"Analysis failed. Last error: {str(last_exception)}")
    
    step_1_duration = time.time() - start_time
    print(f"--- [DONE] Step 1 Complete in {step_1_duration:.2f}s ---")

    # Parse JSON
    response_text = response.text
    raw_step_1_response = response_text 

    if response_text.startswith("```json"): response_text = response_text[7:-3]
    elif response_text.startswith("```"): response_text = response_text[3:-3]
    
    analysis_data = json.loads(response_text)
    
    # --- Step 2: Compliance Planning ---
    try:
        print("--- [START] Step 2: Compliance Planning ---")
        st2_start = time.time()
        
        compliance_plan = generate_compliance_plan(analysis_data, models_to_try)
        
        if compliance_plan:
             analysis_data["compliance_plan"] = compliance_plan
             step_2_duration = time.time() - st2_start
             print(f"--- [DONE] Step 2 Complete in {step_2_duration:.2f}s ---")
        else:
            print("Warning: Compliance Plan generation failed.")

    except Exception as e:
        print(f"Step 2 (Planning) failed silently: {str(e)}")

    # Attach Debug Metadata
    analysis_data["debug_metadata"] = {
        "models_used": used_models,
        "step_1_time": step_1_duration,
        "step_2_time": step_2_duration,
        "system_prompt_snapshot": SYSTEM_PROMPT[:500] + "... [TRUNCATED]",
        "planning_prompt_snapshot": PLANNING_AGENT_PROMPT[:500] + "... [TRUNCATED]",
        "raw_response_step_1": raw_step_1_response[:500] + "... [TRUNCATED]"
    }

    # Validate & Save
    validated_data = PolicyAnalysis(**analysis_data)
    save_to_history(validated_data)
    return validated_data


async def monitor_policies_task():
    """Background task to watch for new PDFs"""
    print(f"📡 Monitoring started in: {os.path.abspath(MONITOR_DIR)}")
    processed_files = set()
    
    while True:
        try:
            for filename in os.listdir(MONITOR_DIR):
                if filename.endswith(".pdf") and filename not in processed_files:
                    filepath = os.path.join(MONITOR_DIR, filename)
                    print(f"🚨 NEW POLICY DETECTED: {filename}")
                    
                    try:
                        # Read and Process
                        with open(filepath, "rb") as f:
                            content = f.read()
                        
                        text = extract_text_from_pdf(content)
                        if text.strip():
                            print(f"⚡ Auto-Triggering Analysis for {filename}...")
                            await run_policy_analysis_pipeline(text)
                            print(f"✅ Auto-Analysis Complete for {filename}")
                        
                        # Mark as processed (in reality, maybe move to 'processed' folder)
                        processed_files.add(filename)
                        
                    except Exception as e:
                        print(f"❌ Failed to auto-process {filename}: {e}")
                        
            await asyncio.sleep(5) # Check every 5 seconds
        except Exception as e:
            print(f"Monitor Error: {e}")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*50)
    print("✅ BACKEND RESTARTED SUCCESSFULLY")
    print("✅ ACTIVE MODELS: Gemini 2.5 Flash, 2.0 Flash-Lite")
    print("="*50 + "\n")
    asyncio.create_task(monitor_policies_task())

@app.post("/api/analyze", response_model=PolicyAnalysis)
async def analyze_policy(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    content = await file.read()
    policy_text = extract_text_from_pdf(content)
    
    if not policy_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

    if not api_key:
         raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set on server.")

    try:
        return await run_policy_analysis_pipeline(policy_text)
    except Exception as e:
        print(f"Processing Error: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
