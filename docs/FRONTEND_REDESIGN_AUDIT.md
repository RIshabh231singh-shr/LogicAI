# LOGICAI — FRONTEND REDESIGN AUDIT

**Date:** September 1, 2026  
**Auditor:** Senior Software & Systems Engineer  
**Repository:** `https://github.com/RIshabh231singh-shr/LogicAI`  
**Purpose:** Comprehensive baseline audit of current full-stack architecture, existing frontend implementation, API surface, styling system, branding, and technical risks prior to UI/UX overhaul.

---

## 1.1 Repository Structure

LogicAI is structured as a multi-service monorepo orchestrating an Express Node.js API Gateway, a Python FastAPI AI engine, vector/relational databases, automated test suites, documentation, and a React Vite frontend workspace.

```text
LogicAI/
├── .env.example                     # Unified environment variable specification
├── .gitignore                       # Git exclusion rules
├── README.md                        # Project root documentation
├── docker-compose.yml               # Multi-service container orchestration
├── backend/                         # Node.js Express API Gateway
│   ├── Dockerfile                   # Gateway container build specification
│   ├── package.json                 # Backend dependencies (express, cors, multer, dotenv)
│   └── src/
│       ├── index.js                 # API route definitions and gateway proxy logic
│       └── services/
│           └── aiServiceClient.js   # HTTP proxy methods dispatching to Python AI service
├── ai-service/                      # Python FastAPI GenAI Engine
│   ├── Dockerfile                   # AI service container build specification
│   ├── requirements.txt             # Python dependencies (fastapi, uvicorn, pydantic, etc.)
│   └── app/
│       ├── main.py                  # FastAPI application routes & dependency wiring
│       └── services/                # Core engines (RAG, Chunker, Router, Embeddings, etc.)
│           ├── advanced_retrieval.py # Hybrid RRF, query rewriting, reranking
│           ├── agent_router.py      # State machine intent classification & routing
│           ├── cache_service.py     # Vector semantic caching layer
│           ├── chunker.py           # Fixed and sentence sliding-window chunking
│           ├── document_processor.py# PDF, TXT, DOCX text extraction
│           ├── embedding_service.py # Vector embedding generation & similarity
│           ├── evaluator.py         # Faithfulness, precision, recall evaluation
│           ├── guardrails.py        # Prompt injection, PII redaction, RBAC security
│           ├── llm_provider.py      # Mock engine and Gemini Pro provider abstraction
│           ├── memory_service.py    # Multi-turn sliding context window
│           ├── observability.py     # Latency, token usage, cost telemetry tracing
│           ├── rag_pipeline.py      # Vector retrieval + citation generation
│           ├── tool_registry.py     # Tool definitions, schemas, and execution
│           └── vector_store.py      # In-memory FAISS fallback & pgvector storage
├── frontend/                        # React Frontend Application
│   ├── index.html                   # HTML entry point (SEO metadata, font imports)
│   ├── package.json                 # Frontend dependencies (react, react-dom, lucide-react, vite)
│   ├── vite.config.js               # Vite configuration with proxy to port 5000
│   └── src/
│       ├── main.jsx                 # React DOM mount point
│       ├── App.jsx                  # Single-file component holding all application UI & logic
│       └── index.css                # Monolithic vanilla CSS file (dark glassmorphism)
├── docs/                            # Technical architecture documentation
│   ├── advanced_retrieval.md
│   ├── agent_routing.md
│   ├── ai_evaluation.md
│   ├── ai_observability.md
│   ├── architecture.md
│   ├── chunking_guide.md
│   ├── conversational_memory.md
│   ├── docker_deployment.md
│   ├── embeddings_guide.md
│   ├── llm_lifecycle.md
│   ├── production_features.md
│   ├── security_guardrails.md
│   ├── tool_calling.md
│   └── vector_database.md
└── tests/                           # Master integration test suites
    ├── run_all_tests.js             # Master test orchestrator (17 suites)
    ├── datasets/
    │   └── rag_eval_dataset.json    # Ground-truth evaluation dataset
    └── test_*.js / test_*.py        # Comprehensive unit and integration test scripts
```

---

## 1.2 Frontend Stack

### Actual Installed Stack

