"""
Adaptive Decision Tree Engine
==============================
Drives dynamic MSME onboarding using a JSON-backed decision tree.
Each question's next node depends on the user's previous answer.

Flow:
  1. Client requests first question via get_first_question()
  2. Client submits answer via get_next_question(current_id, answer)
  3. Engine returns the next question or signals COMPLETE
  4. On COMPLETE, generate_profile() produces the full MSME profile
"""

import json
import os
from typing import Dict, Any, Optional, Tuple, List
from pathlib import Path


QUESTIONS_FILE = Path(__file__).parent / "questions.json"


class AdaptiveOnboardingEngine:
    """
    Stateless decision-tree questionnaire engine.
    
    The client holds state (answers dict). The engine is stateless — 
    it determines the next question from (current_question_id, answer).
    """

    def __init__(self):
        with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        self._questions: Dict[str, dict] = data["questions"]
        self._start: str = data["start"]
        self._terminal: str = data["terminal"]

    # ─── Public API ───────────────────────────────────────────────────

    def get_first_question(self) -> dict:
        """Return the first question in the decision tree."""
        return self._format_question(self._start)

    def get_next_question(
        self, current_id: str, answer: Any
    ) -> Tuple[Optional[dict], bool]:
        """
        Given the current question ID and the user's answer,
        return (next_question_dict, is_complete).

        Returns:
            (question_dict, False) — if there is a next question
            (None, True) — if the questionnaire is complete
        """
        current = self._questions.get(current_id)
        if not current:
            return None, True

        next_map = current.get("next", {})

        # Determine next question ID
        if isinstance(answer, list):
            # Multi-choice: use _default
            next_id = next_map.get("_default", self._terminal)
        elif isinstance(answer, str) and answer in next_map:
            next_id = next_map[answer]
        else:
            next_id = next_map.get("_default", self._terminal)

        if next_id == self._terminal:
            return None, True

        return self._format_question(next_id), False

    def get_question_by_id(self, qid: str) -> Optional[dict]:
        """Retrieve a specific question by ID."""
        if qid in self._questions:
            return self._format_question(qid)
        return None

    def get_total_questions(self) -> int:
        """Return total number of question nodes."""
        return len(self._questions)

    # ─── Profile Generation ───────────────────────────────────────────

    def generate_profile(self, answers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert raw answers dict into a structured MSME business profile.
        
        Args:
            answers: Dict mapping question_id -> answer value
            
        Returns:
            Structured business profile ready for Firestore storage
        """
        # Extract by field name
        field_map = {}
        for qid, answer in answers.items():
            q = self._questions.get(qid, {})
            field = q.get("field", qid)
            field_map[field] = answer

        # Derive enterprise classification
        enterprise_type = self._classify_enterprise(field_map)
        eligible_schemes = self._pre_screen_schemes(field_map, enterprise_type)

        profile = {
            # Core identity
            "business_name": field_map.get("business_name", "My Business"),
            "business_type": field_map.get("business_type", "unknown"),
            "enterprise_classification": enterprise_type,
            "investment_range": field_map.get("investment_range", "unknown"),
            "turnover_range": field_map.get("turnover_range", "unknown"),
            "employee_count": field_map.get("employee_count", "unknown"),

            # Location
            "location_type": field_map.get("location_type", "unknown"),
            "state": field_map.get("state", "unknown"),

            # Owner
            "owner_category": field_map.get("owner_category", []),

            # Registration
            "has_udyam": field_map.get("has_udyam", "no") == "yes",
            "wants_udyam_help": field_map.get("wants_udyam_help", "no") == "yes",

            # Business stage
            "business_age": field_map.get("business_age", "unknown"),
            "is_new_unit": field_map.get("business_age") == "new",
            "needs_funding": field_map.get("needs_funding", "no"),
            "has_loans": field_map.get("has_loans", "no"),

            # Environmental
            "environmental_impact": field_map.get("environmental_impact", []),
            "annual_filings": field_map.get("annual_filings", "1_5"),

            # Misc
            "cluster_size": field_map.get("cluster_size", None),
            "preferred_language": field_map.get("preferred_language", "en"),

            # Derived
            "pre_screened_schemes": eligible_schemes,

            # Raw answers for audit trail
            "_raw_answers": answers,
        }

        return profile

    # ─── Private Helpers ──────────────────────────────────────────────

    def _format_question(self, qid: str) -> dict:
        """Format question for API response."""
        q = self._questions[qid].copy()
        return {
            "id": q["id"],
            "text": q["text"],
            "type": q["type"],
            "field": q.get("field", ""),
            "options": q.get("options", []),
            "placeholder": q.get("placeholder", ""),
        }

    def _classify_enterprise(self, fields: dict) -> str:
        """Classify as Micro / Small / Medium based on investment + turnover."""
        inv = fields.get("investment_range", "")
        turn = fields.get("turnover_range", "")

        # Investment-based classification
        inv_class = {
            "micro": "Micro",
            "small": "Small",
            "medium": "Medium",
            "large": "Large",
        }.get(inv, "Unknown")

        # Turnover-based classification
        turn_class_map = {
            "below_5cr": "Micro",
            "5_to_50cr": "Small",
            "50_to_250cr": "Medium",
            "above_250cr": "Large",
        }
        turn_class = turn_class_map.get(turn, "Unknown")

        # MSME Act: whichever is higher determines category
        order = ["Micro", "Small", "Medium", "Large", "Unknown"]
        inv_idx = order.index(inv_class) if inv_class in order else 4
        turn_idx = order.index(turn_class) if turn_class in order else 4
        return order[max(inv_idx, turn_idx)]

    def _pre_screen_schemes(
        self, fields: dict, enterprise_type: str
    ) -> List[str]:
        """Quick eligibility pre-screening based on profile answers."""
        schemes = []
        btype = fields.get("business_type", "")
        categories = fields.get("owner_category", [])
        if isinstance(categories, str):
            categories = [categories]
        is_new = fields.get("business_age") == "new"
        location = fields.get("location_type", "")

        # CGTMSE: Micro/Small in Manufacturing/Service
        if enterprise_type in ["Micro", "Small"] and btype in ["manufacturing", "service"]:
            schemes.append("CGTMSE")

        # PMEGP: New units
        if is_new:
            schemes.append("PMEGP")

        # MUDRA: Micro/Small
        if enterprise_type in ["Micro", "Small"]:
            schemes.append("MUDRA")

        # Stand Up India: SC/ST/Women, new units
        if is_new and any(c in categories for c in ["women", "sc", "st"]):
            schemes.append("STANDUPINDIA")

        # Udyam: recommend for all unregistered
        if fields.get("has_udyam", "no") != "yes":
            schemes.append("UDYAM")

        # SFURTI: handicraft/artisan clusters
        if btype == "handicraft":
            schemes.append("SFURTI")

        return schemes
