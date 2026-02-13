"""
Policy Scraper Agent
=====================
Scrapes government portals for new policy notifications.
Supports RSS feeds and direct HTML parsing.
"""

import asyncio
import aiohttp
import hashlib
import json
import os
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from config import config


# Known government policy sources
DEFAULT_SOURCES = [
    {
        "name": "MSME Ministry",
        "url": "https://msme.gov.in/notifications-circulars",
        "type": "html",
        "selector": "a[href$='.pdf']",
    },
    {
        "name": "KVIC PMEGP",
        "url": "https://www.kviconline.gov.in/pmegpeportal/pmegphome/notifications.jsp",
        "type": "html",
        "selector": "a[href$='.pdf']",
    },
    {
        "name": "Udyam Portal",
        "url": "https://udyamregistration.gov.in",
        "type": "html",
        "selector": "a[href$='.pdf']",
    },
]

# Track previously seen documents
SCRAPE_STATE_FILE = Path("data/scrape_state.json")


class PolicyScraper:
    """
    Asynchronous policy scraper for Indian government portals.
    
    Architecture:
    1. Periodically hits known government URLs
    2. Extracts PDF links from notification pages
    3. Hashes each URL to detect NEW documents
    4. Downloads new PDFs and triggers ingestion pipeline
    """

    def __init__(self):
        self._seen_hashes: set = set()
        self._load_state()

    def _load_state(self):
        """Load previously seen document hashes."""
        if SCRAPE_STATE_FILE.exists():
            try:
                with open(SCRAPE_STATE_FILE, "r") as f:
                    data = json.load(f)
                self._seen_hashes = set(data.get("seen_hashes", []))
            except Exception:
                self._seen_hashes = set()

    def _save_state(self):
        """Persist seen hashes."""
        SCRAPE_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(SCRAPE_STATE_FILE, "w") as f:
            json.dump({"seen_hashes": list(self._seen_hashes)}, f)

    def _hash_url(self, url: str) -> str:
        return hashlib.sha256(url.encode()).hexdigest()[:16]

    async def scrape_all_sources(
        self, custom_sources: List[dict] = None
    ) -> List[Dict[str, Any]]:
        """
        Scrape all configured sources for new policy PDFs.
        
        Returns:
            List of newly discovered policy documents with metadata.
        """
        sources = (custom_sources or []) + DEFAULT_SOURCES
        new_documents = []

        async with aiohttp.ClientSession() as session:
            tasks = [self._scrape_source(session, src) for src in sources]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in results:
                if isinstance(result, list):
                    new_documents.extend(result)
                elif isinstance(result, Exception):
                    print(f"Scraper error: {result}")

        self._save_state()
        return new_documents

    async def _scrape_source(
        self, session: aiohttp.ClientSession, source: dict
    ) -> List[Dict[str, Any]]:
        """Scrape a single source for PDF links."""
        new_docs = []
        try:
            async with session.get(
                source["url"], timeout=aiohttp.ClientTimeout(total=30)
            ) as resp:
                if resp.status != 200:
                    return []

                html = await resp.text()

                # Simple regex-based PDF link extraction
                # (Production: use BeautifulSoup with proper selectors)
                import re

                pdf_pattern = re.compile(
                    r'href=["\']([^"\']*\.pdf)["\']', re.IGNORECASE
                )
                matches = pdf_pattern.findall(html)

                for pdf_url in matches:
                    # Resolve relative URLs
                    if not pdf_url.startswith("http"):
                        base = source["url"].rsplit("/", 1)[0]
                        pdf_url = f"{base}/{pdf_url}"

                    url_hash = self._hash_url(pdf_url)
                    if url_hash not in self._seen_hashes:
                        self._seen_hashes.add(url_hash)
                        new_docs.append(
                            {
                                "url": pdf_url,
                                "source_name": source["name"],
                                "discovered_at": datetime.utcnow().isoformat(),
                                "hash": url_hash,
                            }
                        )

        except Exception as e:
            print(f"Failed to scrape {source.get('name', 'unknown')}: {e}")

        return new_docs

    async def download_pdf(
        self, url: str, save_dir: str = None
    ) -> Optional[bytes]:
        """Download a PDF from URL."""
        save_dir = save_dir or config.policy.monitor_dir
        os.makedirs(save_dir, exist_ok=True)

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url, timeout=aiohttp.ClientTimeout(total=60)
                ) as resp:
                    if resp.status == 200:
                        content = await resp.read()
                        # Save to disk
                        filename = url.split("/")[-1]
                        filepath = os.path.join(save_dir, filename)
                        with open(filepath, "wb") as f:
                            f.write(content)
                        return content
        except Exception as e:
            print(f"Failed to download {url}: {e}")
        return None
