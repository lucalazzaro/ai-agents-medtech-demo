MedTech AI Agents — Human-in-the-Loop Demo

This project is a multi-agent AI demo designed to show something often ignored in AI hype:

AI agents can sound confident, structured, and policy-aware — and still fail without human supervision.

The demo simulates a small MedTech company “office” made of specialized AI agents (Sales, Marketing, Customer Service, Finance, Coordinator) collaborating on a business decision.

The goal is not automation at all costs, but clarity on:

where AI helps,

where it breaks,

and why humans remain indispensable.

Core Takeaways

This project intentionally demonstrates three conclusions:

Agent orchestration can be simple
Multi-agent systems don’t need heavy frameworks to be understandable or useful.
The architecture is Datapizza-ready to highlight modular, scalable orchestration.

RAG helps — but does not save you
Agents use minimal RAG to cite internal policies and rules.
Citations improve traceability, not judgment.

Human supervision is not optional
The system explicitly highlights risk levels and, in high-risk cases, blocks execution pending human approval.

What This Is (and Is Not)

This is:

A product-style demo

A decision-support simulation

A storytelling tool for AI limitations

A portfolio-grade project

This is not:

A chatbot

A fully autonomous system

A production-ready enterprise solution

Architecture Overview
Frontend (Next.js)
│
├─ UI (decision flow, risk semaphore, agent timeline)
├─ API calls
│
Backend (FastAPI)
│
├─ /run        → multi-agent orchestration
├─ /scenarios  → available business scenarios
├─ /health     → health check
├─ Minimal RAG → citations from internal knowledge base

Agent Roles

The demo simulates five roles:

Sales — revenue and deal velocity

Marketing — compliant messaging and pipeline generation

Customer Service — SLA, churn risk, escalation

Finance — margin, policy, sustainability

Coordinator — consolidates outputs and highlights risk

Each agent:

proposes an action,

makes assumptions,

ignores some risks,

cites internal rules (minimal RAG).

UI Storytelling

The interface is designed to be readable top → bottom:

Scenario selection

Execution mode (realistic / fragile / overconfident)

Risk semaphore (LOW / MEDIUM / HIGH)

Coordinator summary

Ordered decision flow timeline (1 → 5)

Human handoff when required

Visual Lego-style avatars are used to humanize agents without trivializing them.

Avatars Setup (Required)

Place PNG avatars here:

web/public/avatars/
├─ sales.png
├─ marketing.png
├─ customer_service.png
├─ finance.png
├─ coordinator.png


Test locally:

http://localhost:3000/avatars/sales.png

Local Development
Option 1 — Full stack (Frontend + Backend)
Backend
cd backend
python -m venv .venv
. .venv/Scripts/activate   # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000


Verify:

http://127.0.0.1:8000/health

http://127.0.0.1:8000/docs

Frontend
cd web
npm install
npm run dev


Create web/.env.local:

NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000


Open:

http://localhost:3000

Option 2 — Frontend only (UI preview)

The UI loads, but API actions require the backend to be running.

API Endpoints

GET /health — health check

GET /scenarios — available scenarios

POST /run — execute multi-agent decision flow

Deployment

This demo is designed to be deployed with:

Frontend: Vercel

Backend: Render (FastAPI)

See deployment instructions below.

Why Datapizza

The orchestration layer is designed to be Datapizza-ready to demonstrate:

simple agent definitions,

modular flows,

scalable orchestration without complex glue code.

Even when using a fallback orchestrator, the structure remains compatible with Datapizza-style workflows.

Disclaimer

All outputs are synthetic.
No real medical or financial decisions should be made using this system.

AI assists decisions.
Humans own responsibility.