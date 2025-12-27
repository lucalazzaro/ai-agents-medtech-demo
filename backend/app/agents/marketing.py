from typing import Dict, Any
from ..rag import retrieve


async def run_marketing(payload: Dict[str, Any]) -> Dict[str, Any]:
    brief = payload.get("brief", "")
    mode = payload.get("mode", "realistic")

    docs = retrieve(f"marketing compliance claims allowed prohibited medtech {brief}", k=3)

    proposal = [
        "Run a targeted campaign focused on compliant value messaging (workflow, outcomes, safety).",
        "Create a simple landing page with approved claims and clear disclaimers."
    ]
    assumptions = [
        "A narrower audience improves lead quality.",
        "Compliance-approved messaging is available."
    ]
    ignored_risks = [
        "Vanity metrics may look good while lead quality stays low.",
        "Non-compliant wording can create regulatory and reputational risk."
    ]

    if mode == "overconfident":
        proposal[0] = "Use bold performance claims to maximize conversions and adjust later if needed."
        ignored_risks.append("Regulatory risk from exaggerated claims.")
    elif mode == "fragile":
        assumptions.append("We can finalize messaging without formal approval due to time pressure.")

    return {
        "proposal": proposal,
        "assumptions": assumptions,
        "ignored_risks": ignored_risks,
        "citations": [d["id"] for d in docs],
    }
