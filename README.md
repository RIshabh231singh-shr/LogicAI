# Cognivault — Enterprise GenAI Knowledge & Operations Platform

> **Portfolio Repository:** [https://github.com/RIshabh231singh-shr/LogicAI](https://github.com/RIshabh231singh-shr/LogicAI)

Cognivault is a production-grade, enterprise-oriented GenAI platform engineered from first principles to demonstrate end-to-end GenAI architecture, vector search math, agentic intent routing, multi-turn memory, security guardrails, automated evaluation, and telemetry observability.

---

## 🏗️ System Architecture

Cognivault adopts a microservices architecture connecting a **Node.js Express API Gateway** with a high-performance **Python FastAPI GenAI Engine**, **PostgreSQL with `pgvector`**, and **Redis Semantic Cache**.

```
                           ┌───────────────────────────┐
                           │      React Dashboard      │
                           │        (Frontend)         │
                           └─────────────┬─────────────┘
                                         │ HTTP REST / SSE
                                         ▼
                           ┌───────────────────────────┐
                           │   Node.js API Gateway     │
                           │   (Port 5000 / Auth / GW) │
                           └─────────────┬─────────────┘
                                         │ Inter-Service REST (Timeout 5s)
                                         ▼
                           ┌───────────────────────────┐
                           │   Python FastAPI Engine   │
                           │    (Port 8000 / GenAI)    │
                           └──────┬───────────┬────────┘
                                  │           │
           ┌──────────────────────┘           └──────────────────────┐
           ▼                                                         ▼
┌─────────────────────┐                                   ┌─────────────────────┐
│   PostgreSQL +      │                                   │    Redis Semantic   │
│   pgvector (HNSW)   │                                   │    Response Cache   │
└─────────────────────┘                                   └─────────────────────┘
```

---

## 🌟 Key Technical Features & Capabilities

### 1. **LLM Abstraction & Provider Lifecycle**
- Custom `BaseLLMProvider` abstraction supporting pluggable providers (`MockLLMProvider`, `OpenAI`, `Gemini`).
- Native support for **Structured JSON Outputs**, token heuristic calculation, and latency tracking.

### 2. **Document Processing & Custom Chunking**
- Ingestion engine parsing PDF and plain text documents with page numbering and metadata.
- **Fixed-size Sliding Window Chunking** with configurable character overlap.
- **Sentence-boundary Chunking** preserving semantic sentence integrity.

### 3. **384-D Vector Embeddings & Vector Search**
- 384-dimensional normalized vector embedding service.
- **Cosine Similarity Math** calculated from first principles:
  $$\text{Cosine Similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|}$$
- **pgvector Relational Schema** with in-memory fallback and Top-$K$ retrieval.

### 4. **Baseline RAG & Citations**
- Grounded System Prompting (*"Answer strictly based on retrieved context"*).
- Automatic citation extraction attaching document ID, page number, chunk ID, and exact snippet.

### 5. **Advanced Retrieval Engine**
- **Query Rewriting & Multi-Query Expansion** generating diverse retrieval variations.
- **Hybrid Sparse-Dense Search (BM25 + Vector)** using **Reciprocal Rank Fusion (RRF)**:
  $$\text{RRF\_Score}(d) = \sum_{m \in \text{methods}} \frac{1}{60 + \text{rank}_m(d)}$$
- **Cross-Encoder Reranking** re-scoring top candidates for precision alignment.

### 6. **Enterprise Tool Calling & Schema Selection**
- Tool Registry with JSON Schema definitions (`get_employee_details`, `get_leave_balance`, `search_company_policy`).
- **Pre-execution tool inspection endpoint** (`POST /api/v1/tools/process`) intercepting tool calls for human-in-the-loop auditability before execution.

### 7. **Agent Intent Router & State Machine**
- 4-way Intent Classification Routing:
  - `ROUTE_KNOWLEDGE`: RAG vector search.
  - `ROUTE_DATABASE`: Employee relational lookup.
  - `ROUTE_TOOL`: Operational policy search.
  - `ROUTE_UNSUPPORTED`: Safety rejection for injection/security threats.

### 8. **Conversational Memory & Context Resolution**
- Short-term session persistence resolving ambiguous pronouns (*"that"*, *"it"*) across multi-turn user dialogs.

### 9. **Security Guardrails & RBAC Authorization**
- **Prompt Injection & Jailbreak Scanner** rejecting malicious override attempts.
- **Role-Based Access Control (RBAC)** restricting document clearance levels (`guest`, `employee`, `hr_admin`, `admin`).
- **Output PII Redaction** sanitizing SSNs and Credit Card numbers.

### 10. **Automated RAG Evaluation Benchmark**
- Evaluates Context Precision, Context Recall, Faithfulness, and Answer Relevance against standard datasets.

### 11. **GenAI Telemetry & Observability**
- Request trace IDs, step latency breakdowns, token consumption, and estimated USD cost tracking.

### 12. **Semantic Caching & Production Resilience**
- Vector-based semantic response caching returning cached responses in **< 2ms** for queries with similarity $\ge 0.95$.

---

## 🧪 Master Test Suite

Cognivault includes **17 automated integration test suites** covering every component across Node.js and Python.

To run the complete master test suite:

```bash
node tests/run_all_tests.js
```

### Verified Test Suites:
1. `tests/test_backend_health.js` — Node backend health endpoint.
2. `tests/test_ai_health.py` — Python AI service health endpoint.
3. `tests/test_service_communication.js` — Node ↔ Python REST client.
4. `tests/test_llm_chat.js` — LLM chat & structured JSON generation.
5. `tests/test_document_ingestion.js` — PDF/text extraction & metadata.
6. `tests/test_chunking.js` — Sliding window overlap & sentence chunking.
7. `tests/test_embeddings.js` — 384-D vector embeddings & cosine similarity.
8. `tests/test_vector_search.js` — Top-K similarity search & metadata filters.
9. `tests/test_rag_pipeline.js` — Grounded RAG & citation extraction.
10. `tests/test_advanced_retrieval.js` — Query rewriting, Multi-query, Hybrid RRF, Reranker.
11. `tests/test_tool_calling.js` — Tool selection & pre-execution interception.
12. `tests/test_agent_routing.js` — 4-way intent router & state machine loop.
13. `tests/test_memory.js` — Multi-turn conversation context resolution.
14. `tests/test_guardrails.js` — Prompt injection defense & RBAC access rules.
15. `tests/test_evaluation.js` — Context precision, recall, faithfulness benchmark.
16. `tests/test_observability.js` — Trace logging, latency, token usage, cost tracking.
17. `tests/test_production_features.js` — Sub-2ms semantic response caching.

---

## 🐳 Docker Deployment

To launch the multi-container environment (PostgreSQL + pgvector, Redis, Python AI Service, Node Backend):

```bash
docker-compose up --build -d
```

---

## 📂 Project Structure

```
.
├── ai-service/                # Python FastAPI GenAI Engine
│   ├── app/
│   │   ├── main.py            # FastAPI API entry point & routes
│   │   └── services/          # Core GenAI services (RAG, Agent, Tools, Eval, etc.)
│   ├── Dockerfile
│   └── requirements.txt
├── backend/                   # Node.js Express API Gateway
│   ├── src/
│   │   ├── index.js           # Express entry point
│   │   └── services/          # Inter-service REST client
│   └── Dockerfile
├── frontend/                  # React Dashboard UI
│   ├── src/
│   │   ├── App.jsx            # Main operations dashboard component
│   │   └── index.css          # Glassmorphism dark design system
│   └── vite.config.js
├── docs/                      # Architectural & Educational Documentation
├── tests/                     # 17 Automated Integration Test Suites
│   └── run_all_tests.js       # Master test runner
├── docker-compose.yml         # Multi-container orchestration manifest
└── README.md                  # Master repository documentation
```
