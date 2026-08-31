from fastapi import FastAPI
import os

app = FastAPI(
    title="LogicAI Service",
    description="Python FastAPI service handling LLM, Embeddings, RAG, and Agent orchestration.",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {"status": "ok"}