* **React Version:** `18.2.0` (`react`, `react-dom`)
* **Build Tool:** Vite `5.1.6` (`@vitejs/plugin-react` `4.2.1`)
* **Routing:** **None**. Currently, navigation is achieved entirely via internal React state (`activeTab` with IDs `'dashboard'`, `'ingestion'`, `'rag'`, `'agent'`, `'security'`, `'telemetry'`). URLs do not reflect current workspace location.
* **Styling:** Custom monolithic vanilla CSS (`frontend/src/index.css`, ~600 lines) with dark-mode glassmorphic cards, radiant glows, and neon status badges. **Tailwind CSS is NOT installed.**
* **Component Libraries:** None. Raw HTML elements (`<div>`, `<button>`, `<input>`, `<textarea>`) styled with utility classes.
* **Icon Library:** `lucide-react` (`^0.344.0`).
* **State Management:** Local `useState`, `useEffect`, and `useRef` inside a single file. No global context or external state store.
* **Form Handling:** Uncontrolled and controlled inputs directly writing to local state.
* **HTTP/API Library:** Native `fetch()` calls. No HTTP client abstractions, no interceptors, no centralized error handling. Hardcoded URLs pointing directly to `http://localhost:8000` mixed with `/api` relative paths.
* **PDF / Document Viewer:** None. Raw chunk text rendered inside text boxes.
* **Charting:** None. Static numeric cards and raw JSON `<pre>` blocks.
* **Testing:** No frontend unit/component tests configured.

### What Should Be Retained vs. Changed

| Technology Area | Current State | Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | React 18.2.0 | **RETAIN** | Modern, fast, and fully compatible with requirements. |
| **Build Tool** | Vite 5.1.6 | **RETAIN** | Extremely fast HMR, standard modern bundler. |
| **Styling** | Vanilla CSS (`index.css`) | **REPLACE WITH TAILWIND** | Mandatory requirement. Eliminates unmaintainable custom CSS and provides consistent design tokens. |
| **Architecture** | Single-file `App.jsx` (1,400+ lines) | **REFACTOR COMPLETELY** | Decompose into modular `pages/`, `components/layout/`, `components/ui/`, `api/`, and `hooks/`. |
| **HTTP Client** | Native `fetch()` | **REPLACE WITH AXIOS** | Mandatory requirement. Centralize baseURL, interceptors, error boundaries, and timeouts. |
| **Icons** | `lucide-react` | **RETAIN** | Professional, clean, and comprehensive icon system. |
| **Routing** | Component state switching | **REFINE / STRUCTURAL** | Map clean, declarative page components with bookmarkable state and breadcrumb navigation. |

---

## 1.3 Existing Routes & Workspace Views

Because the application currently runs as a single-page state machine, the "routes" are virtual tabs rendered in `App.jsx`:

| Virtual View / Route | Purpose | Components in Current Code | API Dependencies | Problems |
| :--- | :--- | :--- | :--- | :--- |
| `overview` (`dashboard`) | Platform overview & tech showcase | `DashboardTab` (embedded in `App.jsx`) | `/health`, `AI: /health` | Displays backend architecture cards and tech stack instead of a user-centric project workspace. Fake health badges. |
| `ingestion` | Text & Document Chunking | `IngestionTab` (embedded in `App.jsx`) | `POST http://localhost:8000/api/v1/documents/chunk`<br>`POST http://localhost:8000/api/v1/vector/store` | Bypasses Node Gateway; raw character count inputs; no document drag-and-drop; no file upload UX; no project association. |
| `rag` | RAG & Hybrid Vector Search | `RAGTab` (embedded in `App.jsx`) | `POST http://localhost:8000/api/v1/rag/query`<br>`POST http://localhost:8000/api/v1/retrieval/advanced` | Direct backend bypass; raw JSON score dump; citations only show raw chunk IDs (`chunk_id: rag_001`) instead of file and page citations. |
| `agent` | Agent Intent Loop & Chat | `AgentTab` (embedded in `App.jsx`) | `POST http://localhost:8000/api/v1/agent/run`<br>`POST http://localhost:8000/api/v1/memory/chat` | Hardcoded sample queries; chat window lacks markdown formatting; state machine output is a raw JSON dump. |
| `security` | Guardrails & Injection Test | `SecurityTab` (embedded in `App.jsx`) | `POST http://localhost:8000/api/v1/security/guard` | Test vector input form that dumps raw HTTP 403 JSON payloads; overly dramatic red neon design. |
| `telemetry` | Observability & Traces | `TelemetryTab` (embedded in `App.jsx`) | `GET http://localhost:8000/api/v1/telemetry/traces`<br>`POST http://localhost:8000/api/v1/evaluation/answer`<br>`POST http://localhost:8000/api/v1/cache/lookup` | Raw JSON trace dump; no search/filter for traces; mixed mock evaluation endpoints. |

---

## 1.4 Existing Components Audit

