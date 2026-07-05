import BorderGlow from './BorderGlow';
import ShinyText from './ShinyText';
import { useEffect, useState } from 'react';

const defaultServices = [
  {
    number: '01',
    title: 'Architectural Design',
    desc: 'Full-spectrum design services from initial concept to construction documentation. We develop buildings that respond authentically to their site, programme, and people with no compromise between beauty and function.'
  },
  {
    number: '02',
    title: 'Interior Architecture',
    desc: 'We design interiors that are an inseparable extension of the architecture where materials, light, and spatial sequence work together to create environments that feel genuinely crafted and deeply lovable.'
  },
  {
    number: '03',
    title: 'Renovation & Adaptive Reuse',
    desc: 'We transform existing structures with sensitivity and precision preserving what is worth keeping, reimagining what is not, and always seeking the opportunity that the original building offers but hasn\'t yet realised.'
  },
  {
    number: '04',
    title: 'Master Planning & Urban Design',
    desc: 'At the neighbourhood and city scale, we develop masterplans that are legible, humane, and resilient frameworks for urban life that balance density, identity, movement, and public space with intelligence and care.'
  },
  {
    number: '05',
    title: 'Project Management & Site Supervision',
    desc: 'We protect the integrity of the design through construction, coordinating consultants, reviewing progress, and ensuring every detail is realised as intended. Our involvement doesn\'t end at the drawing it ends at the door.'
  },
  {
    number: '06',
    title: 'Sustainable Design Consulting',
    desc: 'Sustainability is not an add-on at Tereios it is embedded in every design decision we make. We advise on passive design strategies, green certifications, and environmental performance from the earliest stages of a project.'
  }
];

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/services')
      .then(r => r.json())
      .then(data => { if (!mounted) return; if (Array.isArray(data) && data.length) setServices(data); else setServices(defaultServices); })
      .catch(() => setServices(defaultServices));
    return () => { mounted = false };
  }, []);

  const source = (services && services.length) ? services : defaultServices;

  return (
    <section className="section" id="services">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">04</span>
          <h2 className="section__title"><ShinyText text="Services" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">Services crafted for every scale of architectural ambition.</p>
        </div>
        <div className="services-grid">
          {source.map((s, i) => (
            <BorderGlow
              key={s.number || i}
              glowColor="45 80 55"
              backgroundColor="#0a0810"
              borderRadius={24}
              glowRadius={30}
              glowIntensity={1.2}
              edgeSensitivity={25}
              coneSpread={20}
              colors={['#D4AF37', '#F5D76E', '#C9A227']}
            >
              <div className="service-card">
                <span className="service-card__number">{s.number}</span>
                <h3 className="service-card__title">{s.title}</h3>
                <p className="service-card__text">{s.desc}</p>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
