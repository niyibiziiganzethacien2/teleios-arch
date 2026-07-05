import Ferrofluid from './Ferrofluid';
import BlurText from './BlurText';
import TextType from './TextType';
import ShinyText from './ShinyText';

const Hero = () => {
  const scrollToVision = () => {
    document.querySelector('#vision')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero__bg">
        <Ferrofluid
          colors={["#D4AF37", "#C9A227", "#f0ece4"]}
          speed={0.3}
          scale={1.8}
          turbulence={0.8}
          fluidity={0.15}
          rimWidth={0.25}
          sharpness={2}
          shimmer={1.2}
          glow={1.5}
          flowDirection="up"
          opacity={0.6}
          mouseInteraction={true}
          mouseStrength={1.2}
          mouseRadius={0.3}
        />
      </div>
      <div className="hero__overlay" />
      <div className="hero__content">
        <BlurText
          text="Genuine form, perfect function."
          delay={100}
          animateBy="words"
          direction="top"
          className="hero__tagline"
        />
        <h1 className="hero__title">
          <ShinyText
            text="TELEIOS"
            speed={4}
            color="#f0ece4"
            shineColor="#D4AF37"
            spread={100}
            direction="left"
            yoyo={true}
          />
          <span className="hero__title-sub">Architecture</span>
        </h1>
        <TextType
          text={[
            "We shape the built world with purpose, truth, and lasting beauty.",
            "Every structure tells an honest story.",
            "Architecture that is profoundly human and uncompromisingly excellent.",
            "Genuine design thinking meets flawless execution."
          ]}
          typingSpeed={40}
          deletingSpeed={25}
          pauseDuration={3000}
          loop={true}
          showCursor={true}
          cursorCharacter="|"
          className="hero__desc"
        />
        <button className="hero__cta" onClick={scrollToVision}>
          Discover our vision
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;
