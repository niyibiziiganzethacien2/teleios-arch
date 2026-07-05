import { useState, useEffect } from 'react';
import Masonry from './Masonry';
import ShinyText from './ShinyText';
import Lightbox from './Lightbox';

const defaultGallery = [
  { id: "1", img: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=900&fit=crop&q=80", url: "#", height: 400 },
  { id: "2", img: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600&h=750&fit=crop&q=80", url: "#", height: 280 },
  { id: "3", img: "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=600&h=800&fit=crop&q=80", url: "#", height: 500 },
  { id: "4", img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=650&fit=crop&q=80", url: "#", height: 320 },
  { id: "5", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=850&fit=crop&q=80", url: "#", height: 450 },
  { id: "6", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=700&fit=crop&q=80", url: "#", height: 350 },
  { id: "7", img: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&h=900&fit=crop&q=80", url: "#", height: 480 },
  { id: "8", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=600&fit=crop&q=80", url: "#", height: 260 },
  { id: "9", img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=800&fit=crop&q=80", url: "#", height: 420 },
  { id: "10", img: "https://images.unsplash.com/photo-1501761095094-94c36b826641?w=600&h=720&fit=crop&q=80", url: "#", height: 380 }
];

const GallerySection = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => { if (!mounted) return; if (Array.isArray(data) && data.length) setGalleryItems(data); else setGalleryItems(defaultGallery); })
      .catch(() => setGalleryItems(defaultGallery));
    return () => { mounted = false };
  }, []);

  const items = (galleryItems && galleryItems.length) ? galleryItems : defaultGallery;

  return (
    <section className="section" id="gallery">
      <div className="section__container">
        <div className="section__header">
          <span className="section__number">—</span>
          <h2 className="section__title"><ShinyText text="Our Work" color="#f0ece4" shineColor="#D4AF37" speed={3} spread={100} /></h2>
          <p className="section__subtitle">A selection of projects that define who we are.</p>
        </div>
        <div className="gallery-wrapper">
          <Masonry
            items={items}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={0.95}
            blurToFocus={true}
            colorShiftOnHover={false}
            onItemClick={(item) => {
              const idx = items.findIndex(i => i.id === item.id);
              setLightbox(idx);
            }}
          />
        </div>
      </div>
      {lightbox !== null && (
        <Lightbox
          items={items}
          index={lightbox}
          onClose={(val) => {
            if (val && val.index !== undefined) {
              setLightbox(val.index);
            } else {
              setLightbox(null);
            }
          }}
        />
      )}
    </section>
  );
};

export default GallerySection;
