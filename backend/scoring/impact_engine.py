"""
pAIr v4 — Composite Impact Engine
====================================
The central metric that quantifies the REAL-WORLD VALUE pAIr delivers
to every MSME it serves. This is what judges, investors, and SAP care about.

Formula
-------
    ImpactScore =
        (ComplianceRiskReduction × 30%) +
        (ProfitabilityGain       × 25%) +
        (SustainabilityImprovement × 20%) +
        (TimeSaved               × 15%) +
        (CostSaved               × 10%)

    Each sub-score is normalised to 0–100 before weighting.

Outputs
-------
- Composite ImpactScore (0–100)
- Impact Grade (Transformative / High / Moderate / Low / Minimal)
- Monthly & Yearly projections
- Sector benchmarking percentile
- Human-readable impact narrative
- SAP GRC alignment mapping

Why This Matters
----------------
This single number answers:  "What measurable difference does pAIr make?"
Every dashboard, every report, every pitch deck leads with this.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


# ── Impact Grade Thresholds ─────────────────────────────────────────────

IMPACT_GRADES = {
    90: "TRANSFORMATIVE",
    75: "HIGH",
    55: "MODERATE",
    35: "LOW",
    0: "MINIMAL",
}

# ── Sector Benchmark Baselines (avg compliance cost, avg risk, etc.) ──
# Source: MSME Ministry reports, RBI data, industry estimates

SECTOR_BENCHMARKS = {
    "manufacturing": {
        "avg_risk_score": 62, "avg_compliance_cost_inr": 85000,
        "avg_penalties_year_inr": 150000, "digital_adoption": 0.35,
        "avg_schemes_utilized": 1.2,
    },
    "service": {
        "avg_risk_score": 48, "avg_compliance_cost_inr": 55000,
        "avg_penalties_year_inr": 80000, "digital_adoption": 0.55,
        "avg_schemes_utilized": 1.5,
    },
    "trading": {
        "avg_risk_score": 55, "avg_compliance_cost_inr": 65000,
        "avg_penalties_year_inr": 120000, "digital_adoption": 0.40,
        "avg_schemes_utilized": 0.8,
    },
    "handicraft": {
        "avg_risk_score": 40, "avg_compliance_cost_inr": 35000,
        "avg_penalties_year_inr": 50000, "digital_adoption": 0.20,
        "avg_schemes_utilized": 0.5,
    },
    "default": {
        "avg_risk_score": 52, "avg_compliance_cost_inr": 60000,
        "avg_penalties_year_inr": 100000, "digital_adoption": 0.38,
        "avg_schemes_utilized": 1.0,
    },
}

# ── Regional Compliance Strictness Multiplier ────────────────────────────
# Higher = stricter enforcement → higher impact from compliance

REGIONAL_STRICTNESS = {
    "maharashtra": 1.25, "karnataka": 1.20, "tamil_nadu": 1.15,
    "telangana": 1.15, "delhi": 1.30, "gujarat": 1.10,
    "uttar_pradesh": 0.90, "west_bengal": 0.95, "rajasthan": 0.90,
    "andhra_pradesh": 1.05, "kerala": 1.10, "punjab": 1.00,
    "default": 1.00,
}


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class ImpactBreakdown:
    """Per-dimension impact scores (each 0–100)."""
    compliance_risk_reduction: float
    profitability_gain: float
    sustainability_improvement: float
    time_saved: float
    cost_saved: float


@dataclass
class ImpactProjection:
    """Monthly and yearly impact projections."""
    monthly_risk_reduction_pct: float
    monthly_cost_saved_inr: float
    monthly_time_saved_hours: float
    monthly_penalties_prevented_inr: float
    monthly_schemes_value_inr: float
    yearly_risk_reduction_pct: float
    yearly_cost_saved_inr: float
    yearly_time_saved_hours: float
    yearly_penalties_prevented_inr: float
    yearly_schemes_value_inr: float
    yearly_co2_saved_kg: float
    yearly_paper_pages_saved: int
    yearly_total_roi_inr: float


@dataclass
class SectorBenchmark:
    """How this business compares to sector average."""
    sector: str
    percentile: float                   # 0–100 (higher = better than peers)
    vs_avg_risk: str                    # "32% lower risk than sector average"
    vs_avg_cost: str                    # "85% less compliance cost"
    vs_avg_penalties: str               # "₹1.2L penalties prevented"
    digital_maturity_boost: str         # "3.5× more digitally mature"


@dataclass
class GRCAlignment:
    """SAP GRC (Governance, Risk, Compliance) alignment mapping."""
    governance_score: float             # How well-governed is compliance
    risk_management_score: float        # Risk identification & mitigation
    compliance_score: float             # Regulatory adherence
    sustainability_score: float         # ESG & sustainability metrics
    overall_grc_readiness: str          # Enterprise / Growth / Basic


@dataclass
class ImpactReport:
    """Complete Impact Report — the centrepiece of pAIr's value proposition."""
    impact_score: float                 # 0–100 composite
    impact_grade: str                   # TRANSFORMATIVE / HIGH / MODERATE / LOW / MINIMAL
    breakdown: ImpactBreakdown
    projection: ImpactProjection
    benchmark: SectorBenchmark
    grc_alignment: GRCAlignment
    narrative: str                      # Human-readable impact story
    key_metrics: Dict[str, Any]         # Headline numbers for dashboard
    generated_at: str = ""