Currently, almost all components are declared anonymously or inline within `frontend/src/App.jsx`.

| Component / Function | Classification | Analysis & Recommended Action |
| :--- | :--- | :--- |
| `AppShell` / `App` | **REFACTOR** | Strip out all business logic, local tab state, and embedded page declarations. Make `App.jsx` a thin orchestrator. |
| `Sidebar` | **REFACTOR** | Extract into `components/layout/Sidebar.jsx`. Replace dark neon aesthetic with clean, structured light/neutral workspace navigation. |
| `Topbar` | **REFACTOR** | Extract into `components/layout/Topbar.jsx`. Remove decorative "v1.0.0 Enterprise" pills; add search, breadcrumbs, and user context. |
| `StatusDot` | **KEEP / REFINE** | Move to `components/ui/StatusDot.jsx` styled with Tailwind. |
| `EmptyState` | **REPLACE** | Replace with a robust, accessible `components/ui/EmptyState.jsx` with customizable title, description, and action button. |
| `SpinBtn` | **REPLACE** | Replace with a proper `components/ui/Button.jsx` supporting variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), sizes (`sm`, `md`, `lg`), and loading states. |
| `CardIcon` | **REMOVE** | Remove neon colored rounded squares; replace with subtle icons integrated into headers. |
| `JsonBlock` | **REFINE** | Extract into `components/ui/JsonBlock.jsx` with copy-to-clipboard functionality and collapsible tree support. |
| `IngestionTab` | **REPLACE** | Replace with `pages/Documents/` featuring drag-and-drop file upload, document list table, and document details drawer. |
| `RAGTab` | **REPLACE** | Replace with `pages/Analysis/` featuring an evidence-backed intelligence workspace with clear citations and findings. |
| `AgentTab` | **REPLACE** | Replace with clean `pages/Projects/` and `pages/Analysis/` agent operations. |
| `SecurityTab` | **REPLACE** | Replace with `pages/Settings/SecuritySettings.jsx` or a restrained Security workspace. |
| `TelemetryTab` | **REPLACE** | Replace with `pages/Observability/` featuring a clean request trace table, latency filters, and detail inspection drawers. |

---

## 1.5 API Audit

### Current Frontend API Calls Inspection

| Feature | Endpoint | Method | Request Payload | Response Schema | Issues in Current Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Health** | `/api/health` | GET | None | `{ status: 'ok' }` | Uses `fetch('/api/health')` without timeout or error interceptors. |
| **AI Service Health** | `http://localhost:8000/health` | GET | None | `{ status: 'ok' }` | **Hardcoded direct AI port.** Bypasses proxy. |
| **Document Chunking** | `http://localhost:8000/api/v1/documents/chunk` | POST | `{ text, chunk_size, chunk_overlap }` | `{ success, chunk_count, chunks: [] }` | Hardcoded URL. Node Gateway has `/api/documents/chunk` which is ignored. |
| **Vector Store** | `http://localhost:8000/api/v1/vector/store` | POST | `{ chunks: [] }` | `{ success, stored_count }` | Hardcoded URL. Node Gateway has `/api/vector/store` which is ignored. |
| **RAG Query** | `http://localhost:8000/api/v1/rag/query` | POST | `{ query, top_k }` | `{ success, data: { answer, citations: [] }, trace_id }` | Hardcoded URL. Citations are poorly mapped to raw chunk IDs. |
| **Advanced Retrieval** | `http://localhost:8000/api/v1/retrieval/advanced` | POST | `{ query, top_k }` | `{ success, chunks: [] }` | Hardcoded URL. Inconsistent payload handling. |
| **Agent Execution** | `http://localhost:8000/api/v1/agent/run` | POST | `{ query }` | `{ success, data: { selected_route, step_history, final_answer } }` | Hardcoded URL. No retry logic or request cancellation. |
| **Memory Chat** | `http://localhost:8000/api/v1/memory/chat` | POST | `{ session_id, prompt }` | `{ success, response, history: [] }` | Field name mismatch in current `App.jsx` (`message` sent vs `prompt` expected). |
| **Guardrails** | `http://localhost:8000/api/v1/security/guard` | POST | `{ prompt, user_role, doc_clearance }` | `{ success, guardrail: {} }` or HTTP 403 `{ detail: {} }` | Hardcoded URL. Error handling catches all exceptions and fakes a mock 403 payload. |
| **Telemetry Traces** | `http://localhost:8000/api/v1/telemetry/traces` | GET | None | `{ success, trace_count, total_tokens_consumed, total_cost_usd, traces: [] }` | Hardcoded URL. No pagination or sorting. |
| **Evaluation** | `http://localhost:8000/api/v1/evaluation/answer` | POST | `{ query, answer, context }` | Endpoint in `App.jsx` points to nonexistent `/api/v1/evaluation/answer` (AI service actually exposes `POST /api/v1/eval/run`). |

