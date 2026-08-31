# PostgreSQL + pgvector Vector Database Architecture

## Overview

Cognivault utilizes PostgreSQL enhanced with the `pgvector` extension for production vector storage, enabling unified relational metadata filtering alongside high-dimensional embedding similarity search.

## Relational Vector Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document Chunks Table
CREATE TABLE IF NOT EXISTS document_chunks (
    chunk_id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    chunk_index INT NOT NULL,
    text TEXT NOT NULL,
    embedding vector(384) NOT NULL,
    page_number INT DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Vector Index for High-Speed Cosine Distance Retrieval
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

## Distance Operators in pgvector

| Operator | Distance Metric | Description |
| :---: | :--- | :--- |
| `<=>` | **Cosine Distance** | $1 - \text{CosineSimilarity}$. Best for text embeddings. |
| `<->` | **L2 (Euclidean) Distance** | Straight line spatial distance. |
| `<#>` | **Negative Dot Product** | Inner product distance for normalized vectors. |

## Top-K Retrieval Query Example

```sql
SELECT 
    chunk_id,
    document_id,
    text,
    page_number,
    metadata,
    1 - (embedding <=> $1::vector) AS similarity_score
FROM document_chunks
WHERE metadata->>'category' = 'hr_policy'
ORDER BY embedding <=> $1::vector
LIMIT 3;
```
