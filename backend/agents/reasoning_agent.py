"""
Reasoning Agent (Powered by Gemini)
====================================
Semantic understanding, policy interpretation, and eligibility logic.
"""

import os
import json
from typing import Dict, Any, List, Optional
import re
from openai import OpenAI
from config import config


REASONING_PROMPT = """
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

ELIGIBILITY_PROMPT = """
You are an MSME scheme eligibility expert. Given a business profile and available government schemes,
determine which schemes the business is eligible for.

Business Profile:
{business_profile}

Available Schemes:
{schemes}

For each scheme, evaluate eligibility based on:
1. Business type (Manufacturing/Service)
2. Investment limits
3. Turnover requirements
4. Geographic location
5. Special categories (Women-owned, SC/ST, etc.)

OUTPUT FORMAT (JSON):
{
  "eligible_schemes": [
    {
      "scheme_name": "",
      "eligibility_status": "ELIGIBLE | PARTIALLY_ELIGIBLE | NOT_ELIGIBLE",
      "matching_criteria": [],
      "missing_criteria": [],
      "potential_benefit": "",
      "next_steps": []
    }
  ],
  "overall_recommendation": ""
}
"""


def _parse_json(text: str) -> dict:
    """Clean markdown fences and parse JSON from AI response."""
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()
    return json.loads(text)


class ReasoningAgent:
    """
    Legal Expert agent for policy analysis.
    
    Uses OpenRouter AI for:
    - Deep semantic reasoning on policy text
    - Structured intelligence extraction
    - MSME eligibility logic for schemes (CGTMSE, PMEGP)
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
        
    async def analyze(
        self, 
        policy_text: str, 
        business_profile: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Perform semantic analysis on policy text.
        
        Args:
            policy_text: Extracted policy document text
            business_profile: Optional business details for eligibility
            
        Returns:
            Dict with 'analysis' and 'eligible_schemes'
        """
        if self.demo_mode:
            return self._get_demo_analysis()
            
        # Policy Analysis
        analysis = await self._analyze_policy(policy_text)
        
        # Eligibility Check (if business profile provided)
        eligible_schemes = []
        if business_profile:
            eligible_schemes = await self._check_eligibility(business_profile)
            
        return {
            "analysis": analysis,
            "eligible_schemes": eligible_schemes
        }
    
    async def _analyze_policy(self, policy_text: str) -> Dict[str, Any]:
        """Run Gemini analysis on policy text."""
        try:
            prompt_text = f"{REASONING_PROMPT}\n\nINPUT POLICY TEXT:\n{policy_text}"
            resp = self._client.chat.completions.create(
                model=config.ai.primary_model,
                messages=[
                    {"role": "system", "content": "You are a senior policy analyst. Return valid JSON only."},
                    {"role": "user", "content": prompt_text},
                ],
                temperature=0.3,
            )
            response_text = resp.choices[0].message.content or ""
            
            return _parse_json(response_text)
            
        except Exception as e:
            raise ValueError(f"Policy analysis failed: {str(e)}")
    
    async def _check_eligibility(
        self, 
        business_profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Check eligibility for government schemes."""
        from schemes import GOVERNMENT_SCHEMES
        
        try:
            prompt = ELIGIBILITY_PROMPT.format(
                business_profile=json.dumps(business_profile, indent=2),
                schemes=json.dumps(GOVERNMENT_SCHEMES, indent=2)
            )
            
            resp = self._client.chat.completions.create(
                model=config.ai.primary_model,
                messages=[
                    {"role": "system", "content": "You are an MSME scheme eligibility expert. Return valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
            response_text = resp.choices[0].message.content or ""
            
            result = _parse_json(response_text)
            return result.get("eligible_schemes", [])
            
        except Exception as e:
            print(f"Eligibility check failed: {e}")
            return []
    
    def _get_demo_analysis(self) -> Dict[str, Any]:
        """Return demo analysis for demonstration mode."""
        return {
            "analysis": {
                "policy_metadata": {
                    "policy_name": "CGTMSE Revised Guidelines 2024",
                    "issuing_authority": "Ministry of MSME, Government of India",
                    "effective_date": "1st July 2024",
                    "geographical_scope": "Pan-India",
                    "policy_type": "Credit Guarantee Scheme"
                },
                "applicability": {
                    "who_is_affected": "All Micro and Small Enterprises in manufacturing or service sectors",
                    "conditions": [
                        "Must be registered on Udyam Portal",
                        "Credit facility up to Rs. 5 crore",
                        "New or existing MSE"
                    ],
                    "exceptions": [
                        "Medium Enterprises",
                        "Retail Trade",
                        "Educational Institutions"
                    ]
                },
                "obligations": [
                    {
                        "obligation": "Quarterly Report Submission",
                        "description": "Submit quarterly performance reports to lending institution",
                        "deadline": "Within 15 days of quarter end",
                        "frequency": "Quarterly",
                        "severity_if_ignored": "HIGH - May lead to withdrawal of guarantee"
                    },
                    {
                        "obligation": "Udyam Registration Renewal",
                        "description": "Maintain active Udyam registration",
                        "deadline": "Annually",
                        "frequency": "Annual",
                        "severity_if_ignored": "HIGH - Ineligibility for scheme"
                    }
                ],
                "penalties": [
                    {
                        "violation": "Non-compliance with reporting",
                        "penalty_amount": "Up to Rs. 10,000",
                        "other_consequences": "Blacklisting, Withdrawal of guarantee cover"
                    }
                ],
                "required_documents": [
                    "Udyam Registration Certificate",
                    "PAN Card",
                    "Business Address Proof",
                    "Bank Statements (6 months)",
                    "Project Report"
                ],
                "compliance_actions": [
                    {
                        "action": "Register on Udyam Portal if not done",
                        "priority": "HIGH",
                        "estimated_effort": "1-2 hours online"
                    },
                    {
                        "action": "Prepare project report for credit application",
                        "priority": "HIGH",
                        "estimated_effort": "2-3 days"
                    },
                    {
                        "action": "Set up quarterly reporting system",
                        "priority": "MEDIUM",
                        "estimated_effort": "Half day"
                    }
                ],
                "risk_assessment": {
                    "overall_risk_level": "MEDIUM",
                    "reasoning": "Compliance requirements are moderate. Main risk is maintaining quarterly reporting discipline."
                },
                "confidence_notes": {
                    "ambiguous_sections": [],
                    "missing_information": ["Exact deadline for annual renewal"]
                }
            },
            "eligible_schemes": [
                {
                    "scheme_name": "CGTMSE",
                    "eligibility_status": "ELIGIBLE",
                    "matching_criteria": ["Micro Enterprise", "Manufacturing Sector", "Udyam Registered"],
                    "missing_criteria": [],
                    "potential_benefit": "Up to 85% guarantee cover on loans up to Rs. 5 crore",
                    "next_steps": ["Apply through any scheduled commercial bank", "Submit Udyam certificate"]
                },
                {
                    "scheme_name": "PMEGP",
                    "eligibility_status": "PARTIALLY_ELIGIBLE",
                    "matching_criteria": ["Manufacturing activity", "Project under Rs. 50 lakhs"],
                    "missing_criteria": ["New unit requirement - existing units not eligible"],
                    "potential_benefit": "Up to 35% subsidy on project cost",
                    "next_steps": ["Check if planning to set up new unit"]
                }
            ]
        }
