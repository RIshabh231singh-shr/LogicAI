# Embeddings & Vector Similarity Mathematics

## Overview

Text embeddings transform human language into high-dimensional numerical vectors $\vec{v} \in \mathbb{R}^d$ such that semantically similar concepts are located close together in spatial vector space.

## Mathematical Formulation

### 1. Vector Representation
Given a text string $T$, an embedding model maps $T$ to a $d$-dimensional normalized vector:
$$\vec{v} = [v_1, v_2, v_3, \dots, v_d]$$

### 2. Cosine Similarity Formula
Cosine similarity measures the angle $\theta$ between query vector $\vec{A}$ and document chunk vector $\vec{B}$:

$$\text{CosineSimilarity}(\vec{A}, \vec{B}) = \cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^d A_i B_i}{\sqrt{\sum_{i=1}^d A_i^2} \sqrt{\sum_{i=1}^d B_i^2}}$$

### 3. Properties
- **Range:** $[-1.0, 1.0]$ where $1.0$ indicates identical directional alignment, $0.0$ indicates orthogonality (unrelated), and $-1.0$ indicates exact opposite.
- **Unit Normalization:** When vectors are L2-normalized ($\|\vec{A}\| = 1, \|\vec{B}\| = 1$), Cosine Similarity equals the simple Dot Product:
  $$\text{CosineSimilarity}(\vec{A}, \vec{B}) = \vec{A} \cdot \vec{B}$$

## Benchmark Empirical Results

Query: *"What is the leave policy?"*

| Rank | Candidate Chunk | Cosine Similarity Score | Evaluation |
| :---: | :--- | :---: | :---: |
| 1 | *"Employees receive 20 annual leave days."* | **0.8654** | High Semantic Match ✅ |
| 2 | *"The cafeteria opens at 8 AM."* | **0.0121** | Low Semantic Match ❌ |
