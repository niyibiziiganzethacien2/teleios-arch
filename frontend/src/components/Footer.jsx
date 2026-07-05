import ShinyText from './ShinyText';
import GradientText from './GradientText';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__col footer__col--brand">
            <GradientText
              colors={["#D4AF37", "#F5D76E", "#C9A227", "#F5D76E", "#D4AF37"]}
              animationSpeed={4}
              direction="horizontal"
              yoyo={true}
            >
              <span className="footer__logo-text">TELEIOS</span>
            </GradientText>
            <ShinyText
              text="Genuine form, perfect function."
              speed={3}
              color="rgba(240,236,228,0.4)"
              shineColor="#D4AF37"
              spread={80}
              direction="left"
              className="footer__tagline"
            />
            <p className="footer__description">
              Architecture that is authentic in concept and masterful in execution — shaping the built world with purpose, truth, and lasting beauty.
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Navigation</h4>
            <div className="footer__nav">
              <a href="#vision" className="footer__link">Vision & Mission</a>
              <a href="#who-we-are" className="footer__link">About</a>
              <a href="#values" className="footer__link">Values</a>
              <a href="#services" className="footer__link">Services</a>
              <a href="#gallery" className="footer__link">Gallery</a>
              <a href="#process" className="footer__link">Process</a>
              <a href="#team" className="footer__link">Team</a>
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Services</h4>
            <div className="footer__nav">
              <a href="#services" className="footer__link">Architectural Design</a>
              <a href="#services" className="footer__link">Interior Architecture</a>
              <a href="#services" className="footer__link">Renovation & Adaptive Reuse</a>
              <a href="#services" className="footer__link">Master Planning</a>
              <a href="#services" className="footer__link">Project Management</a>
              <a href="#services" className="footer__link">Sustainable Design</a>
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Contact</h4>
            <div className="footer__contact">
              <a href="mailto:teleiosarchitecture@gmail.com" className="footer__contact-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                teleiosarchitecture@gmail.com
              </a>
              <a href="mailto:teleiosarchitecture@gmail.com" className="footer__contact-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                teleiosarchitecture@gmail.com
              </a>
              <div className="footer__contact-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Kigali, Rwanda
              </div>
              <div className="footer__social">
                <a href="https://www.instagram.com/teleiosarchitecture?igsh=ajZqNDg3aXAybGdz" className="footer__social-link" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="footer__social-link" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a href="#" className="footer__social-link" aria-label="Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">&copy; {new Date().getFullYear()} TELEIOS Architecture. All rights reserved.</p>
          <p className="footer__legal">
            <a href="#">Privacy Policy</a>
            <span className="footer__sep">·</span>
            <a href="#">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
