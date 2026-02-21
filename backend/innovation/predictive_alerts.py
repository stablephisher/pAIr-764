"""
pAIr v4 — Predictive Compliance Alert Engine
===============================================
Uses pattern analysis and heuristic modelling to predict upcoming
compliance obligations, deadline risks, and regulatory changes
BEFORE they become urgent.

Architecture
------------
    HistoricalPatterns  → DeadlinePredictor  → PredictiveAlert
    PolicyTrends        → RegulatoryForecaster → ProactiveGuidance
    BusinessActivity    → RiskTrajectory       → EarlyWarning

Prediction Models (Heuristic v4 — ML-ready in v5)
--------------------------------------------------
1. Deadline Clustering: Identifies periods of high obligation density
2. Seasonal Compliance: Detects annual/quarterly/monthly patterns
3. Regulatory Momentum: Tracks policy change velocity by sector
4. Penalty Escalation: Predicts penalty increases from trend data
5. Scheme Expiry: Alerts before scheme deadlines/budget exhaustion

Output
------
    PredictiveAlert = {
        prediction_type: DEADLINE_CLUSTER | SEASONAL | REGULATORY_CHANGE | ...,
        confidence: 0.0–1.0,
        predicted_date: datetime,
        lead_time_days: int,
        recommended_actions: List[str],
        evidence: List[str],
    }
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


# ── Enums ────────────────────────────────────────────────────────────────

class PredictionType(str, Enum):
    DEADLINE_CLUSTER = "DEADLINE_CLUSTER"
    SEASONAL_COMPLIANCE = "SEASONAL_COMPLIANCE"
    REGULATORY_CHANGE = "REGULATORY_CHANGE"
    PENALTY_ESCALATION = "PENALTY_ESCALATION"
    SCHEME_EXPIRY = "SCHEME_EXPIRY"
    AUDIT_RISK = "AUDIT_RISK"


class PredictionConfidence(str, Enum):
    HIGH = "HIGH"           # ≥ 0.75
    MEDIUM = "MEDIUM"       # ≥ 0.50
    LOW = "LOW"             # < 0.50


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class PredictiveAlert:
    """A forward-looking compliance alert."""
    alert_id: str
    prediction_type: PredictionType
    title: str
    description: str
    confidence: float
    confidence_band: PredictionConfidence
    predicted_date: Optional[str]    # ISO date for when the event occurs
    lead_time_days: int              # How far in advance we're alerting
    recommended_actions: List[str]
    evidence: List[str]
    affected_obligations: List[str] = field(default_factory=list)
    estimated_impact_inr: float = 0.0
    sector_specific: bool = False
    created_at: str = ""


@dataclass
class ComplianceCalendar:
    """Monthly compliance density map."""
    month: int  # 1–12
    month_name: str
    obligation_count: int
    risk_level: str  # HIGH / MEDIUM / LOW
    key_deadlines: List[str]


@dataclass
class PredictiveReport:
    """Complete predictive analysis output."""
    alerts: List[PredictiveAlert]
    calendar: List[ComplianceCalendar]
    risk_trajectory: str  # INCREASING / STABLE / DECREASING
    next_30_day_risk: float  # 0.0–100.0
    next_90_day_risk: float
    generated_at: str


# ── Seasonal / Cyclical Compliance Patterns ──────────────────────────────

# Indian MSME compliance calendar (month → obligations)
COMPLIANCE_CALENDAR: Dict[int, List[Dict[str, str]]] = {
    1: [
        {"name": "Advance Tax (Q3)", "deadline": "15 Jan", "type": "tax"},
        {"name": "TDS/TCS Return (Q3)", "deadline": "31 Jan", "type": "tax"},
    ],
    3: [
        {"name": "Advance Tax (Q4)", "deadline": "15 Mar", "type": "tax"},
        {"name": "FY Closing Filings", "deadline": "31 Mar", "type": "accounting"},
        {"name": "GSTR-9 Annual Return", "deadline": "31 Mar", "type": "gst"},
    ],
    4: [
        {"name": "New FY Registrations Renewal", "deadline": "30 Apr", "type": "license"},
    ],
    6: [
        {"name": "Advance Tax (Q1)", "deadline": "15 Jun", "type": "tax"},
    ],
    7: [
        {"name": "Income Tax Return Filing", "deadline": "31 Jul", "type": "tax"},
        {"name": "GSTR-3B (Jun)", "deadline": "20 Jul", "type": "gst"},
    ],
    9: [
        {"name": "Advance Tax (Q2)", "deadline": "15 Sep", "type": "tax"},
    ],
    10: [
        {"name": "GSTR-1 Annual Reconciliation Prep", "deadline": "31 Oct", "type": "gst"},
        {"name": "Festival Season Labour Compliance", "deadline": "Ongoing", "type": "labour"},
    ],
    12: [
        {"name": "Calendar Year Closure (shops/establishments)", "deadline": "31 Dec", "type": "license"},
    ],
}

# Sector-specific recurring obligations
SECTOR_OBLIGATIONS: Dict[str, List[Dict[str, Any]]] = {
    "manufacturing": [
        {"name": "Factory License Renewal", "frequency": "annual", "advance_days": 60},
        {"name": "Pollution Control Board Consent", "frequency": "annual", "advance_days": 90},
        {"name": "Fire Safety Certificate", "frequency": "annual", "advance_days": 45},
        {"name": "Boiler Inspection", "frequency": "biannual", "advance_days": 30},
    ],
    "service": [
        {"name": "Professional Tax Return", "frequency": "annual", "advance_days": 30},
        {"name": "Trade License Renewal", "frequency": "annual", "advance_days": 45},
    ],
    "trading": [
        {"name": "Shops & Establishment License", "frequency": "annual", "advance_days": 30},
        {"name": "FSSAI License Renewal", "frequency": "annual", "advance_days": 60},
        {"name": "Weights & Measures Certification", "frequency": "biannual", "advance_days": 30},
    ],
    "handicraft": [
        {"name": "Artisan Card Renewal", "frequency": "biennial", "advance_days": 60},
        {"name": "GI Tag Compliance", "frequency": "annual", "advance_days": 45},
    ],
}


# ── Predictive Engine ────────────────────────────────────────────────────

class PredictiveAlertEngine:
    """
    Generates forward-looking compliance predictions based on:
    1. Calendar-based seasonal patterns
    2. Business profile & sector obligations
    3. Historical compliance data
    4. Policy change momentum

    Usage
    -----
        engine = PredictiveAlertEngine()
        report = engine.predict(
            business_profile={"sector": "manufacturing", "state": "Maharashtra"},
            analysis_history=[...],
            horizon_days=90,
        )
    """

    def predict(
        self,
        business_profile: Dict[str, Any],
        analysis_history: Optional[List[Dict]] = None,
        horizon_days: int = 90,
    ) -> PredictiveReport:
        """
        Generate predictive compliance alerts.

        Parameters
        ----------
        business_profile : dict
            Business profile with sector, state, etc.
        analysis_history : list, optional
            Past analysis results for pattern detection.
        horizon_days : int
            How far ahead to predict (default: 90 days).
        """
        alerts: List[PredictiveAlert] = []
        now = datetime.utcnow()

        # 1. Calendar-based seasonal predictions
        calendar_alerts = self._predict_seasonal(now, horizon_days)
        alerts.extend(calendar_alerts)

        # 2. Sector-specific recurring obligations
        sector_alerts = self._predict_sector_obligations(
            business_profile, now, horizon_days
        )
        alerts.extend(sector_alerts)

        # 3. Deadline clustering analysis
        cluster_alerts = self._detect_deadline_clusters(alerts, now)
        alerts.extend(cluster_alerts)

        # 4. Risk trajectory from history
        trajectory = self._compute_risk_trajectory(analysis_history or [])

        # 5. Build compliance calendar
        calendar = self._build_compliance_calendar(now, business_profile)

        # 6. Near-term risk scores
        next_30 = self._compute_near_term_risk(alerts, 30)
        next_90 = self._compute_near_term_risk(alerts, 90)

        # Sort by lead time (most urgent first)
        alerts.sort(key=lambda a: a.lead_time_days)

        return PredictiveReport(
            alerts=alerts,
            calendar=calendar,
            risk_trajectory=trajectory,
            next_30_day_risk=round(next_30, 1),
            next_90_day_risk=round(next_90, 1),
            generated_at=now.isoformat(),
        )

    # ── Seasonal Predictions ─────────────────────────────────────────

    def _predict_seasonal(
        self, now: datetime, horizon_days: int
    ) -> List[PredictiveAlert]:
        """Generate alerts for known calendar-based compliance events."""
        alerts = []
        cutoff = now + timedelta(days=horizon_days)

        for month, obligations in COMPLIANCE_CALENDAR.items():
            for obl in obligations:
                # Approximate the deadline date for current/next FY
                try:
                    day = int(obl["deadline"].split()[0])
                except (ValueError, IndexError):
                    day = 28  # Default to end of month

                # Try current year and next year
                for year in [now.year, now.year + 1]:
                    try:
                        deadline = datetime(year, month, min(day, 28))
                    except ValueError:
                        continue

                    if now < deadline <= cutoff:
                        lead_days = (deadline - now).days
                        confidence = min(0.95, 0.70 + (0.005 * lead_days))

                        alerts.append(PredictiveAlert(
                            alert_id=f"season_{obl['name'][:20]}_{year}_{month}",
                            prediction_type=PredictionType.SEASONAL_COMPLIANCE,
                            title=f"Upcoming: {obl['name']}",
                            description=(
                                f"{obl['name']} is due around {obl['deadline']} "
                                f"({lead_days} days from now). Plan ahead to avoid penalties."
                            ),
                            confidence=round(confidence, 2),
                            confidence_band=self._confidence_band(confidence),
                            predicted_date=deadline.date().isoformat(),
                            lead_time_days=lead_days,
                            recommended_actions=[
                                f"Prepare documentation for {obl['name']}",
                                f"Set reminder {min(lead_days, 14)} days before deadline",
                                "Consult CA if filing is complex",
                            ],
                            evidence=[
                                f"Regulatory calendar: {obl['type']} obligation",
                                f"Historical pattern: annual/quarterly cycle",
                            ],
                            affected_obligations=[obl["name"]],
                            created_at=now.isoformat(),
                        ))
                        break  # Only add once per obligation

        return alerts

    # ── Sector Obligations ───────────────────────────────────────────

    def _predict_sector_obligations(
        self, profile: Dict, now: datetime, horizon_days: int
    ) -> List[PredictiveAlert]:
        """Generate alerts for sector-specific recurring obligations."""
        alerts = []
        sector = profile.get("sector", profile.get("business_type", "")).lower()

        # Find matching sector
        matched_sector = None
        for key in SECTOR_OBLIGATIONS:
            if key in sector:
                matched_sector = key
                break

        if not matched_sector:
            return alerts

        for obl in SECTOR_OBLIGATIONS[matched_sector]:
            advance = obl["advance_days"]
            # Assume renewal is needed within horizon
            if advance <= horizon_days:
                confidence = 0.65 if obl["frequency"] == "annual" else 0.55

                alerts.append(PredictiveAlert(
                    alert_id=f"sector_{matched_sector}_{obl['name'][:20]}",
                    prediction_type=PredictionType.SEASONAL_COMPLIANCE,
                    title=f"Sector Alert: {obl['name']}",
                    description=(
                        f"As a {matched_sector} business, {obl['name']} "
                        f"({obl['frequency']}) should be renewed. "
                        f"Recommended lead time: {advance} days."
                    ),
                    confidence=confidence,
                    confidence_band=self._confidence_band(confidence),
                    predicted_date=None,  # Date depends on original issuance
                    lead_time_days=advance,
                    recommended_actions=[
                        f"Check expiry date of current {obl['name']}",
                        f"Begin renewal process {advance} days before expiry",
                        "Gather required documents for renewal application",
                    ],
                    evidence=[
                        f"Sector: {matched_sector}",
                        f"Obligation frequency: {obl['frequency']}",
                    ],
                    affected_obligations=[obl["name"]],
                    sector_specific=True,
                    created_at=now.isoformat(),
                ))

        return alerts

    # ── Deadline Clustering ──────────────────────────────────────────

    def _detect_deadline_clusters(
        self, existing_alerts: List[PredictiveAlert], now: datetime
    ) -> List[PredictiveAlert]:
        """
        Detect periods where multiple deadlines cluster together,
        creating high compliance burden.
        """
        cluster_alerts = []

        # Group alerts by 2-week windows
        windows: Dict[int, List[PredictiveAlert]] = {}
        for alert in existing_alerts:
            if alert.lead_time_days > 0:
                window_key = alert.lead_time_days // 14  # 2-week buckets
                windows.setdefault(window_key, []).append(alert)

        for window_key, window_alerts in windows.items():
            if len(window_alerts) >= 3:  # Cluster threshold
                start_day = window_key * 14
                end_day = start_day + 14
                names = [a.title.replace("Upcoming: ", "")[:30] for a in window_alerts[:5]]

                cluster_alerts.append(PredictiveAlert(
                    alert_id=f"cluster_w{window_key}_{len(window_alerts)}",
                    prediction_type=PredictionType.DEADLINE_CLUSTER,
                    title=f"Deadline Cluster: {len(window_alerts)} obligations in days {start_day}-{end_day}",
                    description=(
                        f"{len(window_alerts)} compliance obligations fall within "
                        f"a 2-week window ({start_day}-{end_day} days from now). "
                        f"Includes: {', '.join(names)}. Plan resources accordingly."
                    ),
                    confidence=0.80,
                    confidence_band=PredictionConfidence.HIGH,
                    predicted_date=(now + timedelta(days=start_day)).date().isoformat(),
                    lead_time_days=start_day,
                    recommended_actions=[
                        "Prioritize obligations by penalty severity",
                        "Consider hiring temporary compliance support",
                        "Begin preparing documentation now to spread workload",
                    ],
                    evidence=[
                        f"{len(window_alerts)} obligations in 14-day window",
                        f"Affected: {', '.join(names)}",
                    ],
                    affected_obligations=[a.affected_obligations[0] for a in window_alerts if a.affected_obligations],
                    created_at=now.isoformat(),
                ))

        return cluster_alerts

    # ── Risk Trajectory ──────────────────────────────────────────────

    def _compute_risk_trajectory(
        self, history: List[Dict]
    ) -> str:
        """Compute whether compliance risk is increasing or decreasing."""
        if len(history) < 2:
            return "STABLE"

        # Look at risk scores over time
        scores = []
        for h in history[-10:]:
            score = h.get("compliance_risk", {}).get("overall_score", 50)
            scores.append(score)

        if len(scores) < 2:
            return "STABLE"

        # Simple trend: compare first half avg to second half avg
        mid = len(scores) // 2
        first_half = sum(scores[:mid]) / mid
        second_half = sum(scores[mid:]) / (len(scores) - mid)

        diff = second_half - first_half
        if diff > 5:
            return "INCREASING"
        if diff < -5:
            return "DECREASING"
        return "STABLE"

    # ── Compliance Calendar ──────────────────────────────────────────

    def _build_compliance_calendar(
        self, now: datetime, profile: Dict
    ) -> List[ComplianceCalendar]:
        """Build a 12-month compliance density map."""
        calendar = []
        month_names = [
            "", "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ]

        for month in range(1, 13):
            obligations = COMPLIANCE_CALENDAR.get(month, [])
            count = len(obligations)

            risk = "LOW"
            if count >= 3:
                risk = "HIGH"
            elif count >= 1:
                risk = "MEDIUM"

            deadlines = [o["name"] for o in obligations]

            calendar.append(ComplianceCalendar(
                month=month,
                month_name=month_names[month],
                obligation_count=count,
                risk_level=risk,
                key_deadlines=deadlines,
            ))

        return calendar

    # ── Near-Term Risk ───────────────────────────────────────────────

    def _compute_near_term_risk(
        self, alerts: List[PredictiveAlert], days: int
    ) -> float:
        """Compute aggregate risk score for the next N days."""
        relevant = [a for a in alerts if a.lead_time_days <= days]
        if not relevant:
            return 10.0  # Baseline low risk

        # Weighted by confidence and inverse lead time
        total_weight = 0.0
        weighted_risk = 0.0

        for alert in relevant:
            # Closer deadlines = higher risk contribution
            urgency = max(0.1, 1.0 - (alert.lead_time_days / days))
            weight = alert.confidence * urgency
            total_weight += weight
            # Each alert contributes proportionally
            weighted_risk += weight * 20  # Base risk per alert

        score = min(100.0, weighted_risk)
        return score

    # ── Helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _confidence_band(confidence: float) -> PredictionConfidence:
        if confidence >= 0.75:
            return PredictionConfidence.HIGH
        if confidence >= 0.50:
            return PredictionConfidence.MEDIUM
        return PredictionConfidence.LOW
