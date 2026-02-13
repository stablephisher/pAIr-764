"""
Business Profile Generator
============================
Converts onboarding answers into AI-enriched MSME profiles.
Uses Gemini to generate natural language business summary.
"""

import json
from typing import Dict, Any

import google.generativeai as genai
from config import config


PROFILE_ENRICHMENT_PROMPT = """
You are an MSME business analyst. Given the structured business profile below,
generate a concise 3-4 sentence natural language summary of this business
that a compliance agent can use to quickly understand the business context.

Include:
- Business type and sector
- Size classification (Micro/Small/Medium)
- Location characteristics
- Special categories (Women/SC/ST)
- Key compliance needs

Business Profile:
{profile_json}

Output a JSON object:
{{
  "business_summary": "...",
  "compliance_priority": "HIGH | MEDIUM | LOW",
  "priority_reasoning": "...",
  "recommended_first_action": "..."
}}
"""


class ProfileGenerator:
    """Enriches raw profile data with AI-generated insights."""

    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode
        if config.gemini.api_key:
            genai.configure(api_key=config.gemini.api_key)

    async def enrich_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Take the raw profile from the decision tree and enrich it
        with AI-generated summary, compliance priority, etc.
        """
        if self.demo_mode:
            return self._get_demo_enrichment(profile)

        try:
            model = genai.GenerativeModel(config.gemini.primary_model)
            # Remove raw answers from prompt to keep it clean
            clean_profile = {k: v for k, v in profile.items() if not k.startswith("_")}

            response = model.generate_content(
                PROFILE_ENRICHMENT_PROMPT.format(
                    profile_json=json.dumps(clean_profile, indent=2)
                ),
                generation_config={"response_mime_type": "application/json"},
            )

            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]

            enrichment = json.loads(text)
            profile["ai_summary"] = enrichment.get("business_summary", "")
            profile["compliance_priority"] = enrichment.get("compliance_priority", "MEDIUM")
            profile["priority_reasoning"] = enrichment.get("priority_reasoning", "")
            profile["recommended_first_action"] = enrichment.get("recommended_first_action", "")

        except Exception as e:
            print(f"Profile enrichment failed: {e}")
            profile["ai_summary"] = ""
            profile["compliance_priority"] = "MEDIUM"
            profile["priority_reasoning"] = "AI enrichment unavailable"
            profile["recommended_first_action"] = "Complete Udyam registration if not done"

        return profile

    def _get_demo_enrichment(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Demo mode enrichment."""
        profile["ai_summary"] = (
            f"This is a {profile.get('enterprise_classification', 'Micro')} enterprise "
            f"in the {profile.get('business_type', 'manufacturing')} sector, "
            f"located in a {profile.get('location_type', 'urban')} area of "
            f"{profile.get('state', 'Telangana')}. "
            f"The business employs {profile.get('employee_count', '6-20')} people "
            f"and is pre-screened for {len(profile.get('pre_screened_schemes', []))} "
            f"government schemes."
        )
        profile["compliance_priority"] = "HIGH" if not profile.get("has_udyam") else "MEDIUM"
        profile["priority_reasoning"] = (
            "Udyam registration is pending — required for all MSME scheme benefits"
            if not profile.get("has_udyam")
            else "Registered MSME with standard compliance needs"
        )
        profile["recommended_first_action"] = (
            "Register on udyamregistration.gov.in immediately (free, 30 minutes)"
            if not profile.get("has_udyam")
            else "Upload latest compliance policy documents for analysis"
        )
        return profile
