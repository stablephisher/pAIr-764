"""
pAIr v5 — Embedding Model Integration
========================================
Hybrid embedding layer:
  1. Gemini Embeddings (primary) — Google's text-embedding-004 via API
  2. Hash-based fallback (offline) — deterministic TF-IDF-like hashing

The Gemini embedding model produces 768-dim vectors optimised for
semantic similarity, making it ideal for policy deduplication and search.

Upgrade Path:
  - v5: Gemini API (free tier) + hash fallback
  - v6: Vertex AI Embeddings (production scale)
"""

from __future__ import annotations

import hashlib
import logging
import math
import os
import re
from typing import List, Optional

import aiohttp

from config import config

logger = logging.getLogger("pAIr.embeddings")

_VOCAB_DIM = 768  # Gemini text-embedding-004 output dimension


# ── Hash-based Fallback ──────────────────────────────────────────────────

def _simple_tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def _text_to_vector(text: str, dim: int = _VOCAB_DIM) -> List[float]:
    """Deterministic hash-based embedding (fallback when API unavailable)."""
    tokens = _simple_tokenize(text)
    vec = [0.0] * dim
    for tok in tokens:
        h = int(hashlib.md5(tok.encode()).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0
    # L2-normalise
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


# ── Gemini Embedding Client ─────────────────────────────────────────────

class GeminiEmbeddingClient:
    """
    Async client for Google Gemini text-embedding-004 API.

    Uses the Generative Language API endpoint directly (no SDK dependency).
    Falls back to hash-based embeddings if API key is missing or call fails.
    """

    GEMINI_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent"

    def __init__(self):
        self._api_key = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
        self._model = config.policy.embedding_model  # models/text-embedding-004
        self._available = bool(self._api_key)
        if not self._available:
            logger.info("Gemini API key not found — using hash-based embedding fallback")

    async def embed(self, text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> Optional[List[float]]:
        """
        Generate embedding for a single text.

        Parameters
        ----------
        text : str
            The text to embed (max ~8192 tokens).
        task_type : str
            One of: RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, SEMANTIC_SIMILARITY,
            CLASSIFICATION, CLUSTERING.
        """
        if not self._available:
            return _text_to_vector(text)

        try:
            url = self.GEMINI_EMBED_URL.format(model=self._model)
            payload = {
                "model": self._model,
                "content": {"parts": [{"text": text[:8000]}]},
                "taskType": task_type,
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=payload,
                    params={"key": self._api_key},
                    timeout=aiohttp.ClientTimeout(total=15),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        values = data.get("embedding", {}).get("values", [])
                        if values:
                            return values
                    else:
                        body = await resp.text()
                        logger.warning(f"Gemini embed API returned {resp.status}: {body[:200]}")
        except Exception as e:
            logger.warning(f"Gemini embedding failed, using fallback: {e}")

        return _text_to_vector(text)

    async def embed_batch(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        """Embed multiple texts. Falls back per-text on failure."""
        results = []
        for text in texts:
            vec = await self.embed(text, task_type)
            results.append(vec or _text_to_vector(text))
        return results


# ── Public API ───────────────────────────────────────────────────────────

class PolicyEmbedding:
    """
    Document embedding generator.

    Uses Gemini text-embedding-004 (primary) with hash-based fallback.
    Thread-safe, stateless, async.
    """

    def __init__(self):
        self._client = GeminiEmbeddingClient()

    async def embed_text(self, text: str) -> Optional[List[float]]:
        """Embed a document text for storage/indexing."""
        try:
            return await self._client.embed(text, task_type="RETRIEVAL_DOCUMENT")
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return _text_to_vector(text)

    async def embed_query(self, query: str) -> Optional[List[float]]:
        """Embed a search query for retrieval."""
        try:
            return await self._client.embed(query, task_type="RETRIEVAL_QUERY")
        except Exception as e:
            logger.error(f"Query embedding failed: {e}")
            return _text_to_vector(query)

    async def embed_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Embed multiple texts."""
        return await self._client.embed_batch(texts)

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks for embedding."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            if chunk.strip():
                chunks.append(chunk.strip())
            start = end - overlap
        return chunks

    async def compute_similarity(self, text_a: str, text_b: str) -> float:
        """Compute semantic similarity between two texts (0.0 to 1.0)."""
        vec_a = await self.embed_text(text_a)
        vec_b = await self.embed_text(text_b)
        if not vec_a or not vec_b:
            return 0.0
        # Cosine similarity
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a)) or 1.0
        norm_b = math.sqrt(sum(b * b for b in vec_b)) or 1.0
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))
