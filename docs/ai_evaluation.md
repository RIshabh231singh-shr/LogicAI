# GenAI & RAG Evaluation Methodology

## Overview

Evaluating GenAI and RAG applications is critical for measuring retrieval precision, context recall, and response faithfulness to prevent silent quality regressions during codebase modifications.

## Core Evaluation Metrics

### 1. Context Precision
Measures what fraction of the retrieved chunks are relevant to the expected ground-truth target.

$$\text{Context Precision} = \frac{|\text{Relevant Retrived Chunks}|}{|\text{Total Retrived Chunks}|}$$

### 2. Context Recall
Measures whether the ground-truth reference source and page were successfully retrieved in the top-$K$ context list.

$$\text{Context Recall} = \begin{cases} 1.0 & \text{if Expected Source retrieved} \\ 0.0 & \text{otherwise} \end{cases}$$

### 3. Faithfulness (Groundedness)
Measures the extent to which the generated answer is strictly grounded in the retrieved context, guarding against hallucinations.

$$\text{Faithfulness} = \frac{|\text{Answer Terms Present in Context}|}{|\text{Total Answer Content Terms}|}$$

### 4. Answer Relevance
Measures how directly the generated output answers the user's intent.

$$\text{Answer Relevance} = \frac{|\text{Query Terms Present in Answer}|}{|\text{Total Query Content Terms}|}$$

## Benchmark Dataset Schema (`rag_eval_dataset.json`)

```json
[
  {
    "eval_id": "eval_001",
    "query": "What is the employee annual leave policy?",
    "expected_answer": "Regular full-time employees accrue 20 annual leave days per year.",
    "expected_source": "Employee_Handbook.pdf",
    "expected_page": 24
  }
]
```
