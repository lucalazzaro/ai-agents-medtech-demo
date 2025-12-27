from typing import Dict, Any
from ..rag import retrieve


async def run_customer_service(payload: Dict[str, Any]) -> Dict[str, Any]:
    brief = payload.get("brief", "")
    mode = payload.get("mode", "realistic")

    docs = retrieve(f"sla escalation response times workaround customer churn {brief}", k=3)

    proposal = [
        "Acknowledge the issue immediately and set clear expectations aligned with SLA.",
        "Escalate to technical support and provide an interim workaround if available."
    ]
    assumptions = [
        "A fast first response reduces churn risk.",
        "A workaround exists or can be provided quickly."
    ]
    ignored_risks = [
        "Fixing the symptom without addressing the root cause can lead to repeat incidents.",
        "Poor expectation management can amplify dissatisfaction."
    ]

    if mode == "overconfident":
        proposal[1] = "Promise a full fix within 24 hours to reassure the customer."
        ignored_risks.append("Overpromising resolution time beyond SLA capacity.")
    elif mode == "fragile":
        assumptions.append("We can close the ticket quickly without diagnostics.")

    return {
        "proposal": proposal,
        "assumptions": assumptions,
        "ignored_risks": ignored_risks,
        "citations": [d["id"] for d in docs],
    }
