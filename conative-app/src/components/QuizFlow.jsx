import { S } from '../styles/theme.js';

export default function QuizFlow({ question, index, total, response, onSelect, onNext, onBack }) {
  const { most, least } = response || {};
  const canProceed = most && least;
  const getState = (optId) => { if (most === optId) return "most"; if (least === optId) return "least"; return "none"; };
  const handleClick = (optId) => {
    const current = getState(optId);
    if (current === "most") { onSelect(question.id, { most: null, least }); return; }
    if (current === "least") { onSelect(question.id, { most, least: null }); return; }
    if (!most) { onSelect(question.id, { most: optId, least }); return; }
    if (!least) { onSelect(question.id, { most, least: optId }); return; }
  };
  const pct = Math.round(((index) / total) * 100);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: S.white }}>
      <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.mid }}>{index + 1} OF {total}</div>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.mid }}>{pct}%</div>
      </div>
      <div style={{ height: 2, background: S.rule, margin: "8px 24px 0" }}>
        <div style={{ height: "100%", background: S.black, width: `${pct}%`, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.2em", color: S.mid, marginBottom: 12 }}>WHEN FREE TO BE MYSELF...</div>
        <h2 style={{ fontFamily: S.cormorant, fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 500, lineHeight: 1.35, color: S.black, margin: "0 0 8px" }}>{question.stem}</h2>
        <p style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, letterSpacing: "0.15em", marginBottom: 24 }}>
          {!most ? "TAP YOUR MOST LIKELY ACTION" : !least ? "NOW TAP YOUR LEAST LIKELY ACTION" : "SELECTIONS COMPLETE. TAP TO CHANGE."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${S.rule}` }}>
          {question.options.map((opt) => {
            const state = getState(opt.id);
            const bg = state === "most" ? S.black : state === "least" ? "#e8e4dc" : "transparent";
            const color = state === "most" ? S.white : S.black;
            const label = state === "most" ? "MOST" : state === "least" ? "LEAST" : "";
            return (
              <button key={opt.id} onClick={() => handleClick(opt.id)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "18px 20px", background: bg, color, border: "none",
                borderBottom: `1px solid ${state === "most" ? "#333" : S.rule}`,
                fontFamily: S.cormorant, fontSize: 18, fontWeight: 400, cursor: "pointer",
                textAlign: "left", transition: "all 0.15s", lineHeight: 1.4
              }}>
                <span>{opt.text}</span>
                {label && <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: "0.2em", opacity: 0.7 }}>{label}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          <button onClick={onBack} disabled={index === 0} style={{
            fontFamily: S.mono, fontSize: 11, letterSpacing: "0.1em", background: "transparent",
            border: `1px solid ${index === 0 ? S.rule : S.black}`, color: index === 0 ? S.rule : S.black,
            padding: "10px 24px", cursor: index === 0 ? "default" : "pointer"
          }}>BACK</button>
          <button onClick={onNext} disabled={!canProceed} style={{
            fontFamily: S.bebas, fontSize: 18, letterSpacing: "0.06em",
            background: canProceed ? S.black : S.rule, color: canProceed ? S.white : S.mid,
            border: "none", padding: "10px 32px", cursor: canProceed ? "pointer" : "default",
            transition: "all 0.15s"
          }}>{index === total - 1 ? "SEE MY RESULTS" : "NEXT"}</button>
        </div>
      </div>
    </div>
  );
}
