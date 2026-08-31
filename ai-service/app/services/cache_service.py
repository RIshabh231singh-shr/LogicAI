import time
from typing import Dict, Any, Optional, List, Tuple
from .embedding_service import EmbeddingService

class SemanticCache:
    """In-Memory and Redis-ready Semantic Cache storing query vector embeddings and cached LLM responses."""
    
    def __init__(self, similarity_threshold: float = 0.95, embedding_service: EmbeddingService = None):
        self.similarity_threshold = similarity_threshold
        self.embedding_service = embedding_service or EmbeddingService()
        self.cache_entries: List[Dict[str, Any]] = []

    def get(self, query: str) -> Tuple[Optional[Dict[str, Any]], Optional[float]]:
        """
        Calculates vector embedding of query and searches cache for semantic matches above threshold.
        Returns: (cached_response_data, similarity_score)
        """
        if not self.cache_entries:
            return None, None

        query_vec = self.embedding_service.generate_embedding(query)
        best_match = None
        highest_score = -1.0

        for entry in self.cache_entries:
            score = self.embedding_service.cosine_similarity(query_vec, entry["query_vector"])
            if score > highest_score:
                highest_score = score
                best_match = entry

        if best_match and highest_score >= self.similarity_threshold:
            return best_match["response_data"], round(highest_score, 4)

        return None, None

    def set(self, query: str, response_data: Dict[str, Any]):
        """Caches query vector and response payload."""
        query_vec = self.embedding_service.generate_embedding(query)
        self.cache_entries.append({
            "query": query,
            "query_vector": query_vec,
            "response_data": response_data,
            "cached_at": time.time()
        })
        if len(self.cache_entries) > 200:
            self.cache_entries.pop(0)

    def clear(self):
        """Flushes semantic cache."""
        self.cache_entries = []
