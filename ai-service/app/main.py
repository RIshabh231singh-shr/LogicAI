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

app = FastAPI(
    title="LogicAI Service",
    description="Python FastAPI service handling LLM, Embeddings, RAG, and Agent orchestration.",
    version="1.0.0"
)

document_processor = DocumentProcessor()
text_chunker = TextChunker()
embedding_service = EmbeddingService()
vector_store = VectorStore(embedding_service=embedding_service)

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
