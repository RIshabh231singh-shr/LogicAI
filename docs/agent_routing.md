# Agent Architecture & Intent Routing

## Overview

Cognivault implements a lightweight, deterministic Agent Router that evaluates user query intent and dynamically dispatches requests across 4 operational routes.

## Operational Route Taxonomy

```
                     User Request
                          │
                          ▼
                  Agent Intent Router
                          │
     ┌────────────────────┼────────────────────┬────────────────────┐
     ▼                    ▼                    ▼                    ▼
ROUTE_KNOWLEDGE     ROUTE_DATABASE         ROUTE_TOOL        ROUTE_UNSUPPORTED
(RAG Vector Store)  (Employee SQL DB)   (Policy Search)    (Security Rejection)
```

## Architectural Differences

| Pattern | Description | Statefulness | Best For |
| :--- | :--- | :---: | :--- |
| **LLM** | Static completion from pre-trained weights. | None | General text generation, summarizing. |
| **RAG** | Static retrieval -> context injection -> completion. | Minimal | Document Q&A, knowledge base search. |
| **Tool Calling** | Single-step function execution against DB/API. | Single-step | Fetching live balances, user lookup. |
| **Agent** | Autonomous perception, state loop, and multi-route dispatch. | Full State History | Multi-step workflows, enterprise request routing. |

## Agent State Schema

```json
{
  "query": "Show me employee details for E101",
  "selected_route": "ROUTE_DATABASE",
  "confidence": 0.95,
  "reasoning": "Query requests specific relational employee record lookup.",
  "step_history": [
    {
      "step_index": 1,
      "action": "INTENT_CLASSIFICATION",
      "details": { "route": "ROUTE_DATABASE", "confidence": 0.95 }
    },
    {
      "step_index": 2,
      "action": "TOOL_SELECTION",
      "details": { "tool_name": "get_employee_details", "tool_args": { "employee_id": "E101" } }
    },
    {
      "step_index": 3,
      "action": "TOOL_EXECUTION",
      "details": { "output": { "success": true, "data": { "name": "Rishabh Singh" } } }
    }
  ],
  "final_answer": "Agent Action [get_employee_details]: {'success': True, 'data': {'name': 'Rishabh Singh', ...}}",
  "total_latency_ms": 1.25
}
```
