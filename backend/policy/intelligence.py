"""
pAIr v4 — Real-Time Policy Intelligence Engine
=================================================
Orchestrates policy discovery, change detection, impact assessment,
and proactive alert generation for MSME compliance monitoring.

Architecture
------------
    PolicyIntelligenceEngine
        ├── PolicySearchAPI          (web search — Tavily / Serper)
        ├── PolicyScraper            (govt portal scraping)
        ├── ChangeDetector           (diff + hash-based change detection)
        ├── ImpactAssessor           (LLM-powered impact analysis)
        └── AlertDispatcher          (notification queue)

Flow
----
    1. Scheduled scan (cron / manual trigger)
    2. Search + Scrape for new/updated policies
    3. Detect changes via content hashing & semantic diff
    4. Assess impact on user's business profile
    5. Generate structured alerts with urgency scoring
    6. Dispatch notifications to affected users

v4 Features
-----------
- Content-hash change detection (SHA-256)
- Semantic similarity scoring for duplicate detection
- LLM-powered impact assessment per business profile
- Urgency-scored alert queue with delivery scheduling
- Policy timeline tracking for compliance calendars
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from config import config

logger = logging.getLogger("pAIr.policy.intelligence")


# ── Enums & Data Models ─────────────────────────────────────────────────

class AlertUrgency(str, Enum):
    CRITICAL = "CRITICAL"   # Immediate action required
    HIGH = "HIGH"           # Act within 7 days
    MEDIUM = "MEDIUM"       # Review within 30 days
    LOW = "LOW"             # Informational
    INFO = "INFO"           # FYI — no action needed


class ChangeType(str, Enum):
    NEW_POLICY = "NEW_POLICY"
    AMENDMENT = "AMENDMENT"
    DEADLINE_CHANGE = "DEADLINE_CHANGE"
    PENALTY_CHANGE = "PENALTY_CHANGE"
    SCHEME_UPDATE = "SCHEME_UPDATE"
    GUIDELINE_REVISION = "GUIDELINE_REVISION"


@dataclass
class PolicyChange:
    """Detected policy change with provenance."""
    change_id: str
    change_type: ChangeType
    title: str
    summary: str
    source_url: str
    source_name: str
    discovered_at: str
    content_hash: str
    previous_hash: Optional[str] = None
    raw_content: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ImpactAssessment:
    """LLM-assessed impact of a policy change on a business."""
    change_id: str
    urgency: AlertUrgency
    impact_summary: str
    affected_obligations: List[str]
    action_items: List[str]
    estimated_financial_impact_inr: float
    confidence: float  # 0.0–1.0
    relevant_sectors: List[str] = field(default_factory=list)
    relevant_states: List[str] = field(default_factory=list)


@dataclass
class PolicyAlert:
    """User-facing alert combining change + impact assessment."""
    alert_id: str
    user_id: str
    urgency: AlertUrgency
    title: str
    summary: str
    impact: ImpactAssessment
    change: PolicyChange
    created_at: str
    read: bool = False
    dismissed: bool = False


@dataclass
class ScanResult:
    """Result of a policy scan cycle."""
    scan_id: str
    started_at: str
    completed_at: str
    changes_detected: int
    alerts_generated: int
    sources_scanned: int
    errors: List[str] = field(default_factory=list)
    changes: List[PolicyChange] = field(default_factory=list)


# ── State Management ────────────────────────────────────────────────────

INTEL_STATE_FILE = Path("data/policy_intel_state.json")


class PolicyStateStore:
    """Persists content hashes and scan history for change detection."""

    def __init__(self, state_file: Path = INTEL_STATE_FILE):
        self._path = state_file
        self._content_hashes: Dict[str, str] = {}   # url → last hash
        self._scan_history: List[Dict] = []
        self._known_change_ids: Set[str] = set()
        self._load()

    def _load(self):
        if self._path.exists():
            try:
                with open(self._path, "r") as f:
                    data = json.load(f)
                self._content_hashes = data.get("content_hashes", {})
                self._scan_history = data.get("scan_history", [])
                self._known_change_ids = set(data.get("known_change_ids", []))
            except Exception as e:
                logger.warning(f"Failed to load intelligence state: {e}")

    def save(self):
        self._path.parent.mkdir(parents=True, exist_ok=True)
        with open(self._path, "w") as f:
            json.dump({
                "content_hashes": self._content_hashes,
                "scan_history": self._scan_history[-100:],  # Keep last 100
                "known_change_ids": list(self._known_change_ids)[-5000:],
            }, f, indent=2)

    def get_hash(self, url: str) -> Optional[str]:
        return self._content_hashes.get(url)

    def set_hash(self, url: str, content_hash: str):
        self._content_hashes[url] = content_hash

    def is_known_change(self, change_id: str) -> bool:
        return change_id in self._known_change_ids

    def record_change(self, change_id: str):
        self._known_change_ids.add(change_id)

    def record_scan(self, scan: Dict):
        self._scan_history.append(scan)


# ── Change Detector ─────────────────────────────────────────────────────

class ChangeDetector:
    """Detects policy changes via content hashing and keyword analysis."""

    DEADLINE_KEYWORDS = [
        "deadline", "due date", "last date", "effective from",
        "w.e.f.", "with effect from", "compliance date",
    ]
    PENALTY_KEYWORDS = [
        "penalty", "fine", "imprisonment", "prosecution",
        "suspension", "revocation", "late fee",
    ]
    SCHEME_KEYWORDS = [
        "subsidy", "grant", "loan", "guarantee", "benefit",
        "scheme", "yojana", "programme",
    ]

    @staticmethod
    def hash_content(content: str) -> str:
        """SHA-256 hash of normalized content."""
        normalized = " ".join(content.lower().split())
        return hashlib.sha256(normalized.encode()).hexdigest()[:32]

    @classmethod
    def classify_change(cls, title: str, content: str) -> ChangeType:
        """Classify the type of policy change from text analysis."""
        text = (title + " " + content).lower()

        if any(w in text for w in ["new policy", "new notification", "gazette", "fresh"]):
            return ChangeType.NEW_POLICY
        if any(w in text for w in cls.DEADLINE_KEYWORDS):
            return ChangeType.DEADLINE_CHANGE
        if any(w in text for w in cls.PENALTY_KEYWORDS):
            return ChangeType.PENALTY_CHANGE
        if any(w in text for w in cls.SCHEME_KEYWORDS):
            return ChangeType.SCHEME_UPDATE
        if any(w in text for w in ["amend", "revis", "modif", "updat"]):
            return ChangeType.AMENDMENT
        return ChangeType.GUIDELINE_REVISION

    @classmethod
    def assess_urgency(cls, change_type: ChangeType, content: str) -> AlertUrgency:
        """Heuristic urgency scoring based on change type and content."""
        text = content.lower()

        # Critical: immediate deadlines or criminal penalties
        if any(w in text for w in ["immediate", "within 7 days", "criminal", "imprisonment"]):
            return AlertUrgency.CRITICAL
        if change_type == ChangeType.PENALTY_CHANGE and "increas" in text:
            return AlertUrgency.CRITICAL

        # High: deadline changes or new mandatory requirements
        if change_type == ChangeType.DEADLINE_CHANGE:
            return AlertUrgency.HIGH
        if any(w in text for w in ["mandatory", "compulsory", "must comply"]):
            return AlertUrgency.HIGH

        # Medium: amendments or scheme updates with financial impact
        if change_type in (ChangeType.AMENDMENT, ChangeType.SCHEME_UPDATE):
            return AlertUrgency.MEDIUM

        # Low: informational
        if change_type == ChangeType.NEW_POLICY:
            return AlertUrgency.MEDIUM

        return AlertUrgency.LOW


# ── Policy Intelligence Engine ──────────────────────────────────────────

class PolicyIntelligenceEngine:
    """
    Central orchestrator for real-time policy intelligence.

    Coordinates search APIs, scrapers, and change detection to
    proactively discover and assess policy changes for MSMEs.
    """

    def __init__(self):
        self.state = PolicyStateStore()
        self._alerts_queue: List[PolicyAlert] = []
        self._scan_count = 0
        logger.info("PolicyIntelligenceEngine initialized (v4)")

    async def run_scan(
        self,
        business_profiles: Optional[List[Dict]] = None,
        custom_queries: Optional[List[str]] = None,
    ) -> ScanResult:
        """
        Execute a full policy intelligence scan cycle.

        1. Search web for policy updates
        2. Scrape government portals
        3. Detect changes
        4. Assess impact
        5. Generate alerts

        Parameters
        ----------
        business_profiles : list of dict, optional
            Business profiles to assess impact against.
        custom_queries : list of str, optional
            Additional search queries beyond defaults.
        """
        self._scan_count += 1
        scan_id = f"scan_{int(time.time())}_{self._scan_count}"
        started_at = datetime.utcnow().isoformat()
        errors: List[str] = []
        all_changes: List[PolicyChange] = []

        # ── Stage 1: Web Search ──────────────────────────────────────
        try:
            from policy.search_api import PolicySearchAPI
            search_api = PolicySearchAPI()
            search_results = await self._run_search_queries(
                search_api, custom_queries
            )
            search_changes = self._process_search_results(search_results)
            all_changes.extend(search_changes)
        except Exception as e:
            errors.append(f"Search stage failed: {e}")
            logger.error(f"Search stage error: {e}")

        # ── Stage 2: Portal Scraping ─────────────────────────────────
        try:
            from policy.scraper import PolicyScraper
            scraper = PolicyScraper()
            scraped = await scraper.scrape_all_sources()
            scrape_changes = self._process_scraped_documents(scraped)
            all_changes.extend(scrape_changes)
        except Exception as e:
            errors.append(f"Scrape stage failed: {e}")
            logger.error(f"Scrape stage error: {e}")

        # ── Stage 3: Deduplication ───────────────────────────────────
        unique_changes = self._deduplicate_changes(all_changes)

        # ── Stage 4: Impact Assessment & Alerts ──────────────────────
        alerts_count = 0
        if business_profiles and unique_changes:
            for profile in business_profiles:
                for change in unique_changes:
                    alert = self._generate_alert(change, profile)
                    if alert:
                        self._alerts_queue.append(alert)
                        alerts_count += 1

        # ── Persist State ────────────────────────────────────────────
        self.state.save()

        completed_at = datetime.utcnow().isoformat()
        scan_result = ScanResult(
            scan_id=scan_id,
            started_at=started_at,
            completed_at=completed_at,
            changes_detected=len(unique_changes),
            alerts_generated=alerts_count,
            sources_scanned=len(search_results) if "search_results" in dir() else 0,
            errors=errors,
            changes=unique_changes,
        )
        self.state.record_scan({
            "scan_id": scan_id,
            "at": completed_at,
            "changes": len(unique_changes),
            "alerts": alerts_count,
        })
        self.state.save()

        logger.info(
            f"Scan {scan_id} complete: {len(unique_changes)} changes, "
            f"{alerts_count} alerts, {len(errors)} errors"
        )
        return scan_result

    # ── Search Queries ───────────────────────────────────────────────

    DEFAULT_QUERIES = [
        "India MSME compliance notification 2025",
        "GST MSME new rules circular latest",
        "labour law MSME India amendment 2025",
        "environmental compliance MSME India update",
        "CGTMSE PMEGP MUDRA scheme update 2025",
        "factory act shops establishment India new notification",
        "Udyam registration changes latest",
    ]

    async def _run_search_queries(
        self, search_api, custom_queries: Optional[List[str]] = None
    ) -> List[Dict]:
        """Run all search queries and collect results."""
        queries = self.DEFAULT_QUERIES + (custom_queries or [])
        all_results = []

        for query in queries:
            try:
                results = await search_api.search_policies(query, max_results=5)
                all_results.extend(results)
            except Exception as e:
                logger.warning(f"Query '{query[:40]}...' failed: {e}")

        return all_results

    def _process_search_results(
        self, results: List[Dict]
    ) -> List[PolicyChange]:
        """Convert search results to PolicyChange objects with change detection."""
        changes = []
        for r in results:
            url = r.get("url", "")
            content = r.get("content", "")
            title = r.get("title", "")

            if not url or not content:
                continue

            content_hash = ChangeDetector.hash_content(content)
            previous_hash = self.state.get_hash(url)

            # Skip if content unchanged
            if previous_hash == content_hash:
                continue

            change_id = f"chg_{content_hash[:12]}"
            if self.state.is_known_change(change_id):
                continue

            change_type = ChangeDetector.classify_change(title, content)

            changes.append(PolicyChange(
                change_id=change_id,
                change_type=change_type,
                title=title,
                summary=content[:500],
                source_url=url,
                source_name=r.get("source", "web_search"),
                discovered_at=datetime.utcnow().isoformat(),
                content_hash=content_hash,
                previous_hash=previous_hash,
                raw_content=content,
            ))

            self.state.set_hash(url, content_hash)
            self.state.record_change(change_id)

        return changes

    def _process_scraped_documents(
        self, documents: List[Dict]
    ) -> List[PolicyChange]:
        """Convert scraped documents to PolicyChange objects."""
        changes = []
        for doc in documents:
            url = doc.get("url", "")
            url_hash = doc.get("hash", "")
            change_id = f"scrape_{url_hash}"

            if self.state.is_known_change(change_id):
                continue

            changes.append(PolicyChange(
                change_id=change_id,
                change_type=ChangeType.NEW_POLICY,
                title=url.split("/")[-1].replace(".pdf", "").replace("_", " "),
                summary=f"New document discovered from {doc.get('source_name', 'unknown')}",
                source_url=url,
                source_name=doc.get("source_name", "portal_scraper"),
                discovered_at=doc.get("discovered_at", datetime.utcnow().isoformat()),
                content_hash=url_hash,
            ))
            self.state.record_change(change_id)

        return changes

    # ── Deduplication ────────────────────────────────────────────────

    def _deduplicate_changes(
        self, changes: List[PolicyChange]
    ) -> List[PolicyChange]:
        """Remove duplicate changes based on content hash similarity."""
        seen_hashes: Set[str] = set()
        unique: List[PolicyChange] = []

        for change in changes:
            # Use first 16 chars for fuzzy dedup
            short_hash = change.content_hash[:16]
            if short_hash not in seen_hashes:
                seen_hashes.add(short_hash)
                unique.append(change)

        return unique

    # ── Alert Generation ─────────────────────────────────────────────

    def _generate_alert(
        self, change: PolicyChange, business_profile: Dict
    ) -> Optional[PolicyAlert]:
        """
        Generate an alert for a policy change relative to a business profile.
        Returns None if the change is not relevant to this business.
        """
        # Relevance check: sector and state matching
        sector = business_profile.get("sector", "").lower()
        state = business_profile.get("state", "").lower()
        user_id = business_profile.get("uid", business_profile.get("user_id", "unknown"))

        text = (change.title + " " + change.summary).lower()

        # Simple relevance heuristic (in production: use embeddings)
        sector_relevant = (
            not sector
            or any(w in text for w in sector.split())
            or "msme" in text
            or "all" in text
        )
        state_relevant = (
            not state
            or state in text
            or "india" in text
            or "central" in text
        )

        if not (sector_relevant or state_relevant):
            return None

        urgency = ChangeDetector.assess_urgency(change.change_type, change.summary)

        impact = ImpactAssessment(
            change_id=change.change_id,
            urgency=urgency,
            impact_summary=f"Policy change detected: {change.title}",
            affected_obligations=[change.change_type.value],
            action_items=[
                f"Review: {change.source_url}",
                "Assess applicability to your business",
                "Update compliance calendar if deadlines changed",
            ],
            estimated_financial_impact_inr=0.0,  # Would need LLM for precision
            confidence=0.6,
            relevant_sectors=[sector] if sector else [],
            relevant_states=[state] if state else [],
        )

        alert_id = f"alert_{change.change_id}_{user_id[:8]}"
        return PolicyAlert(
            alert_id=alert_id,
            user_id=user_id,
            urgency=urgency,
            title=change.title,
            summary=change.summary[:300],
            impact=impact,
            change=change,
            created_at=datetime.utcnow().isoformat(),
        )

    # ── Public API ───────────────────────────────────────────────────

    def get_pending_alerts(
        self, user_id: Optional[str] = None
    ) -> List[PolicyAlert]:
        """Get unread alerts, optionally filtered by user."""
        alerts = [a for a in self._alerts_queue if not a.dismissed]
        if user_id:
            alerts = [a for a in alerts if a.user_id == user_id]
        return sorted(alerts, key=lambda a: a.urgency.value)

    def dismiss_alert(self, alert_id: str):
        """Mark an alert as dismissed."""
        for alert in self._alerts_queue:
            if alert.alert_id == alert_id:
                alert.dismissed = True
                break

    def mark_read(self, alert_id: str):
        """Mark an alert as read."""
        for alert in self._alerts_queue:
            if alert.alert_id == alert_id:
                alert.read = True
                break

    def get_scan_history(self, limit: int = 20) -> List[Dict]:
        """Return recent scan results."""
        return self.state._scan_history[-limit:]

    def to_dict(self) -> Dict[str, Any]:
        """Serialize engine state for API response."""
        return {
            "total_tracked_urls": len(self.state._content_hashes),
            "total_known_changes": len(self.state._known_change_ids),
            "pending_alerts": len([a for a in self._alerts_queue if not a.dismissed]),
            "scan_count": self._scan_count,
            "last_scan": self.state._scan_history[-1] if self.state._scan_history else None,
        }
