import { useState, useEffect } from "react";

const NAVY = "#1B2A4A";
const ORANGE = "#E8541A";

const DEMO = {
  client: "Acme Construction",
  champion: "Sarah Martinez",
  month: 3,
  tier: "AI Enablement",
  fcaio: "Jay Condie",
  hoursSaved: 42,
  costSaved: 18500,
  solutionsLive: 6,
  teamTrained: 34,
  roadmap: [
    { initiative: "CEO Dashboard v2", target: "Month 3", status: "In Progress", owner: "fCAIO" },
    { initiative: "Lead follow-up automation", target: "Month 3", status: "Complete", owner: "fCAIO" },
    { initiative: "CRM data entry automation", target: "Month 2", status: "Complete", owner: "fCAIO" },
    { initiative: "Weekly report generator", target: "Month 2", status: "Complete", owner: "AI Champion" },
    { initiative: "Scheduling bot", target: "Month 4", status: "Planned", owner: "fCAIO" },
    { initiative: "Inventory forecasting", target: "Month 4", status: "Planned", owner: "fCAIO" },
    { initiative: "Team onboarding AI guide", target: "Month 5", status: "Planned", owner: "AI Champion" },
  ],
  solutions: [
    { name: "CEO Dashboard", level: 3, status: "Live", dept: "Leadership", impact: "4 hrs/wk saved" },
    { name: "Lead Auto-Response", level: 2, status: "Live", dept: "Sales", impact: "< 2 min response" },
    { name: "CRM Auto-Entry", level: 2, status: "Live", dept: "Sales", impact: "6 hrs/wk saved" },
    { name: "Weekly P&L Report", level: 1, status: "Live", dept: "Finance", impact: "3 hrs/wk saved" },
    { name: "Proposal Generator", level: 2, status: "Live", dept: "Operations", impact: "5 hrs/wk saved" },
    { name: "Customer FAQ Bot", level: 2, status: "Live", dept: "Support", impact: "8 hrs/wk saved" },
  ],
  briefs: [
    { title: "Subcontractor invoice matching", submitter: "Sarah M.", level: 2, priority: "High", status: "Approved" },
    { title: "Job site photo organization", submitter: "Mike R.", level: 1, priority: "Medium", status: "In Review" },
    { title: "Material reorder alerts", submitter: "Sarah M.", level: 2, priority: "High", status: "Queued" },
    { title: "Employee PTO tracker", submitter: "Lisa K.", level: 1, priority: "Low", status: "In Review" },
  ],
  training: [
    { date: "Mar 28", topic: "Prompt engineering for project managers", attendees: 12, type: "Group" },
    { date: "Mar 14", topic: "CRM automation walkthrough", attendees: 8, type: "Group" },
    { date: "Mar 7", topic: "AI Champion deep-dive: solution briefs", attendees: 1, type: "1:1" },
    { date: "Feb 28", topic: "Intro to AI tools (all-hands)", attendees: 34, type: "Group" },
  ],
  cadence: {
    week: 3,
    items: [
      { week: 1, label: "Executive Alignment", desc: "KPI review, roadmap adjustment", done: true },
      { week: 2, label: "Dept Activation", desc: "Operations deep-dive", done: true },
      { week: 3, label: "Implementation", desc: "CEO Dashboard v2, scheduling bot", done: false },
      { week: 4, label: "Training + Report", desc: "AI for field teams", done: false },
    ],
  },
};

const tabs = ["Overview", "Roadmap", "Solutions", "Briefs", "Training"];

