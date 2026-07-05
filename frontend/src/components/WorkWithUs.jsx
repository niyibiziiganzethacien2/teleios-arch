import BorderGlow from './BorderGlow';
import ShinyText from './ShinyText';

const WorkWithUs = () => {
  return (
    <section className="section section--dark" id="work-with-us">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">07</span>
          <h2 className="section__title"><ShinyText text="Work With Us" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">We are always looking for people who care deeply about the craft.</p>
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
          <div className="work-card">
            <p className="work-text">
              At Tereios, we don't hire for roles   we look for people with genuine curiosity, a respect for rigour,
              and the courage to argue for a better idea. If you believe that architecture can change how people feel
              about their lives, we want to hear from you.
            </p>
            <p className="work-text">
              We welcome applications from architects, designers, urban planners, and students at any stage of their career.
            </p>
            <a href="mailto:teleiosarchitecture@gmail.com" className="work-cta">
              Get in touch
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </BorderGlow>
      </div>
    </section>
  );
};

export default WorkWithUs;
