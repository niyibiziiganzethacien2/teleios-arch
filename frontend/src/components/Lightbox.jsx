import { useEffect, useCallback } from 'react';

const Lightbox = ({ items, index, onClose }) => {
  const item = items[index];

  const go = useCallback((dir) => {
    const next = index + dir;
    if (next >= 0 && next < items.length) {
      onClose({ index: next });
    }
  }, [index, items.length, onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose(null);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, go]);

  if (!item) return null;

  return (
    <div className="lightbox" onClick={() => onClose(null)}>
      <button className="lightbox__close" onClick={() => onClose(null)} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      {index > 0 && (
        <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {index < items.length - 1 && (
        <button className="lightbox__nav lightbox__nav--next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img
          src={item.img}
          alt={item.title || item.id}
          className="lightbox__img"
        />
        <div className="lightbox__counter">{index + 1} / {items.length}</div>
      </div>
    </div>
  );
};

export default Lightbox;
