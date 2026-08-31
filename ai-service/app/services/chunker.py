import uuid
import re
from typing import List, Dict, Any

class TextChunker:
    """Service providing fixed-size and sentence-boundary document chunking strategies."""
    
    @staticmethod
    def fixed_size_chunking(
        text: str,
        chunk_size: int = 500,
        chunk_overlap: int = 100,
        document_id: str = "",
        metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Splits text into fixed character-length chunks with a specified sliding overlap.
        """
        if not text:
            return []
            
        if chunk_size <= 0:
            raise ValueError("chunk_size must be greater than 0")
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be strictly smaller than chunk_size")

        metadata = metadata or {}
        chunks: List[Dict[str, Any]] = []
        step = chunk_size - chunk_overlap
        text_length = len(text)
        chunk_index = 0

        start = 0
        while start < text_length:
            end = min(start + chunk_size, text_length)
            chunk_text = text[start:end]
            
            chunk_id = f"{document_id}_chunk_{chunk_index}" if document_id else str(uuid.uuid4())
            
            chunks.append({
                "chunk_id": chunk_id,
                "chunk_index": chunk_index,
                "document_id": document_id,
                "start_char": start,
                "end_char": end,
                "character_count": len(chunk_text),
                "text": chunk_text,
                "metadata": metadata
            })
            
            chunk_index += 1
            if end == text_length:
                break
            start += step

        return chunks

    @staticmethod
    def sentence_chunking(
        text: str,
        max_chunk_size: int = 500,
        document_id: str = "",
        metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Splits text along sentence boundaries (period, exclamation, question mark) without exceeding max_chunk_size.
        """
        if not text:
            return []

        metadata = metadata or {}
        # Regex matching sentence endings followed by whitespace
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
        
        chunks: List[Dict[str, Any]] = []
        current_chunk_sentences: List[str] = []
        current_length = 0
        chunk_index = 0
        start_char = 0

        for sentence in sentences:
            sentence_length = len(sentence)
            
            # If single sentence exceeds max_chunk_size, flush existing and add it as own chunk
            if current_length + sentence_length + (1 if current_chunk_sentences else 0) > max_chunk_size:
                if current_chunk_sentences:
                    chunk_text = " ".join(current_chunk_sentences)
                    end_char = start_char + len(chunk_text)
                    chunk_id = f"{document_id}_chunk_{chunk_index}" if document_id else str(uuid.uuid4())
                    
                    chunks.append({
                        "chunk_id": chunk_id,
                        "chunk_index": chunk_index,
                        "document_id": document_id,
                        "start_char": start_char,
                        "end_char": end_char,
                        "character_count": len(chunk_text),
                        "text": chunk_text,
                        "metadata": metadata
                    })
                    chunk_index += 1
                    start_char = end_char + 1
                    current_chunk_sentences = []
                    current_length = 0

            current_chunk_sentences.append(sentence)
            current_length += sentence_length + 1

        if current_chunk_sentences:
            chunk_text = " ".join(current_chunk_sentences)
            end_char = start_char + len(chunk_text)
            chunk_id = f"{document_id}_chunk_{chunk_index}" if document_id else str(uuid.uuid4())
            
            chunks.append({
                "chunk_id": chunk_id,
                "chunk_index": chunk_index,
                "document_id": document_id,
                "start_char": start_char,
                "end_char": end_char,
                "character_count": len(chunk_text),
                "text": chunk_text,
                "metadata": metadata
            })

        return chunks
