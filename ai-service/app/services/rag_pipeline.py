import time
from typing import List, Dict, Any, Optional, Tuple
from .vector_store import VectorStore
from .llm_provider import BaseLLMProvider, get_llm_provider

class RAGPipeline:
    """
    Baseline Retrieval-Augmented Generation (RAG) Pipeline.
    Orchestrates Query Embedding -> Top-K Vector Search -> Grounded Prompt Construction -> LLM Generation -> Citations formatting.
    """
    
    def __init__(self, vector_store: VectorStore = None, llm_provider: BaseLLMProvider = None):
        self.vector_store = vector_store or VectorStore()
        self._llm_provider = llm_provider

    @property
    def llm_provider(self) -> BaseLLMProvider:
        if self._llm_provider:
            return self._llm_provider
        return get_llm_provider()

    def construct_grounded_prompt(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> Tuple[str, str]:
        """Constructs a strict system prompt and user prompt incorporating retrieved context."""
        system_prompt = (
            "You are Cognivault's Enterprise AI Assistant.\n"
            "Answer the user's question STRICTLY based on the provided context below.\n"
            "If the provided context does not contain enough information to answer accurately, "
            "respond: 'I cannot find relevant information in the provided document repository.'\n"
            "Do NOT make up facts or invent details outside the context."
        )

        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks, start=1):
            source_name = chunk.get("metadata", {}).get("filename") or chunk.get("document_id") or "Document"
            page_num = chunk.get("page_number", 1)
            chunk_id = chunk.get("chunk_id", f"chunk_{idx}")
            text_content = chunk.get("text", "").strip()

            block = (
                f"[Source {idx}: {source_name} | Page: {page_num} | ID: {chunk_id}]\n"
                f"{text_content}"
            )
            context_blocks.append(block)

        formatted_context = "\n\n".join(context_blocks)
        user_prompt = f"RETRIEVED CONTEXT:\n{formatted_context}\n\nUSER QUESTION: {query}"
        
        return system_prompt, user_prompt

    def query(
        self,
        query_text: str,
        top_k: int = 3,
        metadata_filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Executes full end-to-end RAG pipeline and attaches source citations."""
        start_time = time.time()
        
        # 1. Top-K Vector Search
        retrieved_chunks = self.vector_store.search_similarity(
            query=query_text,
            top_k=top_k,
            metadata_filter=metadata_filter
        )

        # 2. Extract Citations
        citations = []
        for chunk in retrieved_chunks:
            source = chunk.get("metadata", {}).get("filename") or chunk.get("document_id") or "Unknown"
            citations.append({
                "source": source,
                "page": chunk.get("page_number", 1),
                "chunk_id": chunk.get("chunk_id"),
                "similarity_score": chunk.get("similarity_score"),
                "snippet": chunk.get("text", "")[:150] + ("..." if len(chunk.get("text", "")) > 150 else "")
            })

        # 3. Handle Empty Retrieval
        if not retrieved_chunks:
            return {
                "query": query_text,
                "answer": "I cannot find relevant information in the provided document repository.",
                "citations": [],
                "retrieved_chunks_count": 0,
                "latency_ms": round((time.time() - start_time) * 1000, 2)
            }

        # 4. Construct Grounded Prompt & Generate Answer
        system_prompt, user_prompt = self.construct_grounded_prompt(query_text, retrieved_chunks)
        llm_response = self.llm_provider.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.2 # Low temperature for factual precision
        )

        total_latency_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "query": query_text,
            "answer": llm_response["content"],
            "citations": citations,
            "retrieved_chunks_count": len(retrieved_chunks),
            "retrieved_chunks": retrieved_chunks, # Inspectable ground-truth chunks
            "usage": llm_response.get("usage", {}),
            "latency_ms": total_latency_ms
        }
