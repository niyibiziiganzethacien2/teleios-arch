import BorderGlow from './BorderGlow';
import ShinyText from './ShinyText';
import { useState } from 'react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section className="section" id="contact">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">08</span>
          <h2 className="section__title"><ShinyText text="Get in Touch" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">Let's start a conversation about your next project.</p>
        </div>
        <div className="contact__grid">
          <div className="contact__info">
            <BorderGlow
              glowColor="45 80 55"
              backgroundColor="#0a0810"
              borderRadius={24}
              glowRadius={30}
              glowIntensity={1.2}
              edgeSensitivity={25}
              coneSpread={20}
              colors={['#D4AF37', '#F5D76E', '#C9A227']}
            >
              <div className="contact__info-card">
                <h3 className="contact__info-title">Contact Information</h3>
                <div className="contact__info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <span className="contact__info-label">Email</span>
                    <a href="mailto:teleiosarchitecture@gmail.com">teleiosarchitecture@gmail.com</a>
                  </div>
                </div>
                <div className="contact__info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <span className="contact__info-label">Location</span>
                    <span>Kigali, Rwanda</span>
                  </div>
                </div>
                <div className="contact__info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <div>
                    <span className="contact__info-label">Social</span>
                    <div className="contact__social">
                      <a href="https://www.instagram.com/teleiosarchitecture?igsh=ajZqNDg3aXAybGdz" aria-label="Instagram">Instagram</a>
                      <span>/</span>
                      <a href="#" aria-label="LinkedIn">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>
            </BorderGlow>
          </div>
          <BorderGlow
            glowColor="45 80 55"
            backgroundColor="#0a0810"
            borderRadius={24}
            glowRadius={30}
            glowIntensity={1.2}
            edgeSensitivity={25}
            coneSpread={20}
            colors={['#D4AF37', '#F5D76E', '#C9A227']}
          >
            <form className="contact__form" onSubmit={handleSubmit}>
              <h3 className="contact__form-title">Send us a message</h3>
              <div className="contact__form-row">
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Your Name" className="contact__input" required />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your Email" className="contact__input" required />
              </div>
              <input value={subject} onChange={e => setSubject(e.target.value)} type="text" placeholder="Subject" className="contact__input" />
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us about your project..." className="contact__textarea" rows={5} required />
              <button type="submit" className="contact__submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Message'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
              {status === 'sent' && <div className="contact__notice">Thanks — we'll be in touch.</div>}
              {status === 'error' && <div className="contact__notice contact__notice--error">Failed to send. Please try again.</div>}
            </form>
          </BorderGlow>
        </div>
      </div>
    </section>
  );
};

export default Contact;
