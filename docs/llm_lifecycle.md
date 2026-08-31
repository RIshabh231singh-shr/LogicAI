# LLM Request Lifecycle Documentation

This document describes step-by-step what happens from the moment a user submits a prompt in Cognivault until the generated response returns to the client.

## Request Flow Overview

```
User (Browser / Client)
       │
   1.  │ POST /api/chat { prompt, system_prompt, temperature, structured }
       ▼
Node.js API Gateway (backend - Port 5000)
       │
   2.  │ Input Validation & Forwarding via aiServiceClient.js
       ▼
Python AI Engine (ai-service - Port 8000)
       │
   3.  │ FastAPI router handles POST /api/v1/chat
       │
   4.  │ Provider Factory selects BaseLLMProvider (Mock or Live Provider)
       │
   5.  │ Prompt Formatting & Token Count Estimation
       │
   6.  │ LLM Generation & Latency Measurement
       ▼
Node.js API Gateway (backend)
       │
   7.  │ Wraps response with metadata { success: true, gateway: "node-backend", data }
       ▼
User (Browser / Client)
```

## Step-by-Step Breakdown

### Step 1: Client Request Dispatch
The client sends an HTTP POST request containing `prompt`, optional `system_prompt`, `temperature` (default `0.7`), and `structured` boolean flag.

### Step 2: Node.js Gateway Validation & Forwarding
The Express server checks that `prompt` is non-empty, attaches an `AbortController` timeout (10s), and forwards the request payload to Python AI Service.

### Step 3: Python AI Service Endpoint Processing
FastAPI validates request schema using Pydantic models (`ChatRequest`). If invalid, it returns `400 Bad Request`.

### Step 4: Provider Selection & Token Estimation
`get_llm_provider()` selects the active model provider. Input tokens are estimated (character-based heuristic: ~4 chars/token).

### Step 5: Generation & Metrics Capture
The provider generates content, calculates token usage (`prompt_tokens`, `completion_tokens`, `total_tokens`), measures wall-clock latency in milliseconds, and returns a structured payload.

### Step 6: Gateway Synthesis & Client Delivery
Node.js receives the Python response, logs telemetry, wraps it in the standardized gateway envelope, and responds to the client with `200 OK`.
