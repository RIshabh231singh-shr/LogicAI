from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import os
import time
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM Provider Abstractions."""
    
    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, structured: bool = False) -> Dict[str, Any]:
        pass

class GeminiLLMProvider(BaseLLMProvider):
    """Live Google Gemini Provider using gemini-3.6-flash."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, structured: bool = False) -> Dict[str, Any]:
        start_time = time.time()
        
        # Assemble payload
        contents = []
        if system_prompt:
            contents.append({
                "role": "user",
                "parts": [{"text": f"System Instructions: {system_prompt}"}]
            })
            contents.append({
                "role": "model",
                "parts": [{"text": "Understood. I will strictly follow these system instructions."}]
            })
            
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        generation_config = {
            "temperature": temperature,
        }
        if structured:
            generation_config["responseMimeType"] = "application/json"

        payload = {
            "contents": contents,
            "generationConfig": generation_config
        }

        try:
            with httpx.Client(timeout=45.0) as client:
                res = client.post(self.endpoint, json=payload)
                
            if res.status_code != 200:
                print(f"[GeminiLLMProvider Error] {res.status_code}: {res.text}")
                raise RuntimeError(f"Gemini API returned {res.status_code}: {res.text}")
                
            data = res.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("No candidates returned from Gemini API")
                
            content_text = candidates[0]["content"]["parts"][0]["text"]
            usage_meta = data.get("usageMetadata", {})
            prompt_tokens = usage_meta.get("promptTokenCount", len(prompt) // 4)
            completion_tokens = usage_meta.get("candidatesTokenCount", len(content_text) // 4)
            
            latency_ms = round((time.time() - start_time) * 1000, 2)

            return {
                "provider": f"google-gemini-{self.model}",
                "content": content_text,
                "structured": structured,
                "usage": {
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": prompt_tokens + completion_tokens
                },
                "latency_ms": latency_ms,
                "parameters": {
                    "temperature": temperature,
                    "model": self.model
                }
            }
        except Exception as err:
            print(f"[GeminiLLMProvider] Fallback due to: {err}")
            # Fallback to Mock if connection fails
            return MockLLMProvider().generate(prompt, system_prompt, temperature, structured)

class MockLLMProvider(BaseLLMProvider):
    """Local Mock Provider for deterministic offline testing and zero API key dependency."""
    
    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, structured: bool = False) -> Dict[str, Any]:
        start_time = time.time()
        
        prompt_tokens = len(prompt) // 4 + 1
        system_tokens = (len(system_prompt) // 4 + 1) if system_prompt else 0
        
        if structured:
            content = f'{{"summary": "Processed query: {prompt}", "category": "general_inquiry", "confidence": 0.95}}'
            completion_tokens = len(content) // 4 + 1
        else:
            content = f" LogicAI Response [Mock Engine]: Received prompt '{prompt}'. System prompt: '{system_prompt or 'None'}'. Temperature: {temperature}."
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
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")
    if gemini_key and not gemini_key.startswith("your_"):
        return GeminiLLMProvider(api_key=gemini_key)
    return MockLLMProvider()
