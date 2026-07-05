import BorderGlow from './BorderGlow';
import ShinyText from './ShinyText';
import TrueFocus from './TrueFocus';

const VisionMission = () => {
  return (
    <section className="section" id="vision">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">01</span>
          <h2 className="section__title"><ShinyText text="Our Vision & Mission" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <div className="section__subtitle">
            <TrueFocus
              sentence="To shape the built world with purpose, truth, and lasting beauty."
              borderColor="#D4AF37"
              glowColor="rgba(212, 175, 55, 0.6)"
              animationDuration={1.8}
              pauseBetweenAnimations={1.5}
              blurAmount={2}
            />
          </div>
        </div>
        <div className="vm-grid">
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
            <div className="vm-card">
              <h3 className="vm-card__title">Vision</h3>
              <p className="vm-card__text">
                We envision a world where every structure tells an honest story — where buildings breathe with the landscape,
                respond to the people within them, and endure across generations. We strive to be the defining voice of
                architecture that is both profoundly human and uncompromisingly excellent.
              </p>
              <p className="vm-card__text">
                Our vision is to lead a new standard in architectural practice: one where genuine design thinking and
                flawless execution are never in conflict, but are always one and the same.
              </p>
            </div>
          </BorderGlow>
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
            <div className="vm-card">
              <h3 className="vm-card__title">Mission</h3>
              <p className="vm-card__text">
                To deliver architecture that is authentic in concept and masterful in execution. We are committed to creating
                spaces that go beyond aesthetics — spaces that serve, inspire, and endure.
              </p>
              <p className="vm-card__text">
                Through rigorous design, deep collaboration with our clients, and an unwavering respect for context and craft,
                Tereios Architecture transforms ideas into environments that feel inevitable.
              </p>
              <p className="vm-card__text">
                Our mission is to bring every project — from intimate residences to civic landmarks — the same depth of
                thought, precision of execution, and genuine care for the people who will inhabit them.
              </p>
            </div>
          </BorderGlow>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