### API Client Architecture Deficiencies

1. **No Centralized Client:** Every component constructs raw `fetch()` strings.
2. **Hardcoded URLs:** Direct calls to `http://localhost:8000` bypass the Vite proxy and Node.js gateway.
3. **No Request Interceptors:** Authentication headers cannot be injected globally.
4. **No Unified Error Handling:** 400, 401, 403, 404, 500, and network drops are handled ad-hoc or unhandled.
5. **No Upload Progress Tracking:** Native `fetch()` does not support upload progress monitoring for large documents.

---

## 1.6 Backend Capability Audit

The backend architecture provides a rich suite of capabilities across both the Node.js Express Gateway and the Python FastAPI AI Service:

| Capability Domain | Backend Endpoints Available | Current UI Coverage | Opportunities for Workspace Redesign |
| :--- | :--- | :--- | :--- |
| **Document Ingestion & Parsing** | `POST /api/documents/upload`<br>`POST /api/v1/documents/ingest` | ❌ None (only raw text input) | Support real PDF, DOCX, and TXT file uploads via multipart form with progress tracking. |
| **Sliding-Window Chunking** | `POST /api/documents/chunk`<br>`POST /api/v1/documents/chunk` | ⚠️ Raw text only | Visual document chunk viewer displaying chunk boundaries, tokens, and metadata. |
| **Vector Storage & Embeddings** | `POST /api/embeddings/generate`<br>`POST /api/vector/store`<br>`POST /api/vector/search` | ⚠️ Invisible background call | Document indexing status indicator (Indexed, Processing, Vectorized). |
| **Hybrid RAG & Citations** | `POST /api/rag/query`<br>`POST /api/v1/rag/query`<br>`POST /api/v1/retrieval/hybrid` | ⚠️ Generic answer box | Interactive document viewer with side-by-side evidence inspection, page references, and snippet highlights. |
| **Advanced Query Expansion & Reranking** | `POST /api/v1/retrieval/rewrite`<br>`POST /api/v1/retrieval/multi-query`<br>`POST /api/v1/retrieval/rerank` | ❌ Not exposed | Query analysis breakdown showing rewritten intent and multi-query expansion terms. |
| **Tool Calling & Agent State Machine** | `GET /api/v1/tools/list`<br>`POST /api/v1/tools/execute`<br>`POST /api/v1/agent/run` | ⚠️ Raw JSON timeline | Structured action cards showing tool invocations, parameters, and outputs cleanly. |
| **Conversational Memory** | `POST /api/v1/memory/chat` | ⚠️ Basic chat container | Persistent multi-turn document research assistant with session context awareness. |
| **Security & Guardrails** | `POST /api/v1/security/guard` | ⚠️ Threat attack test form | Security policy configuration & audit log of prompt rejections and PII redactions. |
| **Evaluation Benchmark** | `POST /api/v1/eval/run` | ❌ Broken endpoint in UI | Quantitative evaluation dashboard (Faithfulness, Precision, Recall, Relevance scores). |
| **Telemetry & Observability** | `GET /api/v1/telemetry/traces` | ⚠️ Raw JSON dump | Filterable request trace log with latency, token usage, and cost tracking. |
| **Semantic Response Caching** | `POST /api/v1/cache/chat` | ⚠️ Basic lookup button | Sub-millisecond response indicators showing cache hits vs LLM generation. |

---

## 1.7 Current UI/UX Audit

An honest review of the existing UI (as captured in browser sessions and screenshots) reveals significant design and architectural deficiencies:

1. **Overly Dark & Heavy Environment:** The current UI uses deep near-black backgrounds (`#04060d`, `#070b14`) with aggressive neon blue, violet, and cyan glows. It resembles a futuristic gamer dashboard rather than a professional enterprise product.
2. **Excessive Information Density:** The Overview page lists architectural components, microservice diagrams, server ports, and technology stacks. A document intelligence workspace should focus on **projects, documents, findings, and analysis**.
3. **Card Overuse:** Almost every paragraph and heading is encased in a separate glassmorphic card with its own border and shadow. This creates severe visual clutter.
4. **Neon Badges Everywhere:** Dozens of colored pills (`badge-emerald`, `badge-cyan`, `badge-violet`, `badge-rose`) compete for attention without clear semantic hierarchy.
5. **No Project-Centric Workflow:** The application treats documents as isolated snippets of pasted text rather than organizing work around structured **Projects** containing multiple documents, analyses, and comparative insights.
6. **No Real Document Upload:** Users cannot upload actual PDF or DOCX files from their computers; they are forced to type or paste text into a `<textarea>`.
7. **Raw Technical Dumps:** The UI repeatedly dumps raw JSON strings (`JSON.stringify(..., null, 2)`) inside `<pre>` blocks, exposing implementation details rather than user-facing data.
8. **Lack of Whitespace:** Elements are crammed together with tight paddings and heavy borders, causing cognitive fatigue.

