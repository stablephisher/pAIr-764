"""
Vector Store — FAISS-based Semantic Policy Search
==================================================
Stores policy embeddings for similarity search.
Enables "find similar policies" and deduplication.
"""

import os
import json
import pickle
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path

from config import config

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("⚠️ FAISS not installed. Vector search disabled. Install: pip install faiss-cpu")


class PolicyVectorStore:
    """
    FAISS-backed vector store for policy document embeddings.
    
    Architecture:
        Policy Text → Gemini Embedding → FAISS Index → Similarity Search
        
    Storage:
        - FAISS index file (binary)
        - Metadata JSON (maps index position → document info)
    """

    def __init__(self, dimension: int = 768):
        self.dimension = dimension
        self.index_path = Path(config.policy.vector_db_path) / "policy.index"
        self.meta_path = Path(config.policy.vector_db_path) / "policy_meta.json"
        
        self._index = None
        self._metadata: List[Dict[str, Any]] = []
        self._load()

    # ─── Core Operations ──────────────────────────────────────────────

    def add_document(
        self,
        embedding: List[float],
        metadata: Dict[str, Any],
    ) -> int:
        """
        Add a document embedding to the store.
        
        Args:
            embedding: Document embedding vector
            metadata: Document metadata (title, source, date, etc.)
            
        Returns:
            Index position of the added document
        """
        if not FAISS_AVAILABLE:
            return -1

        vector = np.array([embedding], dtype=np.float32)
        
        if self._index is None:
            self._index = faiss.IndexFlatIP(self.dimension)  # Inner product (cosine)
            faiss.normalize_L2(vector)
        else:
            faiss.normalize_L2(vector)

        self._index.add(vector)
        idx = len(self._metadata)
        self._metadata.append(metadata)
        self._save()
        return idx

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        score_threshold: float = 0.5,
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Search for similar documents.
        
        Args:
            query_embedding: Query vector
            top_k: Number of results to return
            score_threshold: Minimum similarity score
            
        Returns:
            List of (metadata, score) tuples
        """
        if not FAISS_AVAILABLE or self._index is None or self._index.ntotal == 0:
            return []

        query = np.array([query_embedding], dtype=np.float32)
        faiss.normalize_L2(query)

        scores, indices = self._index.search(query, min(top_k, self._index.ntotal))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and score >= score_threshold and idx < len(self._metadata):
                results.append((self._metadata[idx], float(score)))

        return results

    def get_document_count(self) -> int:
        """Return total documents in the store."""
        if self._index is None:
            return 0
        return self._index.ntotal

    def clear(self):
        """Clear all documents from the store."""
        self._index = None
        self._metadata = []
        self._save()

    # ─── Persistence ──────────────────────────────────────────────────

    def _save(self):
        """Save index and metadata to disk."""
        self.index_path.parent.mkdir(parents=True, exist_ok=True)

        if FAISS_AVAILABLE and self._index is not None:
            faiss.write_index(self._index, str(self.index_path))

        with open(self.meta_path, "w") as f:
            json.dump(self._metadata, f, indent=2)

    def _load(self):
        """Load index and metadata from disk."""
        if FAISS_AVAILABLE and self.index_path.exists():
            try:
                self._index = faiss.read_index(str(self.index_path))
            except Exception:
                self._index = None

        if self.meta_path.exists():
            try:
                with open(self.meta_path, "r") as f:
                    self._metadata = json.load(f)
            except Exception:
                self._metadata = []
