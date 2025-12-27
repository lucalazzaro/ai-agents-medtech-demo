def aggregate(mode, sales, marketing, cs, finance):
    if mode == "realistic":
        return {
            "decision": [
                "Balanced launch plan",
                "Compliance-safe messaging",
                "Controlled discounts"
            ],
            "risk_level": "MEDIUM",
            "why_it_might_fail": "Coordination complexity and missing data",
            "recommended_human_action": "Validate assumptions and policies"
        }

    return {
        "decision": [
            "Accelerate closure with aggressive discount",
            "Standardized response to escalation"
        ],
        "risk_level": "HIGH",
        "why_it_might_fail": "Overconfidence and misaligned incentives",
        "recommended_human_action": "Block and request missing information"
    }
