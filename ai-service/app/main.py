from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import os

from .services.llm_provider import get_llm_provider
from .services.document_processor import DocumentProcessor
from .services.chunker import TextChunker
from .services.embedding_service import EmbeddingService
from .services.vector_store import VectorStore
from .services.rag_pipeline import RAGPipeline
from .services.advanced_retrieval import AdvancedRetrievalEngine
from .services.tool_registry import ToolRegistry
from .services.agent_router import QueryRouter

app = FastAPI(
    title="LogicAI Service",
    description="Python FastAPI service handling LLM, Embeddings, RAG, and Agent orchestration.",
    version="1.0.0"
)

document_processor = DocumentProcessor()
text_chunker = TextChunker()
embedding_service = EmbeddingService()
vector_store = VectorStore(embedding_service=embedding_service)
rag_pipeline = RAGPipeline(vector_store=vector_store, llm_provider=get_llm_provider())
advanced_retrieval = AdvancedRetrievalEngine(vector_store=vector_store, llm_provider=get_llm_provider())
tool_registry = ToolRegistry()
query_router = QueryRouter(rag_pipeline=rag_pipeline, tool_registry=tool_registry)

class EchoRequest(BaseModel):
    message: str

class EchoResponse(BaseModel):
    service: str
    reply: str
    timestamp: str

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="User prompt text")
    system_prompt: Optional[str] = Field(default=None, description="System instructions establishing LLM behavior")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Sampling temperature")
    structured: bool = Field(default=False, description="Whether structured JSON output is requested")

class ChatResponse(BaseModel):
    provider: str
    content: str
    structured: bool
    usage: Dict[str, int]
    latency_ms: float
    parameters: Dict[str, Any]

class ChunkRequest(BaseModel):
    text: str = Field(..., description="Text to chunk")
    strategy: str = Field(default="fixed", description="Chunking strategy: 'fixed' or 'sentence'")
    chunk_size: int = Field(default=500, ge=50, le=10000, description="Target chunk character size")
    chunk_overlap: int = Field(default=100, ge=0, description="Sliding window overlap size")
    document_id: Optional[str] = Field(default="", description="Optional associated document ID")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata to attach to chunks")

class EmbeddingGenerateRequest(BaseModel):
    text: str = Field(..., description="Input text to embed")

class SimilarityRequest(BaseModel):
    query: str = Field(..., description="Query string")
    candidates: List[str] = Field(..., min_items=1, description="Candidate strings to compare against query")

class VectorStoreRequest(BaseModel):
    chunks: List[Dict[str, Any]] = Field(..., min_items=1, description="List of chunk objects to store")

class VectorSearchRequest(BaseModel):
    query: str = Field(..., description="Search query string")
    top_k: int = Field(default=3, ge=1, le=50, description="Number of top chunks to return")
    metadata_filter: Optional[Dict[str, Any]] = Field(default=None, description="Metadata filtering key-values")

class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="RAG User Query")
    top_k: int = Field(default=3, ge=1, le=50, description="Top-K context chunks to retrieve")
    metadata_filter: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata filter")

class AdvancedRetrievalRequest(BaseModel):
    query: str = Field(..., description="Query text")
    top_k: int = Field(default=3, ge=1, le=50, description="Top-K count")
    metadata_filter: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata filter")

class ToolExecuteRequest(BaseModel):
    tool_name: str = Field(..., description="Target tool name to execute")
    tool_args: Dict[str, Any] = Field(default={}, description="Tool arguments dict")

class ToolProcessRequest(BaseModel):
    prompt: str = Field(..., description="User prompt text requiring potential tool execution")

class AgentRunRequest(BaseModel):
    query: str = Field(..., description="Query for agent processing")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/echo", response_model=EchoResponse)
