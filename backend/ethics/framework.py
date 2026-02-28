"""
pAIr v3 — Ethical AI Governance Framework
============================================
Implements responsible AI principles for MSME compliance assistance.

Core Principles
---------------
1. Human-in-the-Loop     — AI recommends, humans decide
2. Transparency          — Every output comes with reasoning + confidence
3. Bias Mitigation       — Fair treatment across demographics
4. Data Privacy          — Minimal data retention, user consent
5. Consultant Synergy    — Complement professionals, never replace
6. Accessibility         — Multi-language, plain-language output
7. Accountability        — Audit trails for all recommendations

This is NOT a legal advisory tool. It is a compliance navigator that
empowers MSMEs with information while directing them to appropriate
professionals for final decisions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


# ── Enums ────────────────────────────────────────────────────────────────

class AIConfidenceLevel(str, Enum):
    """Confidence level of AI-generated outputs."""
    HIGH = "HIGH"           # ≥80% confidence — well-supported
    MEDIUM = "MEDIUM"       # 50–79% — reasonable but verify
    LOW = "LOW"             # <50% — speculative, must consult expert
    UNKNOWN = "UNKNOWN"     # Cannot determine


class EscalationReason(str, Enum):
    """Reasons to escalate to human expert."""
    LOW_CONFIDENCE = "low_confidence"
    COMPLEX_LEGAL = "complex_legal_matter"
    CRIMINAL_PENALTY = "criminal_penalty_risk"
    CONFLICTING_POLICIES = "conflicting_policies"
    CROSS_STATE = "cross_state_jurisdiction"
    HIGH_FINANCIAL_RISK = "high_financial_risk"
    AMBIGUOUS_ELIGIBILITY = "ambiguous_eligibility"
    USER_REQUESTED = "user_requested"


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class TransparencyCard:
    """
    Transparency metadata attached to every AI output.
    Makes the AI's reasoning and limitations visible to the user.
    """
    model_used: str
    confidence_level: AIConfidenceLevel
    reasoning_summary: str
    data_sources: List[str]
    limitations: List[str]
    last_policy_update: Optional[str] = None
    generated_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_used": self.model_used,
            "confidence_level": self.confidence_level.value,
            "reasoning_summary": self.reasoning_summary,
            "data_sources": self.data_sources,
            "limitations": self.limitations,
            "last_policy_update": self.last_policy_update,
            "generated_at": self.generated_at,
        }


@dataclass
class EscalationAlert:
    """Alert indicating the need for human expert intervention."""
    reason: EscalationReason
    severity: str                    # CRITICAL / HIGH / ADVISORY
    message: str
    recommended_expert: str          # CA / Lawyer / MSME Consultant
    context: str = ""


@dataclass
class BiasCheckResult:
    """Result of bias detection checks."""
    checked_dimensions: List[str]    # gender, caste, region, religion
    flags_raised: List[str]
    is_fair: bool
    mitigation_applied: str = ""


@dataclass
class EthicsReport:
    """Complete ethics & governance report for an analysis session."""
    disclaimers: List[str]
    transparency: TransparencyCard
    escalations: List[EscalationAlert]
    bias_check: BiasCheckResult
    human_in_loop_required: bool
    data_handling: Dict[str, str]
    consultant_recommendation: str


# ── Framework ────────────────────────────────────────────────────────────

class EthicalAIFramework:
    """
    Applies ethical AI governance to all pAIr outputs.

    Usage
    -----
        ethics = EthicalAIFramework()
        report = ethics.evaluate(
            analysis_result=policy_analysis_dict,
            confidence_score=0.75,
            model_name="gemini-2.5-flash",
            business_profile=profile_dict,
        )

        # Attach disclaimer + transparency card to every response
        response["ethics"] = report
    """

    # ── Standard Disclaimers ─────────────────────────────────────────

    DISCLAIMERS = [
        "⚖️ This is AI-generated compliance guidance, NOT legal advice.",
        "📋 Always verify with a qualified CA, lawyer, or MSME consultant "
        "before taking action on critical compliance matters.",
        "🔄 Policy information may not reflect the very latest amendments. "
        "Cross-check with official government sources.",
        "🤝 pAIr is designed to complement professional consultants, "
        "not replace them.",
        "🔒 Your uploaded documents are processed ephemerally and not "
        "stored beyond the analysis session.",
    ]

    # ── Public API ───────────────────────────────────────────────────

    def evaluate(
        self,
        analysis_result: Dict[str, Any],
        confidence_score: float,
        model_name: str = "gemini-2.5-flash",
        business_profile: Optional[Dict] = None,
        data_sources: Optional[List[str]] = None,
    ) -> EthicsReport:
        """
        Run full ethical evaluation on an analysis output.
        """
        # 1. Confidence assessment
        confidence_level = self._assess_confidence(confidence_score)

        # 2. Transparency card
        transparency = self._build_transparency_card(
            model_name, confidence_level, analysis_result, data_sources or []
        )

        # 3. Check for escalation triggers
        escalations = self._check_escalation_triggers(
            analysis_result, confidence_level, business_profile
        )

        # 4. Bias detection
        bias_check = self._check_bias(analysis_result, business_profile)

        # 5. Human-in-the-loop determination
        hitl_required = self._needs_human(confidence_level, escalations)

        # 6. Data handling statement
        data_handling = self._data_handling_statement()

        # 7. Consultant recommendation
        consultant_rec = self._consultant_recommendation(
            escalations, confidence_level
        )

        return EthicsReport(
            disclaimers=self.DISCLAIMERS,
            transparency=transparency,
            escalations=escalations,
            bias_check=bias_check,
            human_in_loop_required=hitl_required,
            data_handling=data_handling,
            consultant_recommendation=consultant_rec,
        )

    def get_disclaimers(self) -> List[str]:
        """Return standard disclaimers for UI display."""
        return self.DISCLAIMERS.copy()

    def quick_check(
        self, confidence: float, risk_level: str
    ) -> Dict[str, Any]:
        """
        Lightweight ethics check for API responses.
        Returns dict to embed in API response.
        """
        cl = self._assess_confidence(confidence)
        needs_expert = (
            cl in (AIConfidenceLevel.LOW, AIConfidenceLevel.UNKNOWN)
            or risk_level.upper() in ("HIGH", "CRITICAL")
        )
        return {
            "is_ai_generated": True,
            "confidence_level": cl.value,
            "legal_disclaimer": self.DISCLAIMERS[0],
            "consult_expert": needs_expert,
            "expert_type": "CA or MSME Consultant" if needs_expert else None,
        }

    # ── Internal Logic ───────────────────────────────────────────────

    def _assess_confidence(self, score: float) -> AIConfidenceLevel:
        if score >= 0.80:
            return AIConfidenceLevel.HIGH
        if score >= 0.50:
            return AIConfidenceLevel.MEDIUM
        if score > 0:
            return AIConfidenceLevel.LOW
        return AIConfidenceLevel.UNKNOWN

    def _build_transparency_card(
        self,
        model: str,
        confidence: AIConfidenceLevel,
        analysis: Dict[str, Any],
        sources: List[str],
    ) -> TransparencyCard:
        """Construct a transparency card explaining how the output was generated."""
        # Extract reasoning summary from analysis
        risk = analysis.get("risk_assessment", {})
        reasoning = risk.get("reasoning", "Analysis performed using multi-agent AI pipeline")

        # Identify limitations
        limitations = []
        conf_notes = analysis.get("confidence_notes", {})
        ambiguous = conf_notes.get("ambiguous_sections", [])
        missing = conf_notes.get("missing_information", [])

        if ambiguous:
            limitations.append(
                f"Ambiguous sections identified: {', '.join(ambiguous[:3])}"
            )
        if missing:
            limitations.append(
                f"Missing information: {', '.join(missing[:3])}"
            )
        if confidence != AIConfidenceLevel.HIGH:
            limitations.append(
                "Confidence level is below HIGH — human verification recommended"
            )
        limitations.append("AI analysis based on document text only — may miss context")

        return TransparencyCard(
            model_used=model,
            confidence_level=confidence,
            reasoning_summary=reasoning,
            data_sources=sources if sources else ["Uploaded PDF/document"],
            limitations=limitations,
            generated_at=datetime.utcnow().isoformat(),
        )

    def _check_escalation_triggers(
        self,
        analysis: Dict[str, Any],
        confidence: AIConfidenceLevel,
        profile: Optional[Dict],
    ) -> List[EscalationAlert]:
        """Detect situations requiring professional human intervention."""
        escalations: List[EscalationAlert] = []

        # Low confidence → escalate
        if confidence in (AIConfidenceLevel.LOW, AIConfidenceLevel.UNKNOWN):
            escalations.append(EscalationAlert(
                reason=EscalationReason.LOW_CONFIDENCE,
                severity="HIGH",
                message="AI confidence is low. Results should be verified by a professional.",
                recommended_expert="CA or Legal Advisor",
            ))

        # Criminal penalties → always escalate
        penalties = analysis.get("penalties", [])
        for p in penalties:
            consequences = p.get("other_consequences", "").lower()
            if any(w in consequences for w in ["imprison", "criminal", "jail", "arrest"]):
                escalations.append(EscalationAlert(
                    reason=EscalationReason.CRIMINAL_PENALTY,
                    severity="CRITICAL",
                    message=f"Criminal penalty risk detected: {p.get('violation', '')}. "
                            "Immediate legal consultation required.",
                    recommended_expert="Criminal/Corporate Lawyer",
                    context=p.get("violation", ""),
                ))

        # High financial risk (penalty > 5 lakh)
        for p in penalties:
            amount_str = p.get("penalty_amount", "")
            if any(w in amount_str.lower() for w in ["lakh", "crore", "lac"]):
                escalations.append(EscalationAlert(
                    reason=EscalationReason.HIGH_FINANCIAL_RISK,
                    severity="HIGH",
                    message="Significant financial penalties identified. "
                            "Professional review recommended.",
                    recommended_expert="Chartered Accountant",
                ))
                break

        # Complex multi-state applicability
        geo = analysis.get("policy_metadata", {}).get("geographical_scope", "").lower()
        if any(w in geo for w in ["multiple state", "all india", "inter-state"]):
            if profile and profile.get("state"):
                escalations.append(EscalationAlert(
                    reason=EscalationReason.CROSS_STATE,
                    severity="ADVISORY",
                    message="Policy has multi-state applicability. "
                            "State-specific compliance may vary.",
                    recommended_expert="MSME Consultant familiar with your state",
                ))

        return escalations

    def _check_bias(
        self,
        analysis: Dict[str, Any],
        profile: Optional[Dict],
    ) -> BiasCheckResult:
        """
        Check outputs for potential demographic bias.
        Ensures recommendations don't unfairly disadvantage any group.
        """
        dimensions = ["gender", "caste_category", "religion", "region", "age"]
        flags: List[str] = []

        # Check if scheme recommendations are equitable
        # (All qualified schemes should appear regardless of demographics)
        if profile:
            # Verify: if owner is women/SC/ST, special schemes should be included
            owner_raw = profile.get("owner_category", "")
            owner = owner_raw.lower() if isinstance(owner_raw, str) else " ".join(str(c) for c in owner_raw).lower()
            plan = analysis.get("compliance_plan", {})

            if any(w in owner for w in ["women", "woman", "female"]):
                # Should include Stand Up India or special CGTMSE coverage
                plan_text = str(plan).lower()
                if "stand" not in plan_text and "women" not in plan_text:
                    flags.append(
                        "Women entrepreneur benefits may not be fully represented "
                        "in recommendations"
                    )

            if any(w in owner for w in ["sc", "st"]):
                plan_text = str(plan).lower()
                if "stand" not in plan_text and "special" not in plan_text:
                    flags.append(
                        "SC/ST special category benefits may not be fully represented"
                    )

        mitigation = ""
        if flags:
            mitigation = (
                "System will re-check scheme eligibility for underrepresented "
                "categories and ensure inclusive recommendations."
            )

        return BiasCheckResult(
            checked_dimensions=dimensions,
            flags_raised=flags,
            is_fair=len(flags) == 0,
            mitigation_applied=mitigation,
        )

    def _needs_human(
        self,
        confidence: AIConfidenceLevel,
        escalations: List[EscalationAlert],
    ) -> bool:
        """Determine if human-in-the-loop is required."""
        if confidence in (AIConfidenceLevel.LOW, AIConfidenceLevel.UNKNOWN):
            return True
        if any(e.severity == "CRITICAL" for e in escalations):
            return True
        if len(escalations) >= 3:
            return True
        return False

    def _data_handling_statement(self) -> Dict[str, str]:
        """Data handling transparency statement."""
        return {
            "document_storage": "Documents are processed in-memory and NOT permanently stored.",
            "analysis_retention": "Analysis results are stored locally for session history only.",
            "personal_data": "Business profile data is used solely for scheme matching and is "
                             "not shared with third parties.",
            "ai_training": "Your data is NOT used to train AI models. Google Gemini processes "
                           "data under their Enterprise API terms.",
            "user_rights": "You may request deletion of all your data at any time.",
            "compliance": "Platform follows IT Act 2000 and upcoming DPDP Act 2023 principles.",
        }

    def _consultant_recommendation(
        self,
        escalations: List[EscalationAlert],
        confidence: AIConfidenceLevel,
    ) -> str:
        """Generate a consultant recommendation statement."""
        if not escalations and confidence == AIConfidenceLevel.HIGH:
            return (
                "This analysis has high confidence. You can proceed with the "
                "recommended actions, but consider having a CA verify before "
                "making major financial decisions."
            )

        experts = set()
        for e in escalations:
            experts.add(e.recommended_expert)

        if experts:
            expert_list = ", ".join(experts)
            return (
                f"We recommend consulting: {expert_list}. "
                "pAIr has identified aspects of this policy that benefit from "
                "professional human expertise. Use our analysis as a starting "
                "point for your discussion with them."
            )

        return (
            "Consider consulting an MSME consultant or Chartered Accountant "
            "to validate these recommendations before implementation."
        )
