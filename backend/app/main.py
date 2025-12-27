from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import uuid

from .scenarios import SCENARIOS
from app.datapizza_orchestrator import run_team

app = FastAPI(title="MedTech AI Team Demo", version="0.1.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    scenario_id: str
    mode: str = "realistic"
    human_gate: bool = True


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/scenarios")
def list_scenarios():
    return {"scenarios": list(SCENARIOS.keys())}


@app.post("/run")
async def run(req: RunRequest):
    if req.scenario_id not in SCENARIOS:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown scenario_id. Allowed: {list(SCENARIOS.keys())}",
        )

    scenario = SCENARIOS[req.scenario_id]

    payload: Dict[str, Any] = {
        "scenario_id": req.scenario_id,
        "mode": req.mode,
        "human_gate": req.human_gate,
        "brief": {
            "title": scenario["title"],
            "context": scenario["context"],
            "goal": scenario["goal"],
            "constraints": scenario.get("constraints", []),
        },
    }

    result = await run_team(payload)

    return {
        "run_id": str(uuid.uuid4()),
        "scenario_id": req.scenario_id,
        "mode": req.mode,
        "summary": result["summary"],
        "steps": result["steps"],
    }