def process_echo(payload: EchoRequest):
    if not payload.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    return EchoResponse(
        service="python-ai-service",
        reply=f"AI Service received: {payload.message}",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@app.post("/api/v1/chat", response_model=ChatResponse)
def process_chat(payload: ChatRequest):
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt text cannot be empty or whitespace")
    
    provider = get_llm_provider()
    result = provider.generate(
        prompt=payload.prompt,
        system_prompt=payload.system_prompt,
        temperature=payload.temperature,
        structured=payload.structured
    )
    
    return ChatResponse(**result)

@app.post("/api/v1/documents/ingest")
async def ingest_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")
    
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    
    try:
        doc_result = document_processor.process_file(
            filename=file.filename,
            content_bytes=content,
            mime_type=file.content_type or "application/octet-stream"
        )
        return {"success": True, "data": doc_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.post("/api/v1/documents/chunk")
def chunk_document(payload: ChunkRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        if payload.strategy == "sentence":
            chunks = text_chunker.sentence_chunking(
                text=payload.text,
                max_chunk_size=payload.chunk_size,
                document_id=payload.document_id or "",
                metadata=payload.metadata
            )
        else:
            chunks = text_chunker.fixed_size_chunking(
                text=payload.text,
                chunk_size=payload.chunk_size,
                chunk_overlap=payload.chunk_overlap,
                document_id=payload.document_id or "",
                metadata=payload.metadata
            )
            
        return {
            "success": True,
            "strategy": payload.strategy,
            "chunk_count": len(chunks),
            "chunk_size": payload.chunk_size,
            "chunk_overlap": payload.chunk_overlap,
            "chunks": chunks
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chunking failed: {str(e)}")

@app.post("/api/v1/embeddings/generate")
def generate_embedding(payload: EmbeddingGenerateRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    vector = embedding_service.generate_embedding(payload.text)
    return {
        "success": True,
        "dimensions": len(vector),
        "embedding": vector
    }

@app.post("/api/v1/embeddings/similarity")
def calculate_similarity(payload: SimilarityRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    rankings = embedding_service.rank_candidates(payload.query, payload.candidates)
    return {
        "success": True,
        "query": payload.query,
        "candidate_count": len(payload.candidates),
        "rankings": rankings
    }

@app.post("/api/v1/vector/store")
def store_vector_chunks(payload: VectorStoreRequest):
    stored_count = vector_store.store_batch_chunks(payload.chunks)
    return {
        "success": True,
        "stored_count": stored_count
    }

@app.post("/api/v1/vector/search")
def search_vector_store(payload: VectorSearchRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    results = vector_store.search_similarity(
        query=payload.query,
        top_k=payload.top_k,
        metadata_filter=payload.metadata_filter
    )
    
    return {
        "success": True,
        "query": payload.query,
        "top_k": payload.top_k,
        "retrieved_count": len(results),
        "retrieved_chunks": results
    }

@app.post("/api/v1/rag/query")
def execute_rag_query(payload: RAGQueryRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    rag_result = rag_pipeline.query(
        query_text=payload.query.strip(),
        top_k=payload.top_k,
        metadata_filter=payload.metadata_filter
    )
    
    return {"success": True, "data": rag_result}

@app.post("/api/v1/retrieval/rewrite")
def rewrite_query_endpoint(payload: AdvancedRetrievalRequest):
    rewritten = advanced_retrieval.rewrite_query(payload.query)
    return {"success": True, "original_query": payload.query, "rewritten_query": rewritten}

@app.post("/api/v1/retrieval/multi-query")
def multi_query_endpoint(payload: AdvancedRetrievalRequest):
    multi_queries = advanced_retrieval.generate_multi_queries(payload.query)
    return {"success": True, "original_query": payload.query, "multi_queries": multi_queries}

@app.post("/api/v1/retrieval/hybrid")
def hybrid_search_endpoint(payload: AdvancedRetrievalRequest):
    chunks = advanced_retrieval.hybrid_search(
        query=payload.query,
        top_k=payload.top_k,
        metadata_filter=payload.metadata_filter
    )
    return {"success": True, "query": payload.query, "chunks": chunks}

@app.post("/api/v1/retrieval/rerank")
def rerank_endpoint(payload: AdvancedRetrievalRequest):
    base_chunks = vector_store.search_similarity(query=payload.query, top_k=payload.top_k * 2, metadata_filter=payload.metadata_filter)
    reranked = advanced_retrieval.rerank_chunks(query=payload.query, candidates=base_chunks, top_k=payload.top_k)
    return {"success": True, "query": payload.query, "reranked_chunks": reranked}

@app.get("/api/v1/tools/list")
def list_tools():
    return {"success": True, "tools": tool_registry.get_tool_schemas()}

@app.post("/api/v1/tools/execute")
def execute_tool_endpoint(payload: ToolExecuteRequest):
    res = tool_registry.execute_tool(payload.tool_name, payload.tool_args)
    return {"success": True, "tool_name": payload.tool_name, "result": res}

@app.post("/api/v1/tools/process")
def process_tool_calling(payload: ToolProcessRequest):
    requires_tool, tool_name, tool_args = tool_registry.select_tool(payload.prompt)
    
    if not requires_tool:
        return {
            "success": True,
            "requires_tool": False,
            "message": "No tool call required. Proceeding with conversational LLM response."
        }
    
    tool_call_inspection = {
        "tool_name": tool_name,
        "tool_args": tool_args,
        "status": "INTERCEPTED_PRE_EXECUTION"
    }

    execution_result = tool_registry.execute_tool(tool_name, tool_args)

    return {
        "success": True,
        "requires_tool": True,
        "tool_call": tool_call_inspection,
        "execution_result": execution_result
    }

@app.post("/api/v1/agent/route")
def route_query_endpoint(payload: AgentRunRequest):
    classification = query_router.classify_intent(payload.query)
    return {"success": True, "classification": classification}

@app.post("/api/v1/agent/run")
def run_agent_endpoint(payload: AgentRunRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    agent_output = query_router.run_agent(payload.query)
    return {"success": True, "data": agent_output}
