import { useState } from 'react';
import BorderGlow from './BorderGlow';

const LoginModal = ({ isOpen, onClose, onSuccess, useBackend = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    if (!useBackend) {
      // demo mode: simulate success without calling backend
      setTimeout(() => {
        const demoUser = { id: 0, email, name: email.split('@')[0] || 'User' };
        localStorage.setItem('auth', JSON.stringify({ token: 'demo-token', user: demoUser }));
        setStatus('success');
        if (onSuccess) onSuccess(demoUser);
        onClose();
      }, 500);
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }));
      setStatus('success');
      if (onSuccess) onSuccess(data.user);
      onClose();
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="login-modal">
      <div className="login-modal__backdrop" onClick={onClose} />
      <BorderGlow
        glowColor="45 80 55"
        backgroundColor="#0a0810"
        borderRadius={16}
        glowRadius={20}
        glowIntensity={1.0}
        edgeSensitivity={20}
        coneSpread={18}
        colors={['#D4AF37', '#F5D76E']}
      >
        <form className="contact__form login-modal__card" onSubmit={submit}>
          <h3 className="contact__form-title">Login</h3>
          <div className="contact__form-row">
            <input className="contact__input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="contact__form-row">
            <input className="contact__input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="login-form__actions">
            <button className="contact__submit" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Signing in...' : 'Sign in'}</button>
            <button type="button" className="contact__submit contact__submit--ghost" onClick={onClose}>Cancel</button>
          </div>
          {status === 'error' && <div className="contact__notice contact__notice--error">Invalid credentials</div>}
        </form>
      </BorderGlow>
    </div>
  );
};

export default LoginModal;
