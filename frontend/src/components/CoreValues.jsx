import ShinyText from './ShinyText';
import BorderGlow from './BorderGlow';

const values = [
  {
    title: 'Authenticity',
    desc: 'We design with honesty. Every material, form, and detail must have a genuine reason to exist.',
    number: '01'
  },
  {
    title: 'Precision',
    desc: 'Perfection in function means perfection in detail. We are relentless in the refinement of every element.',
    number: '02'
  },
  {
    title: 'Collaboration',
    desc: 'Great architecture is a conversation. We listen deeply to our clients and communities before we draw a single line.',
    number: '03'
  },
  {
    title: 'Responsibility',
    desc: 'We design with awareness of the environment, culture, and future generations who will inherit our work.',
    number: '04'
  }
];

const CoreValues = () => {
  return (
    <section className="section" id="values">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">03</span>
          <h2 className="section__title"><ShinyText text="Our Core Values" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">The principles that guide every line we draw.</p>
        </div>
        <div className="values-grid">
          {values.map((v, i) => (
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
              <div className="value-card">
                <span className="value-card__number">{v.number}</span>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__text">{v.desc}</p>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
