from typing import Dict, Any
from ..rag import retrieve


async def run_sales(payload: Dict[str, Any]) -> Dict[str, Any]:
    brief = payload.get("brief", "")
    mode = payload.get("mode", "realistic")

    docs = retrieve(f"discount policy approvals margin constraints {brief}", k=3)

    proposal = [
        "Propose a discount within policy limits to accelerate deal closure.",
        "Offer a compliant bundle option (annual plan) instead of deeper discounts."
    ]
    assumptions = [
        "Price is a meaningful barrier for this customer segment.",
        "Policy constraints apply to this deal."
    ]
    ignored_risks = [
        "Margin erosion if discount exceeds approval thresholds.",
        "Overpromising timelines or outcomes to close fast."
    ]

    # Programmed fragility: slight overreach / confidence
    if mode == "overconfident":
        proposal[0] = "Offer an aggressive discount to close this week, then handle approvals retroactively."
        ignored_risks.append("Policy breach risk (discount approval).")
    elif mode == "fragile":
        assumptions.append("Key commercial details are missing, but we proceed anyway.")

    return {
        "proposal": proposal,
        "assumptions": assumptions,
        "ignored_risks": ignored_risks,
        "citations": [d["id"] for d in docs],
    }
