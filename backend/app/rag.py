from pathlib import Path
from typing import List, Dict

KB_DIR = Path(__file__).parent / "knowledge_base"


def load_docs() -> List[Dict]:
    docs: List[Dict] = []
    if not KB_DIR.exists():
        return docs

    for p in KB_DIR.glob("*.md"):
        docs.append({"id": p.stem, "text": p.read_text(encoding="utf-8")})
    return docs


def retrieve(query: str, k: int = 3) -> List[Dict]:
    """
    Tiny retrieval (no embeddings):
    ranks docs by naive keyword overlap with the query.
    Good enough for a demo + traceability.
    """
    docs = load_docs()
    if not docs:
        return []

    q = query.lower()
    q_words = [w.strip(".,:;!?()[]{}\"'").lower() for w in q.split() if len(w) > 2]

    scored = []
    for d in docs:
        text = d["text"].lower()
        score = sum(1 for w in q_words if w in text)
        scored.append((score, d))

    scored.sort(key=lambda x: x[0], reverse=True)

    top = [d for score, d in scored if score > 0][:k]
    return top if top else docs[:k]
