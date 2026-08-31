import time
from typing import Dict, Any, List, Optional
from .rag_pipeline import RAGPipeline
from .tool_registry import ToolRegistry
from .llm_provider import BaseLLMProvider, get_llm_provider
from .vector_store import VectorStore

class AgentState:
    """Maintains execution state, plan history, and agent observations."""
    def __init__(self, query: str):
        self.query = query
        self.selected_route: Optional[str] = None
        self.confidence: float = 0.0
        self.reasoning: str = ""
        self.step_history: List[Dict[str, Any]] = []
        self.final_answer: str = ""
        self.citations: List[Dict[str, Any]] = []
        self.start_time: float = time.time()

    def add_step(self, action: str, details: Dict[str, Any]):
        self.step_history.append({
            "step_index": len(self.step_history) + 1,
            "action": action,
            "details": details,
            "timestamp": time.time() - self.start_time
        })

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "selected_route": self.selected_route,
            "confidence": self.confidence,
            "reasoning": self.reasoning,
            "step_history": self.step_history,
            "final_answer": self.final_answer,
            "citations": self.citations,
            "total_latency_ms": round((time.time() - self.start_time) * 1000, 2)
        }

class QueryRouter:
    """Agent Intent Router classifying queries into distinct execution pathways."""
    
    ROUTE_KNOWLEDGE = "ROUTE_KNOWLEDGE"
    ROUTE_DATABASE = "ROUTE_DATABASE"
    ROUTE_TOOL = "ROUTE_TOOL"
    ROUTE_UNSUPPORTED = "ROUTE_UNSUPPORTED"

    def __init__(self, rag_pipeline: RAGPipeline = None, tool_registry: ToolRegistry = None):
        self.rag_pipeline = rag_pipeline or RAGPipeline()
        self.tool_registry = tool_registry or ToolRegistry()

    def classify_intent(self, query: str) -> Dict[str, Any]:
        """Classifies input query into one of 4 discrete agent routes."""
        q_lower = query.lower().strip()

        # Safety / Unsupported filter
        if any(bad in q_lower for bad in ["hack", "exploit", "drop table", "ignore previous"]):
            return {
                "route": self.ROUTE_UNSUPPORTED,
                "confidence": 0.99,
                "reasoning": "Query contains restricted security terms or injection vectors."
            }

        # Database / Relational Records Query
        if any(term in q_lower for term in ["employee details", "leave balance", "who is", "e101", "e102", "employee profile"]):
            return {
                "route": self.ROUTE_DATABASE,
                "confidence": 0.95,
                "reasoning": "Query requests specific relational employee record lookup."
            }

        # Operational Tool Query
        if any(term in q_lower for term in ["policy", "remote", "company rule", "guideline"]):
            return {
                "route": self.ROUTE_TOOL,
                "confidence": 0.90,
                "reasoning": "Query requires operational policy search tool execution."
            }

        # Enterprise Knowledge Base (RAG) Query
        return {
            "route": self.ROUTE_KNOWLEDGE,
            "confidence": 0.85,
            "reasoning": "Query asks general corporate knowledge questions suitable for RAG retrieval."
        }

    def run_agent(self, query: str) -> Dict[str, Any]:
        """Executes full agent state loop across intent routing, tool dispatch, or RAG pipeline."""
        state = AgentState(query)

        # 1. Intent Classification
        classification = self.classify_intent(query)
        state.selected_route = classification["route"]
        state.confidence = classification["confidence"]
        state.reasoning = classification["reasoning"]
        state.add_step("INTENT_CLASSIFICATION", classification)

        # 2. Route Execution Loop
        if state.selected_route == self.ROUTE_UNSUPPORTED:
            state.final_answer = "I cannot process this request due to enterprise security guidelines."
            state.add_step("ROUTE_TERMINATE", {"status": "REJECTED"})

        elif state.selected_route == self.ROUTE_DATABASE or state.selected_route == self.ROUTE_TOOL:
            requires_tool, tool_name, tool_args = self.tool_registry.select_tool(query)
            state.add_step("TOOL_SELECTION", {"tool_name": tool_name, "tool_args": tool_args})
            
            if tool_name:
                tool_output = self.tool_registry.execute_tool(tool_name, tool_args)
                state.add_step("TOOL_EXECUTION", {"output": tool_output})
                state.final_answer = f"Agent Action [{tool_name}]: {tool_output}"
            else:
                state.final_answer = "Unable to select appropriate database tool."

        elif state.selected_route == self.ROUTE_KNOWLEDGE:
            rag_res = self.rag_pipeline.query(query)
            state.final_answer = rag_res["answer"]
            state.citations = rag_res.get("citations", [])
            state.add_step("RAG_RETRIEVAL_GENERATION", {
                "retrieved_count": rag_res["retrieved_chunks_count"],
                "citations_count": len(state.citations)
            })

        return state.to_dict()
