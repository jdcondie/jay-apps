import { useState, useEffect } from 'react';
import { S } from '../styles/theme.js';

export default function ProcessingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = ["Mapping your responses", "Calculating dimensions", "Building energy profile", "Generating your operating manual"];
  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 700));
    const done = setTimeout(onDone, steps.length * 700 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: S.black, padding: 48 }}>
      <div style={{ fontFamily: S.bebas, fontSize: "clamp(36px, 6vw, 64px)", color: S.white, marginBottom: 48, textAlign: "center" }}>ANALYZING YOUR WIRING</div>
      {steps.map((s, i) => (
        <div key={i} style={{ fontFamily: S.mono, fontSize: 12, letterSpacing: "0.1em", color: step > i ? S.white : "#333", marginBottom: 12, transition: "color 0.4s" }}>
          {step > i ? "✓" : "○"} {s}
        </div>
      ))}
    </div>
  );
}
