import { useEffect, useState } from 'react';
import ClickSpark from './components/ClickSpark';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VisionMission from './components/VisionMission';
import WhoWeAre from './components/WhoWeAre';
import CoreValues from './components/CoreValues';
import Services from './components/Services';
import GallerySection from './components/GallerySection';
import Process from './components/Process';
import Team from './components/Team';
import WorkWithUs from './components/WorkWithUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import './App.css';

const App = () => {
  useEffect(() => {
    const goFull = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    document.addEventListener('click', goFull, { once: true });
    document.addEventListener('touchstart', goFull, { once: true });
    return () => {
      document.removeEventListener('click', goFull);
      document.removeEventListener('touchstart', goFull);
    };
  }, []);

  const [view, setView] = useState('home');
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('auth');
    if (raw) {
      try { const parsed = JSON.parse(raw); setAuth(parsed); setView(parsed.user?.role === 'member' ? 'member' : 'admin'); } catch { setAuth(null); }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    const raw = localStorage.getItem('auth');
    let token = null;
    if (raw) {
      try { token = JSON.parse(raw).token; } catch {}
    }
    setAuth({ user, token });
    setView(user?.role === 'member' ? 'member' : 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth(null);
    setView('home');
  };

  return (
    <ClickSpark
      sparkColor="#D4AF37"
      sparkSize={8}
      sparkRadius={12}
      sparkCount={6}
      duration={350}
    >
      {view === 'admin' && auth ? (
        <AdminDashboard user={auth.user} onLogout={handleLogout} />
      ) : view === 'member' && auth ? (
        <MemberDashboard user={auth.user} onLogout={handleLogout} />
      ) : view === 'login' ? (
        <LoginPage
          onSuccess={handleLoginSuccess}
          onBack={() => setView('home')}
          useBackend={true}
        />
      ) : (
        <>
          <Navbar onOpenLogin={() => setView('login')} />
          <main>
            <Hero />
            <VisionMission />
            <WhoWeAre />
            <CoreValues />
            <Services />
            <GallerySection />
            <Process />
            <Team />
            <WorkWithUs />
            <Contact />
          </main>
          <Footer />
          <BackToTop />
        </>
      )}
    </ClickSpark>
  );
};

export default App;
