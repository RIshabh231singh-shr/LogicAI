from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import os

app = FastAPI(
    title="LogicAI Service",
    description="Python FastAPI service handling LLM, Embeddings, RAG, and Agent orchestration.",
    version="1.0.0"
)

class EchoRequest(BaseModel):
    message: str

class EchoResponse(BaseModel):
    service: str
    reply: str
    timestamp: str

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
