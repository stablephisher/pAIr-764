"""
Planning Agent
==============
Generates prioritized compliance roadmaps and action plans.
"""

import os
import json
from typing import Dict, Any, List
import re
from openai import OpenAI
from config import config


PLANNING_PROMPT = """
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
  "compliance_timeline": {
    "immediate": [],
    "within_30_days": [],
    "within_90_days": [],
    "ongoing": []
  },
  "resource_requirements": {
    "documents_needed": [],
    "estimated_cost": "",
    "professional_help_needed": ""
  },
  "monitoring_advice": "",
  "confidence_level": "HIGH | MEDIUM | LOW"
}
"""


def _parse_json(text: str) -> dict:
    """Clean markdown fences and parse JSON from AI response."""
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()
    return json.loads(text)


class PlanningAgent:
    """
    Strategist agent for compliance roadmap generation.
    
    Transforms policy intelligence into actionable business plans:
    - Prioritized action steps
    - Timeline generation
    - Resource planning
    - Risk assessment
    """
    
    def __init__(self, api_key: str = None, demo_mode: bool = False):
        self.demo_mode = demo_mode
        key = api_key or config.ai.api_key
        self._client = OpenAI(
            base_url=config.ai.base_url,
            api_key=key,
            default_headers={
                "HTTP-Referer": config.ai.site_url,
                "X-Title": config.ai.site_name,
            },
        ) if key else None
        
    async def generate_plan(
        self, 
        policy_analysis: Dict[str, Any],
        eligible_schemes: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate compliance roadmap from policy analysis.
        
        Args:
            policy_analysis: Structured policy intelligence from ReasoningAgent
            eligible_schemes: Optional list of eligible schemes
            
        Returns:
            Comprehensive compliance plan with timeline
        """
        if self.demo_mode:
            return self._get_demo_plan()
            
        try:
            input_data = {
                "policy_analysis": policy_analysis,
                "eligible_schemes": eligible_schemes or []
            }
            
            prompt_text = f"{PLANNING_PROMPT}\n\nINPUT POLICY INTELLIGENCE:\n{json.dumps(input_data, indent=2)}"
            resp = self._client.chat.completions.create(
                model=config.ai.primary_model,
                messages=[
                    {"role": "system", "content": "You are a Compliance Planning Agent. Return valid JSON only."},
                    {"role": "user", "content": prompt_text},
                ],
                temperature=0.3,
            )
            response_text = resp.choices[0].message.content or ""
            
            return _parse_json(response_text)
            
        except Exception as e:
            raise ValueError(f"Planning failed: {str(e)}")
    
    def _get_demo_plan(self) -> Dict[str, Any]:
        """Return demo compliance plan."""
        return {
            "applicability_status": "APPLICABLE",
            "summary_for_owner": "This CGTMSE scheme directly applies to your micro enterprise. You can get up to 85% guarantee coverage on loans up to Rs. 5 crore. This means banks will be more willing to lend to you without demanding heavy collateral.",
            "action_plan": [
                {
                    "step_number": 1,
                    "action": "Verify your Udyam Registration is active",
                    "why_it_matters": "This is a mandatory requirement. No Udyam = No CGTMSE benefit",
                    "deadline": "Before applying for loan",
                    "risk_if_ignored": "Automatic rejection of guarantee application"
                },
                {
                    "step_number": 2,
                    "action": "Prepare your Project Report",
                    "why_it_matters": "Banks need this to assess your credit worthiness and project viability",
                    "deadline": "Within 1 week",
                    "risk_if_ignored": "Delays in loan processing"
                },
                {
                    "step_number": 3,
                    "action": "Approach your bank's MSME lending desk",
                    "why_it_matters": "The bank initiates the CGTMSE application on your behalf",
                    "deadline": "Within 2 weeks",
                    "risk_if_ignored": "None - but opportunity cost of delay"
                },
                {
                    "step_number": 4,
                    "action": "Set up quarterly reporting system",
                    "why_it_matters": "Post-sanction compliance requirement to maintain guarantee",
                    "deadline": "Before loan disbursement",
                    "risk_if_ignored": "Withdrawal of guarantee, potential blacklisting"
                }
            ],
            "compliance_timeline": {
                "immediate": [
                    "Check Udyam Registration status",
                    "Gather last 6 months bank statements"
                ],
                "within_30_days": [
                    "Complete Project Report",
                    "Submit loan application to bank",
                    "Get CGTMSE application initiated"
                ],
                "within_90_days": [
                    "Complete loan documentation",
                    "Set up reporting mechanism"
                ],
                "ongoing": [
                    "Submit quarterly reports by 15th of following month",
                    "Renew Udyam registration annually",
                    "Maintain proper books of accounts"
                ]
            },
            "resource_requirements": {
                "documents_needed": [
                    "Udyam Registration Certificate",
                    "PAN Card of business and proprietor",
                    "Address proof of business premises",
                    "Bank statements (6 months)",
                    "ITR for last 2 years (if applicable)",
                    "Project Report / Business Plan"
                ],
                "estimated_cost": "Rs. 5,000 - 15,000 for documentation and CA fees",
                "professional_help_needed": "Recommended: CA for project report preparation"
            },
            "monitoring_advice": "Mark your calendar for quarterly report submissions. Missing even one can jeopardize your guarantee. Consider using accounting software that can generate these reports automatically.",
            "confidence_level": "HIGH"
        }
