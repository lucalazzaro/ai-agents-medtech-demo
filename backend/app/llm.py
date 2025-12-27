import os
from typing import Optional

class LLMClient:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "openai")  # or "anthropic", ecc.
        self.model = os.getenv("LLM_MODEL", "gpt-4.1-mini")  # sample model name
        self.api_key = os.getenv("LLM_API_KEY")

    async def generate(self, system: str, user: str) -> str:
        """
        Implement the actual provider call here.
        Keep this interface stable: this way, agents and orchestrators never change.
        """
        raise NotImplementedError("Hook your LLM provider here.")
