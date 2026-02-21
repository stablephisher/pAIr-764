"""
pAIr v4 — Enterprise Profitability Optimizer
===============================================
Calculates financial ROI and savings from pAIr's compliance intelligence
platform vs. traditional consulting, plus estimated scheme benefits.

v4 Enhancements
---------------
- Discounted future value modelling (NPV of compliance savings)
- Sector-adjusted benefit sizing (manufacturing / service / trading)
- Multi-year ROI projections with compounding
- Break-even analysis for pAIr subscription value
- SAP GRC-aligned cost categorisation

Outputs
-------
- Compliance cost avoidance (penalty savings)
- Scheme benefit estimation (subsidies, guarantees, tax benefits)
- Time-to-money analysis
- Total ROI projection with NPV
- Multi-year financial projections
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from schemes import GOVERNMENT_SCHEMES, get_scheme_by_id, get_applicable_schemes


# ── Constants ────────────────────────────────────────────────────────────

TRADITIONAL_CA_COST_PER_HOUR = 2500       # INR / hour for a good CA
TRADITIONAL_HOURS_PER_SCHEME_APP = 10     # Hours per scheme application
TAX_BENEFIT_UDYAM_PERCENT = 0.15          # Approx tax benefit for Udyam-registered MSMEs
DEFAULT_LOAN_AMOUNT_INR = 500_000         # Default assumed loan size for benefit calc
GST_LATE_FEE_PER_DAY = 50                # INR late fee per day (GSTR-3B)
MAX_GST_LATE_FEE = 10_000                # Max cap per return

# ── v4 Constants ─────────────────────────────────────────────────────────

DISCOUNT_RATE = 0.10                      # 10% annual discount rate for NPV
GROWTH_RATE = 0.15                        # 15% YoY benefit growth assumption
PROJECTION_YEARS = 5                      # Multi-year projection horizon
PAIR_ANNUAL_SUBSCRIPTION = 12_000         # Rs 12,000 / year platform cost estimate

SECTOR_BENEFIT_MULTIPLIERS: Dict[str, float] = {
    "manufacturing": 1.30,
    "service": 1.00,
    "trading": 1.15,
    "handicraft": 1.20,
    "default": 1.00,
}


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class PenaltyAvoidance:
    """Penalties avoided through timely compliance."""
    obligation: str
    potential_penalty_inr: float
    probability_if_ignored: float    # 0.0–1.0
    expected_loss_avoided: float     # penalty × probability
    urgency: str


@dataclass
class SchemeBenefit:
    """Estimated financial benefit from a government scheme."""
    scheme_id: str
    scheme_name: str
    benefit_type: str               # subsidy / guarantee / tax_benefit / grant
    estimated_value_inr: float
    confidence: str                 # HIGH / MEDIUM / LOW
    application_effort: str         # Easy / Moderate / Complex
    notes: str


@dataclass
class CostComparison:
    """Traditional vs. pAIr cost comparison."""
    traditional_cost_inr: float     # CA/consultant fees
    pair_cost_inr: float            # Platform usage cost
    savings_inr: float
    savings_percent: float
    time_saved_hours: float


@dataclass
class YearlyProjection:
    """v4: Multi-year financial projection."""
    year: int
    gross_benefit_inr: float
    discounted_benefit_inr: float
    cumulative_npv_inr: float
    roi_multiplier: float


@dataclass
class ProfitabilityReport:
    """Complete profitability analysis."""
    total_penalty_avoidance_inr: float
    total_scheme_benefits_inr: float
    total_cost_savings_inr: float
    total_roi_inr: float
    roi_multiplier: float           # e.g., 100x ROI
    penalty_avoidances: List[PenaltyAvoidance]
    scheme_benefits: List[SchemeBenefit]
    cost_comparison: CostComparison
    yearly_projection_inr: float
    recommendations: List[str]
    # v4 fields
    sector_multiplier: float = 1.0
    npv_5yr_inr: float = 0.0
    break_even_months: int = 0
    multi_year_projections: List[YearlyProjection] = field(default_factory=list)
    generated_at: str = ""


# ── Engine ───────────────────────────────────────────────────────────────

class ProfitabilityOptimizer:
    """
    Estimates financial ROI from using pAIr for compliance + scheme discovery.

    Usage
    -----
        optimizer = ProfitabilityOptimizer()
        report = optimizer.analyze(
            analysis_result=policy_analysis_dict,
            business_profile=profile_dict,
            num_policies=3
        )
    """

    def analyze(
        self,
        analysis_result: Dict[str, Any],
        business_profile: Optional[Dict] = None,
        num_policies: int = 1,
    ) -> ProfitabilityReport:
        """
        Run full profitability analysis.

        Parameters
        ----------
        analysis_result : dict
            PolicyAnalysis-shaped dict with penalties and obligations.
        business_profile : dict, optional
            Business profile for scheme matching.
        num_policies : int
            Number of policies processed.
        """
        profile = business_profile or {}

        # 1. Penalty avoidance
        penalty_avoidances = self._calculate_penalty_avoidance(analysis_result)
        total_penalties = sum(pa.expected_loss_avoided for pa in penalty_avoidances)

        # 2. Scheme benefits
        scheme_benefits = self._estimate_scheme_benefits(profile)
        total_schemes = sum(sb.estimated_value_inr for sb in scheme_benefits)

        # 3. Cost comparison
        cost_comparison = self._cost_comparison(num_policies, len(scheme_benefits))

        # 4. v4: Sector multiplier
        sector_mult = self._get_sector_multiplier(profile)
        total_penalties_adj = total_penalties * sector_mult
        total_schemes_adj = total_schemes * sector_mult

        # 5. Aggregate
        total_roi = total_penalties_adj + total_schemes_adj + cost_comparison.savings_inr
        pair_cost = cost_comparison.pair_cost_inr or 1
        roi_multiplier = total_roi / pair_cost if pair_cost > 0 else 0

        # 6. Yearly projection (assume 12 policies/year, scale benefits)
        yearly_scale = 12 / max(num_policies, 1)
        yearly_proj = total_roi * yearly_scale

        # 7. v4: Multi-year NPV projections
        multi_year = self._multi_year_projection(yearly_proj)
        npv_5yr = multi_year[-1].cumulative_npv_inr if multi_year else 0

        # 8. v4: Break-even analysis
        break_even = self._break_even_months(yearly_proj)

        # 9. Recommendations
        recommendations = self._generate_recommendations(
            penalty_avoidances, scheme_benefits, total_roi
        )

        return ProfitabilityReport(
            total_penalty_avoidance_inr=round(total_penalties_adj, 0),
            total_scheme_benefits_inr=round(total_schemes_adj, 0),
            total_cost_savings_inr=round(cost_comparison.savings_inr, 0),
            total_roi_inr=round(total_roi, 0),
            roi_multiplier=round(roi_multiplier, 1),
            penalty_avoidances=penalty_avoidances,
            scheme_benefits=scheme_benefits,
            cost_comparison=cost_comparison,
            yearly_projection_inr=round(yearly_proj, 0),
            recommendations=recommendations,
            sector_multiplier=sector_mult,
            npv_5yr_inr=round(npv_5yr, 0),
            break_even_months=break_even,
            multi_year_projections=multi_year,
            generated_at=datetime.utcnow().isoformat(),
        )

    # ── Penalty Avoidance ────────────────────────────────────────────

    def _calculate_penalty_avoidance(
        self, analysis: Dict[str, Any]
    ) -> List[PenaltyAvoidance]:
        """Extract and quantify penalties that are avoided through timely compliance."""
        avoidances: List[PenaltyAvoidance] = []
        penalties = analysis.get("penalties", [])

        for p in penalties:
            amount = self._parse_amount(p.get("penalty_amount", ""))
            violation = p.get("violation", "Unknown violation")

            # Probability heuristic based on severity language
            consequences = p.get("other_consequences", "").lower()
            probability = self._estimate_probability(violation, consequences)

            # Urgency from obligations
            urgency = "MEDIUM"
            obligations = analysis.get("obligations", [])
            for obl in obligations:
                if any(w in obl.get("obligation", "").lower()
                       for w in violation.lower().split()[:3] if len(w) > 3):
                    sev = obl.get("severity_if_ignored", "").lower()
                    if any(w in sev for w in ["imprison", "criminal", "heavy"]):
                        urgency = "CRITICAL"
                    elif any(w in sev for w in ["suspend", "revok"]):
                        urgency = "HIGH"
                    break

            avoidances.append(PenaltyAvoidance(
                obligation=violation,
                potential_penalty_inr=amount,
                probability_if_ignored=probability,
                expected_loss_avoided=round(amount * probability, 0),
                urgency=urgency,
            ))

        # If no explicit penalties, add GST late fee estimate
        if not avoidances:
            avoidances.append(PenaltyAvoidance(
                obligation="GST Return Late Filing (estimate)",
                potential_penalty_inr=MAX_GST_LATE_FEE,
                probability_if_ignored=0.6,
                expected_loss_avoided=MAX_GST_LATE_FEE * 0.6,
                urgency="MEDIUM",
            ))

        return avoidances

    def _estimate_probability(self, violation: str, consequences: str) -> float:
        """Heuristic probability of actually facing a penalty if non-compliant."""
        text = (violation + " " + consequences).lower()
        if any(w in text for w in ["mandatory", "compulsory", "must", "required by law"]):
            return 0.85
        if any(w in text for w in ["audit", "inspection", "scrutin"]):
            return 0.70
        if any(w in text for w in ["may", "possible", "discretion"]):
            return 0.40
        return 0.55  # Default moderate probability

    # ── Scheme Benefits ──────────────────────────────────────────────

    def _estimate_scheme_benefits(self, profile: Dict) -> List[SchemeBenefit]:
        """Estimate financial benefits from applicable schemes."""
        applicable_ids = get_applicable_schemes(profile)
        benefits: List[SchemeBenefit] = []

        for sid in applicable_ids:
            scheme = get_scheme_by_id(sid)
            if not scheme:
                continue

            benefit = self._estimate_single_scheme(scheme, profile)
            if benefit:
                benefits.append(benefit)

        return benefits

    def _estimate_single_scheme(
        self, scheme: Dict, profile: Dict
    ) -> Optional[SchemeBenefit]:
        """Estimate benefit from a single scheme."""
        sid = scheme["scheme_id"]
        name = scheme["name"]

        if sid == "CGTMSE":
            loan = profile.get("loan_amount", DEFAULT_LOAN_AMOUNT_INR)
            guarantee_value = loan * 0.75  # 75% guarantee
            return SchemeBenefit(
                scheme_id=sid,
                scheme_name=name,
                benefit_type="guarantee",
                estimated_value_inr=guarantee_value,
                confidence="MEDIUM",
                application_effort="Moderate",
                notes=f"Collateral-free credit guarantee of ₹{guarantee_value:,.0f} "
                      f"on a loan of ₹{loan:,.0f}",
            )

        if sid == "PMEGP":
            location = profile.get("location_type", "urban").lower()
            category = profile.get("owner_category", "general").lower()
            is_special = any(
                w in category for w in ["sc", "st", "women", "woman", "minority"]
            )
            if "rural" in location:
                rate = 0.35 if is_special else 0.25
            else:
                rate = 0.25 if is_special else 0.15

            project_cost = profile.get("project_cost", 1_000_000)
            subsidy = project_cost * rate
            return SchemeBenefit(
                scheme_id=sid,
                scheme_name=name,
                benefit_type="subsidy",
                estimated_value_inr=subsidy,
                confidence="MEDIUM",
                application_effort="Moderate",
                notes=f"{rate*100:.0f}% subsidy = ₹{subsidy:,.0f} on project cost ₹{project_cost:,.0f}",
            )

        if sid == "MUDRA":
            # Benefit: access to collateral-free credit
            loan_tier = "Shishu"
            loan_amount = 50_000
            turnover = profile.get("annual_turnover", 0)
            if turnover > 5_00_000:
                loan_tier = "Kishore"
                loan_amount = 5_00_000
            if turnover > 50_00_000:
                loan_tier = "Tarun"
                loan_amount = 10_00_000
            return SchemeBenefit(
                scheme_id=sid,
                scheme_name=name,
                benefit_type="credit_access",
                estimated_value_inr=loan_amount,
                confidence="HIGH",
                application_effort="Easy",
                notes=f"{loan_tier} category: collateral-free loan up to ₹{loan_amount:,.0f}",
            )

        if sid == "STANDUPINDIA":
            loan = profile.get("loan_amount", 10_00_000)
            return SchemeBenefit(
                scheme_id=sid,
                scheme_name=name,
                benefit_type="credit_access",
                estimated_value_inr=loan,
                confidence="MEDIUM",
                application_effort="Moderate",
                notes=f"Bank loan of ₹{loan:,.0f} with 18-month moratorium",
            )

        if sid == "UDYAM":
            # Udyam: gateway to all MSME benefits + tax advantages
            estimated_tax_benefit = (
                profile.get("annual_turnover", 5_00_000) * TAX_BENEFIT_UDYAM_PERCENT
            )
            return SchemeBenefit(
                scheme_id=sid,
                scheme_name=name,
                benefit_type="tax_benefit",
                estimated_value_inr=estimated_tax_benefit,
                confidence="HIGH",
                application_effort="Easy",
                notes=f"Free registration. Estimated tax benefit: ₹{estimated_tax_benefit:,.0f}/year. "
                      "Gateway to all MSME schemes.",
            )

        if sid == "SFURTI":
            cluster_funding = 25_00_000  # Rs 2.5 crore for regular cluster
            per_artisan = cluster_funding / 500  # Divided among 500 artisans
            return SchemeBenefit(
                scheme_id=sid,
                scheme_name=name,
                benefit_type="grant",
                estimated_value_inr=per_artisan,
                confidence="LOW",
                application_effort="Complex",
                notes=f"Cluster-based grant: ~₹{per_artisan:,.0f} per artisan (est.)",
            )

        return None

    # ── Cost Comparison ──────────────────────────────────────────────

    def _cost_comparison(
        self, num_policies: int, num_schemes: int
    ) -> CostComparison:
        """Compare traditional compliance costs vs. pAIr platform costs."""
        total_items = num_policies + num_schemes

        # Traditional
        trad_hours = TRADITIONAL_HOURS_PER_SCHEME_APP * total_items
        trad_cost = trad_hours * TRADITIONAL_CA_COST_PER_HOUR

        # pAIr (API costs + minimal compute)
        pair_cost = total_items * 50  # ₹50 per analysis (Gemini API cost estimate)

        # Time
        digital_hours = 0.5 * total_items

        savings = trad_cost - pair_cost
        savings_pct = (savings / trad_cost * 100) if trad_cost > 0 else 0

        return CostComparison(
            traditional_cost_inr=round(trad_cost, 0),
            pair_cost_inr=round(pair_cost, 0),
            savings_inr=round(savings, 0),
            savings_percent=round(savings_pct, 1),
            time_saved_hours=round(trad_hours - digital_hours, 1),
        )

    # ── Amount Parsing ───────────────────────────────────────────────

    def _parse_amount(self, s: str) -> float:
        """Parse Indian currency strings to float."""
        if not s:
            return 0.0
        import re
        s_clean = s.lower().replace(",", "").replace("₹", "").replace("rs.", "").replace("rs", "")
        m = re.search(r"([\d.]+)\s*(crore|cr)", s_clean)
        if m:
            return float(m.group(1)) * 1_00_00_000
        m = re.search(r"([\d.]+)\s*(lakh|lac|l)", s_clean)
        if m:
            return float(m.group(1)) * 1_00_000
        m = re.search(r"([\d.]+)\s*(thousand|k)", s_clean)
        if m:
            return float(m.group(1)) * 1_000
        m = re.search(r"([\d.]+)", s_clean)
        if m:
            return float(m.group(1))
        return 0.0

    # ── Recommendations ──────────────────────────────────────────────

    def _generate_recommendations(
        self,
        avoidances: List[PenaltyAvoidance],
        benefits: List[SchemeBenefit],
        total_roi: float,
    ) -> List[str]:
        recs: List[str] = []

        # Priority penalty avoidance
        critical = [a for a in avoidances if a.urgency == "CRITICAL"]
        if critical:
            recs.append(
                f"🔴 {len(critical)} critical penalty risk(s) identified. "
                "Immediate compliance action needed to avoid losses."
            )

        # Easy scheme wins
        easy = [b for b in benefits if b.application_effort == "Easy"]
        if easy:
            names = ", ".join(b.scheme_name[:30] for b in easy)
            total_easy = sum(b.estimated_value_inr for b in easy)
            recs.append(
                f"💰 Quick wins: {names} — estimated benefit ₹{total_easy:,.0f} "
                "with minimal application effort."
            )

        # Udyam registration
        udyam = [b for b in benefits if b.scheme_id == "UDYAM"]
        if udyam:
            recs.append(
                "📋 Register for Udyam (free, 10 min) — it unlocks all MSME "
                "scheme benefits and tax advantages."
            )

        # Overall ROI
        if total_roi > 0:
            recs.append(
                f"📈 Total estimated ROI from pAIr: ₹{total_roi:,.0f}. "
                "Compliance + scheme matching provides quantifiable financial returns."
            )

        return recs

    # ── v4: Advanced Financial Methods ────────────────────────────────

    def _get_sector_multiplier(self, profile: Dict) -> float:
        """Resolve sector benefit multiplier from business profile."""
        sector = profile.get("sector", profile.get("business_type", "")).lower()
        if any(w in sector for w in ["manufactur", "factory", "production"]):
            return SECTOR_BENEFIT_MULTIPLIERS["manufacturing"]
        if any(w in sector for w in ["service", "consult", "it", "software"]):
            return SECTOR_BENEFIT_MULTIPLIERS["service"]
        if any(w in sector for w in ["trad", "retail", "wholesale"]):
            return SECTOR_BENEFIT_MULTIPLIERS["trading"]
        if any(w in sector for w in ["craft", "handloom", "artisan"]):
            return SECTOR_BENEFIT_MULTIPLIERS["handicraft"]
        return SECTOR_BENEFIT_MULTIPLIERS["default"]

    def _multi_year_projection(
        self, yearly_roi: float
    ) -> List[YearlyProjection]:
        """
        Generate multi-year NPV projections with growth and discounting.

        Year N benefit = Year1 * (1 + growth)^(N-1)
        NPV(Year N)    = benefit / (1 + discount)^N
        """
        projections: List[YearlyProjection] = []
        cumulative_npv = 0.0

        for year in range(1, PROJECTION_YEARS + 1):
            gross = yearly_roi * ((1 + GROWTH_RATE) ** (year - 1))
            npv = gross / ((1 + DISCOUNT_RATE) ** year)
            cumulative_npv += npv
            annual_cost = PAIR_ANNUAL_SUBSCRIPTION
            roi_mult = cumulative_npv / (annual_cost * year) if annual_cost > 0 else 0

            projections.append(YearlyProjection(
                year=year,
                gross_benefit_inr=round(gross, 0),
                discounted_benefit_inr=round(npv, 0),
                cumulative_npv_inr=round(cumulative_npv, 0),
                roi_multiplier=round(roi_mult, 1),
            ))

        return projections

    def _break_even_months(self, yearly_roi: float) -> int:
        """
        Calculate months until pAIr subscription pays for itself.
        Returns 0 if immediate (ROI > cost from month 1).
        """
        if yearly_roi <= 0:
            return 99  # Never breaks even
        monthly_benefit = yearly_roi / 12
        monthly_cost = PAIR_ANNUAL_SUBSCRIPTION / 12
        if monthly_benefit >= monthly_cost:
            return 1  # Pays for itself immediately
        cumulative_benefit = 0.0
        for month in range(1, 61):
            cumulative_benefit += monthly_benefit
            cumulative_cost = monthly_cost * month
            if cumulative_benefit >= cumulative_cost:
                return month
        return 60
