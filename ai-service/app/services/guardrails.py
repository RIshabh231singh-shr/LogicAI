import re
from typing import Dict, Any, Tuple, Optional

class GuardrailEngine:
    """Enterprise GenAI Security Guardrails protecting against prompt injections, PII leaks, and unauthorized document access."""
    
    PROMPT_INJECTION_PATTERNS = [
        r'ignore\s+(all\s+)?(previous|prior)\s+instructions',
        r'system\s+override',
        r'reveal\s+(confidential|secret|private|system\s+prompt)',
        r'disregard\s+safety\s+guidelines',
        r'you\s+are\s+now\s+dan',
        r'bypass\s+restrictions',
        r'drop\s+table'
    ]

    ROLE_HIERARCHY = {
        "admin": 3,
        "hr_admin": 2,
        "employee": 1,
        "guest": 0
    }

    def inspect_prompt_injection(self, prompt: str) -> Tuple[bool, Optional[str]]:
        """Scans input prompt for malicious prompt injection or jailbreak patterns."""
        p_lower = prompt.lower()
        for pattern in self.PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, p_lower):
                return True, f"Prompt injection threat detected matching pattern: '{pattern}'"
        return False, None

    def validate_document_access(self, user_role: str, document_clearance: str) -> bool:
        """Validates whether a user role has authorization to access document with specified clearance level."""
        user_level = self.ROLE_HIERARCHY.get(user_role.lower(), 0)
        doc_level = self.ROLE_HIERARCHY.get(document_clearance.lower(), 0)
        return user_level >= doc_level

    def sanitize_output(self, text: str) -> str:
        """Redacts sensitive PII (Social Security Numbers, Credit Cards) from LLM output."""
        if not text:
            return ""
        # Redact US Social Security Numbers (XXX-XX-XXXX)
        text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED_SSN]', text)
        # Redact Credit Card Numbers (16 digits)
        text = re.sub(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b', '[REDACTED_CREDIT_CARD]', text)
        return text

    def run_guardrails(self, prompt: str, user_role: str = "employee", doc_clearance: Optional[str] = None) -> Dict[str, Any]:
        """Executes full input security check, authorization check, and safety audit."""
        is_injection, threat_msg = self.inspect_prompt_injection(prompt)
        if is_injection:
            return {
                "is_safe": False,
                "status": "REJECTED_PROMPT_INJECTION",
                "detail": threat_msg
            }

        if doc_clearance:
            is_authorized = self.validate_document_access(user_role, doc_clearance)
            if not is_authorized:
                return {
                    "is_safe": False,
                    "status": "REJECTED_UNAUTHORIZED_ACCESS",
                    "detail": f"User role '{user_role}' is not authorized to access clearance level '{doc_clearance}'"
                }

        return {
            "is_safe": True,
            "status": "PASSED",
            "detail": "Input passed all security guardrail checks."
        }
