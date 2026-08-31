import time
from typing import Dict, Any, List, Optional

class MemoryService:
    """Manages short-term conversation session history and sliding context windows."""
    
    def __init__(self, max_history_turns: int = 10):
        self.sessions: Dict[str, List[Dict[str, Any]]] = {}
        self.max_history_turns = max_history_turns

    def add_turn(self, session_id: str, role: str, content: str):
        """Appends a new turn (user or assistant) to the specified session history."""
        if session_id not in self.sessions:
            self.sessions[session_id] = []
            
        self.sessions[session_id].append({
            "role": role,
            "content": content,
            "timestamp": time.time()
        })
        
        # Enforce sliding window truncation
        if len(self.sessions[session_id]) > self.max_history_turns * 2:
            self.sessions[session_id] = self.sessions[session_id][-self.max_history_turns * 2:]

    def get_history(self, session_id: str, max_turns: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieves history turns for a session."""
        history = self.sessions.get(session_id, [])
        if max_turns:
            return history[-max_turns * 2:]
        return history

    def format_conversation_context(self, session_id: str, current_query: str) -> str:
        """Formats conversation history into a unified prompt context block for follow-up resolution."""
        history = self.get_history(session_id, max_turns=4)
        if not history:
            return current_query

        context_lines = ["PREVIOUS CONVERSATION HISTORY:"]
        for turn in history:
            prefix = "User" if turn["role"] == "user" else "Assistant"
            context_lines.append(f"{prefix}: {turn['content']}")
            
        context_lines.append(f"\nCURRENT USER QUESTION: {current_query}")
        return "\n".join(context_lines)

    def clear_session(self, session_id: str):
        """Clears memory for a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
