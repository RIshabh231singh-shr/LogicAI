# GenAI Observability & Request Tracing

## Overview

Cognivault provides full end-to-end telemetry and observability for every GenAI request, tracking step latencies, token consumption, retrieval traces, and estimated USD cost.

## End-to-End Trace Request Flow

```
Request (POST /api/v1/rag/query)
       │
   1.  │ TelemetryTracer assigns trace_id (e.g. trace_a1b2c3d4e5f6)
       ▼
   2.  │ Log Step: INITIATE_REQUEST (0.0 ms)
       ▼
   3.  │ Log Step: VECTOR_SEARCH_RETRIEVAL (1.2 ms) ──► Record Retrieval Trace
       ▼
   4.  │ Log Step: LLM_GENERATION_COMPLETE (12.4 ms) ──► Record Token Usage & Cost
       ▼
   5.  │ End Trace: Calculate Total Latency (13.6 ms)
```

## Telemetry Report Schema

```json
{
  "trace_id": "trace_a1b2c3d4e5f6",
  "path": "/api/v1/rag/query",
  "prompt": "Telemetry tracking policy",
  "status": "SUCCESS",
  "total_latency_ms": 13.6,
  "llm_usage": {
    "prompt_tokens": 120,
    "completion_tokens": 85,
    "total_tokens": 205,
    "model_name": "mock-llm-engine"
  },
  "estimated_cost_usd": 0.000188,
  "retrieval_trace": [
    {
      "chunk_id": "obs_chunk_1",
      "source": "obs.pdf",
      "similarity_score": 0.8842
    }
  ],
  "steps": [
    { "step_index": 1, "step_name": "START_RAG_PIPELINE", "elapsed_ms": 0.1 },
    { "step_index": 2, "step_name": "RETRIEVAL_AND_GENERATION_COMPLETE", "elapsed_ms": 13.5 }
  ]
}
```
