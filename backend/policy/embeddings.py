"""
Embedding Model Integration
=============================
Lightweight local embedding fallback (TF-IDF hashing).
OpenRouter does not expose an embedding endpoint, so we use
a fast deterministic hash-based approach for vector similarity.
When a proper embedding provider is configured, swap this out.
"""

import hashlib, math, re
from typing import List, Optional

from config import config


_VOCAB_DIM = 768  # match original dimension expectation


def _simple_tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def _text_to_vector(text: str, dim: int = _VOCAB_DIM) -> List[float]:
    """Deterministic hash-based embedding (not semantic, but non-crashing)."""
    tokens = _simple_tokenize(text)
    vec = [0.0] * dim
    for tok in tokens:
        h = int(hashlib.md5(tok.encode()).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0
    # L2-normalise
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


class PolicyEmbedding:
    """
    Document embedding generator.
    Currently uses a lightweight hash-based approach.
    """

    def __init__(self):
        pass

    async def embed_text(self, text: str) -> Optional[List[float]]:
        try:
            return _text_to_vector(text)
        except Exception as e:
            print(f"Embedding generation failed: {e}")
            return None

    async def embed_query(self, query: str) -> Optional[List[float]]:
        try:
            return _text_to_vector(query)
        except Exception as e:
            print(f"Query embedding failed: {e}")
            return None

    async def embed_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        return [await self.embed_text(t) for t in texts]

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            if chunk.strip():
                chunks.append(chunk.strip())
            start = end - overlap
        return chunks
