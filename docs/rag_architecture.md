# Baseline Retrieval-Augmented Generation (RAG) Architecture

## Overview

RAG solves LLM hallucination and training cutoff limitations by fetching relevant context from an enterprise document store and injecting it directly into the prompt before response generation.

## RAG Flow Diagram

```
User Query ("What is the leave policy?")
       │
   1.  │ Generate Embedding Vector (d=384)
       ▼
   2.  │ Perform Top-K Similarity Search against pgvector Store
       ▼
   3.  │ Retrieve Top Chunks + Extract Metadata (Filename, Page Number, Chunk ID)
       ▼
   4.  │ Construct Grounded System & User Prompt
       │ ("Answer STRICTLY based on context. Do not invent facts.")
       ▼
   5.  │ Execute LLM Generation
       ▼
   6.  │ Return Formatted Response + Explicit Source Citations
```

## Grounding & Hallucination Prevention

To ensure strict factual accuracy, the RAG system prompt enforces:
1. **Strict Context Boundaries:** The LLM is prohibited from relying on pre-training parametric knowledge if contradicted by retrieved facts.
2. **Explicit Fallback:** If retrieved context does not contain the answer, the model explicitly responds with: *"I cannot find relevant information in the provided document repository."*

## Citation Payload Schema

```json
{
  "query": "What is the employee annual leave policy?",
  "answer": "Regular full-time employees accrue 20 annual leave days per year.",
  "citations": [
    {
      "source": "Employee_Handbook.pdf",
      "page": 24,
      "chunk_id": "handbook_leave_p24",
      "similarity_score": 0.8654,
      "snippet": "Employee Annual Leave Policy: Regular full-time employees accrue 20 annual leave days per year."
    }
  ],
  "retrieved_chunks_count": 1,
  "latency_ms": 12.5
}
```
