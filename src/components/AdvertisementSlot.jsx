import { useEffect, useState } from 'react';
import './AdvertisementSlot.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');

const SERVER_URL = API_URL.replace(/\/api$/, '');

function getMediaUrl(path) {
  if (!path || typeof path !== 'string') {
    return '';
  }

  const mediaPath = path.trim();

  if (/^https?:\/\//i.test(mediaPath)) {
    return mediaPath;
  }

  // Backend থেকে /uploads/... এলে
  if (mediaPath.startsWith('/')) {
    return `${SERVER_URL}${mediaPath}`;
  }

  // Backend থেকে শুধু filename এলে
  if (mediaPath.startsWith('uploads/')) {
    return `${SERVER_URL}/${mediaPath}`;
  }

  // Backend থেকে শুধু ফাইলের নাম এলে
  return `${SERVER_URL}/uploads/${mediaPath}`;
}

function AdvertisementSlot({ position, className = '' }) {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAdvertisements() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/advertisements/position/${encodeURIComponent(position)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Advertisement API failed: ${response.status}`);
        }

        const result = await response.json();

        // Backend-এর বিভিন্ন সম্ভাব্য response structure
        let data = [];

        if (Array.isArray(result)) {
          data = result;
        } else if (Array.isArray(result.data)) {
          data = result.data;
        } else if (Array.isArray(result.advertisements)) {
          data = result.advertisements;
        } else if (result.advertisement) {
          data = [result.advertisement];
        } else if (result.data && typeof result.data === 'object') {
          data = [result.data];
        }

        // নির্দিষ্ট Placement-এর বিজ্ঞাপন বাছাই
        const filteredAds = data.filter((ad) => {
          if (!ad) return false;

          const active = ad.isActive === true || ad.isActive === 'true';

          const correctPosition = ad.placement === position;

          return active && correctPosition;
        });

        console.log(`Advertisements for ${position}:`, filteredAds);

        setAdvertisements(filteredAds);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(
            `Failed to load advertisements for ${position}:`,
            error
          );

          setAdvertisements([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAdvertisements();

    return () => {
      controller.abort();
    };
  }, [position]);

  if (loading || advertisements.length === 0) {
    return null;
  }

  return (
    <section
      className={`advertisement-slot ${className}`}
      data-ad-position={position}
      aria-label="Advertisement"
    >
      {advertisements.map((ad) => {
        const adId = ad._id || ad.id;

        const imageUrl = getMediaUrl(ad.image || ad.imageUrl);

        const videoUrl = getMediaUrl(ad.video || ad.videoUrl);

        const destination = ad.link || ad.targetUrl || '';

        const handleClick = async () => {
          if (!adId) return;

          try {
            await fetch(`${API_URL}/advertisements/${adId}/click`, {
              method: 'POST',
            });
          } catch (error) {
            console.error('Advertisement click tracking failed:', error);
          }
        };

        // Image load error হলে Console-এ দেখাবে
        const handleImageError = (event) => {
          console.error(
            'Advertisement image failed to load:',
            event.currentTarget.src
          );
        };

        const type = String(ad.type || '')
          .trim()
          .toLowerCase();

        const isVideo = type === 'video' || Boolean(ad.video || ad.videoUrl);

        const isImage =
          type === 'image' ||
          type === 'banner' ||
          Boolean(ad.image || ad.imageUrl);

        return (
          <article
            className="advertisement-card"
            key={adId || `${position}-${ad.title}`}
          >
            <span className="advertisement-label">Advertisement</span>

            {isVideo && videoUrl ? (
              <video
                className="advertisement-video"
                controls
                playsInline
                preload="metadata"
                poster={imageUrl || undefined}
              >
                <source src={videoUrl} />
                Your browser does not support this video.
              </video>
            ) : isImage && imageUrl ? (
              destination ? (
                <a
                  href={destination}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClick}
                  className="advertisement-link"
                >
                  <img
                    src={imageUrl}
                    alt={ad.title || 'Advertisement'}
                    className="advertisement-image"
                    onError={handleImageError}
                  />
                </a>
              ) : (
                <img
                  src={imageUrl}
                  alt={ad.title || 'Advertisement'}
                  className="advertisement-image"
                  onError={handleImageError}
                />
              )
            ) : (
              <div className="advertisement-text">
                {ad.title && <h3>{ad.title}</h3>}

                {ad.description && <p>{ad.description}</p>}

                {destination && (
                  <a
                    href={destination}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                  >
                    Learn More
                  </a>
                )}
              </div>
            )}

            {ad.title && isImage && (
              <p className="advertisement-title">{ad.title}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}

export default AdvertisementSlot;
