import { S } from '../styles/theme.js';

export default function IntroScreen({ onStart, onSignIn, resumeData, onResume, onStartFresh }) {
  const total = 36;
  const pct = resumeData ? Math.round(((resumeData.qIndex) / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: S.white, padding: "48px 24px", textAlign: "center", position: "relative" }}>
      {onSignIn && (
        <button onClick={onSignIn} style={{
          position: "absolute", top: 20, right: 24, fontFamily: S.mono, fontSize: 10,
          letterSpacing: "0.1em", background: "transparent", border: `1px solid ${S.rule}`,
          color: S.mid, padding: "10px 14px", cursor: "pointer"
        }}>SIGN IN</button>
      )}
      <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: S.mid, marginBottom: 32 }}>Behavioral Assessment / Personal Operating Manual</div>
      <h1 style={{ fontFamily: S.bebas, fontSize: "clamp(60px, 14vw, 140px)", lineHeight: 0.9, color: S.black, letterSpacing: -1, margin: 0 }}>HOW ARE<br/>YOU WIRED?</h1>
      <p style={{ fontFamily: S.cormorant, fontSize: "clamp(17px, 2.5vw, 22px)", fontStyle: "italic", color: "#333", maxWidth: 480, marginTop: 24, lineHeight: 1.55 }}>
        No right answers. Discover how you instinctively take action, where your energy goes, and how to use your wiring instead of fighting it.
      </p>
      <p style={{ fontFamily: S.cormorant, fontSize: 15, color: S.mid, maxWidth: 420, marginTop: 16, lineHeight: 1.6 }}>
        Four options per question. Pick the one you'd most likely take, then the one you'd least likely take. Go with your gut.
      </p>

      {resumeData ? (
        <div style={{ marginTop: 48, width: "100%", maxWidth: 360 }}>
          {/* Resume banner */}
          <div style={{ border: `1px solid ${S.rule}`, padding: "20px 24px", marginBottom: 12, textAlign: "left" }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: "0.2em", color: S.mid, marginBottom: 10 }}>ASSESSMENT IN PROGRESS</div>
            {/* Mini progress bar */}
            <div style={{ height: 2, background: S.rule, marginBottom: 10 }}>
              <div style={{ height: "100%", background: S.black, width: `${pct}%` }} />
            </div>
            <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginBottom: 16 }}>
              QUESTION {resumeData.qIndex + 1} OF {total} — {pct}% COMPLETE
            </div>
            <button onClick={onResume} style={{
              width: "100%", fontFamily: S.bebas, fontSize: 20, letterSpacing: "0.08em",
              background: S.black, color: S.white, border: "none", padding: "14px", cursor: "pointer",
            }}>RESUME</button>
          </div>
          <button onClick={onStartFresh} style={{
            width: "100%", fontFamily: S.mono, fontSize: 10, letterSpacing: "0.1em",
            background: "transparent", border: `1px solid ${S.rule}`, color: S.mid,
            padding: "12px", cursor: "pointer",
          }}>START OVER INSTEAD</button>
        </div>
      ) : (
        <>
          <button onClick={onStart} style={{ marginTop: 48, fontFamily: S.bebas, fontSize: 22, letterSpacing: "0.08em", background: S.black, color: S.white, border: "none", padding: "16px 56px", cursor: "pointer", transition: "transform 0.15s" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >BEGIN ASSESSMENT</button>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginTop: 24, letterSpacing: "0.15em" }}>~8 MINUTES</div>
        </>
      )}
    </div>
  );
}
