import uuid
import io
import re
from datetime import datetime
from typing import Dict, Any, List
from pypdf import PdfReader

class DocumentProcessor:
    """Service handling document text extraction, metadata parsing, and normalization."""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Cleans control characters, normalizes line breaks, and collapses multiple spaces."""
        if not text:
            return ""
        # Remove non-printable control characters except newline & tab
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
        # Normalize whitespace (replace multiple spaces with a single space)
        text = re.sub(r'[ \t]+', ' ', text)
        # Remove consecutive blank lines
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()

    def process_file(self, filename: str, content_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        """Extracts text, page numbers, and metadata from uploaded raw file bytes."""
        document_id = str(uuid.uuid4())
        file_size_bytes = len(content_bytes)
        pages_data: List[Dict[str, Any]] = []
        full_text_list: List[str] = []

        if filename.lower().endswith(".pdf") or mime_type == "application/pdf":
            pdf_stream = io.BytesIO(content_bytes)
            reader = PdfReader(pdf_stream)
            total_pages = len(reader.pages)

            for idx, page in enumerate(reader.pages, start=1):
                raw_text = page.extract_text() or ""
                cleaned = self.clean_text(raw_text)
                pages_data.append({
                    "page_number": idx,
                    "character_count": len(cleaned),
                    "text": cleaned
                })
                if cleaned:
                    full_text_list.append(cleaned)
        else:
            # Plain text / Markdown fallback processing
            text_content = content_bytes.decode("utf-8", errors="replace")
            cleaned = self.clean_text(text_content)
            total_pages = 1
            pages_data.append({
                "page_number": 1,
                "character_count": len(cleaned),
                "text": cleaned
            })
            full_text_list.append(cleaned)

        full_text = "\n\n".join(full_text_list)

        return {
            "document_id": document_id,
            "filename": filename,
            "mime_type": mime_type,
            "file_size_bytes": file_size_bytes,
            "total_pages": total_pages,
            "total_characters": len(full_text),
            "ingested_at": datetime.utcnow().isoformat() + "Z",
            "pages": pages_data,
            "full_text": full_text
        }
