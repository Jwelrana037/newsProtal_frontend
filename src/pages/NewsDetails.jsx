import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getNewsById } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext';

import './NewsDetails.css';

function NewsDetails() {
  const { id } = useParams();
  const { language } = useLanguage();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isEnglish = language === 'en';

  useEffect(() => {
    let isMounted = true;

    async function fetchNews() {
      try {
        setLoading(true);
        setError('');
        setNews(null);

        const data = await getNewsById(id);

        if (isMounted) {
          setNews(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message ||
              (isEnglish ? 'Failed to load news.' : 'সংবাদ লোড করা যায়নি।')
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchNews();
    } else {
      setError(isEnglish ? 'News ID is missing.' : 'সংবাদের ID পাওয়া যায়নি।');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, isEnglish]);

  const homeText = isEnglish ? 'Home' : 'হোম পেজে ফিরে যাও';

  if (loading) {
    return (
      <div className="news-details-message">
        {isEnglish ? 'Loading news...' : 'সংবাদ লোড হচ্ছে...'}
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="news-details-message">
        <p>
          {error ||
            (isEnglish ? 'News article not found.' : 'সংবাদটি পাওয়া যায়নি।')}
        </p>

        <Link to="/" className="news-back-link">
          ← {homeText}
        </Link>
      </div>
    );
  }

  const title = isEnglish ? news.titleEn || news.title : news.title;

  const description = isEnglish
    ? news.descriptionEn || news.description
    : news.description;

  const content = isEnglish ? news.contentEn || news.content : news.content;

  const category = isEnglish ? news.categoryEn || news.category : news.category;

  const authorLabel = isEnglish ? 'Author' : 'লেখক';

  const formattedDate = news.createdAt
    ? new Date(news.createdAt).toLocaleDateString(
        isEnglish ? 'en-US' : 'bn-BD',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : '';

  return (
    <main className="news-details-page">
      <div className="news-details-container">
        {/* Breadcrumb */}
        <nav className="news-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{isEnglish ? 'Home' : 'হোম'}</Link>
          <span aria-hidden="true">/</span>
          <span>{category}</span>
        </nav>

        {/* Category */}
        <span className="news-details-category">{category}</span>

        {/* Title */}
        <h1 className="news-details-title">{title}</h1>

        {/* Description */}
        {description && (
          <p className="news-details-description">{description}</p>
        )}

        {/* Author and Date */}
        <div className="news-details-meta">
          <span>
            {authorLabel}: {news.author || 'NewsToday Desk'}
          </span>

          {formattedDate && (
            <time dateTime={news.createdAt}>{formattedDate}</time>
          )}
        </div>

        {/* News Image */}
        <img
          className="news-details-image"
          src={getImageUrl(news.image)}
          alt={title || 'News image'}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/news-placeholder.png';
          }}
        />

        {/* Full Content */}
        <article className="news-details-content">{content}</article>

        {/* Back to Home */}
        <Link to="/" className="news-back-link">
          ← {homeText}
        </Link>
      </div>
    </main>
  );
}

export default NewsDetails;
