"""
pAIr v4 — Enterprise Compliance Risk Scoring Engine
=====================================================
Quantifies regulatory risk for MSMEs on a 0–100 scale using a weighted
multi-factor algorithm calibrated for Indian policy environments.

v4 Enhancements
---------------
- Urgency decay function (exponential deadline urgency)
- Sector risk multiplier (manufacturing vs service vs trading)
- Regional compliance strictness factor
- Probability-adjusted penalty model (Expected Value)
- Discounted future value modelling for long-term penalties
- Impact-first scoring alignment

Formula
-------
    RiskScore = Σ (wᵢ × factorᵢ × sectorMult × regionalMult)
    where i ∈ {severity, penalty, deadline, frequency}

    DeadlineUrgency = 100 × e^(-λ × days_remaining)     [λ = 0.033]
    ExpectedPenalty = P(enforcement) × PenaltyAmount × (1 + r)^(-t)

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

# ── v4: Sector Risk Multipliers ──────────────────────────────────────────
# Manufacturing has more compliance burden than services

SECTOR_RISK_MULTIPLIERS: Dict[str, float] = {
    "manufacturing": 1.25,
    "service": 1.00,
    "trading": 1.10,
    "handicraft": 0.90,
    "default": 1.05,
}

# ── v4: Regional Compliance Strictness ───────────────────────────────────

REGIONAL_STRICTNESS: Dict[str, float] = {
    "maharashtra": 1.20, "karnataka": 1.15, "tamil_nadu": 1.10,
    "telangana": 1.10, "delhi": 1.25, "gujarat": 1.05,
    "uttar_pradesh": 0.90, "west_bengal": 0.95, "rajasthan": 0.90,
    "default": 1.00,
}

# ── v4: Urgency Decay Constants ──────────────────────────────────────────
# λ for exponential decay: urgency = 100 * e^(-λ * days)
# At 7 days: ~79, at 30 days: ~37, at 90 days: ~5
URGENCY_LAMBDA = 0.033

# ── v4: Discount Rate for Future Value ───────────────────────────────────
DISCOUNT_RATE_ANNUAL = 0.10  # 10% discount rate for future penalty valuation


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
    # v4 additions
    expected_penalty_inr: float = 0.0      # Probability-adjusted penalty
    urgency_decay_score: float = 0.0       # Exponential urgency
    discounted_penalty_inr: float = 0.0    # Time-value adjusted penalty
    sector_adjusted_score: float = 0.0     # After sector multiplier


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
    # v4 additions
    sector_multiplier: float = 1.0
    regional_multiplier: float = 1.0
    total_expected_penalty_inr: float = 0.0  # Sum of all probability-adjusted penalties
    total_discounted_penalty_inr: float = 0.0  # Present value of all penalties
    risk_velocity: str = ""                  # ACCELERATING / STABLE / DECELERATING


# ── Scoring Engine ───────────────────────────────────────────────────────

class ComplianceRiskScorer:
    """
    Enterprise-grade multi-factor compliance risk scorer.

    v4 Features:
    - Exponential urgency decay function
    - Sector × regional risk multipliers
    - Probability-adjusted expected penalty values
    - Discounted future value modelling
    - Risk velocity tracking

    Usage
    -----
        scorer = ComplianceRiskScorer()
        report = scorer.score(policy_analysis_dict, business_profile=profile)
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

    def score(
        self,
        analysis: Dict[str, Any],
        business_profile: Optional[Dict[str, Any]] = None,
    ) -> ComplianceRiskReport:
        """
        Score a policy analysis result and return a full risk report.

        Parameters
        ----------
        analysis : dict
            A PolicyAnalysis-shaped dict with keys: obligations, penalties,
            risk_assessment, compliance_actions, etc.
        business_profile : dict, optional
            MSME profile for sector/regional adjustments.
        """
        profile = business_profile or {}
        obligations = analysis.get("obligations", [])
        penalties = analysis.get("penalties", [])
        actions = analysis.get("compliance_actions", [])

        # v4: Resolve sector and regional multipliers
        sector_mult = self._get_sector_multiplier(profile)
        regional_mult = self._get_regional_multiplier(profile)

        # Build a penalty-lookup for obligation matching
        penalty_map = self._build_penalty_map(penalties)

        obligation_risks: List[ObligationRisk] = []

        for obl in obligations:
            obl_risk = self._score_obligation(obl, penalty_map, sector_mult, regional_mult)
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

        # v4: Aggregate expected & discounted penalties
        total_expected = sum(r.expected_penalty_inr for r in obligation_risks)
        total_discounted = sum(r.discounted_penalty_inr for r in obligation_risks)

        # v4: Risk velocity (are deadlines accelerating?)
        risk_velocity = self._compute_risk_velocity(obligation_risks)

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
            sector_multiplier=sector_mult,
            regional_multiplier=regional_mult,
            total_expected_penalty_inr=round(total_expected, 0),
            total_discounted_penalty_inr=round(total_discounted, 0),
            risk_velocity=risk_velocity,
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
        self, obl: Dict[str, Any], penalty_map: Dict[str, float],
        sector_mult: float = 1.0, regional_mult: float = 1.0,
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

        # v4: Apply sector × regional multipliers (capped at 1.4×)
        adjusted = min(100, weighted * min(sector_mult * regional_mult, 1.4))

        # v4: Exponential urgency decay
        urgency_decay = self._urgency_decay(days_remaining)

        # v4: Expected penalty (probability-adjusted)
        raw_penalty_inr = self._extract_raw_penalty_inr(name, penalty_map)
        enforcement_prob = self._enforcement_probability(severity_raw)
        expected_penalty = raw_penalty_inr * enforcement_prob

        # v4: Discounted future value
        discounted = self._discount_penalty(expected_penalty, days_remaining)

        band = self._band(adjusted)
        hint = self._remediation_hint(band, name)

        return ObligationRisk(
            obligation_name=name,
            severity_score=round(severity_score, 1),
            penalty_score=round(penalty_score, 1),
            deadline_score=round(deadline_score, 1),
            frequency_score=round(frequency_score, 1),
            weighted_score=round(adjusted, 1),
            risk_band=band,
            days_remaining=days_remaining,
            remediation_hint=hint,
            expected_penalty_inr=round(expected_penalty, 0),
            urgency_decay_score=round(urgency_decay, 1),
            discounted_penalty_inr=round(discounted, 0),
            sector_adjusted_score=round(adjusted, 1),
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

    # ── v4: Advanced Scoring Methods ─────────────────────────────────

    def _urgency_decay(self, days_remaining: Optional[int]) -> float:
        """
        Exponential urgency decay function.
        urgency = 100 × e^(-λ × days)

        Returns 100 for overdue, ~79 for 7 days, ~37 for 30 days, ~5 for 90 days.
        """
        if days_remaining is None:
            return 50.0  # Unknown → moderate urgency
        if days_remaining <= 0:
            return 100.0  # Overdue → maximum urgency
        return 100.0 * math.exp(-URGENCY_LAMBDA * days_remaining)

    def _enforcement_probability(self, severity_raw: str) -> float:
        """
        Probability of enforcement/penalty action given severity.
        Criminal: 0.90, Suspension: 0.80, Heavy Fine: 0.70, etc.
        """
        kw = severity_raw.lower()
        if any(w in kw for w in ["criminal", "imprison", "jail"]):
            return 0.90
        if any(w in kw for w in ["suspend", "revok", "cancel"]):
            return 0.80
        if any(w in kw for w in ["heavy", "signific", "lakh", "crore"]):
            return 0.70
        if any(w in kw for w in ["fine", "penal"]):
            return 0.55
        if any(w in kw for w in ["warn", "notice"]):
            return 0.30
        return 0.40  # Default moderate

    def _extract_raw_penalty_inr(self, obl_name: str, penalty_map: Dict[str, float]) -> float:
        """Extract raw penalty amount in INR for expected value calculation."""
        words = [w.lower() for w in obl_name.split() if len(w) > 3]
        amounts = [penalty_map.get(w, 0) for w in words]
        if amounts:
            # Convert score back to approximate INR (inverse of _penalty_amount_to_score)
            max_score = max(amounts)
            if max_score >= 100:
                return 10_00_000
            if max_score >= 85:
                return 5_00_000
            if max_score >= 70:
                return 1_00_000
            if max_score >= 55:
                return 50_000
            if max_score >= 40:
                return 10_000
        return 5_000  # Default minimum estimate

    def _discount_penalty(self, expected_penalty: float, days: Optional[int]) -> float:
        """
        Discounted future value of penalty.
        PV = FV / (1 + r)^t  where r = annual rate, t = years.
        """
        if days is None or days <= 0:
            return expected_penalty  # Already due or overdue → full value
        years = days / 365.0
        return expected_penalty / ((1 + DISCOUNT_RATE_ANNUAL) ** years)

    def _get_sector_multiplier(self, profile: Dict[str, Any]) -> float:
        """Resolve sector risk multiplier from business profile."""
        sector = profile.get("sector", profile.get("business_type", "")).lower()
        if any(w in sector for w in ["manufactur", "factory", "production"]):
            return SECTOR_RISK_MULTIPLIERS["manufacturing"]
        if any(w in sector for w in ["service", "consult", "it", "software"]):
            return SECTOR_RISK_MULTIPLIERS["service"]
        if any(w in sector for w in ["trad", "retail", "wholesale"]):
            return SECTOR_RISK_MULTIPLIERS["trading"]
        if any(w in sector for w in ["craft", "handloom", "artisan"]):
            return SECTOR_RISK_MULTIPLIERS["handicraft"]
        return SECTOR_RISK_MULTIPLIERS["default"]

    def _get_regional_multiplier(self, profile: Dict[str, Any]) -> float:
        """Resolve regional compliance strictness multiplier."""
        state = profile.get("state", profile.get("location", "")).lower().replace(" ", "_")
        if state in REGIONAL_STRICTNESS:
            return REGIONAL_STRICTNESS[state]
        for key in REGIONAL_STRICTNESS:
            if key in state or state in key:
                return REGIONAL_STRICTNESS[key]
        return REGIONAL_STRICTNESS["default"]

    def _compute_risk_velocity(self, risks: List[ObligationRisk]) -> str:
        """
        Determine if risk is accelerating (deadlines clustering soon),
        stable, or decelerating.
        """
        days_list = [r.days_remaining for r in risks if r.days_remaining is not None]
        if not days_list:
            return "STABLE"
        overdue = sum(1 for d in days_list if d < 0)
        soon = sum(1 for d in days_list if 0 <= d <= 30)
        far = sum(1 for d in days_list if d > 30)
        total = len(days_list)
        if total == 0:
            return "STABLE"
        urgency_ratio = (overdue * 2 + soon) / total
        if urgency_ratio > 1.5:
            return "ACCELERATING"
        if urgency_ratio < 0.5:
            return "DECELERATING"
        return "STABLE"
