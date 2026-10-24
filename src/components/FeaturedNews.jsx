import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getFeaturedNews } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext';

import './FeaturedNews.css';

function FeaturedNews() {
  const { language } = useLanguage();

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
useEffect(() => {
  let isMounted = true;

  async function fetchFeaturedNews() {
    try {
      setLoading(true);
      setError('');

      const data = await getFeaturedNews();

      if (isMounted) {
        setNewsList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (isMounted) {
        setError(
          err.message ||
            'বিশেষ সংবাদ লোড করা যায়নি।'
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  fetchFeaturedNews();

  return () => {
    isMounted = false;
  };
}, []);



  if (loading) {
    return (
      <section className="featured-news-section">
        <p className="featured-news-message">
          {language === 'en'
            ? 'Loading featured news...'
            : 'বিশেষ সংবাদ লোড হচ্ছে...'}
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-news-section">
        <p className="featured-news-message featured-news-error">{error}</p>
      </section>
    );
  }

  if (newsList.length === 0) {
    return null;
  }

  // প্রথম সংবাদটি প্রধান Featured News
  const mainNews = newsList[0];

  const title =
    language === 'en' ? mainNews.titleEn || mainNews.title : mainNews.title;

  const description =
    language === 'en'
      ? mainNews.descriptionEn || mainNews.description
      : mainNews.description;

  const category =
    language === 'en'
      ? mainNews.categoryEn || mainNews.category
      : mainNews.category;

  return (
    <section className="featured-news-section">
      <div className="featured-news-heading">
        <h2>{language === 'en' ? 'Featured News' : 'বিশেষ সংবাদ'}</h2>
      </div>

      <div className="featured-news-layout">
        <article className="featured-news-main">
          <Link
            to={`/news/${mainNews._id}`}
            className="featured-news-image-link"
          >
            <img
              className="featured-news-image"
              src={getImageUrl(mainNews.image)}
              alt={title}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/news-placeholder.png';
              }}
            />
          </Link>

          <div className="featured-news-content">
            <span className="featured-news-category">{category}</span>

            <h3>
              <Link to={`/news/${mainNews._id}`}>{title}</Link>
            </h3>

            <p>{description}</p>
          </div>
        </article>

        {newsList.length > 1 && (
          <div className="featured-news-side">
            {newsList.slice(1).map((news) => {
              const sideTitle =
                language === 'en' ? news.titleEn || news.title : news.title;

              return (
                <article className="featured-news-side-card" key={news._id}>
                  <Link to={`/news/${news._id}`}>
                    <img
                      src={getImageUrl(news.image)}
                      alt={sideTitle}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = '/news-placeholder.png';
                      }}
                    />
                  </Link>

                  <h3>
                    <Link to={`/news/${news._id}`}>{sideTitle}</Link>
                  </h3>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedNews;
