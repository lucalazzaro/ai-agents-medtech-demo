from typing import Dict, Any
from ..rag import retrieve


async def run_finance(payload: Dict[str, Any]) -> Dict[str, Any]:
    brief = payload.get("brief", "")
    mode = payload.get("mode", "realistic")

    docs = retrieve(f"margin discount approvals budget constraints policy {brief}", k=3)

    proposal = [
        "Require margin check and approval for any discount above the standard threshold.",
        "Protect budget allocations that reduce churn risk and SLA penalties."
    ]
    assumptions = [
        "Margin protection is critical for long-term sustainability.",
        "Budget cuts can have downstream effects on churn and reputation."
    ]
    ignored_risks = [
        "Overly strict control can slow growth and harm customer outcomes.",
        "Short-term savings can increase long-term costs."
    ]

    if mode == "overconfident":
        proposal[0] = "Reject all discounts this month to protect margin, regardless of churn risk."
        ignored_risks.append("Revenue shortfall and churn impact risk.")
    elif mode == "fragile":
        assumptions.append("We can decide without updated forecast inputs.")

    return {
        "proposal": proposal,
        "assumptions": assumptions,
        "ignored_risks": ignored_risks,
        "citations": [d["id"] for d in docs],
    }
