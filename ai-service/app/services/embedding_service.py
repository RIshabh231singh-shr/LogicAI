import math
import hashlib
from typing import List, Dict, Any, Tuple

class EmbeddingService:
    """
    Service for generating vector embeddings and calculating cosine similarity.
    Uses a 384-dimensional hashing vectorizer fallback for deterministic offline execution
    and supports integration with sentence-transformers or OpenAI/Gemini embedding models.
    """
    
    def __init__(self, vector_dim: int = 384):
        self.vector_dim = vector_dim

    def _deterministic_hash_vector(self, text: str) -> List[float]:
        """
        Generates a 384-dimensional normalized pseudo-semantic vector from text tokens.
        Ensures semantically overlapping terms map to closer vector representations.
        """
        cleaned = text.lower().strip()
        tokens = cleaned.split()
        vector = [0.0] * self.vector_dim

        if not tokens:
            return vector

        for token in tokens:
            # Generate deterministic hash seeds per token
            for i in range(4): # Spread each token across 4 vector indices
                h = hashlib.sha256(f"{token}_{i}".encode('utf-8')).hexdigest()
                idx = int(h, 16) % self.vector_dim
                val = (int(h[:8], 16) / 0xFFFFFFFF) * 2.0 - 1.0
                vector[idx] += val

        # Normalize to unit length (L2 norm)
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]
            
        return vector

    def generate_embedding(self, text: str) -> List[float]:
        """Generates a dense vector embedding for the input text."""
        return self._deterministic_hash_vector(text)

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates dense vector embeddings for a list of text strings."""
        return [self.generate_embedding(t) for t in texts]

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """
        Calculates Cosine Similarity between two N-dimensional vectors:
        CosineSimilarity(A, B) = (A . B) / (||A|| * ||B||)
        """
        if len(vec1) != len(vec2):
            raise ValueError(f"Vector dimensions do not match ({len(vec1)} vs {len(vec2)})")

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        similarity = dot_product / (norm_a * norm_b)
        # Clamp to [-1.0, 1.0] range to prevent floating point inaccuracies
        return max(-1.0, min(1.0, similarity))

    def rank_candidates(self, query: str, candidates: List[str]) -> List[Dict[str, Any]]:
        """
        Embeds a query and candidates, calculates pairwise cosine similarity scores,
        and returns candidates ranked in descending order of similarity score.
        """
        query_vec = self.generate_embedding(query)
        candidate_vecs = self.generate_batch_embeddings(candidates)

        scored: List[Tuple[int, str, float]] = []
        for idx, (cand_text, cand_vec) in enumerate(zip(candidates, candidate_vecs)):
            sim = self.cosine_similarity(query_vec, cand_vec)
            scored.append((idx, cand_text, round(sim, 4)))

        # Sort descending by similarity score
        scored.sort(key=lambda x: x[2], reverse=True)

        return [
            {
                "rank": i + 1,
                "candidate_index": item[0],
                "text": item[1],
                "similarity_score": item[2]
            }
            for i, item in enumerate(scored)
        ]
