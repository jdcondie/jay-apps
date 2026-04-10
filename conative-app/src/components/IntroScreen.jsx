import { S } from '../styles/theme.js';

export default function IntroScreen({ onStart, onSignIn }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: S.black, padding: "48px 24px", textAlign: "center", position: "relative" }}>
      {onSignIn && (
        <button onClick={onSignIn} style={{
          position: "absolute", top: 20, right: 24, fontFamily: S.mono, fontSize: 10,
          letterSpacing: "0.1em", background: "transparent", border: "1px solid #2a2a2a",
          color: S.mid, padding: "10px 14px", cursor: "pointer"
        }}>SIGN IN</button>
      )}
      <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: S.onDarkDim, marginBottom: 32 }}>Behavioral Assessment / Personal Operating Manual</div>
      <h1 style={{ fontFamily: S.bebas, fontSize: "clamp(60px, 14vw, 140px)", lineHeight: 0.9, color: S.white, letterSpacing: -1, margin: 0 }}>HOW ARE<br/>YOU WIRED?</h1>
      <p style={{ fontFamily: S.cormorant, fontSize: "clamp(17px, 2.5vw, 22px)", fontStyle: "italic", color: S.onDarkBody, maxWidth: 480, marginTop: 24, lineHeight: 1.55 }}>
        36 questions. No right answers. Discover how you instinctively take action, where your energy goes, and how to use your wiring instead of fighting it.
      </p>
      <p style={{ fontFamily: S.cormorant, fontSize: 15, color: S.onDarkDim, maxWidth: 420, marginTop: 16, lineHeight: 1.6 }}>
        For each question, pick the action you'd MOST likely take and the action you'd LEAST likely take. Go with your gut. Don't overthink it.
      </p>
      <button onClick={onStart} style={{ marginTop: 48, fontFamily: S.bebas, fontSize: 22, letterSpacing: "0.08em", background: S.white, color: S.black, border: "none", padding: "16px 56px", cursor: "pointer", transition: "transform 0.15s" }}
        onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
        onMouseLeave={e => e.target.style.transform = "scale(1)"}
      >BEGIN ASSESSMENT</button>
      <div style={{ fontFamily: S.mono, fontSize: 10, color: S.onDarkDim, marginTop: 24, letterSpacing: "0.15em" }}>~8 MINUTES</div>
    </div>
  );
}
