# Conversational Memory & Session Context Architecture

## Overview

Cognivault maintains stateful short-term conversation session memory to resolve ambiguous follow-up queries, pronouns (*"that"*, *"it"*, *"the former"*), and multi-turn context across user interactions.

## Multi-Turn Follow-Up Resolution Flow

```
Turn 1: User asks "What is the leave policy?"
       │
   1.  │ Store User Turn in Session Memory
       ▼
   2.  │ Generate LLM Completion ("Employees receive 20 annual leave days per year.")
       ▼
   3.  │ Store Assistant Response in Session Memory

Turn 2: User asks "How many days does that give me?"
       │
   4.  │ Retrieve Last N Turns from Session Memory
       ▼
   5.  │ Format Context Prompt Block:
       │ PREVIOUS CONVERSATION HISTORY:
       │ User: What is the leave policy?
       │ Assistant: Employees receive 20 annual leave days per year.
       │ CURRENT USER QUESTION: How many days does that give me?
       ▼
   6.  │ LLM resolves "that" -> "Annual leave policy" -> Answers "That gives you 20 annual leave days."
```

## Memory Schema

```json
{
  "session_id": "session_user_rishabh_101",
  "history": [
    { "role": "user", "content": "What is the leave policy?", "timestamp": 1725134400.0 },
    { "role": "assistant", "content": "Employees receive 20 annual leave days.", "timestamp": 1725134401.2 },
    { "role": "user", "content": "How many days does that give me?", "timestamp": 1725134410.5 },
    { "role": "assistant", "content": "That gives you 20 annual leave days per year.", "timestamp": 1725134411.8 }
  ]
}
```
