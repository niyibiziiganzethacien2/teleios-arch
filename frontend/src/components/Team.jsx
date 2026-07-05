import ShinyText from './ShinyText';
import ChromaGrid from './ChromaGrid';
import ThacienImg from '../assets/images/gg.jpg';
import { useEffect, useState } from 'react';

const defaultTeam = [
  {
    initials: 'GK',
    name: 'Gad KWIZERA',
    role: 'Founder & Principal Architect',
    bio: 'Founded Tereios Architecture with a single conviction: that great buildings must be honest. With over a decade of experience spanning residential, civic, and cultural projects across East Africa and Europe.',
    quote: '"I never start a design until I understand why this building needs to exist."',
    borderColor: '#D4AF37',
    gradient: 'linear-gradient(145deg, #D4AF37, #03010A)',
  },
  {
    initials: 'LI',
    name: 'Loselyne INEMA',
    role: 'Co-founder & Design Director',
    bio: 'Leads design direction at Tereios with a philosophy rooted in material honesty and spatial precision. Her background in both architecture and interior design allows her to work seamlessly across scales.',
    quote: '"Every material we choose makes a promise to the person who touches it. We keep our promises."',
    borderColor: '#C9A227',
    gradient: 'linear-gradient(210deg, #C9A227, #03010A)',
  },
  {
    initials: 'NIT',
    name: 'NIYIBIZI IGANZE   Thacien',
    role: 'Project Architect',
    bio: 'Manages complex multi-phase projects with precision and calm. Her background in structural coordination means she speaks fluently across disciplines.',
    borderColor: '#F5D76E',
    gradient: 'linear-gradient(165deg, #F5D76E, #03010A)',
    decrypted: true,
    localImage: ThacienImg,
  },
  {
    initials: 'EN',
    name: 'Elissa NDAYISHIMIYE',
    role: 'Urban Designer',
    bio: 'Focuses on master planning and public space. He believes cities are shaped by the spaces between buildings just as much as the buildings themselves.',
    borderColor: '#B8860B',
    gradient: 'linear-gradient(195deg, #B8860B, #03010A)',
  },
  {
    initials: 'EN',
    name: 'Elie NZAYISENGA',
    role: 'Interior Designer',
    bio: 'Brings warmth and precision to every interior. His eye for material pairings and spatial rhythm transforms rooms into experiences that last long in memory.',
    borderColor: '#DAA520',
    gradient: 'linear-gradient(225deg, #DAA520, #03010A)',
  }
];

const Team = () => {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/team')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length) setTeam(data);
        else setTeam(defaultTeam);
      })
      .catch(() => setTeam(defaultTeam));
    return () => { mounted = false };
  }, []);

  const source = (team && team.length) ? team : defaultTeam;
  const gridItems = source.map(t => ({
    image: t.image || t.localImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=D4AF37&color=03010A&size=300&bold=true`,
    title: t.name,
    subtitle: t.role,
    bio: t.bio,
    quote: t.quote,
    borderColor: t.borderColor,
    gradient: t.gradient,
    decrypted: t.decrypted,
  }));

  return (
    <section className="section" id="team">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">06</span>
          <h2 className="section__title"><ShinyText text="Meet the Team" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">Designed by minds. Built by hands. Guided by principle.</p>
        </div>
        <ChromaGrid
          items={gridItems}
          radius={300}
          damping={0.45}
          fadeOut={0.6}
          ease="power3.out"
          columns={3}
        />
      </div>
    </section>
  );
};

export default Team;
