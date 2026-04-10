import { useState, useEffect } from "react";

const ORANGE = "#E8541A";
const NAVY = "#1B2A4A";

function fmt(n) {
  return "$" + Math.round(n).toLocaleString();
}

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 900);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export default function ROICalculator() {
  const w = useWidth();
  const mobile = w < 700;

  const [inputs, setInputs] = useState({
    headcount: 50,
    avgSalary: 55000,
    manualHoursPerWeek: 12,
    rolesReplaceable: 1,
    replacedRoleSalary: 65000,
    leadResponseMinutes: 240,
    monthlyLeads: 80,
    closeRate: 15,
    avgDealValue: 5000,
    retainerMonthly: 15000,
  });

  const [showResults, setShowResults] = useState(false);

  function update(key, val) {
    setInputs((p) => ({ ...p, [key]: val }));
  }

  const hourlyRate = inputs.avgSalary / 2080;
  const weeklyManualCost = inputs.headcount * inputs.manualHoursPerWeek * hourlyRate;
  const productivitySavings20 = weeklyManualCost * 0.2 * 52;
  const hireAvoidance = inputs.rolesReplaceable * inputs.replacedRoleSalary;
  const isSlowResponse = inputs.leadResponseMinutes > 5;
  const missedLeadPct = isSlowResponse ? 0.09 : 0;
  const leadRecoveryRevenue = inputs.monthlyLeads * missedLeadPct * (inputs.closeRate / 100) * inputs.avgDealValue * 12;
  const totalAnnualValue = productivitySavings20 + hireAvoidance + leadRecoveryRevenue;
  const annualRetainer = inputs.retainerMonthly * 12;
  const roi = annualRetainer > 0 ? ((totalAnnualValue - annualRetainer) / annualRetainer) * 100 : 0;
  const paybackMonths = totalAnnualValue > 0 ? Math.ceil((annualRetainer / totalAnnualValue) * 12) : 99;

  const inputStyle = {
    width: "100%",
    padding: mobile ? "12px 14px" : "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: mobile ? 16 : 15,
    fontFamily: "'DM Sans', sans-serif",
    background: "#f9fafb",
    color: NAVY,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 4, display: "block" };
  const hintStyle = { fontSize: 11, color: "#6b7280", marginTop: 2 };
  const fieldWrap = { marginBottom: 16 };
  const sectionLabel = { fontSize: 13, fontWeight: 700, color: ORANGE, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 };

  function Field({ label, hint, stateKey }) {
    return (
      <div style={fieldWrap}>
        <label style={labelStyle}>{label}</label>
        <input type="number" style={inputStyle} value={inputs[stateKey]} onChange={(e) => update(stateKey, +e.target.value)} />
        {hint && <div style={hintStyle}>{hint}</div>}
      </div>
    );
  }

  const inputsPanel = (
    <div style={{ background: "white", borderRadius: 16, padding: mobile ? "20px 16px" : "24px 20px", border: "1px solid #e5e7eb" }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: "0 0 20px", paddingBottom: 10, borderBottom: `2px solid ${ORANGE}` }}>Their Numbers</h2>

      <div style={sectionLabel}>Workforce</div>
      <Field label="Total employees" stateKey="headcount" />
      <Field label="Average salary" stateKey="avgSalary" hint="Across roles that do manual/repetitive work" />
      <Field label="Manual hours per person per week" stateKey="manualHoursPerWeek" hint="Data entry, reporting, scheduling, email, etc." />

      <div style={{ ...sectionLabel, marginTop: 20 }}>Hire Avoidance</div>
      <Field label="Roles AI could replace or defer" stateKey="rolesReplaceable" hint={`"Is there anybody you've been wanting to hire?"`} />
      <Field label="Salary for that role (annual)" stateKey="replacedRoleSalary" />

      <div style={{ ...sectionLabel, marginTop: 20 }}>Lead Response</div>
      <Field label="Avg lead response time (minutes)" stateKey="leadResponseMinutes" hint="Under 5 min = no recovery shown" />
      <Field label="Monthly inbound leads" stateKey="monthlyLeads" />
      <Field label="Current close rate (%)" stateKey="closeRate" />
      <Field label="Average deal value" stateKey="avgDealValue" />

      <div style={{ ...sectionLabel, marginTop: 20 }}>Your Retainer</div>
      <Field label="Monthly retainer" stateKey="retainerMonthly" />

      {mobile && (
        <button onClick={() => setShowResults(true)} style={{
          width: "100%", padding: "16px", marginTop: 12,
          background: ORANGE, color: "white", border: "none",
          borderRadius: 12, fontSize: 16, fontWeight: 800,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
        }}>
          Calculate ROI
        </button>
      )}
    </div>
  );

  const resultsPanel = (
    <div>
      <div style={{ background: NAVY, borderRadius: 16, padding: mobile ? "24px 16px" : "28px 24px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Total Annual Value Created</div>
        <div style={{ fontSize: mobile ? 34 : 42, fontWeight: 800, color: "white" }}>{fmt(totalAnnualValue)}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>vs. {fmt(annualRetainer)}/yr retainer</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "white", borderRadius: 12, padding: "16px 12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>ROI</div>
          <div style={{ fontSize: mobile ? 28 : 32, fontWeight: 800, color: roi > 0 ? "#16a34a" : "#dc2626", marginTop: 4 }}>{Math.round(roi)}%</div>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: "16px 12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Payback</div>
          <div style={{ fontSize: mobile ? 28 : 32, fontWeight: 800, color: NAVY, marginTop: 4 }}>{paybackMonths > 12 ? "12+" : paybackMonths} mo</div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: mobile ? "18px 14px" : "24px 20px", border: "1px solid #e5e7eb", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: NAVY, margin: "0 0 16px", paddingBottom: 8, borderBottom: `2px solid ${ORANGE}` }}>Value Breakdown</h3>

        {[
          { label: "Productivity Gains (20%)", value: productivitySavings20, sub: `${inputs.headcount} people x ${inputs.manualHoursPerWeek} hrs/wk x 20%` },
          { label: "Hire Avoidance", value: hireAvoidance, sub: `${inputs.rolesReplaceable} role${inputs.rolesReplaceable !== 1 ? "s" : ""} at ${fmt(inputs.replacedRoleSalary)}` },
          ...(isSlowResponse ? [{ label: "Lead Recovery Revenue", value: leadRecoveryRevenue, sub: `9% recovered (${inputs.leadResponseMinutes} min to under 5)` }] : []),
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>{fmt(item.value)}/yr</span>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{item.sub}</div>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>Net Annual Value</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: totalAnnualValue - annualRetainer > 0 ? "#16a34a" : "#dc2626" }}>
              {fmt(totalAnnualValue - annualRetainer)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ background: "#fffbeb", borderRadius: 12, padding: mobile ? "14px" : "16px 18px", border: "1px solid #fde68a" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Talk Track</div>
        <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.6, margin: "0 0 8px" }}>
          "Right now your team is spending roughly {fmt(weeklyManualCost)} per week on manual work. If we recover even 20% of that, that's {fmt(productivitySavings20)} a year back in productive capacity."
        </p>
        {inputs.rolesReplaceable > 0 && (
          <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.6, margin: "0 0 8px" }}>
            "That {fmt(inputs.replacedRoleSalary)} hire you've been wanting to make? We can set up an AI system that handles that function for a fraction of the cost."
          </p>
        )}
        {isSlowResponse && (
          <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.6, margin: "0 0 8px" }}>
            "Your leads are waiting {inputs.leadResponseMinutes} minutes for a response. An AI follow-up system responds instantly, and that alone could recover {fmt(leadRecoveryRevenue)} a year."
          </p>
        )}
        <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.6, margin: 0 }}>
          "All in, {fmt(totalAnnualValue)} in annual value against a {fmt(annualRetainer)} investment. {Math.round(roi)}% return, paid back in {paybackMonths > 12 ? "under a year" : `${paybackMonths} months`}."
        </p>
      </div>

      {mobile && (
        <button onClick={() => setShowResults(false)} style={{
          width: "100%", padding: "14px", marginTop: 16,
          background: "white", color: NAVY, border: "1px solid #d1d5db",
          borderRadius: 12, fontSize: 14, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
        }}>
          Edit Inputs
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: mobile ? "16px 12px" : "24px 16px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>LIVE CALCULATOR</div>
          <h1 style={{ fontSize: mobile ? 22 : 26, fontWeight: 800, color: NAVY, margin: "0 0 6px" }}>AI Implementation ROI</h1>
          <p style={{ color: "#6b7280", fontSize: mobile ? 13 : 14, margin: 0 }}>Plug in their real numbers during the call. Let the math close.</p>
        </div>

        {mobile ? (
          showResults ? resultsPanel : inputsPanel
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
            {inputsPanel}
            {resultsPanel}
          </div>
        )}
      </div>
    </div>
  );
}
