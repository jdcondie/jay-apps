import { useState, useMemo } from 'react';
import { S } from '../styles/theme.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { CAREER_ARCHETYPES } from '../data/careerData.js';
import { scoreCareerFit } from '../scoring/careerScoring.js';

export default function RoleFitChecker({ results, onBack }) {
  const { zones, energy, dominant, resistance } = results;
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');

  const scored = useMemo(() => {
    return CAREER_ARCHETYPES
      .map(c => ({ ...c, fit: scoreCareerFit(c, zones, energy, dominant, resistance) }))
      .sort((a, b) => b.fit.alignment - a.fit.alignment);
  }, [zones, energy, dominant, resistance]);

  const filtered = useMemo(() => {
    if (!query.trim()) return scored.slice(0, 24);
    const q = query.toLowerCase();
    return scored.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      (c.tags || []).some(t => t.includes(q))
    );
  }, [query, scored]);

  const fitLabel = f => f === 1 ? 'STRONG FIT' : f === 2 ? 'MODERATE' : 'LOW FIT';
  const fitColor = f => f === 1 ? S.white : f === 2 ? '#7a766e' : '#333';
  const barColor = f => f === 1 ? S.white : f === 2 ? '#3a3a3a' : '#1e1e1e';

  return (
    <div style={{ minHeight: '100vh', background: S.black }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid #2a2a2a', color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>← DASHBOARD</button>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.onDarkDim }}>ROLE FIT</div>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '32px 16px 24px' : '48px 24px 32px' }}>
        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.onDarkDim, marginBottom: 16 }}>ROLE FIT CHECKER</div>
        <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(36px, 8vw, 64px)', color: S.white, margin: '0 0 16px', lineHeight: 0.9 }}>WHERE DOES YOUR<br/>WIRING FIT?</h2>
        <p style={{ fontFamily: S.cormorant, fontSize: 16, color: S.white, fontStyle: 'italic', margin: '0 0 32px' }}>
          78 roles ranked by energy alignment to your wiring. Search by role, category, or keyword.
        </p>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search roles, categories, keywords..."
          style={{ width: '100%', background: '#0f0f0f', border: '1px solid #2a2a2a', color: S.white, fontFamily: S.mono, fontSize: 12, padding: '14px 16px', boxSizing: 'border-box', outline: 'none', letterSpacing: '0.04em' }}
        />
      </div>

      {/* Results */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '0 16px 48px' : '0 24px 64px' }}>
        {filtered.map(c => (
          <div key={c.id} style={{ borderTop: '1px solid #1a1a1a', padding: '20px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 20, flexShrink: 0, width: 28, paddingTop: 4 }}>{c.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
                <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.white, letterSpacing: '0.04em', lineHeight: 1.1 }}>{c.title}</div>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: fitColor(c.fit.fit), letterSpacing: '0.1em', flexShrink: 0, paddingTop: 4 }}>{fitLabel(c.fit.fit)}</div>
              </div>
              <div style={{ fontFamily: S.cormorant, fontSize: 13, fontStyle: 'italic', color: S.white, marginBottom: 10 }}>{c.subtitle}</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, height: 2, background: '#111' }}>
                  <div style={{ height: '100%', background: barColor(c.fit.fit), width: `${c.fit.energyFit}%`, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, flexShrink: 0, letterSpacing: '0.08em' }}>{c.fit.energyFit}% ENERGY FIT</div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ fontFamily: S.cormorant, fontSize: 16, color: '#444', fontStyle: 'italic', textAlign: 'center', paddingTop: 48 }}>
            No roles match that search.
          </div>
        )}
      </div>
    </div>
  );
}
