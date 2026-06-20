import React, { useEffect, useState } from 'react';
import { dentalApi, tokenStore, userStore } from '../dentalApi';

export function LoginGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    email: 'dentist@demo.com',
    password: 'demo1234',
    name: '',
    practiceName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (tokenStore.get()) {
        try {
          const { user } = await dentalApi.me();
          userStore.set(user);
          setAuthed(true);
          onAuthenticated();
        } catch {
          tokenStore.clear();
        }
      }
      setReady(true);
    })();
  }, [onAuthenticated]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = mode === 'login' ? await dentalApi.login(form) : await dentalApi.register(form);
      tokenStore.set(res.token);
      userStore.set(res.user);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  if (!ready || authed) {
    return null;
  }

  return (
    <div className="dental-login-backdrop">
      <form className="dental-login-card" onSubmit={submit}>
        <h1>🦷 Dental SaaS</h1>
        <div className="sub">
          {mode === 'login' ? 'Sign in to the OHIF Dental viewer' : 'Create your practice account'}
        </div>

        {mode === 'register' && (
          <>
            <label>Clinician name</label>
            <input className="dental-input" value={form.name} onChange={set('name')} placeholder="Dr. Jane Doe" />
            <label>Practice name</label>
            <input
              className="dental-input"
              value={form.practiceName}
              onChange={set('practiceName')}
              placeholder="Practice Dental"
            />
          </>
        )}

        <label>Email</label>
        <input className="dental-input" type="email" value={form.email} onChange={set('email')} required />
        <label>Password</label>
        <input
          className="dental-input"
          type="password"
          value={form.password}
          onChange={set('password')}
          required
        />

        {error && <div className="dental-login-error">{error}</div>}

        <button className="dental-btn primary" type="submit" disabled={busy} style={{ marginTop: 16 }}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div className="dental-login-switch">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button type="button" onClick={() => setMode('register')}>
                Register
              </button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Sign in
              </button>
            </>
          )}
        </div>

        {mode === 'login' && (
          <div className="dental-login-demo">
            Demo — <code>dentist@demo.com</code> / <code>demo1234</code>
          </div>
        )}
      </form>
    </div>
  );
}

export default LoginGate;
