import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import BreakingNews from './BreakingNews';
import './Navbar.css';
import { useLanguage } from '../context/LanguageContext';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');

const BACKEND_URL = API_URL.replace(/\/api$/, '');

function getMediaUrl(filePath) {
  if (!filePath) return '';

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  return `${BACKEND_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
}

function getSafeTargetUrl(targetUrl) {
  if (!targetUrl) return null;

  try {
    const parsedUrl = new URL(targetUrl);

    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
  } catch {
    return null;
  }

  return null;
}

function AdvertisementCard({ ad, index, isBangla }) {
  const imageUrl = getMediaUrl(ad.image);
  const videoUrl = getMediaUrl(ad.video);
  const targetUrl = getSafeTargetUrl(ad.targetUrl);

  const animationClass =
    ad.animation && ad.animation !== 'none'
      ? `ad-animation-${ad.animation}`
      : '';

  const duration = Math.min(60, Math.max(3, Number(ad.durationSeconds) || 10));

  let content;

  if (ad.type === 'video' && videoUrl) {
    content = (
      <video
        className="header-ad-video"
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label={ad.title || 'Video advertisement'}
      >
        আপনার ব্রাউজার ভিডিও চালাতে পারছে না।
      </video>
    );
  } else if (ad.type === 'image' && imageUrl) {
    content = (
      <img
        src={imageUrl}
        alt={ad.title || 'Advertisement'}
        className="header-ad-image"
        loading="lazy"
      />
    );
  } else if (ad.type === 'video') {
    content = <div className="header-ad-fallback">ভিডিও ফাইল পাওয়া যায়নি।</div>;
  } else if (ad.type === 'image') {
    content = (
      <div className="header-ad-fallback">বিজ্ঞাপনের ছবি পাওয়া যায়নি।</div>
    );
  } else {
    content = (
      <div
        className={`header-ad-animated ${animationClass}`}
        style={{
          backgroundColor: ad.backgroundColor || '#123b56',
          color: ad.textColor || '#ffffff',
          '--ad-duration': `${duration}s`,
        }}
      >
        <span className="ad-label">
          {isBangla ? 'বিজ্ঞাপন' : 'ADVERTISEMENT'}
        </span>

        <strong className="header-ad-headline">
          {ad.headline || ad.title || 'বিশেষ বিজ্ঞাপন'}
        </strong>

        {ad.description && (
          <span className="header-ad-description">{ad.description}</span>
        )}

        {ad.price && (
          <strong className="header-ad-price">
            {isBangla ? 'মূল্য: ' : 'Price: '}
            {ad.price}
          </strong>
        )}

        {ad.offer && <span className="header-ad-offer">{ad.offer}</span>}

        {ad.contact && (
          <span className="header-ad-contact">
            {isBangla ? 'যোগাযোগ: ' : 'Contact: '}
            {ad.contact}
          </span>
        )}
      </div>
    );
  }

  return (
    <article className="header-ad-content" data-ad-index={index}>
      {targetUrl ? (
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="header-ad-link"
          aria-label={ad.title || 'Advertisement'}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </article>
  );
}

function Navbar() {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [advertisements, setAdvertisements] = useState([]);

  const searchInputRef = useRef(null);
  const searchFormRef = useRef(null);

  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const isBangla = language === 'bn';

  const categories = [
    { bn: 'জাতীয়', en: 'National', slug: 'national' },
    { bn: 'আন্তর্জাতিক', en: 'International', slug: 'international' },
    { bn: 'রাজনীতি', en: 'Politics', slug: 'politics' },
    { bn: 'খেলাধুলা', en: 'Sports', slug: 'sports' },
    { bn: 'বিনোদন', en: 'Entertainment', slug: 'entertainment' },
    { bn: 'প্রযুক্তি', en: 'Technology', slug: 'technology' },
  ];

  // তারিখ ও সময় আপডেট
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Scroll অনুযায়ী Navbar Hide / Show
  useEffect(() => {
    let previousScrollY = window.scrollY;
    let ticking = false;
    let animationFrameId = null;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      animationFrameId = window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(0, window.scrollY);
        const difference = currentScrollY - previousScrollY;

        if (currentScrollY <= 80) {
          setShowNavbar(true);
        } else if (difference > 5) {
          setShowNavbar(false);
        } else if (difference < -5) {
          setShowNavbar(true);
        }

        previousScrollY = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Search খুললে Input-এ Focus
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  // Search-এর বাইরে ক্লিক অথবা Escape চাপলে Search বন্ধ
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Backend থেকে সক্রিয় Header বিজ্ঞাপন লোড
  useEffect(() => {
    const controller = new AbortController();

    async function fetchAdvertisements() {
      try {
        const response = await fetch(
          `${API_URL}/advertisements/position/header`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`বিজ্ঞাপন লোড করা যায়নি (HTTP ${response.status})`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.advertisements)) {
          setAdvertisements(data.advertisements);
        } else {
          setAdvertisements([]);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Header Advertisement Error:', error);
          setAdvertisements([]);
        }
      }
    }

    fetchAdvertisements();

    return () => controller.abort();
  }, []);

  // Search Submit
  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      searchInputRef.current?.focus();
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query)}`);

    setSearch('');
    setSearchOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  // তারিখ ফরম্যাট
  const formattedDate = new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateTime);

  // সময় ফরম্যাট
  const formattedTime = new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(dateTime);

  // বিজ্ঞাপন Render
  const renderAdvertisements = () => {
    if (advertisements.length === 0) {
      return null;
    }

    return (
      <div className="header-ad-grid">
        {advertisements.map((ad, index) => (
          <AdvertisementCard
            key={ad._id || `${ad.title || 'advertisement'}-${index}`}
            ad={ad}
            index={index}
            isBangla={isBangla}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`navbar-wrapper ${
        showNavbar ? 'navbar-visible' : 'navbar-hidden'
      }`}
    >
      <header className="site-header">
        {/* Topbar */}
        <div className="topbar">
          <div className="navbar-container topbar-inner">
            <div className="topbar-date">
              <span className="calendar-icon" aria-hidden="true">
                ▦
              </span>

              <span>{formattedDate}</span>
              <span className="topbar-divider">|</span>
              <span>{formattedTime}</span>
            </div>

            <div className="topbar-right">
              <button
                type="button"
                className="language-button"
                onClick={toggleLanguage}
              >
                {isBangla ? 'বাংলা | English' : 'English | বাংলা'}
              </button>

              <div className="social-links">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  f
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  ▶
                </a>

                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                >
                  𝕏
                </a>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  ◎
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Logo, Desktop Advertisement এবং Search */}
        <div className="navbar-container brand-row">
          {/* Logo */}
          <Link
            to="/"
            className="brand-logo"
            onClick={closeSearch}
            aria-label={isBangla ? 'প্রচ্ছদ' : 'Home'}
          >
            <span className="logo-icon">
              <img
                src="/images/MyLogo.png"
                alt="দৈনিক লালমাই জনকণ্ঠ সংবাদ"
                className="site-logo"
              />
            </span>

            <span className="brand-copy">
              <span className="first-logo">{isBangla ? 'দৈনিক' : 'Daily'}</span>

              <span className="brand-div">
                <span className="brand-red">
                  {isBangla ? 'লালমাই ' : 'Lalmai'}
                </span>

                <span className="brand-green">
                  {isBangla ? ' জনকণ্ঠ' : 'Janakantha'}
                </span>

                <span className="brand-dark">
                  {isBangla ? ' সংবাদ' : 'News'}
                </span>
              </span>

              <small className="logo-second-site">
                {isBangla
                  ? 'সত্য ও নির্ভরযোগ্য সংবাদের ঠিকানা'
                  : 'Your source for trusted news'}
              </small>
            </span>
          </Link>

          {/* শুধু Desktop Header-এ Advertisement */}
          {advertisements.length > 0 && (
            <div className="header-ad header-ad-desktop">
              {renderAdvertisements()}
            </div>
          )}

          {/* Search */}
          <form
            ref={searchFormRef}
            className={`navbar-search ${searchOpen ? 'search-open' : ''}`}
            onSubmit={handleSearch}
            role="search"
          >
            <input
              ref={searchInputRef}
              type="search"
              placeholder={isBangla ? 'খবর খুঁজুন...' : 'Search news...'}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label={isBangla ? 'খবর খুঁজুন' : 'Search news'}
            />

            <button
              type="submit"
              className="desktop-search-button"
              aria-label={isBangla ? 'খুঁজুন' : 'Search'}
            >
              ⌕
            </button>

            <button
              type="button"
              className="mobile-search-toggle"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              aria-label={isBangla ? 'সার্চ খুলুন' : 'Open search'}
            >
              {searchOpen ? '✕' : '⌕'}
            </button>
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav
        className="category-nav"
        aria-label={isBangla ? 'প্রধান নেভিগেশন' : 'Main navigation'}
      >
        <div className="navbar-container nav-inner">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-home ${isActive ? 'active' : ''}`}
            onClick={closeSearch}
          >
            <span className="nav-home-icon" aria-hidden="true">
              ⌂
            </span>

            {t.home || (isBangla ? 'হোম' : 'Home')}
          </NavLink>

          {categories.map((category) => (
            <NavLink
              key={category.slug}
              to={`/category/${category.slug}`}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeSearch}
            >
              {isBangla ? category.bn : category.en}
            </NavLink>
          ))}

          <NavLink
            to="/videos"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSearch}
          >
            {t.videos || (isBangla ? 'ভিডিও' : 'Videos')}
          </NavLink>
        </div>
      </nav>

      {/* Breaking News */}
      <BreakingNews />
    </div>
  );
}

export default Navbar;
