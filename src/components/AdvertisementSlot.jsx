import { useEffect, useState } from 'react';
import './AdvertisementSlot.css';

// Backend API URL
// Production-এ VITE_API_URL environment variable সেট করবে।
// উদাহরণ: https://your-backend.com/api
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');

// Backend-এর origin বের করা
// API URL যদি https://example.com/api হয়,
// তাহলে backend origin হবে https://example.com
const BACKEND_ORIGIN = API_URL.replace(/\/api$/, '');

function getMediaUrl(url) {
  if (!url) return '';

  // সম্পূর্ণ URL হলে সেটিই ব্যবহার করা হবে
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Relative URL-এর আগে backend origin যোগ হবে
  return `${BACKEND_ORIGIN}/${url.replace(/^\/+/, '')}`;
}

function AdvertisementCard({ ad }) {
  const [mediaError, setMediaError] = useState(false);

  const isVideo = ad.type === 'video' && Boolean(ad.video);

  const mediaUrl = isVideo ? getMediaUrl(ad.video) : getMediaUrl(ad.image);

  const animationClass =
    ad.animation && ad.animation !== 'none'
      ? `ad-animation-${ad.animation}`
      : '';

  const hasMedia = Boolean(mediaUrl) && !mediaError;

  const content = (
    <>
      {hasMedia && isVideo ? (
        <video
          className="advertisement-media"
          src={mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          controls
          onError={() => setMediaError(true)}
        />
      ) : hasMedia ? (
        <img
          className="advertisement-media"
          src={mediaUrl}
          alt={ad.title || 'বিজ্ঞাপন'}
          loading="lazy"
          onError={() => setMediaError(true)}
        />
      ) : null}

      {ad.headline && <h3 className="advertisement-headline">{ad.headline}</h3>}

      {ad.description && (
        <p className="advertisement-description">{ad.description}</p>
      )}

      {ad.price && <p className="advertisement-price">মূল্য: {ad.price}</p>}

      {ad.offer && <p className="advertisement-offer">{ad.offer}</p>}

      {ad.contact && (
        <p className="advertisement-contact">যোগাযোগ: {ad.contact}</p>
      )}

      {!hasMedia && !ad.headline && !ad.description && !ad.offer && (
        <p className="advertisement-title">{ad.title}</p>
      )}
    </>
  );

  const cardStyle = {
    backgroundColor: ad.backgroundColor || '#ffffff',
    color: ad.textColor || '#222222',
  };

  // বিজ্ঞাপনের নির্ধারিত লিংক
  if (ad.targetUrl) {
    return (
      <a
        className={`advertisement-card ${animationClass}`}
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={cardStyle}
        aria-label={ad.title || 'বিজ্ঞাপন দেখুন'}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={`advertisement-card ${animationClass}`} style={cardStyle}>
      {content}
    </div>
  );
}

function AdvertisementSlot({ position, className = '' }) {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAdvertisements() {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/advertisements/position/${encodeURIComponent(position)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Advertisement API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.advertisements)) {
          setAdvertisements(data.advertisements);
        } else {
          setAdvertisements([]);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(`বিজ্ঞাপন লোড করা যায়নি (${position}):`, error);

          setAdvertisements([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAdvertisements();

    return () => controller.abort();
  }, [position]);

  // লোড হওয়ার সময় অথবা বিজ্ঞাপন না থাকলে কোনো জায়গা নেবে না
  if (loading || advertisements.length === 0) {
    return null;
  }

  return (
    <section
      className={`advertisement-slot ${className}`}
      aria-label="বিজ্ঞাপন"
    >
      <div
        className={`advertisement-grid ${
          advertisements.length === 1
            ? 'advertisement-grid-single'
            : 'advertisement-grid-multiple'
        }`}
      >
        {advertisements.map((ad) => (
          <AdvertisementCard key={ad._id} ad={ad} />
        ))}
      </div>
    </section>
  );
}

export default AdvertisementSlot;
