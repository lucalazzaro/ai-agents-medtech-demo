"use client";

import { useMemo, useState } from "react";

type Mode = "realistic" | "fragile" | "overconfident";
type Orchestrator = "manual" | "datapizza";

/**
 * Put your PNGs here:
 * web/public/avatars/
 *  - sales.png
 *  - marketing.png
 *  - customer_service.png
 *  - finance.png
 *  - coordinator.png
 */
const AVATARS: Record<string, string> = {
  sales: "/avatars/sales.png",
  marketing: "/avatars/marketing.png",
  customer_service: "/avatars/customer_service.png",
  finance: "/avatars/finance.png",
  coordinator: "/avatars/coordinator.png",
};

const STEP_ORDER = ["sales", "marketing", "customer_service", "finance", "coordinator"];

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function riskMeta(risk?: string) {
  const r = (risk || "").toUpperCase();
  if (r === "HIGH") return { label: "HIGH", hint: "Human decision required.", tone: "danger" as const };
  if (r === "MEDIUM") return { label: "MEDIUM", hint: "Proceed carefully. Review before execution.", tone: "warn" as const };
  if (r === "LOW") return { label: "LOW", hint: "Low risk. Still verify assumptions.", tone: "ok" as const };
  return { label: (risk || "—").toUpperCase(), hint: "—", tone: "neutral" as const };
}

function toneStyles(tone: "ok" | "warn" | "danger" | "neutral") {
  if (tone === "ok") return { bg: "#ECFDF5", border: "#10B981", text: "#065F46" };
  if (tone === "warn") return { bg: "#FFFBEB", border: "#F59E0B", text: "#92400E" };
  if (tone === "danger") return { bg: "#FEF2F2", border: "#EF4444", text: "#7F1D1D" };
  return { bg: "#F3F4F6", border: "#9CA3AF", text: "#111827" };
}

function actionLabel(riskLabel: string) {
  const r = (riskLabel || "").toUpperCase();
  if (r === "LOW") return "Safe to proceed";
  if (r === "MEDIUM") return "Review before execution";
  if (r === "HIGH") return "Blocked — human approval required";
  return "—";
}

function trafficDotColor(level: "LOW" | "MEDIUM" | "HIGH") {
  if (level === "LOW") return "#10B981";
  if (level === "MEDIUM") return "#F59E0B";
  return "#EF4444";
}

function pickTop2(list: any): string[] {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 2).filter((x) => typeof x === "string");
}

function pickTop1(list: any): string | null {
  if (!Array.isArray(list)) return null;
  const v = list.find((x) => typeof x === "string");
  return v ?? null;
}

