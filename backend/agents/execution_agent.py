"""
Execution Agent
===============
Prepares outputs, application drafts, and compliance checklists.
"""

import os
import json
from typing import Dict, Any, List
from datetime import datetime
import re
from openai import OpenAI
from config import config


EXECUTION_PROMPT = """
You are an Execution Agent responsible for preparing actionable outputs for MSME owners.

Given a compliance plan and business profile, generate:
1. Application draft text that can be used for scheme applications
2. Compliance checklist with checkboxes
3. Document preparation guide

OUTPUT FORMAT (JSON):
{
  "application_draft": {
    "title": "",
    "to": "",
    "subject": "",
    "body": "",
    "attachments_required": []
  },
  "compliance_checklist": [
    {
      "category": "",
      "items": [
        {"task": "", "status": "pending", "due_date": "", "notes": ""}
      ]
    }
  ],
  "document_preparation_guide": [
    {
      "document_name": "",
      "where_to_get": "",
      "typical_time": "",
      "cost_if_any": "",
      "tips": ""
    }
  ],
  "form_filling_assistance": {
    "form_name": "",
    "fields_guidance": {}
  }
}
"""


def _parse_json(text: str) -> dict:
    """Clean markdown fences and parse JSON from AI response."""
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()
    return json.loads(text)


