import { useState } from 'react';

export default function LoginPage({ onSuccess, onBack, useBackend }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    if (!useBackend) {
      await new Promise(r => setTimeout(r, 800));
      const demoUser = { id: 0, email, name: email.split('@')[0] || 'User' };
      localStorage.setItem('auth', JSON.stringify({ token: 'demo-token', user: demoUser }));
      setStatus('success');
      setTimeout(() => { if (onSuccess) onSuccess(demoUser); }, 400);
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }));
      setStatus('success');
      setTimeout(() => { if (onSuccess) onSuccess(data.user); }, 400);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className={`login-page ${status === 'success' ? 'login-page--success' : ''}`}>
      <div className="login-page__bg" />
      <div className="login-page__inner">
        <div className="login-page__brand">
          <div className="login-page__mark">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
              <path d="M2 20L12 4l10 16" />
              <path d="M6 16l6-8 6 8" />
            </svg>
          </div>
          <h1 className="login-page__title">TELEIOS</h1>
          <p className="login-page__sub">Architecture</p>
        </div>
        <form className="login-page__form" onSubmit={submit}>
          <div className="login-page__field">
            <label className="login-page__label">Email</label>
            <input
              className="login-page__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <span className="login-page__line" />
          </div>
          <div className="login-page__field">
            <label className="login-page__label">Password</label>
            <input
              className="login-page__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span className="login-page__line" />
          </div>
          {status === 'error' && (
            <div className="login-page__error">Invalid email or password</div>
          )}
          <button className="login-page__submit" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? <span className="login-page__spinner" /> : 'Sign in'}
          </button>
          <button type="button" className="login-page__back" onClick={onBack}>
            Back to site
          </button>
        </form>
      </div>
    </div>
  );
}
