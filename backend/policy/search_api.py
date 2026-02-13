"""
Web Search API Integration
============================
Uses Tavily or Serper for real-time policy search.
Provides structured search results for the reasoning layer.
"""

import os
import json
import aiohttp
from typing import List, Dict, Any, Optional

from config import config


class PolicySearchAPI:
    """
    Hybrid search layer — uses Tavily (primary) or Serper (fallback)
    to find real-time government policy updates.
    
    Architecture:
        Query → Tavily/Serper API → Ranked Results → LLM Reasoning
    """

    def __init__(self):
        self.tavily_key = config.policy.tavily_api_key
        self.serper_key = config.policy.serper_api_key

    async def search_policies(
        self,
        query: str,
        max_results: int = None,
        search_depth: str = "advanced",
    ) -> List[Dict[str, Any]]:
        """
        Search for policy updates using available search APIs.
        
        Args:
            query: Search query (e.g., "MSME CGTMSE new guidelines 2025")
            max_results: Maximum results to return
            search_depth: "basic" or "advanced" (Tavily-specific)
            
        Returns:
            List of search result objects with title, url, content
        """
        max_results = max_results or config.policy.max_search_results

        if self.tavily_key:
            return await self._search_tavily(query, max_results, search_depth)
        elif self.serper_key:
            return await self._search_serper(query, max_results)
        else:
            print("⚠️ No search API keys configured. Skipping web search.")
            return []

    async def search_scheme_updates(self, scheme_id: str) -> List[Dict[str, Any]]:
        """Search for updates to a specific government scheme."""
        scheme_queries = {
            "CGTMSE": "CGTMSE credit guarantee MSME latest notification 2025",
            "PMEGP": "PMEGP employment generation programme new guidelines",
            "MUDRA": "Pradhan Mantri MUDRA Yojana latest updates",
            "STANDUPINDIA": "Stand Up India scheme latest circular",
            "UDYAM": "Udyam registration new rules MSME",
            "SFURTI": "SFURTI scheme traditional industries update",
        }
        query = scheme_queries.get(scheme_id, f"{scheme_id} MSME India latest notification")
        return await self.search_policies(query, max_results=5)

    # ─── Tavily Search ────────────────────────────────────────────────
    async def _search_tavily(
        self, query: str, max_results: int, search_depth: str
    ) -> List[Dict[str, Any]]:
        """Search using Tavily API (optimized for AI agents)."""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "api_key": self.tavily_key,
                    "query": query,
                    "search_depth": search_depth,
                    "max_results": max_results,
                    "include_domains": [
                        "msme.gov.in",
                        "pib.gov.in",
                        "rbi.org.in",
                        "cgtmse.in",
                        "mudra.org.in",
                        "standupmitra.in",
                        "udyamregistration.gov.in",
                        "kviconline.gov.in",
                        "egazette.nic.in",
                    ],
                }
                async with session.post(
                    "https://api.tavily.com/search",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=15),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return [
                            {
                                "title": r.get("title", ""),
                                "url": r.get("url", ""),
                                "content": r.get("content", ""),
                                "score": r.get("score", 0),
                                "source": "tavily",
                            }
                            for r in data.get("results", [])
                        ]
        except Exception as e:
            print(f"Tavily search failed: {e}")
        return []

    # ─── Serper Search ────────────────────────────────────────────────
    async def _search_serper(
        self, query: str, max_results: int
    ) -> List[Dict[str, Any]]:
        """Fallback search using Serper.dev (Google Search API)."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "X-API-KEY": self.serper_key,
                    "Content-Type": "application/json",
                }
                payload = {
                    "q": query + " site:gov.in OR site:nic.in",
                    "num": max_results,
                    "gl": "in",
                }
                async with session.post(
                    "https://google.serper.dev/search",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=15),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return [
                            {
                                "title": r.get("title", ""),
                                "url": r.get("link", ""),
                                "content": r.get("snippet", ""),
                                "score": 1.0 - (i * 0.1),
                                "source": "serper",
                            }
                            for i, r in enumerate(data.get("organic", []))
                        ]
        except Exception as e:
            print(f"Serper search failed: {e}")
        return []
