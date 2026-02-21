"""
pAIr v4 — Sector Compliance Benchmarking
==========================================
Provides comparative compliance analytics so MSMEs can see how they
rank against peers in their sector, state, and size bracket.

Architecture
------------
    UserScores  ─┐
                  ├── BenchmarkEngine → PercentileRank → BenchmarkReport
    SectorData  ─┘

Benchmark Dimensions
--------------------
1. Compliance Score (vs sector peers)
2. Risk Level (vs sector average)
3. Scheme Utilisation (how many schemes utilised vs available)
4. Penalty Exposure (vs sector median)
5. Sustainability Score (vs sector leaders)

Data Sources (v4 — Synthetic Calibrated)
----------------------------------------
National MSME survey data calibrated sector benchmarks.
In v5, these will come from anonymised aggregate user data.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


# ── Enums ────────────────────────────────────────────────────────────────

class BenchmarkTier(str, Enum):
    TOP_10 = "TOP_10"          # 90th+ percentile
    ABOVE_AVERAGE = "ABOVE_AVERAGE"  # 60th-89th
    AVERAGE = "AVERAGE"        # 40th-59th
    BELOW_AVERAGE = "BELOW_AVERAGE"  # 20th-39th
    BOTTOM_20 = "BOTTOM_20"    # Below 20th

class BenchmarkDimension(str, Enum):
    COMPLIANCE = "COMPLIANCE"
    RISK = "RISK"
    SCHEME_UTILISATION = "SCHEME_UTILISATION"
    PENALTY_EXPOSURE = "PENALTY_EXPOSURE"
    SUSTAINABILITY = "SUSTAINABILITY"


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class DimensionBenchmark:
    """Benchmark result for a single dimension."""
    dimension: BenchmarkDimension
    user_score: float
    sector_average: float
    sector_median: float
    sector_top_10: float     # 90th percentile value
    percentile_rank: float   # 0–100
    tier: BenchmarkTier
    gap_to_average: float    # Positive = above average
    improvement_opportunity: str


@dataclass
class PeerComparison:
    """How the MSME compares to similar-sized peers."""
    peer_group: str          # e.g., "Micro Manufacturing — Maharashtra"
    peer_count: int          # Simulated peer count
    user_overall_score: float
    peer_average_score: float
    user_rank: int           # Rank within peer group
    strengths: List[str]
    weaknesses: List[str]


@dataclass
class BenchmarkReport:
    """Complete sector benchmarking report."""
    business_name: str
    sector: str
    state: str
    size_category: str       # Micro / Small / Medium
    dimensions: List[DimensionBenchmark]
    peer_comparison: PeerComparison
    overall_percentile: float
    overall_tier: BenchmarkTier
    recommendations: List[str]
    generated_at: str


# ── Sector Benchmark Data (Calibrated Synthetic) ────────────────────────

# Sector-level statistics: (mean, median, p10, p90, stdev)
# Based on typical Indian MSME compliance patterns
SECTOR_BENCHMARKS: Dict[str, Dict[str, Tuple[float, float, float, float, float]]] = {
    "manufacturing": {
        "compliance":        (52.0, 50.0, 25.0, 82.0, 18.0),
        "risk":              (58.0, 55.0, 30.0, 85.0, 17.0),
        "scheme_utilisation": (28.0, 22.0, 5.0, 65.0, 20.0),
        "penalty_exposure":  (45.0, 42.0, 15.0, 80.0, 19.0),
        "sustainability":    (38.0, 35.0, 10.0, 72.0, 20.0),
    },
    "service": {
        "compliance":        (58.0, 57.0, 30.0, 85.0, 16.0),
        "risk":              (48.0, 45.0, 20.0, 78.0, 18.0),
        "scheme_utilisation": (32.0, 28.0, 8.0, 70.0, 19.0),
        "penalty_exposure":  (38.0, 35.0, 10.0, 72.0, 18.0),
        "sustainability":    (42.0, 40.0, 15.0, 75.0, 18.0),
    },
    "trading": {
        "compliance":        (48.0, 45.0, 20.0, 78.0, 17.0),
        "risk":              (50.0, 48.0, 22.0, 80.0, 18.0),
        "scheme_utilisation": (25.0, 20.0, 3.0, 60.0, 18.0),
        "penalty_exposure":  (42.0, 40.0, 12.0, 75.0, 19.0),
        "sustainability":    (30.0, 28.0, 8.0, 65.0, 18.0),
    },
    "handicraft": {
        "compliance":        (40.0, 38.0, 15.0, 70.0, 17.0),
        "risk":              (42.0, 40.0, 18.0, 72.0, 17.0),
        "scheme_utilisation": (35.0, 30.0, 8.0, 72.0, 20.0),
        "penalty_exposure":  (35.0, 32.0, 8.0, 68.0, 18.0),
        "sustainability":    (50.0, 48.0, 20.0, 82.0, 19.0),
    },
}

# Default for unknown sectors
DEFAULT_BENCHMARK: Dict[str, Tuple[float, float, float, float, float]] = {
    "compliance":        (50.0, 48.0, 22.0, 80.0, 17.0),
    "risk":              (50.0, 48.0, 22.0, 80.0, 17.0),
    "scheme_utilisation": (30.0, 25.0, 5.0, 65.0, 19.0),
    "penalty_exposure":  (40.0, 38.0, 12.0, 75.0, 18.0),
    "sustainability":    (40.0, 38.0, 12.0, 72.0, 18.0),
}

# Size-category adjustments (Micro may have lower compliance infrastructure)
SIZE_ADJUSTMENTS: Dict[str, float] = {
    "micro": -5.0,    # Lower baseline expected
    "small": 0.0,     # Average
    "medium": 5.0,    # Higher infrastructure expected
}


# ── Benchmarking Engine ─────────────────────────────────────────────────

class SectorBenchmarkEngine:
    """
    Compares an MSME's compliance metrics against sector peers.

    Usage
    -----
        engine = SectorBenchmarkEngine()
        report = engine.benchmark(
            user_scores={
                "compliance": 65,
                "risk": 45,
                "scheme_utilisation": 40,
                "penalty_exposure": 30,
                "sustainability": 55,
            },
            business_profile={
                "business_name": "Rajan Manufacturing",
                "sector": "manufacturing",
                "state": "Maharashtra",
                "size": "small",
                "annual_turnover": 5000000,
            },
        )
    """

    def benchmark(
        self,
        user_scores: Dict[str, float],
        business_profile: Dict[str, Any],
    ) -> BenchmarkReport:
        """
        Generate a comprehensive sector benchmarking report.

        Parameters
        ----------
        user_scores : dict
            User's scores for each dimension (0–100 scale).
            Keys: compliance, risk, scheme_utilisation, penalty_exposure, sustainability
        business_profile : dict
            Business profile with sector, state, size, etc.
        """
        sector = self._resolve_sector(business_profile)
        state = business_profile.get("state", "Unknown")
        size = self._resolve_size(business_profile)
        name = business_profile.get("business_name", "Your Business")

        # Get sector benchmarks
        benchmarks = SECTOR_BENCHMARKS.get(sector, DEFAULT_BENCHMARK)
        size_adj = SIZE_ADJUSTMENTS.get(size, 0.0)

        # Compute dimension-level benchmarks
        dimensions: List[DimensionBenchmark] = []
        dim_map = {
            "compliance": BenchmarkDimension.COMPLIANCE,
            "risk": BenchmarkDimension.RISK,
            "scheme_utilisation": BenchmarkDimension.SCHEME_UTILISATION,
            "penalty_exposure": BenchmarkDimension.PENALTY_EXPOSURE,
            "sustainability": BenchmarkDimension.SUSTAINABILITY,
        }

        for key, dimension in dim_map.items():
            user_val = user_scores.get(key, 50.0)
            mean, median, p10, p90, stdev = benchmarks.get(
                key, (50, 48, 20, 80, 17)
            )

            # Adjust for size
            adj_mean = mean + size_adj
            adj_median = median + size_adj

            # Compute percentile (approximate using normal distribution)
            percentile = self._approximate_percentile(user_val, adj_mean, stdev)
            tier = self._percentile_to_tier(percentile)
            gap = user_val - adj_mean

            # For risk and penalty_exposure, LOWER is better
            if dimension in (BenchmarkDimension.RISK, BenchmarkDimension.PENALTY_EXPOSURE):
                percentile = 100 - percentile
                tier = self._percentile_to_tier(percentile)
                gap = adj_mean - user_val  # Positive gap = better (lower risk)

            improvement = self._improvement_hint(dimension, tier, gap)

            dimensions.append(DimensionBenchmark(
                dimension=dimension,
                user_score=round(user_val, 1),
                sector_average=round(adj_mean, 1),
                sector_median=round(adj_median, 1),
                sector_top_10=round(p90, 1),
                percentile_rank=round(percentile, 1),
                tier=tier,
                gap_to_average=round(gap, 1),
                improvement_opportunity=improvement,
            ))

        # Peer comparison
        peer_comparison = self._build_peer_comparison(
            dimensions, sector, state, size, user_scores
        )

        # Overall score
        overall_pct = sum(d.percentile_rank for d in dimensions) / max(len(dimensions), 1)
        overall_tier = self._percentile_to_tier(overall_pct)

        # Recommendations
        recommendations = self._generate_recommendations(dimensions, sector)

        return BenchmarkReport(
            business_name=name,
            sector=sector,
            state=state,
            size_category=size.title(),
            dimensions=dimensions,
            peer_comparison=peer_comparison,
            overall_percentile=round(overall_pct, 1),
            overall_tier=overall_tier,
            recommendations=recommendations,
            generated_at=datetime.utcnow().isoformat(),
        )

    # ── Sector Resolution ────────────────────────────────────────────

    def _resolve_sector(self, profile: Dict) -> str:
        """Resolve sector from business profile."""
        sector = profile.get("sector", profile.get("business_type", "")).lower()
        if any(w in sector for w in ["manufactur", "factory", "production"]):
            return "manufacturing"
        if any(w in sector for w in ["service", "consult", "it", "software"]):
            return "service"
        if any(w in sector for w in ["trad", "retail", "wholesale"]):
            return "trading"
        if any(w in sector for w in ["craft", "handloom", "artisan"]):
            return "handicraft"
        return "service"  # Default

    def _resolve_size(self, profile: Dict) -> str:
        """Resolve MSME size category."""
        size = profile.get("size", profile.get("msme_category", "")).lower()
        if "micro" in size:
            return "micro"
        if "medium" in size:
            return "medium"
        # Use turnover as fallback
        turnover = profile.get("annual_turnover", 0)
        if turnover < 50_00_000:  # < 50 lakh
            return "micro"
        if turnover < 5_00_00_000:  # < 5 crore
            return "small"
        return "medium"

    # ── Statistical Helpers ──────────────────────────────────────────

    @staticmethod
    def _approximate_percentile(value: float, mean: float, stdev: float) -> float:
        """
        Approximate percentile using normal CDF approximation.
        Uses logistic approximation: CDF(z) ≈ 1 / (1 + e^(-1.7 * z))
        """
        if stdev <= 0:
            return 50.0
        z = (value - mean) / stdev
        # Logistic approximation of normal CDF
        import math
        try:
            percentile = 100.0 / (1.0 + math.exp(-1.7 * z))
        except OverflowError:
            percentile = 100.0 if z > 0 else 0.0
        return max(1.0, min(99.0, percentile))

    @staticmethod
    def _percentile_to_tier(percentile: float) -> BenchmarkTier:
        if percentile >= 90:
            return BenchmarkTier.TOP_10
        if percentile >= 60:
            return BenchmarkTier.ABOVE_AVERAGE
        if percentile >= 40:
            return BenchmarkTier.AVERAGE
        if percentile >= 20:
            return BenchmarkTier.BELOW_AVERAGE
        return BenchmarkTier.BOTTOM_20

    # ── Peer Comparison ──────────────────────────────────────────────

    def _build_peer_comparison(
        self,
        dimensions: List[DimensionBenchmark],
        sector: str,
        state: str,
        size: str,
        user_scores: Dict[str, float],
    ) -> PeerComparison:
        """Build peer comparison analysis."""
        peer_group = f"{size.title()} {sector.title()} — {state.title()}"

        # Simulated peer count (based on MSME registry estimates)
        peer_counts = {"micro": 45000, "small": 12000, "medium": 3000}
        base_count = peer_counts.get(size, 10000)
        # Reduce by state population factor
        state_factor = {"maharashtra": 0.15, "tamil_nadu": 0.12, "karnataka": 0.10,
                        "gujarat": 0.10, "delhi": 0.08, "uttar_pradesh": 0.12}
        factor = state_factor.get(state.lower().replace(" ", "_"), 0.05)
        peer_count = int(base_count * factor)

        # Overall user score (weighted average of dimension percentiles)
        user_overall = sum(d.percentile_rank for d in dimensions) / max(len(dimensions), 1)
        peer_avg = 50.0  # By definition, average peer is at 50th percentile

        # Approximate rank
        user_rank = max(1, int(peer_count * (100 - user_overall) / 100))

        # Identify strengths and weaknesses
        sorted_dims = sorted(dimensions, key=lambda d: d.percentile_rank, reverse=True)
        strengths = [
            f"{d.dimension.value}: {d.percentile_rank:.0f}th percentile ({d.tier.value})"
            for d in sorted_dims if d.percentile_rank >= 60
        ][:3]
        weaknesses = [
            f"{d.dimension.value}: {d.percentile_rank:.0f}th percentile — {d.improvement_opportunity}"
            for d in sorted_dims if d.percentile_rank < 40
        ][:3]

        return PeerComparison(
            peer_group=peer_group,
            peer_count=peer_count,
            user_overall_score=round(user_overall, 1),
            peer_average_score=peer_avg,
            user_rank=user_rank,
            strengths=strengths or ["No standout strengths yet — keep improving!"],
            weaknesses=weaknesses or ["No critical weaknesses identified."],
        )

    # ── Improvement Hints ────────────────────────────────────────────

    @staticmethod
    def _improvement_hint(
        dimension: BenchmarkDimension,
        tier: BenchmarkTier,
        gap: float,
    ) -> str:
        """Generate a specific improvement suggestion."""
        if tier in (BenchmarkTier.TOP_10, BenchmarkTier.ABOVE_AVERAGE):
            return "Maintain current performance. You're ahead of most peers."

        hints = {
            BenchmarkDimension.COMPLIANCE: (
                "Focus on timely filings and document management. "
                "Use pAIr's automated reminders to close the gap."
            ),
            BenchmarkDimension.RISK: (
                "Reduce risk exposure by addressing critical obligations first. "
                "Target overdue items to improve quickly."
            ),
            BenchmarkDimension.SCHEME_UTILISATION: (
                "You're leaving benefits on the table. Review pAIr's scheme "
                "recommendations and apply for at least 2 applicable schemes."
            ),
            BenchmarkDimension.PENALTY_EXPOSURE: (
                "Your penalty risk is higher than average. Prioritize compliance "
                "for obligations with the highest penalty amounts."
            ),
            BenchmarkDimension.SUSTAINABILITY: (
                "Adopt digital-first processes and track paper/energy usage. "
                "Small operational changes can boost your sustainability score significantly."
            ),
        }
        return hints.get(dimension, "Review pAIr recommendations for improvement steps.")

    # ── Recommendations ──────────────────────────────────────────────

    def _generate_recommendations(
        self,
        dimensions: List[DimensionBenchmark],
        sector: str,
    ) -> List[str]:
        """Generate actionable benchmarking recommendations."""
        recs = []

        # Find weakest dimension
        weakest = min(dimensions, key=lambda d: d.percentile_rank)
        strongest = max(dimensions, key=lambda d: d.percentile_rank)

        recs.append(
            f"Strongest area: {strongest.dimension.value} "
            f"({strongest.percentile_rank:.0f}th percentile). "
            f"Keep up the good work!"
        )

        if weakest.percentile_rank < 40:
            recs.append(
                f"Priority improvement: {weakest.dimension.value} "
                f"({weakest.percentile_rank:.0f}th percentile). "
                f"{weakest.improvement_opportunity}"
            )

        # Scheme utilisation check
        scheme_dim = next(
            (d for d in dimensions if d.dimension == BenchmarkDimension.SCHEME_UTILISATION),
            None,
        )
        if scheme_dim and scheme_dim.percentile_rank < 50:
            recs.append(
                "Many MSMEs in your sector are benefiting more from government schemes. "
                "Check pAIr's scheme matching for easy-to-apply opportunities."
            )

        # Sector-specific advice
        sector_tips = {
            "manufacturing": (
                "Manufacturing MSMEs benefit significantly from environmental "
                "compliance and factory safety certifications. These also boost "
                "your sustainability and compliance scores."
            ),
            "trading": (
                "Trading businesses often miss GST-related scheme benefits. "
                "Ensure your Udyam registration is current for maximum advantages."
            ),
            "handicraft": (
                "Handicraft businesses have strong government support. Explore "
                "SFURTI and GI Tag benefits to improve both income and benchmarks."
            ),
        }
        if sector in sector_tips:
            recs.append(sector_tips[sector])

        return recs
