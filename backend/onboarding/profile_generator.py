"""
Business Profile Generator
============================
Converts onboarding answers into AI-enriched MSME profiles.
Uses OpenRouter (OpenAI-compatible) for natural language business summary.
"""

import json, re
from typing import Dict, Any

from openai import AsyncOpenAI
from config import config


PROFILE_ENRICHMENT_PROMPT = """You are an MSME business analyst. Given the structured business profile below,
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
}}"""


def _parse_json(text: str) -> dict:
    """Extract JSON from a response that may contain markdown fences."""
    text = text.strip()
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if m:
        text = m.group(1).strip()
    return json.loads(text)


class ProfileGenerator:
    """Enriches raw profile data with AI-generated insights."""

    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode
        api_key = config.ai.api_key
        self._client = (
            AsyncOpenAI(
                base_url=config.ai.base_url,
                api_key=api_key,
                default_headers={
                    "HTTP-Referer": config.ai.site_url,
                    "X-Title": config.ai.site_name,
                },
            )
            if api_key
            else None
        )

    async def enrich_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Take the raw profile from the decision tree and enrich it
        with AI-generated summary, compliance priority, etc.
        """
        if self.demo_mode or not self._client:
            return self._get_demo_enrichment(profile)

        try:
            clean_profile = {k: v for k, v in profile.items() if not k.startswith("_")}

            for model_id in [config.ai.primary_model, config.ai.fallback_model]:
                try:
                    resp = await self._client.chat.completions.create(
                        model=model_id,
                        messages=[
                            {"role": "system", "content": "You are an expert MSME business analyst."},
                            {
                                "role": "user",
                                "content": PROFILE_ENRICHMENT_PROMPT.format(
                                    profile_json=json.dumps(clean_profile, indent=2)
                                ),
                            },
                        ],
                        temperature=0.3,
                    )
                    text = resp.choices[0].message.content or ""
                    break
                except Exception:
                    text = ""

            enrichment = _parse_json(text)
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
