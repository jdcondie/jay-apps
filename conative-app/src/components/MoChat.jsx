import { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { S } from '../styles/theme.js';
import { MODE_LABELS, STRENGTH_DATA, DOMINANT_NARRATIVES, RESISTANCE_NARRATIVES, DANGER_ZONES } from '../data/strengthData.js';

function buildSystemPrompt(results) {
  const { mo, scores, energy, zones, strengths, dominant, resistance } = results;
  const modes = ['FF', 'FT', 'QS', 'IMP'];

  const dims = modes.map(m => {
    const s = STRENGTH_DATA[m][zones[m]];
    return `- ${MODE_LABELS[m]} (${m}): Score ${scores[m]}/10 · Zone: ${zones[m]} · Strength: ${s.name} (${s.title})
  Superpower: ${s.superpower}
  Shadow: ${s.shadow}
  At best: ${s.atBest}
  Under stress: ${s.underStress}`;
  }).join('\n');

  const dom = DOMINANT_NARRATIVES[dominant];
  const dz = DANGER_ZONES;

  return `You are a personal advisor who helps people understand and apply their behavioral wiring from the Conative Assessment.

The user's full profile:
MO Code: ${mo}
Dominant Mode: ${dominant} (${MODE_LABELS[dominant]}) — ${strengths[dominant].title}
Resistance Mode: ${resistance} (${MODE_LABELS[resistance]})

DIMENSION BREAKDOWN:
${dims}

HOW THEY OPERATE:
${dom.how}

WHAT SUCCESS FEELS LIKE FOR THEM:
${dom.success}

HOW THEY RESET:
${dom.reset}

THEIR PROCRASTINATION PATTERN:
${dom.procrastination}

RESISTANCE (${MODE_LABELS[resistance]}):
${RESISTANCE_NARRATIVES[resistance]}

DANGER ZONES:
${modes.map(m => `${MODE_LABELS[m]}: High score risk — ${DANGER_ZONES[m].high} / Low score risk — ${DANGER_ZONES[m].low}`).join('\n')}

Your job: help them apply this wiring to real decisions, work structure, career moves, team dynamics, relationships, and daily habits. Reference their specific data when relevant. Be direct, practical, and specific — not generic. Speak like a peer, not a coach. Keep responses focused and concise. Don't pad. If they ask about something outside their wiring, answer briefly and bring it back to what their profile reveals.`;
}

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export default function MoChat({ results, onBack }) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (API_KEY) {
      clientRef.current = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setStreaming(true);
    setStreamContent('');

    try {
      const stream = clientRef.current.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: buildSystemPrompt(results),
        messages: history.map(m => ({ role: m.role, content: m.content })),
      });

      let full = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
          full += chunk.delta.text;
          setStreamContent(full);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }]);
      setStreamContent('');
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
      setStreamContent('');
    }
    setStreaming(false);
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!API_KEY) {
    return (
      <div style={{ minHeight: '100vh', background: S.black }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid #2a2a2a', color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>← DASHBOARD</button>
        </div>
        <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: S.bebas, fontSize: 48, color: S.white, marginBottom: 24 }}>ONE STEP NEEDED</div>
          <div style={{ fontFamily: S.cormorant, fontSize: 16, color: S.onDarkBody, lineHeight: 1.7, marginBottom: 32 }}>
            Add your Anthropic API key to <code style={{ fontFamily: S.mono, fontSize: 13, color: '#666', background: '#111', padding: '2px 6px' }}>.env.local</code> to enable the chat.
          </div>
          <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', padding: '20px 24px', textAlign: 'left' }}>
            <div style={{ fontFamily: S.mono, fontSize: 12, color: S.onDarkDim, lineHeight: 1.8 }}>
              VITE_ANTHROPIC_API_KEY=sk-ant-...
            </div>
          </div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.onDarkDim, marginTop: 16, letterSpacing: '0.1em' }}>
            Then restart the dev server.
          </div>
        </div>
      </div>
    );
  }

  const STARTERS = [
    "How should I structure my workday given my wiring?",
    "What kinds of work will drain me fastest?",
    "What should I look for in a business partner?",
    "How do I know when I'm operating in my danger zone?",
  ];

  return (
    <div style={{ minHeight: '100vh', background: S.black, display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid #2a2a2a', color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>← DASHBOARD</button>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.onDarkDim }}>CHAT WITH YOUR MO</div>
        <div style={{ width: 80 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', maxWidth: 680, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {messages.length === 0 && !streaming && (
          <div style={{ paddingBottom: 32 }}>
            <div style={{ fontFamily: S.bebas, fontSize: 'clamp(28px, 5vw, 42px)', color: S.white, marginBottom: 12, lineHeight: 0.95 }}>ASK ANYTHING ABOUT<br/>YOUR WIRING</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 15, color: S.onDarkDim, fontStyle: 'italic', marginBottom: 40 }}>
              Decisions, work structure, team dynamics, career moves. All grounded in your actual profile.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STARTERS.map(s => (
                <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  style={{ fontFamily: S.cormorant, fontSize: 15, color: S.onDarkBody, background: 'transparent', border: '1px solid #1a1a1a', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a3a'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 28, display: 'flex', gap: 16, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, flexShrink: 0, paddingTop: 4, letterSpacing: '0.1em' }}>
              {m.role === 'user' ? 'YOU' : 'MO'}
            </div>
            <div style={{
              fontFamily: m.role === 'user' ? S.mono : S.cormorant,
              fontSize: m.role === 'user' ? 12 : 15,
              color: m.role === 'user' ? S.onDarkDim : S.onDarkBody,
              lineHeight: 1.75,
              maxWidth: '85%',
              textAlign: m.role === 'user' ? 'right' : 'left',
              whiteSpace: 'pre-wrap',
            }}>{m.content}</div>
          </div>
        ))}

        {streaming && streamContent && (
          <div style={{ marginBottom: 28, display: 'flex', gap: 16 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, flexShrink: 0, paddingTop: 4, letterSpacing: '0.1em' }}>MO</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 15, color: S.onDarkBody, lineHeight: 1.75, maxWidth: '85%', whiteSpace: 'pre-wrap' }}>
              {streamContent}<span style={{ opacity: 0.4, animation: 'pulse 1s infinite' }}>▋</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 0 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your wiring..."
            rows={1}
            style={{ flex: 1, background: '#0f0f0f', border: '1px solid #2a2a2a', borderRight: 'none', color: S.white, fontFamily: S.mono, fontSize: 12, padding: '12px 14px', outline: 'none', resize: 'none', letterSpacing: '0.04em', lineHeight: 1.5 }}
          />
          <button onClick={send} disabled={streaming || !input.trim()}
            style={{ fontFamily: S.bebas, fontSize: 16, letterSpacing: '0.08em', background: input.trim() && !streaming ? S.white : '#1a1a1a', color: input.trim() && !streaming ? S.black : '#333', border: 'none', padding: '0 24px', cursor: input.trim() && !streaming ? 'pointer' : 'default', transition: 'all 0.15s', flexShrink: 0 }}
          >SEND</button>
        </div>
        {!isMobile && <div style={{ maxWidth: 680, margin: '8px auto 0', fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, letterSpacing: '0.08em' }}>ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</div>}
      </div>
    </div>
  );
}
