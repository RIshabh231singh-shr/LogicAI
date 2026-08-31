# LogicAI — Enterprise Project Intelligence & Operations Platform

> **Repository:** [https://github.com/RIshabh231singh-shr/LogicAI](https://github.com/RIshabh231singh-shr/LogicAI)

LogicAI is an AI-powered project and document intelligence platform that analyzes multiple project documents, extracts evidence-backed insights, supports comparison, and provides retrieval, evaluation, and observability capabilities.

Engineered from first principles, LogicAI combines end-to-end GenAI architecture, vector search math, agentic intent routing, multi-turn memory, security guardrails, automated evaluation, and telemetry observability into a clean, light-first enterprise workspace.

---

## 🏗️ System Architecture

LogicAI adopts a decoupled microservices architecture connecting a **Node.js Express API Gateway** with a high-performance **Python FastAPI GenAI Engine**, **PostgreSQL with `pgvector`**, and **Redis Semantic Cache**.

```
                           ┌───────────────────────────┐
                           │      LogicAI Workspace    │
                           │     (React + Tailwind)    │
                           └─────────────┬─────────────┘
                                         │ HTTP REST (Axios)
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
│   (Vector Store)    │                                   │    (<2ms hits)      │
└─────────────────────┘                                   └─────────────────────┘
```

---

## 🌟 Key Technical Features & Capabilities

### 1. **Project & Document Workspaces**
- Multi-project workspace management grouping specifications, RFCs, and policy documents.
- Drag-and-drop document upload with real-time Axios progress tracking.
- Interactive **3-column Document Viewer** connecting source pages directly to verified evidence findings.

### 2. **LLM Abstraction & Provider Lifecycle**
- Custom `BaseLLMProvider` abstraction supporting pluggable providers (`MockLLMProvider`, `OpenAI`, `Gemini Pro`).
- Native support for **Structured JSON Outputs**, token calculation, and latency tracking.

### 3. **Document Processing & Custom Chunking**
- Ingestion engine parsing PDF and plain text documents with page numbering and metadata.
- **Fixed-size Sliding Window Chunking** with configurable character overlap.
- **Sentence-boundary Chunking** preserving semantic sentence integrity.

### 4. **384-D Vector Embeddings & Vector Search**
- 384-dimensional normalized vector embedding service.
- **Cosine Similarity Math** calculated from first principles:
  $$\text{Cosine Similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|}$$
- **pgvector Relational Schema** with in-memory fallback and Top-$K$ retrieval.

### 5. **Hybrid RAG & Grounded Citations**
- Grounded System Prompting (*"Answer strictly based on retrieved context"*).
- Automatic citation extraction attaching document ID, page number, chunk ID, and exact snippet.
- Formatted citations (`architecture.pdf · p.12`) with clickable evidence inspection.

### 6. **Advanced Retrieval Engine**
- **Query Rewriting & Multi-Query Expansion** generating diverse retrieval variations.
- **Hybrid Sparse-Dense Search (BM25 + Vector)** using **Reciprocal Rank Fusion (RRF)**:
  $$\text{RRF\_Score}(d) = \sum_{m \in \text{methods}} \frac{1}{60 + \text{rank}_m(d)}$$
- **Cross-Encoder Reranking** re-scoring top candidates for precision alignment.

### 7. **Enterprise Tool Calling & Schema Selection**
- Tool Registry with JSON Schema definitions (`get_employee_details`, `get_leave_balance`, `search_company_policy`).
- **Pre-execution tool inspection endpoint** (`POST /api/v1/tools/process`) intercepting tool calls for human-in-the-loop auditability before execution.

### 8. **Agent Intent Router & State Machine**
- 4-way Intent Classification Routing:
  - `ROUTE_KNOWLEDGE`: RAG vector search.
  - `ROUTE_DATABASE`: Relational record lookup.
  - `ROUTE_TOOL`: Operational tool execution.
  - `ROUTE_UNSUPPORTED`: Safety rejection for injection/security threats.

### 9. **Conversational Memory & Context Resolution**
- Short-term session persistence resolving ambiguous pronouns (*"that"*, *"it"*) across multi-turn user dialogs.

### 10. **Security Guardrails & RBAC Authorization**
- **Prompt Injection & Jailbreak Scanner** rejecting malicious override attempts.
- **Role-Based Access Control (RBAC)** restricting document clearance levels (`guest`, `employee`, `hr_admin`, `admin`).
- **Output PII Redaction** sanitizing SSNs and credentials.

### 11. **Automated RAG Evaluation Benchmark**
- Quantitative benchmarking calculating **Context Precision**, **Context Recall**, **Faithfulness**, and **Answer Relevance** against standard datasets.

### 12. **GenAI Telemetry & Observability**
- Request trace IDs, step latency breakdowns, token consumption, and estimated USD cost tracking.
- Interactive trace inspection dialog for granular auditability.

### 13. **Semantic Caching & Production Resilience**
- Vector-based semantic response caching returning cached responses in **< 2ms** for queries with similarity $\ge 0.95$.

---

## 🧪 Master Test Suite

LogicAI includes **17 automated integration test suites** covering every component across Node.js and Python.

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

## 💻 Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

The light-first workspace will be accessible at `http://localhost:3000` (or `3001` if port 3000 is occupied).

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
├── frontend/                  # React + Tailwind Project Intelligence Workspace
│   ├── src/
│   │   ├── api/               # Centralized Axios API service layer
│   │   ├── components/        # Reusable UI & Layout components
│   │   ├── context/           # Workspace state & keyboard shortcuts
│   │   ├── pages/             # Workspaces (Overview, Projects, Documents, Analysis, etc.)
│   │   ├── App.jsx            # Lightweight 56-line root router
│   │   └── index.css          # Tailwind CSS design system
│   ├── public/                # Original LogicAI SVG logos and favicon
│   ├── tailwind.config.js     # Light-first workspace design tokens
│   └── vite.config.js         # Vite configuration with API proxies
├── docs/                      # Architectural & Educational Documentation
├── tests/                     # 17 Automated Integration Test Suites
│   └── run_all_tests.js       # Master test runner
├── docker-compose.yml         # Multi-container orchestration manifest
└── README.md                  # Master repository documentation
```
