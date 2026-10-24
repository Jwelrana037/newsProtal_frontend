import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import BreakingNews from './BreakingNews';
import './Navbar.css';
import { useLanguage } from '../context/LanguageContext';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');

const BACKEND_URL = API_URL.replace(/\/api$/, '');

function Navbar() {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [advertisement, setAdvertisement] = useState(null);

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

  // Scroll করলে Navbar Hide / Show
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

  // Search খুললে ইনপুটে Focus
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  // Search-এর বাইরে ক্লিক করলে বন্ধ হবে
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchOpen &&
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
  }, [searchOpen]);

  // Backend থেকে সক্রিয় Navbar বিজ্ঞাপন লোড
  useEffect(() => {
    const controller = new AbortController();

    async function fetchAdvertisement() {
      try {
        const response = await fetch(`${API_URL}/advertisements/navbar`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`বিজ্ঞাপন লোড করা যায়নি (HTTP ${response.status})`);
        }

        const data = await response.json();

        console.log('Navbar Advertisement Data:', data);
        console.log(
          'Advertisement Request URL:',
          `${API_URL}/advertisements/navbar`
        );

        if (data.success) {
          setAdvertisement(data.advertisement || null);
        } else {
          setAdvertisement(null);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Advertisement Error:', error);
          setAdvertisement(null);
        }
      }
    }

    fetchAdvertisement();

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

  // তারিখ
  const formattedDate = new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateTime);

  // সময়
  const formattedTime = new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(dateTime);

  // বিজ্ঞাপনের ছবির সম্পূর্ণ URL
  const advertisementImageUrl = advertisement?.image
    ? /^https?:\/\//i.test(advertisement.image)
      ? advertisement.image
      : `${BACKEND_URL}${
          advertisement.image.startsWith('/') ? '' : '/'
        }${advertisement.image}`
    : '';

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
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  f
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                >
                  ▶
                </a>

                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X"
                >
                  𝕏
                </a>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  ◎
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Logo, Advertisement, Search */}
        <div className="navbar-container brand-row">
          <Link
            to="/"
            className="brand-logo"
            onClick={closeSearch}
            aria-label={isBangla ? 'প্রচ্ছদ' : 'Home'}
          >
            <span className="logo-icon">
              <img src="/images/MyLogo.png" alt="দৈনিক" className="site-logo" />
            </span>

            <span className="brand-copy">
              <span className="first-logo">{isBangla ? 'দৈনিক' : 'Daily'}</span>
              <div className="brand-div">
                <span className="brand-red">
                  {isBangla ? 'লালমাই ' : 'Lalmai'}
                </span>
                <span className="brand-green">
                  {isBangla ? ' জনকণ্ঠ' : 'Janakantha'}
                </span>
                <span className="brand-dark">
                  {isBangla ? '  সংবাদ' : 'News'}
                </span>
              </div>

              <small className="logo-second-site">
                {isBangla
                  ? 'সত্য ও নির্ভরযোগ্য সংবাদের ঠিকানা'
                  : 'Your source for trusted news'}
              </small>
            </span>
          </Link>

          {/* Navbar Advertisement */}
          <div className="header-ad header-ad-desktop">
            {advertisement && advertisementImageUrl ? (
              <a
                href={advertisement.targetUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="header-ad-link"
                aria-label={advertisement.title}
              >
                <img
                  src={advertisementImageUrl}
                  alt={advertisement.title}
                  className="header-ad-image"
                />
              </a>
            ) : (
              <>
                <span className="ad-label">
                  {isBangla ? 'বিজ্ঞাপন' : 'ADVERTISEMENT'}
                </span>

                <strong>
                  {isBangla
                    ? 'সঠিক তথ্য, সমৃদ্ধ দেশ'
                    : 'Trusted News, Informed Nation'}
                </strong>

                <span>
                  {isBangla
                    ? 'সত্যের সঙ্গে প্রতিদিন'
                    : 'Stay informed every day'}
                </span>
              </>
            )}
          </div>

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
      {/* Breaking News */}
      <BreakingNews />

      {/* Mobile & Tablet Advertisement */}
      <div className="navbar-container header-ad header-ad-mobile">
        {advertisement && advertisementImageUrl ? (
          <a
            href={advertisement.targetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="header-ad-link"
            aria-label={advertisement.title}
          >
            <img
              src={advertisementImageUrl}
              alt={advertisement.title}
              className="header-ad-image"
            />
          </a>
        ) : (
          <>
            <span className="ad-label">
              {isBangla ? 'বিজ্ঞাপন' : 'ADVERTISEMENT'}
            </span>

            <strong>
              {isBangla
                ? 'সঠিক তথ্য, সমৃদ্ধ দেশ'
                : 'Trusted News, Informed Nation'}
            </strong>

            <span>
              {isBangla ? 'সত্যের সঙ্গে প্রতিদিন' : 'Stay informed every day'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
