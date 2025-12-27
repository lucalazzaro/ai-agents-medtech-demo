def evaluate(risk_level: str):
    if risk_level == "HIGH":
        return ["BLOCK: High risk — human approval required"]
    return ["OK"]