class ExecutionAgent:
    """
    Action execution agent for output preparation.
    
    Responsibilities:
    - Application draft generation
    - Compliance checklist creation
    - Document preparation guidance
    - Form filling assistance
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
        
    async def prepare_outputs(
        self, 
        compliance_plan: Dict[str, Any],
        business_profile: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Prepare actionable outputs from compliance plan.
        
        Args:
            compliance_plan: Plan from PlanningAgent
            business_profile: Business details for personalization
            
        Returns:
            Application drafts, checklists, and guides
        """
        if self.demo_mode:
            return self._get_demo_outputs()
            
        try:
            input_data = {
                "compliance_plan": compliance_plan,
                "business_profile": business_profile or {},
                "current_date": datetime.now().strftime("%Y-%m-%d")
            }
            
            prompt_text = f"{EXECUTION_PROMPT}\n\nINPUT:\n{json.dumps(input_data, indent=2)}"
            resp = self._client.chat.completions.create(
                model=config.ai.primary_model,
                messages=[
                    {"role": "system", "content": "You are an Execution Agent. Return valid JSON only."},
                    {"role": "user", "content": prompt_text},
                ],
                temperature=0.3,
            )
            response_text = resp.choices[0].message.content or ""
            
            return _parse_json(response_text)
            
        except Exception as e:
            print(f"Execution agent error: {e}")
            return self._get_fallback_outputs()
    
    def _get_demo_outputs(self) -> Dict[str, Any]:
        """Return demo execution outputs."""
        return {
            "application_draft": {
                "title": "Application for Credit Guarantee Coverage under CGTMSE",
                "to": "The Branch Manager, [Bank Name], [Branch Address]",
                "subject": "Request for MSME Term Loan with CGTMSE Coverage",
                "body": """Respected Sir/Madam,

I, [Proprietor/Partner/Director Name], on behalf of [Business Name], a Micro Enterprise registered under Udyam (Registration No: UDYAM-XX-XX-XXXXXXX), hereby apply for a term loan of Rs. [Amount] under the Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) scheme.

Business Details:
- Nature of Activity: [Manufacturing/Service]
- Year of Establishment: [Year]
- Current Annual Turnover: Rs. [Amount]
- Number of Employees: [Number]

Purpose of Loan:
[Describe the purpose - working capital, machinery purchase, expansion, etc.]

I understand that the guarantee coverage under CGTMSE will enable collateral-free lending. I hereby confirm that:
1. Our enterprise qualifies as a Micro/Small Enterprise under MSMED Act
2. We are registered on the Udyam Portal
3. We will comply with all reporting requirements

I request you to kindly process our application and initiate the CGTMSE coverage.

Enclosed: [List of documents]

Thanking you,
Yours faithfully,

[Signature]
[Name and Designation]
[Business Name]
[Date]""",
                "attachments_required": [
                    "Udyam Registration Certificate",
                    "PAN Card (Business and Proprietor)",
                    "Address Proof",
                    "Bank Statements (6 months)",
                    "Project Report",
                    "ITR (if available)"
                ]
            },
            "compliance_checklist": [
                {
                    "category": "Pre-Application Requirements",
                    "items": [
                        {"task": "Verify Udyam Registration is active", "status": "pending", "due_date": "Immediate", "notes": "Check on udyamregistration.gov.in"},
                        {"task": "Collect 6 months bank statements", "status": "pending", "due_date": "Within 3 days", "notes": "From primary business account"},
                        {"task": "Prepare Project Report", "status": "pending", "due_date": "Within 7 days", "notes": "Can hire CA for Rs. 5000-10000"}
                    ]
                },
                {
                    "category": "Application Stage",
                    "items": [
                        {"task": "Visit bank's MSME desk", "status": "pending", "due_date": "Within 2 weeks", "notes": "Carry all documents"},
                        {"task": "Fill loan application form", "status": "pending", "due_date": "At bank visit", "notes": "Bank will provide form"},
                        {"task": "Sign CGTMSE consent form", "status": "pending", "due_date": "At bank visit", "notes": "Authorizes bank to apply for guarantee"}
                    ]
                },
                {
                    "category": "Post-Sanction Compliance",
                    "items": [
                        {"task": "Set up quarterly reporting calendar", "status": "pending", "due_date": "Before disbursement", "notes": "Reports due by 15th of month after quarter"},
                        {"task": "Maintain books of accounts", "status": "pending", "due_date": "Ongoing", "notes": "Consider accounting software"},
                        {"task": "Renew Udyam registration", "status": "pending", "due_date": "Annually", "notes": "Set reminder for anniversary date"}
                    ]
                }
            ],
            "document_preparation_guide": [
                {
                    "document_name": "Udyam Registration Certificate",
                    "where_to_get": "udyamregistration.gov.in",
                    "typical_time": "15-30 minutes (online, instant)",
                    "cost_if_any": "Free",
                    "tips": "Keep Aadhaar linked mobile handy for OTP"
                },
                {
                    "document_name": "Project Report",
                    "where_to_get": "Prepare yourself or hire a CA/Consultant",
                    "typical_time": "2-5 days",
                    "cost_if_any": "Rs. 5,000 - 15,000 if outsourced",
                    "tips": "Include 3-year projections, clear fund utilization plan"
                },
                {
                    "document_name": "Bank Statements",
                    "where_to_get": "Your business bank branch or net banking",
                    "typical_time": "Instant via net banking, 1-2 days from branch",
                    "cost_if_any": "Usually free, some banks charge Rs. 100-200",
                    "tips": "Get stamped statements from branch for authenticity"
                }
            ],
            "form_filling_assistance": {
                "form_name": "CGTMSE Application (via Bank)",
                "fields_guidance": {
                    "enterprise_category": "Select 'Micro' if investment in P&M < Rs. 1 crore and turnover < Rs. 5 crore",
                    "nature_of_activity": "Select from Manufacturing/Service based on primary business",
                    "credit_facility_type": "Term Loan / Working Capital / Composite - as per your need",
                    "amount_applied": "Maximum Rs. 5 crore for CGTMSE coverage",
                    "special_category": "Tick if Women/SC/ST/NER owned for higher guarantee %"
                }
            }
        }
    
    def _get_fallback_outputs(self) -> Dict[str, Any]:
        """Fallback outputs if AI fails."""
        return {
            "application_draft": {
                "title": "Application Draft",
                "to": "[Appropriate Authority]",
                "subject": "[Scheme Name] Application",
                "body": "Please prepare based on your compliance plan.",
                "attachments_required": []
            },
            "compliance_checklist": [],
            "document_preparation_guide": [],
            "form_filling_assistance": {}
        }
