import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaArrowUp,
  FaMapMarkerAlt,
} from 'react-icons/fa';

import './Footer.css';

function Footer() {
  const { language, t } = useLanguage();

  const isBangla = language === 'bn';
  const currentYear = new Date().getFullYear();

  const categories = [
    { bn: 'জাতীয়', en: 'National', slug: 'national' },
    { bn: 'রাজনীতি', en: 'Politics', slug: 'politics' },
    { bn: 'আন্তর্জাতিক', en: 'International', slug: 'international' },
    { bn: 'খেলাধুলা', en: 'Sports', slug: 'sports' },
    { bn: 'প্রযুক্তি', en: 'Technology', slug: 'technology' },
    { bn: 'বিনোদন', en: 'Entertainment', slug: 'entertainment' },
  ];

  const quickLinks = [
    {
      label: t.home,
      path: '/',
    },
    {
      label: t.videos,
      path: '/videos',
    },
    {
      label: t.search,
      path: '/search',
    },
  ];

  const contactEmail = 'dainiklalmaijonokonthosangbad@gmail.com';
  const phoneNumber = '01686977099';
  const whatsappNumber = '8801686977099';

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="site-footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link
              to="/"
              className="footer-logo"
              aria-label={
                isBangla
                  ? 'দৈনিক লালমাই জনকণ্ঠ সংবাদ - হোম'
                  : 'Daily Lalmai Janakantha Sangbad - Home'
              }
            >
              <span className="footer-logo-text">
                <span className="footer-logo-top">
                  {isBangla ? 'দৈনিক' : 'DAILY'}
                  <br />
                  <span className="logoName">
                    <strong className="footer-logo-middle">
                      {isBangla ? 'লালমাই ' : 'LALMAI JANAKANTHA'}
                    </strong>
                    <strong className="footer-logo-middle-2nd">
                      {isBangla ? 'জনকণ্ঠ ' : 'LALMAI JANAKANTHA'}
                    </strong>

                    <strong className="footer-logo-bottom">
                      {isBangla ? 'সংবাদ' : 'SANGBAD'}
                    </strong>
                  </span>
                </span>

                {/* <span className="footer-logo-middle">
                  {isBangla ? 'লালমাই ' : 'LALMAI JANAKANTHA'}
                </span>
                <span className="footer-logo-middle-2nd">
                  {isBangla ? 'জনকণ্ঠ ' : 'LALMAI JANAKANTHA'}
                </span>

                <span className="footer-logo-bottom">
                  {isBangla ? 'সংবাদ' : 'SANGBAD'}
                </span> */}
              </span>
            </Link>

            <p className="footer-description">
              {isBangla
                ? 'দৈনিক লালমাই জনকণ্ঠ সংবাদ। সত্য, নিরপেক্ষ ও বস্তুনিষ্ঠ সংবাদ পরিবেশনে আমরা প্রতিশ্রুতিবদ্ধ।'
                : 'Daily Lalmai Janakantha Sangbad. We are committed to delivering truthful, impartial, and objective news.'}
            </p>

            <div className="footer-publisher">
              <strong>
                {isBangla ? 'সম্পাদক ও প্রকাশক:' : 'Editor & Publisher:'}
              </strong>

              <span>
                {isBangla
                  ? 'মোঃ শাহ জাহান (সম্রাট তাজ)'
                  : 'Md. Shah Jahan (Samrat Taj)'}
              </span>
            </div>

            {/* Social Links */}
            <div className="footer-social-links">
              <a
                href="https://www.facebook.com/dainika.lalama.i.janakantha.sambada"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="footer-social facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="footer-social youtube"
              >
                <FaYoutube />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-social instagram"
              >
                <FaInstagram />
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="footer-social whatsapp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">
              {isBangla ? 'গুরুত্বপূর্ণ লিংক' : 'Quick Links'}
            </h3>

            <span className="footer-heading-line" />

            <ul className="footer-link-list">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>
                    <span className="footer-link-arrow">›</span>
                    {item.label}
                  </Link>
                </li>
              ))}

              <li>
                <Link to="/privacy">
                  <span className="footer-link-arrow">›</span>
                  {isBangla ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                </Link>
              </li>

              <li>
                <Link to="/terms">
                  <span className="footer-link-arrow">›</span>
                  {isBangla ? 'ব্যবহারের শর্তাবলি' : 'Terms of Use'}
                </Link>
              </li>
            </ul>
          </div>

          {/* News Categories */}
          <div className="footer-column">
            <h3 className="footer-heading">
              {isBangla ? 'সংবাদ বিভাগ' : 'News Categories'}
            </h3>

            <span className="footer-heading-line" />

            <ul className="footer-link-list">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link to={`/category/${category.slug}`}>
                    <span className="footer-link-arrow">›</span>
                    {isBangla ? category.bn : category.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-column footer-contact">
            <h3 className="footer-heading">
              {isBangla ? 'যোগাযোগ করুন' : 'Contact Us'}
            </h3>

            <span className="footer-heading-line" />

            <p className="footer-contact-description">
              {isBangla
                ? 'সংবাদ, মতামত বা বাণিজ্যিক যোগাযোগের জন্য আমাদের সঙ্গে যোগাযোগ করুন।'
                : 'Contact us for news tips, feedback, or business inquiries.'}
            </p>

            {/* Email */}
            <a href={`mailto:${contactEmail}`} className="footer-contact-item">
              <span className="footer-contact-icon">
                <FaEnvelope />
              </span>

              <span className="footer-contact-text">
                <small>{isBangla ? 'ইমেইল' : 'Email'}</small>

                <span className="footer-email">{contactEmail}</span>
              </span>
            </a>

            {/* Phone */}
            <a href={`tel:${phoneNumber}`} className="footer-contact-item">
              <span className="footer-contact-icon">
                <FaPhoneAlt />
              </span>

              <span className="footer-contact-text">
                <small>{isBangla ? 'ফোন' : 'Phone'}</small>

                <span>{phoneNumber}</span>
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <FaWhatsapp />
              </span>

              <span className="footer-contact-text">
                <small>WhatsApp</small>

                <span>{phoneNumber}</span>
              </span>
            </a>

            {/* Office Address */}
            <div className="footer-contact-item footer-address">
              <span className="footer-contact-icon">
                <FaMapMarkerAlt />
              </span>

              <span className="footer-contact-text">
                <small>{isBangla ? 'কার্যালয়' : 'Office'}</small>

                <span>
                  {isBangla
                    ? 'বাগমারা বাজার, লালমাই, কুমিল্লা, বাংলাদেশ'
                    : 'Bagmara Bazar, Lalmai, Cumilla, Bangladesh'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-copyright">
            <p>
              © {currentYear}{' '}
              <Link to="/" className="footer-copyright-brand">
                {isBangla
                  ? 'দৈনিক লালমাই জনকণ্ঠ সংবাদ'
                  : 'Daily Lalmai Janakantha Sangbad'}
              </Link>
            </p>

            <p className="footer-rights">
              {isBangla ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
            </p>
          </div>

          <div className="footer-legal-links">
            <Link to="/privacy">
              {isBangla ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
            </Link>

            <span className="footer-legal-divider">|</span>

            <Link to="/terms">
              {isBangla ? 'ব্যবহারের শর্তাবলি' : 'Terms of Use'}
            </Link>
          </div>

          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label={isBangla ? 'উপরে ফিরে যান' : 'Back to top'}
            title={isBangla ? 'উপরে ফিরে যান' : 'Back to top'}
          >
            <FaArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
