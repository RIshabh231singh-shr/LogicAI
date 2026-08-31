# Docker Deployment & Container Architecture

## Overview

Cognivault utilizes a multi-container Docker architecture orchestrating Node.js API Gateway, Python FastAPI AI Service, PostgreSQL with `pgvector`, and Redis cache.

## Container Topology

```
                  Client Requests
                         │
                         ▼
        ┌────────────────────────────────┐
        │       cognivault-backend       │
        │     (Node.js Express Gateway)  │
        └────────────────┬───────────────┘
                         │ REST (Port 8000)
                         ▼
        ┌────────────────────────────────┐
        │     cognivault-ai-service      │
        │   (Python FastAPI GenAI)       │
        └───────┬────────────────┬───────┘
                │                │
                ▼                ▼
     ┌──────────────────┐  ┌──────────────────┐
     │ cognivault-pg    │  │ cognivault-redis │
     │ (pgvector DB)    │  │ (Semantic Cache) │
     └──────────────────┘  └──────────────────┘
```

## Quickstart Launch Command

```bash
docker-compose up --build -d
```
