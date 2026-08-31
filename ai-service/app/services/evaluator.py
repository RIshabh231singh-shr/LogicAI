import re
from typing import List, Dict, Any

class RAGEvaluator:
    """Evaluation Engine computing Context Precision, Context Recall, Faithfulness, and Answer Relevance."""

    def evaluate_retrieval(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        expected_source: str,
        expected_page: int
    ) -> Dict[str, float]:
        """
        Calculates Context Precision and Context Recall for vector retrieval.
        - Context Precision: % of retrieved chunks matching expected source/page.
        - Context Recall: 1.0 if expected source chunk is found in top-K, 0.0 otherwise.
        """
        if not retrieved_chunks:
            return {"context_precision": 0.0, "context_recall": 0.0}

        relevant_count = 0
        found_target = False

        for chunk in retrieved_chunks:
            meta = chunk.get("metadata", {})
            src = meta.get("filename") or chunk.get("document_id") or ""
            page = chunk.get("page_number", 1)

            if expected_source.lower() in src.lower() and (expected_page is None or page == expected_page):
                relevant_count += 1
                found_target = True

        precision = relevant_count / len(retrieved_chunks)
        recall = 1.0 if found_target else 0.0

        return {
            "context_precision": round(precision, 4),
            "context_recall": round(recall, 4)
        }

    def evaluate_faithfulness(self, generated_answer: str, context_text: str) -> float:
        """
        Calculates Faithfulness score: % of terms/statements in the generated answer supported by retrieved context.
        Strips mock engine telemetry wrappers for clean heuristic evaluation.
        """
        if not generated_answer or not context_text:
            return 0.0

        # Strip mock engine boilerplate if present
        clean_gen = re.sub(r'Cognivault AI Response \[Mock Engine\]:\s*Received prompt\s*[\'\"]?', '', generated_answer)
        clean_gen = re.sub(r'[\'\"]?\.\s*System prompt:.*', '', clean_gen)

        answer_words = set(re.findall(r'\w+', clean_gen.lower()))
        context_words = set(re.findall(r'\w+', context_text.lower()))

        # Common stop words & prompt framing artifacts
        stop_words = {"the", "a", "an", "is", "are", "and", "or", "in", "on", "of", "to", "for", "with", "by", "this", "that", "retrieved", "context", "user", "question", "source", "page", "id"}
        content_words = answer_words - stop_words

        if not content_words:
            return 1.0

        supported = sum(1 for word in content_words if word in context_words)
        return round(supported / len(content_words), 4)

    def evaluate_answer_relevance(self, query: str, generated_answer: str) -> float:
        """
        Calculates Answer Relevance score: token overlap between user query and generated answer.
        """
        query_words = set(re.findall(r'\w+', query.lower()))
        answer_words = set(re.findall(r'\w+', generated_answer.lower()))

        stop_words = {"what", "is", "the", "how", "many", "does", "are", "a", "an", "of", "to", "in", "for"}
        q_content = query_words - stop_words

        if not q_content:
            return 1.0

        overlap = sum(1 for word in q_content if word in answer_words)
        return round(overlap / len(q_content), 4)

    def evaluate_item(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        generated_answer: str,
        expected_answer: str,
        expected_source: str,
        expected_page: int
    ) -> Dict[str, Any]:
        """Evaluates a single Q&A evaluation item across all 4 metrics."""
        retrieval_metrics = self.evaluate_retrieval(query, retrieved_chunks, expected_source, expected_page)
        
        context_text = " ".join([c.get("text", "") for c in retrieved_chunks])
        faithfulness = self.evaluate_faithfulness(generated_answer, context_text)
        relevance = self.evaluate_answer_relevance(query, generated_answer)

        return {
            "query": query,
            "metrics": {
                "context_precision": retrieval_metrics["context_precision"],
                "context_recall": retrieval_metrics["context_recall"],
                "faithfulness": faithfulness,
                "answer_relevance": relevance
            }
        }