export default function Home() {
  const API = process.env.NEXT_PUBLIC_API_BASE;

  const [scenarioId, setScenarioId] = useState<string>("product_launch");
  const [mode, setMode] = useState<Mode>("realistic");
  const [orchestrator, setOrchestrator] = useState<Orchestrator>("manual");

  const [result, setResult] = useState<any>(null);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = result?.steps || [];

  const orderedSteps = useMemo(() => {
    const rank = (role: string) => {
      const idx = STEP_ORDER.indexOf(role);
      return idx === -1 ? 999 : idx;
    };
    return [...steps].sort((a: any, b: any) => rank(String(a?.role || "")) - rank(String(b?.role || "")));
  }, [steps]);

  const coordinatorStep = useMemo(() => {
    return orderedSteps.find((s: any) => s?.role === "coordinator") ?? null;
  }, [orderedSteps]);

  const summary = result?.summary ?? coordinatorStep?.output ?? null;
  const risk = riskMeta(summary?.risk_level);
  const badge = toneStyles(risk.tone);

  async function loadScenarios() {
    if (!API) return;
    try {
      const res = await fetch(`${API}/scenarios`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.scenarios)) setScenarios(data.scenarios);
    } catch {
      // optional
    }
  }

  async function runDemo() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!API) throw new Error("NEXT_PUBLIC_API_BASE is missing (web/.env.local).");
      if (!scenarios.length) loadScenarios();

      const res = await fetch(`${API}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: scenarioId,
          mode,
          human_gate: true,
          orchestrator, // backend may ignore; kept for storytelling
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Backend responded ${res.status}. ${txt}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 18px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Project: MedTech AI Team (Multi-Agent)</div>
            <h1 style={{ fontSize: 40, lineHeight: 1.05, margin: 0, letterSpacing: -0.8 }}>
              An “office” of AI agents…
              <span style={{ color: "#475569" }}> and the cracks show fast.</span>
            </h1>
            <p style={{ marginTop: 12, maxWidth: 760, color: "#334155", fontSize: 16, lineHeight: 1.45 }}>
              Four virtual teammates propose a business decision under pressure.
              They sound confident. They cite policies. They can still fail — and humans must step in.
            </p>
          </div>

          {/* Status / traffic light */}
          <div
            style={{
              minWidth: 300,
              border: `1px solid ${badge.border}`,
              background: badge.bg,
              color: badge.text,
              borderRadius: 14,
              padding: 14,
              boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.85 }}>Office status</div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(["HIGH", "MEDIUM", "LOW"] as const).map((level) => {
                  const active = level === risk.label;
                  const color = trafficDotColor(level as any);
                  return (
                    <div
                      key={level}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: active ? color : "#E5E7EB",
                        border: "1px solid #CBD5E1",
                      }}
                      title={level}
                    />
                  );
                })}
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Risk: <b>{risk.label}</b></div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 3 }}>{actionLabel(risk.label)}</div>
                <div style={{ fontSize: 13, marginTop: 6, opacity: 0.95 }}>{risk.hint}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            marginTop: 18,
            border: "1px solid #E2E8F0",
            background: "white",
            borderRadius: 16,
            padding: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            boxShadow: "0 8px 20px rgba(2,6,23,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#475569", width: 70 }}>Scenario</span>
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #CBD5E1" }}
            >
              {(scenarios.length ? scenarios : ["product_launch", "customer_escalation"]).map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#475569", width: 70 }}>Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #CBD5E1" }}
            >
              <option value="realistic">Realistic</option>
              <option value="fragile">Fragile</option>
              <option value="overconfident">Overconfident</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#475569", width: 92 }}>Orchestration</span>
            <select
              value={orchestrator}
              onChange={(e) => setOrchestrator(e.target.value as Orchestrator)}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #CBD5E1" }}
            >
              <option value="manual">Manual (fallback)</option>
              <option value="datapizza">Datapizza (demo)</option>
            </select>
          </div>

          <button
            onClick={runDemo}
            disabled={loading}
            style={{
              marginLeft: "auto",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #0F172A",
              background: "#0F172A",
              color: "white",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Running…" : "Run demo"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #FCA5A5",
              background: "#FEF2F2",
              color: "#7F1D1D",
            }}
          >
            <b>Error:</b> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            {/* Coordinator summary */}
            <section style={{ border: "1px solid #E2E8F0", background: "white", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>Coordinator summary</h2>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  Run ID: <code>{result.run_id}</code>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Final plan</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "#0F172A" }}>
                    {(summary?.final_plan || []).map((x: string, i: number) => (
                      <li key={i} style={{ marginBottom: 6 }}>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Why it might fail</div>
                  <div style={{ color: "#0F172A", lineHeight: 1.35 }}>
                    {summary?.why_it_might_fail || "—"}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: "#64748B", marginBottom: 6 }}>
                    Recommended human action
                  </div>
                  <div style={{ color: "#0F172A", lineHeight: 1.35 }}>
                    {summary?.recommended_human_action || "—"}
                  </div>
                </div>
              </div>

              {/* Human gate banner (optional: shown only if backend returns status) */}
              {summary?.status === "BLOCKED_PENDING_HUMAN" && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #EF4444",
                    background: "#FEF2F2",
                    color: "#7F1D1D",
                  }}
                >
                  <b>Blocked.</b> Human approval is required before execution.
                </div>
              )}
            </section>

            {/* Decision flow timeline */}
            <section style={{ border: "1px solid #E2E8F0", background: "white", borderRadius: 16, padding: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Decision flow (read top → bottom)</h2>
              <p style={{ marginTop: 6, marginBottom: 14, color: "#475569" }}>
                A simple sequence: each agent proposes, the coordinator consolidates, and the system highlights where humans must intervene.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {orderedSteps.map((s: any, idx: number) => {
                  const role = String(s?.role || "");
                  const avatar = AVATARS[role] || AVATARS["coordinator"];
                  const isCoordinator = role === "coordinator";

                  const proposalTop = isCoordinator
                    ? pickTop2(s?.output?.final_plan)
                    : pickTop2(s?.output?.proposal);

                  const ignoredTop = pickTop1(s?.output?.ignored_risks);
                  const citations = Array.isArray(s?.output?.citations) ? s.output.citations : [];

                  return (
                    <div key={`${role}-${idx}`} style={{ display: "flex", gap: 14 }}>
                      {/* Step number */}
                      <div
                        style={{
                          minWidth: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "#0F172A",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                        }}
                      >
                        {idx + 1}
                      </div>

                      {/* Card */}
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #E2E8F0",
                          borderRadius: 14,
                          padding: 14,
                          background: "#FFFFFF",
                        }}
                      >
                        {/* Header with avatar */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img
                              src={avatar}
                              alt={role}
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                border: "1px solid #E2E8F0",
                                background: "#F8FAFC",
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 900 }}>
                                {isCoordinator ? "Coordinator" : titleCase(role)}
                              </div>
                              <div style={{ fontSize: 12, color: "#64748B" }}>
                                {s?.name || (isCoordinator ? "Decision" : "Proposal")} · {s?.ms ?? 0} ms
                              </div>
                            </div>
                          </div>

                          {/* Tiny label */}
                          <div style={{ fontSize: 12, color: "#64748B" }}>
                            {isCoordinator ? "Final decision" : "Agent output"}
                          </div>
                        </div>

                        {/* Always-visible: main proposal */}
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 12, color: "#64748B" }}>
                            {isCoordinator ? "Final plan" : "Proposal (short)"}
                          </div>
                          <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                            {(proposalTop.length ? proposalTop : ["—"]).map((x: string, i: number) => (
                              <li key={i} style={{ marginBottom: 6, color: "#0F172A" }}>
                                {x}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Always-visible: one sharp risk */}
                        {!isCoordinator && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: 12, color: "#64748B" }}>One risk it might ignore</div>
                            <div style={{ marginTop: 6, color: "#0F172A", lineHeight: 1.35 }}>
                              {ignoredTop ?? "—"}
                            </div>
                          </div>
                        )}

                        {/* Citations always visible */}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 12, color: "#64748B" }}>Citations (minimal RAG)</div>
                          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {(citations.length ? citations : ["—"]).map((c: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: 12,
                                  padding: "4px 8px",
                                  borderRadius: 999,
                                  border: "1px solid #CBD5E1",
                                  background: "#F8FAFC",
                                  color: "#0F172A",
                                }}
                                title="Retrieved from knowledge_base"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Details collapsible */}
                        <details style={{ marginTop: 12 }}>
                          <summary style={{ cursor: "pointer", color: "#0F172A", fontWeight: 700 }}>
                            Show details
                          </summary>

                          {!isCoordinator && (
                            <>
                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: 12, color: "#64748B" }}>Assumptions</div>
                                <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                                  {(s?.output?.assumptions || []).map((x: string, i: number) => (
                                    <li key={i} style={{ marginBottom: 6, color: "#0F172A" }}>
                                      {x}
                                    </li>
                                  ))}
                                  {!Array.isArray(s?.output?.assumptions) && <li style={{ color: "#0F172A" }}>—</li>}
                                </ul>
                              </div>

                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: 12, color: "#64748B" }}>Ignored risks</div>
                                <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
                                  {(s?.output?.ignored_risks || []).map((x: string, i: number) => (
                                    <li key={i} style={{ marginBottom: 6, color: "#0F172A" }}>
                                      {x}
                                    </li>
                                  ))}
                                  {!Array.isArray(s?.output?.ignored_risks) && <li style={{ color: "#0F172A" }}>—</li>}
                                </ul>
                              </div>
                            </>
                          )}

                          {isCoordinator && (
                            <div style={{ marginTop: 10 }}>
                              <div style={{ fontSize: 12, color: "#64748B" }}>Human handoff</div>
                              <div style={{ marginTop: 6, color: "#0F172A", lineHeight: 1.35 }}>
                                <b>Why it might fail:</b> {s?.output?.why_it_might_fail || "—"}
                                <br />
                                <b>Recommended human action:</b> {s?.output?.recommended_human_action || "—"}
                              </div>
                            </div>
                          )}
                        </details>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Footer note */}
            <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", padding: "6px 0 18px 0" }}>
              Demo note: outputs are synthetic. RAG is minimal by design. Humans remain accountable.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