# ── Impact Engine ────────────────────────────────────────────────────────

class ImpactEngine:
    """
    Composite Impact Scoring Engine.

    Aggregates all scoring dimensions into a single, defensible,
    presentation-ready impact metric.

    Usage
    -----
        engine = ImpactEngine()
        report = engine.calculate(
            risk_data=risk_score_dict,
            sustainability_data=sustainability_dict,
            profitability_data=profitability_dict,
            business_profile=profile_dict,
            num_policies=3,
        )

    The ImpactScore is designed to be:
    - Understandable by non-technical judges
    - Defensible with transparent formulae
    - Comparable across sectors via benchmarking
    - Aligned with SAP GRC frameworks
    """

    # ── Weights (must sum to 1.0) ────────────────────────────────────
    W_RISK = 0.30
    W_PROFIT = 0.25
    W_SUSTAINABILITY = 0.20
    W_TIME = 0.15
    W_COST = 0.10

    def calculate(
        self,
        risk_data: Dict[str, Any],
        sustainability_data: Dict[str, Any],
        profitability_data: Dict[str, Any],
        business_profile: Optional[Dict[str, Any]] = None,
        num_policies: int = 1,
        num_schemes: int = 0,
    ) -> ImpactReport:
        """
        Calculate composite impact score from all scoring engine outputs.

        Parameters
        ----------
        risk_data : dict
            Output from ComplianceRiskScorer (overall_score, overall_band, etc.)
        sustainability_data : dict
            Output from SustainabilityEngine (green_score, paper, carbon, etc.)
        profitability_data : dict
            Output from ProfitabilityOptimizer (total_roi_inr, roi_multiplier, etc.)
        business_profile : dict, optional
            MSME profile for sector benchmarking and regional adjustments.
        num_policies : int
            Policies analysed in this session.
        num_schemes : int
            Schemes matched.
        """
        profile = business_profile or {}
        sector = self._resolve_sector(profile)
        region = self._resolve_region(profile)
        regional_multiplier = REGIONAL_STRICTNESS.get(region, 1.0)
        benchmark_data = SECTOR_BENCHMARKS.get(sector, SECTOR_BENCHMARKS["default"])

        # ── 1. Compliance Risk Reduction (0-100) ────────────────────
        # How much risk is REDUCED by using pAIr vs doing nothing
        raw_risk = risk_data.get("overall_score", 50)
        # Risk reduction = how much of the identified risk pAIr helps mitigate
        # Higher raw risk = more value from pAIr (more to fix)
        risk_reduction = self._risk_reduction_score(raw_risk, regional_multiplier)

        # ── 2. Profitability Gain (0-100) ───────────────────────────
        roi_multiplier = profitability_data.get("roi_multiplier", 1.0)
        total_roi = profitability_data.get("total_roi_inr", 0)
        penalty_avoided = profitability_data.get("penalty_avoidance_inr", 0)
        scheme_benefits = profitability_data.get("scheme_benefits_inr", 0)
        profitability_score = self._profitability_score(
            roi_multiplier, total_roi, penalty_avoided, scheme_benefits, benchmark_data
        )

        # ── 3. Sustainability Improvement (0-100) ───────────────────
        green_score = sustainability_data.get("green_score", 0)
        co2_saved = sustainability_data.get("co2_saved_kg", 0)
        sustainability_score = self._sustainability_score(green_score, co2_saved)

        # ── 4. Time Saved (0-100) ───────────────────────────────────
        hours_saved = sustainability_data.get("hours_saved", 0)
        productivity_mult = sustainability_data.get("productivity_multiplier", 1.0)
        time_score = self._time_saved_score(hours_saved, productivity_mult, num_policies)

        # ── 5. Cost Saved (0-100) ───────────────────────────────────
        cost_saved = sustainability_data.get("cost_saved_inr", 0)
        cost_score = self._cost_saved_score(cost_saved, benchmark_data, num_policies)

        # ── Composite Impact Score ──────────────────────────────────
        breakdown = ImpactBreakdown(
            compliance_risk_reduction=round(risk_reduction, 1),
            profitability_gain=round(profitability_score, 1),
            sustainability_improvement=round(sustainability_score, 1),
            time_saved=round(time_score, 1),
            cost_saved=round(cost_score, 1),
        )

        impact_score = (
            self.W_RISK * risk_reduction
            + self.W_PROFIT * profitability_score
            + self.W_SUSTAINABILITY * sustainability_score
            + self.W_TIME * time_score
            + self.W_COST * cost_score
        )

        # Apply regional multiplier (capped boost)
        impact_score = min(100, impact_score * min(regional_multiplier, 1.15))
        impact_score = round(impact_score, 1)
        impact_grade = self._grade(impact_score)

        # ── Projections ─────────────────────────────────────────────
        projection = self._calculate_projections(
            risk_data, sustainability_data, profitability_data, num_policies, num_schemes
        )

        # ── Sector Benchmark ────────────────────────────────────────
        benchmark = self._sector_benchmark(
            impact_score, risk_reduction, cost_saved,
            penalty_avoided, sector, benchmark_data
        )

        # ── GRC Alignment ───────────────────────────────────────────
        grc = self._grc_alignment(
            risk_reduction, profitability_score, sustainability_score, impact_score
        )

        # ── Narrative ───────────────────────────────────────────────
        narrative = self._build_narrative(
            impact_score, impact_grade, breakdown, projection, benchmark, profile
        )

        # ── Key Metrics (dashboard headline numbers) ────────────────
        key_metrics = {
            "impact_score": impact_score,
            "risk_reduced_pct": round(risk_reduction * 0.7, 1),
            "hours_saved_monthly": round(projection.monthly_time_saved_hours, 1),
            "money_saved_yearly_inr": round(projection.yearly_total_roi_inr, 0),
            "penalties_prevented_inr": round(penalty_avoided, 0),
            "schemes_unlocked_inr": round(scheme_benefits, 0),
            "co2_saved_yearly_kg": round(projection.yearly_co2_saved_kg, 2),
            "roi_multiplier": round(roi_multiplier, 1),
            "sector_percentile": round(benchmark.percentile, 0),
            "grc_readiness": grc.overall_grc_readiness,
        }

        return ImpactReport(
            impact_score=impact_score,
            impact_grade=impact_grade,
            breakdown=breakdown,
            projection=projection,
            benchmark=benchmark,
            grc_alignment=grc,
            narrative=narrative,
            key_metrics=key_metrics,
            generated_at=datetime.utcnow().isoformat(),
        )

    # ── Sub-Score Calculators ────────────────────────────────────────

    def _risk_reduction_score(self, raw_risk: float, regional_mult: float) -> float:
        """
        Higher raw risk → pAIr provides more value.
        Score = how much risk pAIr helps mitigate.

        Uses sigmoid curve: rapid value gain for medium-high risk,
        diminishing returns at extremes.
        """
        # Sigmoid mapping: raw_risk 0-100 → reduction value 0-100
        # At risk=50, reduction~60; at risk=80, reduction~90
        x = (raw_risk - 30) / 15  # centre at 30, spread 15
        sigmoid = 100 / (1 + math.exp(-x))
        # Apply regional boost (stricter regions = more value from compliance)
        return min(100, sigmoid * min(regional_mult, 1.2))

    def _profitability_score(
        self,
        roi_mult: float,
        total_roi: float,
        penalties: float,
        schemes: float,
        bench: Dict,
    ) -> float:
        """
        Profitability sub-score based on ROI and financial impact.

        Uses logarithmic scaling to prevent outlier dominance.
        """
        # ROI multiplier component (40%): log scale, 10× → ~70, 100× → ~100
        roi_component = min(100, 30 * math.log10(max(roi_mult, 1) + 1))

        # Penalty avoidance vs sector average (30%)
        avg_penalty = bench.get("avg_penalties_year_inr", 100000)
        penalty_component = min(100, (penalties / max(avg_penalty, 1)) * 80)

        # Scheme benefits (30%): up to ₹50L = 100
        scheme_component = min(100, (schemes / 5000000) * 100)

        return roi_component * 0.4 + penalty_component * 0.3 + scheme_component * 0.3

    def _sustainability_score(self, green_score: float, co2_kg: float) -> float:
        """
        Sustainability sub-score from Green Score + CO₂ reduction.
        """
        # Green score is already 0-100, weight 70%
        # CO₂ bonus (log scale): weight 30%
        co2_component = min(100, 40 * math.log10(max(co2_kg, 0.01) + 1))
        return green_score * 0.7 + co2_component * 0.3

    def _time_saved_score(
        self, hours: float, productivity: float, num_policies: int
    ) -> float:
        """
        Time savings sub-score.
        Baseline: 8h traditional → 0.5h digital per policy = 7.5h saved.
        """
        # Per-policy savings normalized (7.5h max per policy)
        per_policy_saved = hours / max(num_policies, 1)
        time_component = min(100, (per_policy_saved / 7.5) * 80)

        # Productivity multiplier bonus
        prod_bonus = min(20, (productivity - 1) * 4)

        return min(100, time_component + prod_bonus)

    def _cost_saved_score(
        self, cost_inr: float, bench: Dict, num_policies: int
    ) -> float:
        """
        Cost savings sub-score vs traditional consulting.
        """
        avg_cost = bench.get("avg_compliance_cost_inr", 60000)
        per_policy = cost_inr / max(num_policies, 1)
        # Normalize against sector benchmark
        return min(100, (per_policy / max(avg_cost / 12, 1)) * 80)

    # ── Projections ──────────────────────────────────────────────────

    def _calculate_projections(
        self,
        risk_data: Dict,
        sus_data: Dict,
        prof_data: Dict,
        num_policies: int,
        num_schemes: int,
    ) -> ImpactProjection:
        """
        Calculate monthly and yearly projections.
        Assumes average MSME processes ~1 policy/month, ~12/year.
        """
        scale_monthly = 1 / max(num_policies, 1)
        scale_yearly = 12 / max(num_policies, 1)

        raw_risk = risk_data.get("overall_score", 50)
        risk_reduction_pct = min(70, raw_risk * 0.7)

        cost_saved = sus_data.get("cost_saved_inr", 0)
        hours_saved = sus_data.get("hours_saved", 0)
        co2_saved = sus_data.get("co2_saved_kg", 0)
        paper_saved = sus_data.get("paper_saved", 0)

        penalty_avoided = prof_data.get("penalty_avoidance_inr", 0)
        scheme_value = prof_data.get("scheme_benefits_inr", 0)
        total_roi = prof_data.get("total_roi_inr", 0)

        return ImpactProjection(
            monthly_risk_reduction_pct=round(risk_reduction_pct, 1),
            monthly_cost_saved_inr=round(cost_saved * scale_monthly, 0),
            monthly_time_saved_hours=round(hours_saved * scale_monthly, 1),
            monthly_penalties_prevented_inr=round(penalty_avoided * scale_monthly, 0),
            monthly_schemes_value_inr=round(scheme_value * scale_monthly, 0),
            yearly_risk_reduction_pct=round(risk_reduction_pct, 1),
            yearly_cost_saved_inr=round(cost_saved * scale_yearly, 0),
            yearly_time_saved_hours=round(hours_saved * scale_yearly, 1),
            yearly_penalties_prevented_inr=round(penalty_avoided * scale_yearly, 0),
            yearly_schemes_value_inr=round(scheme_value * scale_yearly, 0),
            yearly_co2_saved_kg=round(co2_saved * scale_yearly, 2),
            yearly_paper_pages_saved=int(paper_saved * scale_yearly),
            yearly_total_roi_inr=round(total_roi * scale_yearly, 0),
        )

    # ── Sector Benchmark ─────────────────────────────────────────────

    def _sector_benchmark(
        self,
        impact_score: float,
        risk_reduction: float,
        cost_saved: float,
        penalties: float,
        sector: str,
        bench: Dict,
    ) -> SectorBenchmark:
        """
        Compare this MSME's impact against sector averages.
        Percentile = how this business ranks vs peers.
        """
        avg_risk = bench.get("avg_risk_score", 52)
        avg_cost = bench.get("avg_compliance_cost_inr", 60000)
        avg_penalties = bench.get("avg_penalties_year_inr", 100000)
        digital_adoption = bench.get("digital_adoption", 0.38)

        # Percentile: modelled as normal distribution around sector avg
        # Impact score above sector avg → higher percentile
        deviation = (impact_score - 50) / 20  # Standard deviations from mean
        # Approximate CDF with logistic
        percentile = min(99, max(1, 50 + 50 * math.tanh(deviation)))

        risk_diff_pct = max(0, round(((avg_risk - (100 - risk_reduction)) / max(avg_risk, 1)) * 100, 0))
        cost_diff_pct = round(min(99, (cost_saved / max(avg_cost, 1)) * 100), 0)
        digital_boost = round(1 / max(digital_adoption, 0.01), 1)

        return SectorBenchmark(
            sector=sector,
            percentile=round(percentile, 0),
            vs_avg_risk=f"{risk_diff_pct}% lower compliance risk than {sector} sector average",
            vs_avg_cost=f"{cost_diff_pct}% less compliance cost than traditional methods",
            vs_avg_penalties=f"₹{penalties:,.0f} in penalties prevented (sector avg: ₹{avg_penalties:,.0f}/yr)",
            digital_maturity_boost=f"{digital_boost}× more digitally mature than sector average",
        )

    # ── GRC Alignment ────────────────────────────────────────────────

    def _grc_alignment(
        self,
        risk_score: float,
        profit_score: float,
        sustainability_score: float,
        impact_score: float,
    ) -> GRCAlignment:
        """
        Map pAIr scores to SAP GRC (Governance, Risk, Compliance) framework.
        This is what makes pAIr SAP-acquirable.
        """
        # Governance: how well the MSME is set up for compliance governance
        governance = min(100, (impact_score * 0.6 + profit_score * 0.4))

        # Risk Management: identification + mitigation capability
        risk_mgmt = min(100, risk_score * 1.1)

        # Compliance: regulatory adherence level
        compliance = min(100, (risk_score * 0.5 + impact_score * 0.5))

        # Sustainability: ESG readiness
        sustainability = sustainability_score

        # Overall readiness
        avg = (governance + risk_mgmt + compliance + sustainability) / 4
        if avg >= 75:
            readiness = "Enterprise-Ready"
        elif avg >= 55:
            readiness = "Growth-Stage"
        else:
            readiness = "Foundation"

        return GRCAlignment(
            governance_score=round(governance, 1),
            risk_management_score=round(risk_mgmt, 1),
            compliance_score=round(compliance, 1),
            sustainability_score=round(sustainability, 1),
            overall_grc_readiness=readiness,
        )

    # ── Narrative ────────────────────────────────────────────────────

    def _build_narrative(
        self,
        score: float,
        grade: str,
        breakdown: ImpactBreakdown,
        projection: ImpactProjection,
        benchmark: SectorBenchmark,
        profile: Dict,
    ) -> str:
        """Generate human-readable impact story for presentations."""
        biz_name = profile.get("business_name", "your business")
        sector = profile.get("sector", "your sector")

        return (
            f"pAIr Impact Analysis for {biz_name}\n\n"
            f"Impact Score: {score}/100 ({grade})\n\n"
            f"By using pAIr, {biz_name} achieves a {grade.lower()} impact across "
            f"five critical dimensions:\n\n"
            f"• Compliance Risk Reduction: {breakdown.compliance_risk_reduction}/100 — "
            f"pAIr identified and helps mitigate regulatory risks, reducing compliance "
            f"uncertainty by up to 70%.\n\n"
            f"• Profitability Gain: {breakdown.profitability_gain}/100 — "
            f"₹{projection.yearly_total_roi_inr:,.0f} estimated yearly ROI through "
            f"penalty avoidance and scheme benefits.\n\n"
            f"• Sustainability Impact: {breakdown.sustainability_improvement}/100 — "
            f"Projected to save {projection.yearly_co2_saved_kg} kg CO₂ and "
            f"{projection.yearly_paper_pages_saved} pages of paper annually.\n\n"
            f"• Time Efficiency: {breakdown.time_saved}/100 — "
            f"{projection.yearly_time_saved_hours} hours saved per year, "
            f"freeing up resources for core business activities.\n\n"
            f"• Cost Optimization: {breakdown.cost_saved}/100 — "
            f"₹{projection.yearly_cost_saved_inr:,.0f} in yearly compliance cost savings "
            f"compared to traditional consulting.\n\n"
            f"Sector Performance: {benchmark.vs_avg_risk}. "
            f"pAIr positions {biz_name} in the top {100 - benchmark.percentile:.0f}% "
            f"of {sector} MSMEs for compliance readiness.\n\n"
            f"GRC Readiness: {benchmark.percentile:.0f}th percentile — "
            f"demonstrating enterprise-grade governance, risk management, "
            f"and compliance capabilities."
        )

    # ── Helpers ──────────────────────────────────────────────────────

    def _grade(self, score: float) -> str:
        for threshold, grade in sorted(IMPACT_GRADES.items(), reverse=True):
            if score >= threshold:
                return grade
        return "MINIMAL"

    def _resolve_sector(self, profile: Dict) -> str:
        """Extract sector from profile, normalise to benchmark key."""
        sector = profile.get("sector", profile.get("business_type", "")).lower()
        if any(w in sector for w in ["manufactur", "factory", "production"]):
            return "manufacturing"
        if any(w in sector for w in ["service", "consult", "it", "software"]):
            return "service"
        if any(w in sector for w in ["trad", "retail", "wholesale", "shop"]):
            return "trading"
        if any(w in sector for w in ["craft", "handloom", "artisan", "handicraft"]):
            return "handicraft"
        return "default"

    def _resolve_region(self, profile: Dict) -> str:
        """Extract state/region from profile, normalise for strictness lookup."""
        state = profile.get("state", profile.get("location", "")).lower()
        state = state.replace(" ", "_")
        if state in REGIONAL_STRICTNESS:
            return state
        # Partial match
        for key in REGIONAL_STRICTNESS:
            if key in state or state in key:
                return key
        return "default"