function fmt(n) { return "$" + n.toLocaleString(); }

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 900);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function StatusBadge({ status }) {
  const colors = {
    "Complete": { bg: "#dcfce7", color: "#166534" },
    "Live": { bg: "#dcfce7", color: "#166534" },
    "In Progress": { bg: "#fef3c7", color: "#92400e" },
    "Planned": { bg: "#e0e7ff", color: "#3730a3" },
    "Approved": { bg: "#dcfce7", color: "#166534" },
    "In Review": { bg: "#fef3c7", color: "#92400e" },
    "Queued": { bg: "#e0e7ff", color: "#3730a3" },
  };
  const c = colors[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function KPICard({ label, value, sub, mobile }) {
  return (
    <div style={{
      background: "white", borderRadius: 14, padding: mobile ? "14px 14px" : "20px 18px",
      border: "1px solid #e5e7eb", flex: 1, minWidth: mobile ? "calc(50% - 6px)" : 140,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: mobile ? 22 : 28, fontWeight: 800, color: NAVY }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Mobile card for list items
function MobileCard({ children }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: "1px solid #e5e7eb", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function CardRow({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{children}</span>
    </div>
  );
}

export default function ClientPortal() {
  const [tab, setTab] = useState("Overview");
  const w = useWidth();
  const mobile = w < 640;
  const d = DEMO;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .scroll-table { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      `}</style>

      {/* Nav */}
      <div style={{ background: NAVY, padding: mobile ? "14px 16px" : "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: ORANGE, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>AI Operating System</div>
          <div style={{ color: "white", fontSize: mobile ? 16 : 18, fontWeight: 800, marginTop: 2 }}>{d.client}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#94a3b8", fontSize: 11 }}>Month {d.month}</div>
          <div style={{ color: "#94a3b8", fontSize: 11 }}>{d.tier}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", padding: mobile ? "0 12px" : "0 24px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: mobile ? "12px 14px" : "14px 20px",
            background: "none", border: "none",
            borderBottom: tab === t ? `3px solid ${ORANGE}` : "3px solid transparent",
            color: tab === t ? NAVY : "#6b7280",
            fontWeight: tab === t ? 800 : 500,
            fontSize: mobile ? 13 : 14,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "16px 12px" : "24px 20px" }}>

        {/* ── OVERVIEW ──────────────────────────────────────── */}
        {tab === "Overview" && (
          <>
            <div style={{ display: "flex", gap: mobile ? 8 : 12, marginBottom: mobile ? 16 : 24, flexWrap: "wrap" }}>
              <KPICard label="Hours Saved" value={`${d.hoursSaved} hrs`} sub="cumulative" mobile={mobile} />
              <KPICard label="Cost Saved" value={fmt(d.costSaved)} sub="cumulative" mobile={mobile} />
              <KPICard label="Solutions Live" value={d.solutionsLive} mobile={mobile} />
              <KPICard label="Team Trained" value={d.teamTrained} sub="employees" mobile={mobile} />
            </div>

            <div style={{ background: "white", borderRadius: 14, padding: mobile ? "16px 14px" : "20px 22px", border: "1px solid #e5e7eb", marginBottom: mobile ? 16 : 24 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 14 }}>This Month</div>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: mobile ? 8 : 10 }}>
                {d.cadence.items.map((item, i) => (
                  <div key={i} style={{
                    padding: mobile ? "12px 10px" : "14px 12px",
                    borderRadius: 10,
                    border: d.cadence.week === item.week ? `2px solid ${ORANGE}` : "1px solid #e5e7eb",
                    background: item.done ? "#f0fdf4" : d.cadence.week === item.week ? "#fff7ed" : "#fafafa",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: item.done ? "#16a34a" : d.cadence.week === item.week ? ORANGE : "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                      Wk {item.week} {item.done ? "\u2713" : d.cadence.week === item.week ? "NOW" : ""}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{item.label}</div>
                    {!mobile && <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.4 }}>{item.desc}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mobile ? 8 : 12 }}>
              <div style={{ background: "white", borderRadius: 14, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Your fCAIO</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{d.fcaio}</div>
              </div>
              <div style={{ background: "white", borderRadius: 14, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>AI Champion</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{d.champion}</div>
              </div>
            </div>
          </>
        )}

        {/* ── ROADMAP ───────────────────────────────────────── */}
        {tab === "Roadmap" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 14 }}>90-Day Roadmap</div>
            {mobile ? (
              d.roadmap.map((r, i) => (
                <MobileCard key={i}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{r.initiative}</div>
                  <CardRow label="Target">{r.target}</CardRow>
                  <CardRow label="Status"><StatusBadge status={r.status} /></CardRow>
                  <CardRow label="Owner">{r.owner}</CardRow>
                </MobileCard>
              ))
            ) : (
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      {["Initiative", "Target", "Status", "Owner"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#6b7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.roadmap.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fafafa" : "white" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{r.initiative}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{r.target}</td>
                        <td style={{ padding: "12px 14px" }}><StatusBadge status={r.status} /></td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{r.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SOLUTIONS ─────────────────────────────────────── */}
        {tab === "Solutions" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 14 }}>Deployed Solutions</div>
            {mobile ? (
              d.solutions.map((s, i) => (
                <MobileCard key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{s.name}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: NAVY, color: "white" }}>L{s.level}</span>
                  </div>
                  <CardRow label="Dept">{s.dept}</CardRow>
                  <CardRow label="Status"><StatusBadge status={s.status} /></CardRow>
                  <CardRow label="Impact"><span style={{ color: "#16a34a" }}>{s.impact}</span></CardRow>
                </MobileCard>
              ))
            ) : (
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      {["Solution", "Level", "Department", "Status", "Impact"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#6b7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.solutions.map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fafafa" : "white" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{s.name}</td>
                        <td style={{ padding: "12px 14px" }}><span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: NAVY, color: "white" }}>L{s.level}</span></td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{s.dept}</td>
                        <td style={{ padding: "12px 14px" }}><StatusBadge status={s.status} /></td>
                        <td style={{ padding: "12px 14px", color: "#16a34a", fontWeight: 600 }}>{s.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BRIEFS ────────────────────────────────────────── */}
        {tab === "Briefs" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>Solution Brief Backlog</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Opportunities submitted by the AI Champion and team.</div>
            {mobile ? (
              d.briefs.map((b, i) => (
                <MobileCard key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{b.title}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: NAVY, color: "white" }}>L{b.level}</span>
                  </div>
                  <CardRow label="By">{b.submitter}</CardRow>
                  <CardRow label="Priority"><span style={{ fontWeight: 700, color: b.priority === "High" ? "#dc2626" : b.priority === "Medium" ? "#d97706" : "#6b7280" }}>{b.priority}</span></CardRow>
                  <CardRow label="Status"><StatusBadge status={b.status} /></CardRow>
                </MobileCard>
              ))
            ) : (
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      {["Brief", "Submitted By", "Level", "Priority", "Status"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#6b7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.briefs.map((b, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fafafa" : "white" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.title}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{b.submitter}</td>
                        <td style={{ padding: "12px 14px" }}><span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: NAVY, color: "white" }}>L{b.level}</span></td>
                        <td style={{ padding: "12px 14px" }}><span style={{ fontWeight: 700, color: b.priority === "High" ? "#dc2626" : b.priority === "Medium" ? "#d97706" : "#6b7280" }}>{b.priority}</span></td>
                        <td style={{ padding: "12px 14px" }}><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TRAINING ──────────────────────────────────────── */}
        {tab === "Training" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 14 }}>Training Log</div>
            {mobile ? (
              d.training.map((t, i) => (
                <MobileCard key={i}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{t.topic}</div>
                  <CardRow label="Date">{t.date}</CardRow>
                  <CardRow label="Type">
                    <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: t.type === "1:1" ? "#fef3c7" : "#e0e7ff", color: t.type === "1:1" ? "#92400e" : "#3730a3" }}>{t.type}</span>
                  </CardRow>
                  <CardRow label="Attendees">{t.attendees}</CardRow>
                </MobileCard>
              ))
            ) : (
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      {["Date", "Topic", "Type", "Attendees"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#6b7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.training.map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fafafa" : "white" }}>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{t.date}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{t.topic}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: t.type === "1:1" ? "#fef3c7" : "#e0e7ff", color: t.type === "1:1" ? "#92400e" : "#3730a3" }}>{t.type}</span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{t.attendees}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