---

## 1.8 Branding Audit

A search across all repository files reveals inconsistent branding between `Cognivault` (from previous iterations) and `LogicAI`:

* **`frontend/index.html`:** Title is `CogniVault — Enterprise GenAI Platform`, description mentions `CogniVault`.
* **`frontend/src/App.jsx`:** Multiple UI labels: `CogniVault Platform Overview`, `CogniVault` in sidebar logo and topbar.
* **`frontend/package.json`:** `"name": "cognivault-frontend"`.
* **`frontend/README.md`:** Refers to Cognivault.
* **`backend/package.json`:** `"name": "cognivault-backend"`.
* **`docker-compose.yml`:** Container names (`cognivault-postgres`, `cognivault-ai-service`, etc.) and database credentials.

### Branding Resolution Strategy

* **Product-Facing Surfaces (MANDATORY):** All user-visible UI text, HTML `<title>`, meta descriptions, sidebar logos, navigation labels, headers, breadcrumbs, toasts, error messages, and documentation must display **LogicAI**.
* **Internal Identifiers:** Docker container names and environment variable secrets in `.env.example` that do not affect the user experience should be handled carefully to avoid breaking running containers or database scripts.

---

## 1.9 Dependency Audit

### Current `frontend/package.json` Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.6"
  }
}
```

### Dependencies to Add

1. **`tailwindcss`**, **`postcss`**, **`autoprefixer`**: Mandatory for implementing the professional, responsive, token-based design system.
2. **`axios`**: Mandatory for centralized HTTP requests, progress tracking, interceptors, and error handling.

### Dependencies to Retain

* `react`, `react-dom`
* `lucide-react`
* `vite`, `@vitejs/plugin-react`

---

## 1.10 Risk Assessment & Mitigation Plan

### High Risk

| Risk Item | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **API Contract Divergence** | Breaking working backend integrations during refactoring. | Keep Node.js Gateway `/api/*` and AI service `/api/v1/*` contracts intact. Create strongly-typed API client wrappers. |
| **File Upload Failures** | Document uploads failing due to multipart handling or memory limits. | Implement Axios multipart upload with progress tracking; test against both Node Gateway `/api/documents/upload` and AI service `/api/v1/documents/ingest`. |
| **App.jsx Bloat Regression** | Re-creating a single giant file. | Strictly enforce the modular architecture: `App.jsx` only houses the shell and top-level layout; pages and feature components live in separate directories. |

### Medium Risk

| Risk Item | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Tailwind Configuration Conflicts** | CSS collisions between legacy `index.css` and Tailwind utilities. | Replace custom CSS with standard Tailwind utilities; establish a clean `tailwind.config.js` with neutral color tokens. |
| **State Synchronization across Views** | Uploaded documents not reflecting in RAG/Analysis views. | Implement a shared Project / Document state provider or lightweight store so operations in one view update the workspace immediately. |

### Low Risk

| Risk Item | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Typography & Spacing Refinements** | Visual inconsistencies during migration. | Define standardized Tailwind typography and spacing scales matching Inter font rules. |
| **Branding Text Replacement** | Incomplete name updates in UI. | Global grep search for `Cognivault` and replace with `LogicAI` on all UI surfaces. |

---

## 1.11 Audit Conclusion & Next Steps

The repository possesses a powerful, highly capable backend engine with robust RAG, hybrid search, tools, agents, memory, guardrails, evaluation, and observability. However, the current frontend is an unwieldy single-file prototype with an overly dark, noisy, and technical aesthetic that does not serve real users.

Upon user approval of this audit, Phase 2 will commence:
1. Commit `docs: add repository audit for frontend redesign`.
2. Install and configure Tailwind CSS.
3. Establish centralized Axios client and API services.
4. Implement the clean, light-first LogicAI branding, custom SVG logo, and design tokens.
5. Decompose the application into a structured, modular component hierarchy centered around **Projects, Documents, Analysis, Citations, Evaluation, and Observability**.
