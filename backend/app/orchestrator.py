"""
Manual orchestrator (baseline).

Kept for comparison with Datapizza-based orchestration.
"""

import time
from typing import Dict, Any, List

from .agents.sales import run_sales
from .agents.marketing import run_marketing
from .agents.customer_service import run_customer_service
from .agents.finance import run_finance


def _ms() -> int:
    return int(time.time() * 1000)


async def run_team(payload: Dict[str, Any]) -> Dict[str, Any]:
    steps: List[Dict[str, Any]] = []

    async def step(name: str, role: str, fn):
        t0 = _ms()
        out = await fn(payload)
        steps.append(
            {
                "name": name,
                "role": role,
                "output": out,
                "warnings": [],
                "ms": _ms() - t0,
            }
        )
        return out

    sales = await step("Sales proposal", "sales", run_sales)
    marketing = await step("Marketing proposal", "marketing", run_marketing)
    cs = await step("Customer Service proposal", "customer_service", run_customer_service)
    finance = await step("Finance proposal", "finance", run_finance)

    # Simple coordinator: intentionally imperfect in fragile/overconfident modes
    mode = payload.get("mode", "realistic")

    if mode == "realistic":
        risk_level = "MEDIUM"
        final_plan = [
            "Use compliant messaging + targeted campaign.",
            "Offer discounts only within policy thresholds (Finance approval required for exceptions).",
            "Handle the ticket per SLA with transparent expectations and escalation.",
        ]
        why_it_might_fail = "Coordination still depends on missing context and cross-team alignment."
        recommended_human_action = "Review discount thresholds and compliance wording before execution."
    else:
        risk_level = "HIGH"
        final_plan = [
            "Move fast: aggressive discount + bold claims + promise quick fix.",
            "Optimize for short-term closure and optics.",
        ]
        why_it_might_fail = "Overconfidence + missing info leads to policy, compliance, and SLA risks."
        recommended_human_action = "Block and request missing inputs; rewrite plan within constraints."

    coordinator_output = {
        "final_plan": final_plan,
        "risk_level": risk_level,
        "why_it_might_fail": why_it_might_fail,
        "recommended_human_action": recommended_human_action,
    }

    steps.append(
        {
            "name": "Coordinator decision",
            "role": "coordinator",
            "output": coordinator_output,
            "warnings": ["BLOCK: High risk — human approval required."] if risk_level == "HIGH" else [],
            "ms": 5,
        }
    )

    return {
        "summary": coordinator_output,
        "steps": steps,
    }
