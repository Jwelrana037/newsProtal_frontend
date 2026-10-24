import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getPublishedNewsPaginated } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/imageUrl';

import './LatestNews.css';

function LatestNews() {
  const { language, t } = useLanguage();

  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 10;
  const isBangla = language === 'bn';

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      try {
        setLoading(true);
        setError('');

        const result = await getPublishedNewsPaginated(currentPage, limit);

        if (cancelled) return;

        setNewsList(result.data || []);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        if (cancelled) return;

        setError(
          err.message ||
            (isBangla ? 'সংবাদ লোড করা যায়নি।' : 'Failed to load news.')
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      cancelled = true;
    };
  }, [currentPage, isBangla, retryCount]);

  function changePage(page) {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: document.querySelector('.latest-news')?.offsetTop ?? 0,
      behavior: 'smooth',
    });
  }

  return (
    <section className="latest-news">
      <div className="latest-news-container">
        <div className="latest-news-heading">
          <h2>{t.latestNews}</h2>
        </div>

        {loading ? (
          <div className="latest-news-message" role="status">
            {isBangla ? 'সংবাদ লোড হচ্ছে...' : 'Loading news...'}
          </div>
        ) : error ? (
          <div className="latest-news-error" role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              {isBangla ? 'আবার চেষ্টা করুন' : 'Try again'}
            </button>
          </div>
        ) : newsList.length === 0 ? (
          <div className="latest-news-message">
            {isBangla ? 'কোনো সংবাদ পাওয়া যায়নি।' : 'No news found.'}
          </div>
        ) : (
          <>
            <div className="latest-news-grid">
              {newsList.map((news) => {
                const id = news._id || news.id;

                const title =
                  language === 'en' ? news.titleEn || news.title : news.title;

                const category =
                  language === 'en'
                    ? news.categoryEn || news.category
                    : news.category;

                const description =
                  language === 'en'
                    ? news.descriptionEn || news.description
                    : news.description;

                return (
                  <article className="latest-news-card" key={id}>
                    <Link to={`/news/${id}`} className="latest-news-image-link">
                      {news.image ? (
                        <img
                          src={getImageUrl(news.image)}
                          alt={title}
                          className="latest-news-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="latest-news-image-placeholder">
                          {isBangla ? 'সংবাদ' : 'News'}
                        </div>
                      )}
                    </Link>

                    <div className="latest-news-content">
                      <span className="latest-news-category">{category}</span>

                      <h3>
                        <Link to={`/news/${id}`}>{title}</Link>
                      </h3>

                      {description && <p>{description}</p>}

                      <Link
                        to={`/news/${id}`}
                        className="latest-news-read-more"
                      >
                        {isBangla ? 'বিস্তারিত পড়ুন →' : 'Read more →'}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav
                className="news-pagination"
                aria-label={isBangla ? 'সংবাদ পেজ নেভিগেশন' : 'News pagination'}
              >
                <button
                  type="button"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {isBangla ? '← আগের' : '← Previous'}
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    aria-current={currentPage === page ? 'page' : undefined}
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {isBangla ? 'পরের →' : 'Next →'}
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default LatestNews;
