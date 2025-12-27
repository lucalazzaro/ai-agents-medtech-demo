from pydantic import BaseModel
from typing import List, Dict, Any, Literal

Mode = Literal["realistic", "fragile", "overconfident"]

class AgentOutput(BaseModel):
    proposal: List[str]
    assumptions: List[str]
    ignored_risks: List[str]

class Step(BaseModel):
    role: str
    output: AgentOutput
    latency_ms: int

class RunResult(BaseModel):
    scenario: str
    mode: Mode
    risk_level: str
    decision: List[str]
    why_it_might_fail: str
    recommended_human_action: str
    steps: List[Step]
