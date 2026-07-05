import { useState, useEffect } from 'react';
import ShinyText from './ShinyText';
import logoSrc from '../assets/images/TELEIOS LODO.png';

const navLinks = [
  { href: '#vision', label: 'Vision' },
  { href: '#who-we-are', label: 'About' },
  { href: '#values', label: 'Values' },
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#process', label: 'Process' },
  { href: '#team', label: 'Team' },
  { href: '#contact', label: 'Contact' },
];

const Navbar = ({ onOpenLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const sections = navLinks.map(l => document.querySelector(l.href)).filter(Boolean);
      let current = '';
      for (const section of sections) {
        const top = section.offsetTop - 200;
        if (window.scrollY >= top) {
          current = '#' + section.id;
        }
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="#" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <img
            src={logoSrc}
            alt="TELEIOS Architecture"
            className="navbar__logo-img"
          />
          <ShinyText
            text="TELEIOS"
            speed={3}
            color="#f0ece4"
            shineColor="#D4AF37"
            spread={90}
            direction="left"
            className="navbar__logo-text"
          />
        </a>
        <button
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`navbar__link ${active === l.href ? 'navbar__link--active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavClick(l.href); }}
            >
              {l.label}
            </a>
          ))}
          <div className="navbar__auth">
            <button className="navbar__login" onClick={onOpenLogin}>Login</button>
          </div>
        </div>
        {menuOpen && <div className="navbar__overlay" onClick={() => setMenuOpen(false)} />}
      </div>
    </nav>
  );
};

export default Navbar;
