# Advanced Retrieval Techniques in Cognivault

This document details the 5 advanced retrieval strategies implemented in Cognivault to maximize precision, recall, and relevance in enterprise RAG systems.

---

## 1. Metadata Filtering
- **Problem:** Unfiltered vector search across millions of enterprise chunks retrieves irrelevant content from wrong departments or outdated document versions.
- **Solution:** Apply hard relational constraints (`WHERE metadata->>'department' = 'engineering'`) before or during vector nearest-neighbor search.
- **Tradeoff:** Extremely fast and accurate, but requires clean metadata tagging during ingestion.

---

## 2. Query Rewriting
- **Problem:** Conversational or shortcut user queries (e.g. *"what's PTO?"*) perform poorly against formal vector embeddings.
- **Solution:** Rephrase and expand acronyms into rich domain terms (*"paid time off annual leave"*).
- **Tradeoff:** Minimal latency addition (~5-10ms), drastically improves vector matching.

---

## 3. Multi-Query Retrieval
- **Problem:** A single query perspective may fail to match document chunks written with different terminology.
- **Solution:** Generate $N$ semantic query variants, query the vector store for each, and union the retrieved results.
- **Tradeoff:** $N\times$ vector search requests, but offers maximum recall coverage.

---

## 4. Hybrid Search (BM25 + Dense Vector RRF)
- **Problem:** Vector search misses exact keyword matches (part numbers, error codes `ERR-404`), while keyword search misses semantic meaning.
- **Solution:** Reciprocal Rank Fusion (RRF) combining keyword rank and vector rank:
$$\text{RRF\_Score}(d) = \sum_{m \in \text{methods}} \frac{1}{60 + \text{rank}_m(d)}$$
- **Tradeoff:** Requires dual index evaluation, but provides state-of-the-art accuracy.

---

## 5. Cross-Encoder Reranking
- **Problem:** Bi-encoders calculate query and document vectors separately, missing fine-grained token-level cross-attention.
- **Solution:** Secondary reranker model evaluating full joint token interaction on Top-$N$ candidates to produce a refined final Top-$K$ ranking.
- **Tradeoff:** Higher CPU/GPU compute, so applied strictly to top candidate subsets.
