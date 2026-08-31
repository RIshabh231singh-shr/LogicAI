# Document Chunking and Segmentation Guide

## Overview

Chunking is the process of breaking down large document texts into smaller, semantically coherent segments suitable for embedding generation, vector indexing, and LLM context insertion.

## Why Chunking is Critical for GenAI Architectures

1. **Token Limit Constraints:** LLMs operate within a finite context window (e.g., 8k, 32k, 128k tokens). Passing an entire 100-page document exceeds context capacity and causes truncation.
2. **Retrieval Precision:** Embedding an entire book into a single vector averages out specific details. Chunking creates focused vectors that match precise search queries.
3. **Cost & Latency Optimization:** Smaller relevant context chunks reduce API prompt token consumption and generation latency.

## Chunking Strategies

### 1. Fixed-Size Chunking with Overlap
- **Mechanics:** Splits text into uniform character or token blocks (e.g., 500 chars) with a sliding window overlap (e.g., 100 chars).
- **Purpose of Overlap:** Overlap ensures key concepts or sentences spanning across a chunk boundary are preserved in both adjacent chunks, preventing context loss.
- **Tradeoffs:** Fast and predictable, but may slice sentences in half.

### 2. Sentence-Boundary Chunking
- **Mechanics:** Splits text along natural sentence endings (`.`, `!`, `?`) up to a maximum character limit.
- **Tradeoffs:** Preserves linguistic coherence, but chunk lengths vary dynamically based on sentence structure.

## Inspectable Chunk Schema

```json
{
  "chunk_id": "doc_sec_001_chunk_0",
  "chunk_index": 0,
  "document_id": "doc_sec_001",
  "start_char": 0,
  "end_char": 150,
  "character_count": 150,
  "text": "Cognivault Enterprise Platform Architecture Document. Section 1: Security and Access Control. All API endpoints require JWT authentication.",
  "metadata": {
    "page": 1,
    "category": "architecture"
  }
}
```
