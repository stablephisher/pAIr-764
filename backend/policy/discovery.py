"""
pAIr v5 — Policy Discovery Service
======================================
Autonomous background service that discovers, fetches, and indexes
government policies relevant to registered MSMEs.

This is the core architectural shift: from upload-based → auto-discovery.

Flow
----
1. Scheduled scan (configurable interval, default 6 hours)
2. Search APIs (Tavily primary, Serper fallback) with gov domain filters
3. Web scraper for direct government portal crawling
4. Change detection via content hashing
5. Deduplication via FAISS semantic similarity
6. Impact assessment per registered business profile
7. Alert generation for affected users

Sources
-------
- msme.gov.in, pib.gov.in, rbi.org.in, gst.gov.in
- startupindia.gov.in, egazette.nic.in, cgtmse.in
- udyamregistration.gov.in, kviconline.gov.in
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from config import config

logger = logging.getLogger("pAIr.discovery")


# ── Government Source Registry ───────────────────────────────────────────

GOVERNMENT_SOURCES = [
    {
        "id": "msme_ministry",
        "name": "Ministry of MSME",
        "base_url": "https://msme.gov.in",
        "search_queries": [
            "MSME new notification circular {year}",
            "micro small medium enterprise policy update India",
            "MSME scheme guidelines revision {year}",
        ],
        "domains": ["msme.gov.in"],
        "priority": 1,
    },
    {
        "id": "pib",
        "name": "Press Information Bureau",
        "base_url": "https://pib.gov.in",
        "search_queries": [
            "PIB MSME announcement {year}",
            "government policy MSME press release India",
        ],
        "domains": ["pib.gov.in"],
        "priority": 2,
    },
    {
        "id": "rbi",
        "name": "Reserve Bank of India",
        "base_url": "https://rbi.org.in",
        "search_queries": [
            "RBI MSME lending priority sector circular {year}",
            "RBI credit policy small enterprise",
        ],
        "domains": ["rbi.org.in"],
        "priority": 1,
    },
    {
        "id": "gst_council",
        "name": "GST Council",
        "base_url": "https://gst.gov.in",
        "search_queries": [
            "GST MSME notification {year}",
            "GST composition scheme small business update",
            "GSTR filing deadline notification",
        ],
        "domains": ["gst.gov.in", "cbic-gst.gov.in"],
        "priority": 1,
    },
    {
        "id": "startup_india",
        "name": "Startup India",
        "base_url": "https://www.startupindia.gov.in",
        "search_queries": [
            "Startup India MSME scheme benefit {year}",
            "startup recognition DPIIT notification",
        ],
        "domains": ["startupindia.gov.in"],
        "priority": 2,
    },
    {
        "id": "egazette",
        "name": "e-Gazette of India",
        "base_url": "https://egazette.nic.in",
        "search_queries": [
            "gazette notification MSME Act amendment {year}",
        ],
        "domains": ["egazette.nic.in"],
        "priority": 3,
    },
    {
        "id": "cgtmse",
        "name": "CGTMSE",
        "base_url": "https://www.cgtmse.in",
        "search_queries": [
            "CGTMSE credit guarantee scheme update {year}",
        ],
        "domains": ["cgtmse.in"],
        "priority": 2,
    },
    {
        "id": "udyam",
        "name": "Udyam Registration",
        "base_url": "https://udyamregistration.gov.in",
        "search_queries": [
            "Udyam registration new rules notification {year}",
        ],
        "domains": ["udyamregistration.gov.in"],
        "priority": 2,
    },
]


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class DiscoveredPolicy:
    """A policy discovered through automated search/scraping."""
    discovery_id: str
    title: str
    url: str
    content_snippet: str
    source_id: str
    source_name: str
    content_hash: str
    discovered_at: str
    relevance_score: float = 0.0
    is_new: bool = True
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None
    sectors: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DiscoveryScanResult:
    """Result of a single discovery scan cycle."""
    scan_id: str
    started_at: str
    completed_at: str
    sources_scanned: int
    total_results: int
    new_policies: int
    duplicates_filtered: int
    errors: List[str] = field(default_factory=list)
    policies: List[DiscoveredPolicy] = field(default_factory=list)


# ── Discovery State Persistence ──────────────────────────────────────────

DISCOVERY_STATE_FILE = Path("data/discovery_state.json")


class DiscoveryStateStore:
    """Persists discovery state for change detection and dedup tracking."""

    def __init__(self):
        self._content_hashes: Dict[str, str] = {}  # url → hash
        self._discovered_ids: set = set()
        self._last_scan: Optional[str] = None
        self._scan_count: int = 0
        self._load()

    def _load(self):
        if DISCOVERY_STATE_FILE.exists():
            try:
                with open(DISCOVERY_STATE_FILE, "r") as f:
                    data = json.load(f)
                self._content_hashes = data.get("content_hashes", {})
                self._discovered_ids = set(data.get("discovered_ids", []))
                self._last_scan = data.get("last_scan")
                self._scan_count = data.get("scan_count", 0)
            except Exception as e:
                logger.warning(f"Failed to load discovery state: {e}")

    def save(self):
        DISCOVERY_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DISCOVERY_STATE_FILE, "w") as f:
            json.dump({
                "content_hashes": self._content_hashes,
                "discovered_ids": list(self._discovered_ids)[-10000:],
                "last_scan": self._last_scan,
                "scan_count": self._scan_count,
            }, f, indent=2)

    def is_known(self, content_hash: str) -> bool:
        return content_hash in self._content_hashes.values()

    def record(self, url: str, content_hash: str, discovery_id: str):
        self._content_hashes[url] = content_hash
        self._discovered_ids.add(discovery_id)

    def record_scan(self):
        self._last_scan = datetime.utcnow().isoformat()
        self._scan_count += 1

    @property
    def last_scan(self) -> Optional[str]:
        return self._last_scan

    @property
    def scan_count(self) -> int:
        return self._scan_count


# ── Sector Keyword Matching ─────────────────────────────────────────────

SECTOR_KEYWORDS = {
    "manufacturing": [
        "factory", "manufacturing", "industrial", "production",
        "pollution control", "boiler", "fire safety", "hazardous",
    ],
    "service": [
        "service", "IT", "software", "consulting", "professional tax",
        "outsourcing", "BPO", "digital",
    ],
    "trading": [
        "trading", "retail", "wholesale", "import", "export",
        "shops", "establishment", "FSSAI", "food safety",
    ],
    "handicraft": [
        "handicraft", "artisan", "handloom", "khadi", "village industry",
        "traditional", "GI tag", "craft",
    ],
}


def detect_sectors(text: str) -> List[str]:
    """Detect which MSME sectors a policy text is relevant to."""
    text_lower = text.lower()
    matched = []
    for sector, keywords in SECTOR_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            matched.append(sector)
    if not matched:
        matched = ["general"]
    return matched


def compute_content_hash(content: str) -> str:
    """SHA-256 hash for content change detection."""
    normalized = " ".join(content.lower().split())
    return hashlib.sha256(normalized.encode()).hexdigest()[:32]


# ── Policy Discovery Engine ─────────────────────────────────────────────

class PolicyDiscoveryEngine:
    """
    Autonomous policy discovery engine.

    Combines web search APIs (Tavily/Serper) with direct scraping
    to find new/updated government policies relevant to MSMEs.

    Usage
    -----
        engine = PolicyDiscoveryEngine()
        result = await engine.run_discovery_scan()
        # result.policies = list of newly discovered policies
    """

    def __init__(self):
        self._state = DiscoveryStateStore()
        self._search_api = None
        self._scraper = None

    def _get_search_api(self):
        if self._search_api is None:
            from policy.search_api import PolicySearchAPI
            self._search_api = PolicySearchAPI()
        return self._search_api

    def _get_scraper(self):
        if self._scraper is None:
            from policy.scraper import PolicyScraper
            self._scraper = PolicyScraper()
        return self._scraper

    async def run_discovery_scan(
        self,
        source_ids: Optional[List[str]] = None,
        business_profile: Optional[Dict[str, Any]] = None,
    ) -> DiscoveryScanResult:
        """
        Run a full policy discovery scan.

        Parameters
        ----------
        source_ids : list, optional
            Filter to specific sources. None = scan all.
        business_profile : dict, optional
            Target business profile for relevance scoring.
        """
        scan_id = str(uuid.uuid4())[:8]
        started_at = datetime.utcnow().isoformat()
        errors: List[str] = []
        all_policies: List[DiscoveredPolicy] = []

        sources = GOVERNMENT_SOURCES
        if source_ids:
            sources = [s for s in sources if s["id"] in source_ids]

        # Phase 1: Search API discovery
        search_results = await self._search_all_sources(sources, errors)
        all_policies.extend(search_results)

        # Phase 2: Direct scraping discovery
        try:
            scraper = self._get_scraper()
            scraped = await scraper.scrape_all_sources()
            for doc in scraped:
                content_hash = compute_content_hash(doc.get("url", ""))
                if not self._state.is_known(content_hash):
                    policy = DiscoveredPolicy(
                        discovery_id=str(uuid.uuid4())[:8],
                        title=doc.get("url", "").split("/")[-1],
                        url=doc["url"],
                        content_snippet="PDF document discovered via scraping",
                        source_id=doc.get("source_name", "unknown").lower().replace(" ", "_"),
                        source_name=doc.get("source_name", "Unknown"),
                        content_hash=content_hash,
                        discovered_at=doc.get("discovered_at", datetime.utcnow().isoformat()),
                        sectors=["general"],
                    )
                    all_policies.append(policy)
        except Exception as e:
            errors.append(f"Scraping failed: {str(e)}")
            logger.warning(f"Scraping phase failed: {e}")

        # Phase 3: Deduplication
        unique_policies = self._deduplicate(all_policies)
        duplicates_filtered = len(all_policies) - len(unique_policies)

        # Phase 4: Relevance scoring if business profile provided
        if business_profile:
            unique_policies = self._score_relevance(unique_policies, business_profile)
            unique_policies.sort(key=lambda p: p.relevance_score, reverse=True)

        # Phase 5: Persist state
        for policy in unique_policies:
            self._state.record(policy.url, policy.content_hash, policy.discovery_id)
        self._state.record_scan()
        self._state.save()

        completed_at = datetime.utcnow().isoformat()

        return DiscoveryScanResult(
            scan_id=scan_id,
            started_at=started_at,
            completed_at=completed_at,
            sources_scanned=len(sources),
            total_results=len(all_policies),
            new_policies=len(unique_policies),
            duplicates_filtered=duplicates_filtered,
            errors=errors,
            policies=unique_policies,
        )

    async def _search_all_sources(
        self, sources: List[dict], errors: List[str]
    ) -> List[DiscoveredPolicy]:
        """Search all sources using Tavily/Serper APIs."""
        policies = []
        search_api = self._get_search_api()
        current_year = datetime.utcnow().year

        for source in sources:
            for query_template in source.get("search_queries", []):
                query = query_template.format(year=current_year)
                try:
                    results = await search_api.search_policies(
                        query=query,
                        max_results=5,
                        search_depth="advanced",
                    )
                    for result in results:
                        content = result.get("content", "")
                        content_hash = compute_content_hash(content or result.get("url", ""))

                        if self._state.is_known(content_hash):
                            continue

                        policy = DiscoveredPolicy(
                            discovery_id=str(uuid.uuid4())[:8],
                            title=result.get("title", "Unknown Policy"),
                            url=result.get("url", ""),
                            content_snippet=content[:500] if content else "",
                            source_id=source["id"],
                            source_name=source["name"],
                            content_hash=content_hash,
                            discovered_at=datetime.utcnow().isoformat(),
                            relevance_score=result.get("score", 0.0),
                            sectors=detect_sectors(content or result.get("title", "")),
                        )
                        policies.append(policy)

                except Exception as e:
                    err_msg = f"Search failed for {source['name']}: {str(e)}"
                    errors.append(err_msg)
                    logger.warning(err_msg)

        return policies

    def _deduplicate(self, policies: List[DiscoveredPolicy]) -> List[DiscoveredPolicy]:
        """Remove duplicate policies based on content hash and URL."""
        seen_hashes = set()
        seen_urls = set()
        unique = []

        for policy in policies:
            if policy.content_hash in seen_hashes:
                policy.is_duplicate = True
                continue
            # Normalize URL for comparison
            normalized_url = policy.url.rstrip("/").lower()
            if normalized_url in seen_urls:
                policy.is_duplicate = True
                continue

            seen_hashes.add(policy.content_hash)
            seen_urls.add(normalized_url)
            unique.append(policy)

        return unique

    def _score_relevance(
        self,
        policies: List[DiscoveredPolicy],
        business_profile: Dict[str, Any],
    ) -> List[DiscoveredPolicy]:
        """Score policy relevance against a business profile."""
        biz_sector = business_profile.get("business_type", "").lower()
        biz_state = business_profile.get("state", "").lower()
        biz_size = business_profile.get("enterprise_classification", "").lower()

        for policy in policies:
            score = policy.relevance_score or 0.5

            # Sector match boost
            if biz_sector in policy.sectors or "general" in policy.sectors:
                score += 0.2

            # Keyword matching from content
            content_lower = policy.content_snippet.lower()
            if biz_sector and biz_sector in content_lower:
                score += 0.15
            if biz_state and biz_state in content_lower:
                score += 0.1
            if biz_size and biz_size in content_lower:
                score += 0.05

            # Priority boost from source
            source = next(
                (s for s in GOVERNMENT_SOURCES if s["id"] == policy.source_id),
                None,
            )
            if source and source.get("priority", 3) == 1:
                score += 0.1

            policy.relevance_score = min(1.0, score)

        return policies

    def get_scan_status(self) -> Dict[str, Any]:
        """Return current discovery status."""
        return {
            "last_scan": self._state.last_scan,
            "total_scans": self._state.scan_count,
            "known_policies": len(self._state._content_hashes),
            "next_scan_interval_hours": config.policy.scrape_interval_hours,
        }


# ── Background Discovery Task ───────────────────────────────────────────

_discovery_engine: Optional[PolicyDiscoveryEngine] = None


def get_discovery_engine() -> PolicyDiscoveryEngine:
    """Singleton access to the discovery engine."""
    global _discovery_engine
    if _discovery_engine is None:
        _discovery_engine = PolicyDiscoveryEngine()
    return _discovery_engine


async def background_discovery_loop(db_instance=None, interval_hours: int = 6):
    """
    Background task that periodically runs policy discovery.
    Start this as an asyncio task on application startup.

    Parameters
    ----------
    db_instance : FirestoreDB
        Database instance for saving discovered policies and notifying users.
    interval_hours : int
        Hours between discovery scans.
    """
    engine = get_discovery_engine()
    interval_seconds = interval_hours * 3600

    logger.info(f"Policy discovery background loop started (interval: {interval_hours}h)")

    while True:
        try:
            logger.info("Starting policy discovery scan...")
            result = await engine.run_discovery_scan()

            logger.info(
                f"Discovery scan complete: {result.new_policies} new, "
                f"{result.duplicates_filtered} duplicates, "
                f"{len(result.errors)} errors"
            )

            # Save discovered policies and notify users
            if db_instance and result.new_policies > 0:
                for policy in result.policies:
                    if policy.is_duplicate:
                        continue
                    try:
                        db_instance.store_detected_policy({
                            "discovery_id": policy.discovery_id,
                            "title": policy.title,
                            "url": policy.url,
                            "source": policy.source_name,
                            "sectors": policy.sectors,
                            "discovered_at": policy.discovered_at,
                            "content_hash": policy.content_hash,
                            "relevance_score": policy.relevance_score,
                        })
                    except Exception as e:
                        logger.warning(f"Failed to save discovered policy: {e}")

            if result.errors:
                for err in result.errors:
                    logger.warning(f"Discovery error: {err}")

        except Exception as e:
            logger.error(f"Discovery loop error: {e}", exc_info=True)

        await asyncio.sleep(interval_seconds)
