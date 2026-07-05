import ShinyText from './ShinyText';
import BorderGlow from './BorderGlow';

const steps = [
  { number: '01', title: 'Discovery', desc: 'We listen. We ask questions others don\'t. We understand your life, your brief, and your site before touching a pencil.' },
  { number: '02', title: 'Concept', desc: 'We develop a clear architectural idea   one that responds to place, purpose, and aspiration with originality and discipline.' },
  { number: '03', title: 'Design Development', desc: 'Concept becomes building. Space, material, light, and detail are refined through close collaboration and iteration.' },
  { number: '04', title: 'Documentation', desc: 'We produce meticulous technical drawings and specifications   the precision contract between design intention and built reality.' },
  { number: '05', title: 'Delivery', desc: 'We see every project through to completion   present on site, attentive to detail, and committed to the quality of the final result.' }
];

const Process = () => {
  return (
    <section className="section" id="process">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">05</span>
          <h2 className="section__title"><ShinyText text="Our Process" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">From first sketch to final handover   a method built on rigour and care.</p>
        </div>
        <div className="process-steps">
          {steps.map((s, i) => (
            <div className="process-step" key={s.number}>
              <div className="process-step__connector">
                <div className="process-step__dot" />
                {i < steps.length - 1 && <div className="process-step__line" />}
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
                <div className="process-card">
                  <span className="process-card__number">{s.number}</span>
                  <h3 className="process-card__title">{s.title}</h3>
                  <p className="process-card__text">{s.desc}</p>
                </div>
              </BorderGlow>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
