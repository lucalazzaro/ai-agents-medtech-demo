from typing import Dict, Any

# Always keep a safe fallback
from .orchestrator import run_team as run_team_fallback

async def run_team(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Datapizza orchestrator (optional).

    If Datapizza is installed, you can plug it in here.
    If not installed, we fall back to the manual orchestrator
    so the demo remains runnable without extra dependencies.
    """
    try:
        # If Datapizza is installed, you can import it here.
        # NOTE: Keep output schema identical to the fallback.
        import datapizza  # noqa: F401

        # TODO: Replace this placeholder with real Datapizza flow execution
        # For now, call fallback so the project runs end-to-end.
        return await run_team_fallback(payload)

    except Exception:
        # Datapizza not installed or incompatible → keep demo working
        return await run_team_fallback(payload)
