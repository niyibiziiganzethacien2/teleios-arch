import BorderGlow from './BorderGlow';
import ShinyText from './ShinyText';

const WhoWeAre = () => {
  return (
    <section className="section" id="who-we-are">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">02</span>
          <h2 className="section__title"><ShinyText text="Who We Are" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">
            "We do not design buildings. We design experiences, relationships, and legacies   and the buildings are how they become real."
          </p>
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
          <div className="wwa-card">
            <p className="wwa-text">
              Tereios Architecture is a team of passionate designers, thinkers, and builders united by one conviction:
              that great architecture must be both genuine and functional. We reject the superficial and the temporary.
              We believe that form earns its place only when it serves a true purpose, and that function achieves its
              highest expression only when it is beautifully conceived.
            </p>
            <p className="wwa-text">
              Founded on the principle that the best buildings are those you feel before you understand them, we approach
              every project as an opportunity to solve a real human challenge with creativity, intelligence, and craft.
            </p>
            <div className="wwa-name">  Tereios Architecture</div>
          </div>
        </BorderGlow>
      </div>
    </section>
  );
};

export default WhoWeAre;
