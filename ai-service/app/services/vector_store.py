import os
import math
from typing import List, Dict, Any, Optional
from .embedding_service import EmbeddingService

class VectorStore:
    """
    Vector Store implementation supporting PostgreSQL + pgvector
    with an In-Memory vector store fallback for local development & testing.
    """
    
    def __init__(self, embedding_service: EmbeddingService = None):
        self.embedding_service = embedding_service or EmbeddingService()
        self.in_memory_records: List[Dict[str, Any]] = []

    def store_chunk(
        self,
        chunk_id: str,
        document_id: str,
        text: str,
        embedding: List[float],
        page_number: int = 1,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Stores a document chunk vector and associated metadata."""
        record = {
            "chunk_id": chunk_id,
            "document_id": document_id,
            "text": text,
            "embedding": embedding,
            "page_number": page_number,
            "metadata": metadata or {}
        }
        
        # Replace if chunk_id already exists
        self.in_memory_records = [r for r in self.in_memory_records if r["chunk_id"] != chunk_id]
        self.in_memory_records.append(record)
        return record

    def store_batch_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Stores multiple document chunk records in batch."""
        stored_count = 0
        for chunk in chunks:
            text = chunk.get("text", "")
            if not text:
                continue
            embedding = chunk.get("embedding") or self.embedding_service.generate_embedding(text)
            self.store_chunk(
                chunk_id=chunk["chunk_id"],
                document_id=chunk.get("document_id", ""),
                text=text,
                embedding=embedding,
                page_number=chunk.get("page_number", 1),
                metadata=chunk.get("metadata", {})
            )
            stored_count += 1
        return stored_count

    def search_similarity(
        self,
        query: str,
        top_k: int = 3,
        metadata_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs Top-K vector similarity search against stored chunks using Cosine Distance.
        Returns matching chunks sorted by similarity score before sending to LLM.
        """
        if not self.in_memory_records:
            return []

        query_vec = self.embedding_service.generate_embedding(query)
        results: List[Dict[str, Any]] = []

        for record in self.in_memory_records:
            # Metadata filtering check
            if metadata_filter:
                match = True
                for key, val in metadata_filter.items():
                    if record["metadata"].get(key) != val:
                        match = False
                        break
                if not match:
                    continue

            sim_score = self.embedding_service.cosine_similarity(query_vec, record["embedding"])
            results.append({
                "chunk_id": record["chunk_id"],
                "document_id": record["document_id"],
                "text": record["text"],
                "page_number": record["page_number"],
                "similarity_score": round(sim_score, 4),
                "metadata": record["metadata"]
            })

        # Sort descending by similarity score
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

    def clear(self):
        """Clears all stored records."""
        self.in_memory_records = []
