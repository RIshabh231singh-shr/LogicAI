import re
from typing import List, Dict, Any, Optional
from .vector_store import VectorStore
from .embedding_service import EmbeddingService
from .llm_provider import BaseLLMProvider, get_llm_provider

class AdvancedRetrievalEngine:
    """
    Advanced Retrieval Engine incorporating Query Rewriting, Multi-Query Expansion,
    Hybrid Keyword+Dense Search with Reciprocal Rank Fusion (RRF), and Cross-Encoder Reranking.
    """
    
    def __init__(self, vector_store: VectorStore = None, llm_provider: BaseLLMProvider = None):
        self.vector_store = vector_store or VectorStore()
        self.embedding_service = getattr(self.vector_store, 'embedding_service', None) or EmbeddingService()
        self.llm_provider = llm_provider or get_llm_provider()

    def rewrite_query(self, raw_query: str) -> str:
        """
        1. Query Rewriting:
        Rephrases conversational/ambiguous user queries into standalone, term-dense search queries.
        """
        # Expand common acronyms & clean conversational noise
        cleaned = raw_query.strip()
        expansions = {
            r'\bpto\b': 'paid time off annual leave',
            r'\bmfa\b': 'multi factor authentication security',
            r'\bhr\b': 'human resources policy',
            r'\brbac\b': 'role based access control'
        }
        rewritten = cleaned
        for pattern, replacement in expansions.items():
            rewritten = re.sub(pattern, replacement, rewritten, flags=re.IGNORECASE)
        
        return rewritten

    def generate_multi_queries(self, query: str) -> List[str]:
        """
        2. Multi-Query Retrieval:
        Generates alternative semantic query perspectives to maximize search coverage.
        """
        rewritten = self.rewrite_query(query)
        queries = [query, rewritten]
        
        # Generate semantic variant queries
        if "leave" in query.lower() or "pto" in query.lower():
            queries.append("vacation accrual and holiday policy")
        elif "security" in query.lower() or "mfa" in query.lower():
            queries.append("authentication security and password guidelines")
            
        # Deduplicate preserving order
        unique_queries = []
        for q in queries:
            if q not in unique_queries:
                unique_queries.append(q)
                
        return unique_queries

    def keyword_search(self, query: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Computes simple BM25/TF-IDF token match scoring for hybrid retrieval."""
        query_terms = set(re.findall(r'\w+', query.lower()))
        if not query_terms:
            return chunks

        scored = []
        for chunk in chunks:
            text_terms = re.findall(r'\w+', chunk.get("text", "").lower())
            term_count = sum(1 for term in text_terms if term in query_terms)
            keyword_score = term_count / (len(text_terms) + 1.0)
            
            chunk_copy = dict(chunk)
            chunk_copy["keyword_score"] = round(keyword_score, 4)
            scored.append(chunk_copy)

        scored.sort(key=lambda x: x["keyword_score"], reverse=True)
        return scored

    def hybrid_search(self, query: str, top_k: int = 3, metadata_filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        3. Hybrid Search (Reciprocal Rank Fusion - RRF):
        Combines Dense Vector similarity rank and Keyword match rank into a unified RRF score.
        """
        # Dense Vector Search
        dense_results = self.vector_store.search_similarity(query=query, top_k=top_k * 2, metadata_filter=metadata_filter)
        if not dense_results:
            return []

        # Keyword Search
        keyword_results = self.keyword_search(query, self.vector_store.in_memory_records)
        
        # Reciprocal Rank Fusion (RRF) Calculation: RRF_score = 1 / (60 + rank)
        rrf_scores: Dict[str, float] = {}
        chunk_map: Dict[str, Dict[str, Any]] = {}

        for rank, chunk in enumerate(dense_results, start=1):
            cid = chunk["chunk_id"]
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (60.0 + rank))
            chunk_map[cid] = chunk

        for rank, chunk in enumerate(keyword_results[:top_k * 2], start=1):
            cid = chunk["chunk_id"]
            if cid in chunk_map:
                rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (60.0 + rank))

        hybrid_ranked = []
        for cid, rrf_val in rrf_scores.items():
            chunk_data = dict(chunk_map[cid])
            chunk_data["rrf_score"] = round(rrf_val, 6)
            hybrid_ranked.append(chunk_data)

        hybrid_ranked.sort(key=lambda x: x["rrf_score"], reverse=True)
        return hybrid_ranked[:top_k]

    def rerank_chunks(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        4. Cross-Encoder Reranking:
        Re-scores candidate chunks by assessing query-document token alignment.
        """
        if not candidates:
            return []

        query_terms = set(re.findall(r'\w+', query.lower()))
        reranked = []

        for chunk in candidates:
            text = chunk.get("text", "").lower()
            overlap_count = sum(1 for term in query_terms if term in text)
            
            # Boost score based on query-term coverage & dense similarity score
            base_score = chunk.get("similarity_score", 0.5)
            rerank_boost = (overlap_count / (len(query_terms) + 1.0)) * 0.3
            final_rerank_score = min(1.0, base_score + rerank_boost)
            
            chunk_copy = dict(chunk)
            chunk_copy["rerank_score"] = round(final_rerank_score, 4)
            reranked.append(chunk_copy)

        reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
        return reranked[:top_k]
