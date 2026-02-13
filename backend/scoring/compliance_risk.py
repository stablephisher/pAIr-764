"""
pAIr v3 — Compliance Risk Scoring Engine
==========================================
Quantifies regulatory risk for MSMEs on a 0–100 scale using a weighted
multi-factor algorithm calibrated for Indian policy environments.

Formula
-------
    RiskScore = Σ (wᵢ × factorᵢ)    where i ∈ {severity, penalty, deadline, frequency}

Each factor is normalized to 0–100 before weighting.

Risk Bands
----------
    CRITICAL ≥ 80 | HIGH ≥ 60 | MEDIUM ≥ 40 | LOW ≥ 20 | MINIMAL < 20
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional

from config import config


# ── Enums ────────────────────────────────────────────────────────────────

class RiskBand(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    MINIMAL = "MINIMAL"


class Severity(str, Enum):
    """Normalised severity categories used across the platform."""
    CRIMINAL = "CRIMINAL"          # 100
    SUSPENSION = "SUSPENSION"      # 90
    HEAVY_FINE = "HEAVY_FINE"      # 75
    MODERATE_FINE = "MODERATE_FINE" # 55
    WARNING = "WARNING"            # 35
    ADVISORY = "ADVISORY"          # 15

SEVERITY_SCORES: Dict[str, int] = {
    Severity.CRIMINAL: 100,
    Severity.SUSPENSION: 90,
    Severity.HEAVY_FINE: 75,
    Severity.MODERATE_FINE: 55,
    Severity.WARNING: 35,
    Severity.ADVISORY: 15,
}


class Frequency(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    ANNUALLY = "ANNUALLY"
    ONE_TIME = "ONE_TIME"

FREQUENCY_SCORES: Dict[str, int] = {
    Frequency.DAILY: 100,
    Frequency.WEEKLY: 85,
    Frequency.MONTHLY: 70,
    Frequency.QUARTERLY: 50,
    Frequency.ANNUALLY: 30,
    Frequency.ONE_TIME: 10,
}


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class ObligationRisk:
    """Risk profile for a single obligation."""
    obligation_name: str
    severity_score: float          # 0–100
    penalty_score: float           # 0–100
    deadline_score: float          # 0–100
    frequency_score: float         # 0–100
    weighted_score: float = 0.0
    risk_band: RiskBand = RiskBand.MINIMAL
    days_remaining: Optional[int] = None
    remediation_hint: str = ""


@dataclass
class ComplianceRiskReport:
    """Aggregated risk report for a business."""
    overall_score: float           # 0–100 (weighted avg of all obligations)
    overall_band: RiskBand
    obligation_risks: List[ObligationRisk]
    top_risks: List[ObligationRisk]          # Top 3 highest-risk items
    score_breakdown: Dict[str, float]        # Per-factor averages
    generated_at: str = ""
    recommendations: List[str] = field(default_factory=list)


# ── Scoring Engine ───────────────────────────────────────────────────────

class ComplianceRiskScorer:
    """
    Multi-factor compliance risk scorer.

    Usage
    -----
        scorer = ComplianceRiskScorer()
        report = scorer.score(policy_analysis_dict)
    """

    def __init__(self):
        self.w = config.scoring
        self._weights = {
            "severity": self.w.w_severity,
            "penalty": self.w.w_penalty,
            "deadline": self.w.w_deadline,
            "frequency": self.w.w_frequency,
        }

    # ── Public API ───────────────────────────────────────────────────

    def score(self, analysis: Dict[str, Any]) -> ComplianceRiskReport:
        """
        Score a policy analysis result and return a full risk report.

        Parameters
        ----------
        analysis : dict
            A PolicyAnalysis-shaped dict with keys: obligations, penalties,
            risk_assessment, compliance_actions, etc.
        """
        obligations = analysis.get("obligations", [])
        penalties = analysis.get("penalties", [])
        actions = analysis.get("compliance_actions", [])

        # Build a penalty-lookup for obligation matching
        penalty_map = self._build_penalty_map(penalties)

        obligation_risks: List[ObligationRisk] = []

        for obl in obligations:
            obl_risk = self._score_obligation(obl, penalty_map)
            obligation_risks.append(obl_risk)

        # Add action-derived synthetic obligations if no overlap
        obl_names = {o.obligation_name.lower() for o in obligation_risks}
        for act in actions:
            act_name = act.get("action", "")
            if act_name.lower() not in obl_names:
                syn = self._score_action_as_obligation(act)
                obligation_risks.append(syn)

        # Sort descending by score
        obligation_risks.sort(key=lambda o: o.weighted_score, reverse=True)

        # Overall score: weighted mean (heavier weight on top risks)
        overall = self._compute_overall(obligation_risks)
        overall_band = self._band(overall)

        # Top 3
        top_risks = obligation_risks[:3]

        # Per-factor averages
        factor_avgs = self._factor_averages(obligation_risks)

        # Recommendations
        recommendations = self._generate_recommendations(
            obligation_risks, overall_band, analysis
        )

        return ComplianceRiskReport(
            overall_score=round(overall, 1),
            overall_band=overall_band,
            obligation_risks=obligation_risks,
            top_risks=top_risks,
            score_breakdown=factor_avgs,
            generated_at=datetime.utcnow().isoformat(),
            recommendations=recommendations,
        )

    def score_quick(self, risk_level: str, penalties: List[dict]) -> float:
        """
        Quick risk score from a risk_level string and penalties list.
        Used for lightweight scoring without full analysis.
        """
        level_map = {"HIGH": 80, "MEDIUM": 50, "LOW": 25}
        base = level_map.get(risk_level.upper(), 50)

        # Boost by penalty severity
        penalty_boost = 0
        for p in penalties:
            amount_str = p.get("penalty_amount", "")
            parsed = self._parse_penalty_amount(amount_str)
            if parsed > 500_000:
                penalty_boost = max(penalty_boost, 20)
            elif parsed > 100_000:
                penalty_boost = max(penalty_boost, 12)
            elif parsed > 10_000:
                penalty_boost = max(penalty_boost, 5)

        return min(100, base + penalty_boost)

    # ── Internal Scoring Logic ───────────────────────────────────────

    def _score_obligation(
        self, obl: Dict[str, Any], penalty_map: Dict[str, float]
    ) -> ObligationRisk:
        """Score a single obligation against all four factors."""

        name = obl.get("obligation", "Unknown")

        # Factor 1: Severity
        severity_raw = obl.get("severity_if_ignored", "WARNING").upper()
        severity_score = self._normalize_severity(severity_raw)

        # Factor 2: Penalty (match by keyword overlap)
        penalty_score = self._match_penalty_score(name, penalty_map)

        # Factor 3: Deadline urgency
        deadline_str = obl.get("deadline", "")
        deadline_score, days_remaining = self._score_deadline(deadline_str)

        # Factor 4: Frequency
        frequency_str = obl.get("frequency", "ONE_TIME").upper()
        frequency_score = self._normalize_frequency(frequency_str)

        # Weighted composite
        weighted = (
            self._weights["severity"] * severity_score
            + self._weights["penalty"] * penalty_score
            + self._weights["deadline"] * deadline_score
            + self._weights["frequency"] * frequency_score
        )

        band = self._band(weighted)
        hint = self._remediation_hint(band, name)

        return ObligationRisk(
            obligation_name=name,
            severity_score=round(severity_score, 1),
            penalty_score=round(penalty_score, 1),
            deadline_score=round(deadline_score, 1),
            frequency_score=round(frequency_score, 1),
            weighted_score=round(weighted, 1),
            risk_band=band,
            days_remaining=days_remaining,
            remediation_hint=hint,
        )

    def _score_action_as_obligation(self, action: Dict[str, Any]) -> ObligationRisk:
        """Convert a ComplianceAction into a synthetic obligation risk."""
        priority_map = {"HIGH": 75, "MEDIUM": 45, "LOW": 20}
        sev = priority_map.get(action.get("priority", "MEDIUM"), 45)
        return ObligationRisk(
            obligation_name=action.get("action", "Action"),
            severity_score=sev,
            penalty_score=30,
            deadline_score=40,
            frequency_score=20,
            weighted_score=round(
                self._weights["severity"] * sev
                + self._weights["penalty"] * 30
                + self._weights["deadline"] * 40
                + self._weights["frequency"] * 20,
                1,
            ),
            risk_band=self._band(sev * 0.5 + 20),
            remediation_hint="Review compliance action requirements.",
        )

    # ── Factor Normalisers ───────────────────────────────────────────

    def _normalize_severity(self, raw: str) -> float:
        """Map textual severity to 0–100."""
        # Try direct enum match first
        for sev in Severity:
            if sev.value in raw:
                return SEVERITY_SCORES[sev]
        # Keyword fallback
        kw = raw.lower()
        if any(w in kw for w in ["imprison", "criminal", "jail"]):
            return 100
        if any(w in kw for w in ["suspend", "revok", "cancel"]):
            return 90
        if any(w in kw for w in ["heavy", "lakh", "crore", "signific"]):
            return 75
        if any(w in kw for w in ["fine", "penal"]):
            return 55
        if any(w in kw for w in ["warn", "notice"]):
            return 35
        return 25  # Default: mild

    def _normalize_frequency(self, raw: str) -> float:
        """Map frequency string to 0–100."""
        for freq in Frequency:
            if freq.value in raw:
                return FREQUENCY_SCORES[freq]
        kw = raw.lower()
        if "daily" in kw or "continuous" in kw:
            return 100
        if "week" in kw:
            return 85
        if "month" in kw:
            return 70
        if "quarter" in kw:
            return 50
        if "annual" in kw or "year" in kw:
            return 30
        return 10  # Default: one-time

    def _score_deadline(self, deadline_str: str) -> tuple[float, Optional[int]]:
        """
        Deadline urgency: 100 = overdue, 0 = far away.
        Returns (score, days_remaining or None).
        """
        if not deadline_str:
            return 40.0, None

        # Try parsing common date formats
        for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%B %d, %Y", "%d %B %Y"]:
            try:
                dt = datetime.strptime(deadline_str.strip(), fmt)
                delta = (dt - datetime.utcnow()).days
                if delta < 0:
                    return 100.0, delta  # Overdue
                if delta <= 7:
                    return 95.0, delta
                if delta <= 14:
                    return 85.0, delta
                if delta <= 30:
                    return 70.0, delta
                if delta <= 60:
                    return 50.0, delta
                if delta <= 90:
                    return 35.0, delta
                if delta <= 180:
                    return 20.0, delta
                return 10.0, delta
            except ValueError:
                continue

        # Keyword heuristics for non-date strings
        kw = deadline_str.lower()
        if any(w in kw for w in ["immediate", "urgent", "overdue", "asap"]):
            return 95.0, 0
        if any(w in kw for w in ["within 7", "1 week"]):
            return 85.0, 7
        if any(w in kw for w in ["within 30", "1 month"]):
            return 65.0, 30
        if any(w in kw for w in ["within 90", "3 month", "quarter"]):
            return 40.0, 90
        if any(w in kw for w in ["annual", "yearly", "before march"]):
            return 25.0, 180

        return 40.0, None  # Unknown → moderate urgency

    def _build_penalty_map(self, penalties: List[Dict[str, Any]]) -> Dict[str, float]:
        """Build keyword→penalty_score lookup from penalty entries."""
        pmap: Dict[str, float] = {}
        for p in penalties:
            violation = p.get("violation", "").lower()
            amount_str = p.get("penalty_amount", "")
            score = self._penalty_amount_to_score(amount_str)
            # Store with each word as key for fuzzy matching
            for word in violation.split():
                if len(word) > 3:
                    pmap[word] = max(pmap.get(word, 0), score)
        return pmap

    def _match_penalty_score(self, obl_name: str, penalty_map: Dict[str, float]) -> float:
        """Match obligation name to penalty scores via keyword overlap."""
        if not penalty_map:
            return 30.0  # Default moderate
        words = [w.lower() for w in obl_name.split() if len(w) > 3]
        scores = [penalty_map[w] for w in words if w in penalty_map]
        return max(scores) if scores else 30.0

    def _penalty_amount_to_score(self, amount_str: str) -> float:
        """Parse penalty amount string to 0–100 severity score."""
        parsed = self._parse_penalty_amount(amount_str)
        if parsed <= 0:
            return 30.0  # Unknown → moderate
        if parsed >= 10_00_000:  # ≥ 10 lakh
            return 100.0
        if parsed >= 5_00_000:
            return 85.0
        if parsed >= 1_00_000:
            return 70.0
        if parsed >= 50_000:
            return 55.0
        if parsed >= 10_000:
            return 40.0
        return 25.0

    def _parse_penalty_amount(self, s: str) -> float:
        """Extract numeric value from Indian penalty strings."""
        if not s:
            return 0.0
        import re
        s_lower = s.lower().replace(",", "")
        # Handle crore/lakh/thousand
        m = re.search(r"([\d.]+)\s*(crore|cr)", s_lower)
        if m:
            return float(m.group(1)) * 1_00_00_000
        m = re.search(r"([\d.]+)\s*(lakh|lac|l)", s_lower)
        if m:
            return float(m.group(1)) * 1_00_000
        m = re.search(r"([\d.]+)\s*(thousand|k)", s_lower)
        if m:
            return float(m.group(1)) * 1_000
        m = re.search(r"rs\.?\s*([\d.]+)", s_lower)
        if m:
            return float(m.group(1))
        m = re.search(r"([\d.]+)", s_lower)
        if m:
            return float(m.group(1))
        return 0.0

    # ── Risk Band ────────────────────────────────────────────────────

    def _band(self, score: float) -> RiskBand:
        if score >= self.w.risk_critical:
            return RiskBand.CRITICAL
        if score >= self.w.risk_high:
            return RiskBand.HIGH
        if score >= self.w.risk_medium:
            return RiskBand.MEDIUM
        if score >= self.w.risk_low:
            return RiskBand.LOW
        return RiskBand.MINIMAL

    # ── Aggregation ──────────────────────────────────────────────────

    def _compute_overall(self, risks: List[ObligationRisk]) -> float:
        """
        Overall risk: exponentially-weighted mean that emphasises top risks.
        Top-1 gets 2× weight, top-2 gets 1.5×, rest 1×.
        """
        if not risks:
            return 0.0
        if len(risks) == 1:
            return risks[0].weighted_score

        total, weight_sum = 0.0, 0.0
        for i, r in enumerate(risks):
            w = 2.0 if i == 0 else (1.5 if i == 1 else 1.0)
            total += w * r.weighted_score
            weight_sum += w
        return total / weight_sum

    def _factor_averages(self, risks: List[ObligationRisk]) -> Dict[str, float]:
        """Compute per-factor averages across all obligations."""
        if not risks:
            return {"severity": 0, "penalty": 0, "deadline": 0, "frequency": 0}
        n = len(risks)
        return {
            "severity": round(sum(r.severity_score for r in risks) / n, 1),
            "penalty": round(sum(r.penalty_score for r in risks) / n, 1),
            "deadline": round(sum(r.deadline_score for r in risks) / n, 1),
            "frequency": round(sum(r.frequency_score for r in risks) / n, 1),
        }

    # ── Recommendations ──────────────────────────────────────────────

    def _generate_recommendations(
        self,
        risks: List[ObligationRisk],
        band: RiskBand,
        analysis: Dict[str, Any],
    ) -> List[str]:
        """Generate actionable compliance recommendations."""
        recs: List[str] = []

        if band in (RiskBand.CRITICAL, RiskBand.HIGH):
            recs.append(
                "⚠️ URGENT: Your compliance risk is elevated. "
                "Prioritize the top obligations immediately."
            )

        # Overdue items
        overdue = [r for r in risks if r.days_remaining is not None and r.days_remaining < 0]
        if overdue:
            recs.append(
                f"🔴 {len(overdue)} obligation(s) are OVERDUE. "
                "Address these before all others."
            )

        # Soon-due items
        soon = [r for r in risks if r.days_remaining is not None and 0 <= r.days_remaining <= 30]
        if soon:
            recs.append(
                f"🟡 {len(soon)} obligation(s) due within 30 days. "
                "Plan your compliance calendar now."
            )

        # High-severity items
        high_sev = [r for r in risks if r.severity_score >= 75]
        if high_sev:
            names = ", ".join(r.obligation_name[:40] for r in high_sev[:3])
            recs.append(
                f"🔵 High-severity obligations: {names}. "
                "Non-compliance could lead to serious consequences."
            )

        # General best practice
        recs.append(
            "📋 Set up a compliance calendar with automated reminders "
            "for recurring obligations."
        )

        return recs

    def _remediation_hint(self, band: RiskBand, name: str) -> str:
        """Short remediation hint based on risk band."""
        hints = {
            RiskBand.CRITICAL: f"Immediate action required for '{name}'. Consult a legal advisor.",
            RiskBand.HIGH: f"Schedule '{name}' compliance within this week.",
            RiskBand.MEDIUM: f"Plan to address '{name}' within the next 30 days.",
            RiskBand.LOW: f"Add '{name}' to your quarterly review checklist.",
            RiskBand.MINIMAL: f"'{name}' is low priority. Monitor periodically.",
        }
        return hints.get(band, "Review compliance requirements.")
