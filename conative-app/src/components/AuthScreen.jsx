import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { S } from '../styles/theme.js';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Account created. You're signed in.");
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage('Check your email for a password reset link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Invalid email or password.');
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: '#111', border: `1px solid #2a2a2a`,
    color: S.white, fontFamily: S.mono, fontSize: 13, outline: 'none',
    boxSizing: 'border-box', letterSpacing: '0.05em',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: S.black, padding: '48px 24px' }}>
      <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.3em', color: S.onDarkDim, marginBottom: 32, textTransform: 'uppercase' }}>
        Behavioral Assessment / Personal Operating Manual
      </div>

      <h1 style={{ fontFamily: S.bebas, fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 0.9, color: S.white, letterSpacing: -1, margin: '0 0 40px', textAlign: 'center' }}>
        {mode === 'login' ? 'WELCOME\nBACK' : mode === 'signup' ? 'CREATE\nACCOUNT' : 'RESET\nPASSWORD'}
      </h1>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.onDarkDim, marginBottom: 8 }}>EMAIL</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{ ...inputStyle }}
          />
        </div>

        {mode !== 'reset' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.onDarkDim }}>PASSWORD</div>
              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('reset'); setError(null); setMessage(null); }} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: 'none', color: S.mid, cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
              style={{ ...inputStyle }}
            />
          </div>
        )}

        {error && (
          <div style={{ fontFamily: S.mono, fontSize: 11, color: '#dc2626', marginBottom: 16, padding: '10px 14px', background: '#1a0000', border: '1px solid #dc262633' }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ fontFamily: S.mono, fontSize: 11, color: '#16a34a', marginBottom: 16, padding: '10px 14px', background: '#001a00', border: '1px solid #16a34a33' }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '16px', fontFamily: S.bebas, fontSize: 20, letterSpacing: '0.08em',
            background: loading ? '#333' : S.white, color: loading ? S.mid : S.black,
            border: 'none', cursor: loading ? 'default' : 'pointer', transition: 'all 0.15s'
          }}
        >
          {loading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SEND RESET LINK'}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null); }}
          style={{
            width: '100%', marginTop: 12, padding: '12px', fontFamily: S.mono, fontSize: 11,
            letterSpacing: '0.1em', background: 'transparent', border: `1px solid #2a2a2a`,
            color: S.mid, cursor: 'pointer'
          }}
        >
          {mode === 'reset' ? 'BACK TO SIGN IN' : mode === 'login' ? 'NO ACCOUNT? CREATE ONE' : 'HAVE AN ACCOUNT? SIGN IN'}
        </button>
      </form>
    </div>
  );
}
