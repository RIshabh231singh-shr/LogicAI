# Cognivault System Architecture

## Overview

Cognivault uses a decoupled microservice-inspired architecture designed to separate core business logic, application state, and security from GenAI computation and model evaluation.

```
React (frontend)
     │
     ▼ (HTTP / REST)
Node.js + Express (backend - API Gateway)
     │
     ▼ (HTTP / REST)
Python + FastAPI (ai-service - GenAI Engine)
```

## Service Responsibilities

### 1. Backend (`backend/`)
- **Technology:** Node.js, Express
- **Role:** API Gateway, Authentication, Authorization, Chat History, File Upload Processing, Rate Limiting.

### 2. AI Service (`ai-service/`)
- **Technology:** Python 3.11+, FastAPI
- **Role:** Prompt Engineering, Document Extraction & Chunking, Embeddings, Vector Search, RAG Pipeline, Tool Calling, Agent Routing, Evaluation.
