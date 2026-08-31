from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import os
import time

class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM Provider Abstractions."""
    
    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, structured: bool = False) -> Dict[str, Any]:
        pass

class MockLLMProvider(BaseLLMProvider):
    """Local Mock Provider for deterministic offline testing and zero API key dependency."""
    
    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, structured: bool = False) -> Dict[str, Any]:
        start_time = time.time()
        
        # Token estimation: ~4 chars per token rule of thumb
        prompt_tokens = len(prompt) // 4 + 1
        system_tokens = (len(system_prompt) // 4 + 1) if system_prompt else 0
        
        if structured:
            content = f'{{"summary": "Processed query: {prompt}", "category": "general_inquiry", "confidence": 0.95}}'
            completion_tokens = len(content) // 4 + 1
        else:
            content = f"Cognivault AI Response [Mock Engine]: Received prompt '{prompt}'. System prompt: '{system_prompt or 'None'}'. Temperature: {temperature}."
            completion_tokens = len(content) // 4 + 1
            
        latency_ms = round((time.time() - start_time) * 1000, 2)
        
        return {
            "provider": "mock-llm-engine",
            "content": content,
            "structured": structured,
            "usage": {
                "prompt_tokens": prompt_tokens + system_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + system_tokens + completion_tokens
            },
            "latency_ms": latency_ms,
            "parameters": {
                "temperature": temperature,
                "system_prompt": system_prompt
            }
        }

def get_llm_provider() -> BaseLLMProvider:
    """Factory function returning active LLM Provider based on environment configuration."""
    api_key = os.getenv("LLM_API_KEY", "")
    if api_key and api_key != "your_llm_api_key_here":
        # Placeholder for live LLM integration (e.g. OpenAI / Gemini)
        return MockLLMProvider()
    return MockLLMProvider()
