# Enterprise Tool Calling (Function Calling) Architecture

## Overview

Tool Calling allows LLMs to trigger backend actions, query live relational databases, or call external APIs by outputting structured JSON function signatures matching defined tool schemas.

## Tool Calling Workflow

```
User Query ("How many leave days does E101 have left?")
       │
   1.  │ Tool Selection Engine matches prompt intent against Tool Schemas
       ▼
   2.  │ Formats Target Tool Call Payload
       │ { "tool_name": "get_leave_balance", "tool_args": { "employee_id": "E101" } }
       ▼
   3.  │ Intercept & Log Tool Call BEFORE Execution (Pre-Execution Audit)
       ▼
   4.  │ Execute Python / Backend Function against Enterprise DB
       │ Result: { "remaining_leave_days": 14 }
       ▼
   5.  │ Feed Tool Result to LLM to synthesize final response
```

## Tool Schemas

```json
[
  {
    "name": "get_employee_details",
    "description": "Retrieves employee profile, role, department, and contact email.",
    "parameters": {
      "type": "object",
      "properties": {
        "employee_id": { "type": "string", "description": "Employee ID (e.g. E101)" }
      },
      "required": ["employee_id"]
    }
  },
  {
    "name": "get_leave_balance",
    "description": "Retrieves remaining paid annual leave balance days for an employee.",
    "parameters": {
      "type": "object",
      "properties": {
        "employee_id": { "type": "string", "description": "Employee ID (e.g. E101)" }
      },
      "required": ["employee_id"]
    }
  },
  {
    "name": "search_company_policy",
    "description": "Searches internal company compliance and HR policy guidelines.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": { "type": "string", "description": "Policy query term" }
      },
      "required": ["query"]
    }
  }
]
```
