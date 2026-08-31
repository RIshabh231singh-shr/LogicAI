import uuid
import time
from typing import Dict, Any, List, Optional

# Standard Model Cost Estimates per 1,000 Tokens (USD)
MODEL_PRICING = {
    "mock-llm-engine": {"prompt": 0.0005, "completion": 0.0015},
    "gpt-4o-mini": {"prompt": 0.00015, "completion": 0.0006},
    "gemini-1.5-flash": {"prompt": 0.000075, "completion": 0.0003}
}

class TelemetryTracer:
    """Enterprise GenAI Observability Tracer tracking step latencies, token consumption, cost, and retrieval traces."""

    def __init__(self):
        self.active_traces: Dict[str, Dict[str, Any]] = {}
        self.completed_traces: List[Dict[str, Any]] = []

    def start_trace(self, path: str, prompt: str) -> str:
        """Starts a new request trace and assigns a unique trace_id."""
        trace_id = f"trace_{uuid.uuid4().hex[:12]}"
        self.active_traces[trace_id] = {
            "trace_id": trace_id,
            "path": path,
            "prompt": prompt,
            "start_time": time.time(),
            "steps": [],
            "llm_usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            "estimated_cost_usd": 0.0,
            "retrieval_trace": [],
            "status": "RUNNING"
        }
        return trace_id

    def log_step(self, trace_id: str, step_name: str, details: Optional[Dict[str, Any]] = None):
        """Logs an execution step with timestamp delta."""
        if trace_id not in self.active_traces:
            return
        
        trace = self.active_traces[trace_id]
        elapsed_ms = round((time.time() - trace["start_time"]) * 1000, 2)
        
        trace["steps"].append({
            "step_index": len(trace["steps"]) + 1,
            "step_name": step_name,
            "elapsed_ms": elapsed_ms,
            "details": details or {}
        })

    def record_llm_usage(
        self,
        trace_id: str,
        prompt_tokens: int,
        completion_tokens: int,
        model_name: str = "mock-llm-engine"
    ):
        """Records token usage and computes estimated USD cost."""
        if trace_id not in self.active_traces:
            return
        
        trace = self.active_traces[trace_id]
        total_tokens = prompt_tokens + completion_tokens
        
        pricing = MODEL_PRICING.get(model_name, MODEL_PRICING["mock-llm-engine"])
        cost = (prompt_tokens / 1000.0 * pricing["prompt"]) + (completion_tokens / 1000.0 * pricing["completion"])
        
        trace["llm_usage"] = {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "model_name": model_name
        }
        trace["estimated_cost_usd"] = round(cost, 6)

    def record_retrieval_trace(self, trace_id: str, retrieved_chunks: List[Dict[str, Any]]):
        """Logs retrieved chunk IDs, sources, and similarity scores."""
        if trace_id not in self.active_traces:
            return

        trace = self.active_traces[trace_id]
        trace["retrieval_trace"] = [
            {
                "chunk_id": c.get("chunk_id"),
                "source": c.get("metadata", {}).get("filename") or c.get("document_id"),
                "similarity_score": c.get("similarity_score")
            }
            for c in retrieved_chunks
        ]

    def end_trace(self, trace_id: str, status: str = "SUCCESS") -> Dict[str, Any]:
        """Finalizes trace, computes total latency, and saves to completed traces log."""
        if trace_id not in self.active_traces:
            return {}

        trace = self.active_traces.pop(trace_id)
        trace["total_latency_ms"] = round((time.time() - trace["start_time"]) * 1000, 2)
        trace["status"] = status
        
        self.completed_traces.append(trace)
        # Keep last 100 traces in memory
        if len(self.completed_traces) > 100:
            self.completed_traces = self.completed_traces[-100:]
            
        return trace

    def get_trace_history(self) -> List[Dict[str, Any]]:
        """Returns completed trace log history."""
        return self.completed_traces
