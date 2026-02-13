"""
Embedding Model Integration
=============================
Uses Google's text-embedding-004 model for document embeddings.
"""

import google.generativeai as genai
from typing import List, Optional

from config import config


class PolicyEmbedding:
    """
    Document embedding generator using Gemini's embedding model.
    
    Architecture:
        Text chunk → Gemini text-embedding-004 → 768-dim vector → FAISS
    """

    def __init__(self):
        if config.gemini.api_key:
            genai.configure(api_key=config.gemini.api_key)
        self.model = config.policy.embedding_model

    async def embed_text(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text (max ~2048 tokens for optimal results)
            
        Returns:
            List of floats (768-dimensional embedding)
        """
        try:
            result = genai.embed_content(
                model=self.model,
                content=text,
                task_type="retrieval_document",
            )
            return result["embedding"]
        except Exception as e:
            print(f"Embedding generation failed: {e}")
            return None

    async def embed_query(self, query: str) -> Optional[List[float]]:
        """Generate embedding optimized for search queries."""
        try:
            result = genai.embed_content(
                model=self.model,
                content=query,
                task_type="retrieval_query",
            )
            return result["embedding"]
        except Exception as e:
            print(f"Query embedding failed: {e}")
            return None

    async def embed_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts."""
        results = []
        for text in texts:
            embedding = await self.embed_text(text)
            results.append(embedding)
        return results

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into overlapping chunks for embedding.
        
        Args:
            text: Full document text
            chunk_size: Characters per chunk
            overlap: Overlap between chunks
            
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            if chunk.strip():
                chunks.append(chunk.strip())
            start = end - overlap
        return chunks
