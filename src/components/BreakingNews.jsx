import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './BreakingNews.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

function BreakingNews() {
  const { language } = useLanguage();

  // তোমার LanguageContext অনুযায়ী ভাষা নির্ধারণ
  const isBangla = language === 'bn' || language === 'bangla';

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ভাষা অনুযায়ী লেখা
  const text = {
    title: isBangla ? 'ব্রেকিং নিউজ' : 'Breaking News',

    loading: isBangla ? 'নিউজ লোড হচ্ছে...' : 'Loading news...',

    error: isBangla ? 'নিউজ লোড করা যাচ্ছে না।' : 'Unable to load news.',

    empty: isBangla
      ? 'বর্তমানে কোনো ব্রেকিং নিউজ নেই।'
      : 'There is no breaking news right now.',
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchBreakingNews() {
      try {
        const response = await fetch(`${API_URL}/api/breaking-news`);

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid API response');
        }

        if (isMounted) {
          setNews(result.data);
          setError(false);
        }
      } catch (err) {
        console.error('Breaking News Error:', err.message);

        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // প্রথমবার নিউজ লোড
    fetchBreakingNews();

    // প্রতি ১৫ সেকেন্ডে নতুন নিউজ চেক
    const intervalId = setInterval(fetchBreakingNews, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Loading UI
  if (loading) {
    return (
      <section className="breaking-news" aria-label={text.title}>
        <div className="breaking-label">
          <span className="breaking-dot" />
          <span>{text.title}</span>
        </div>

        <div className="breaking-content">
          <span className="breaking-message">{text.loading}</span>
        </div>
      </section>
    );
  }

  // API Error UI
  if (error && news.length === 0) {
    return (
      <section className="breaking-news" aria-label={text.title}>
        <div className="breaking-label">
          <span className="breaking-dot" />
          <span>{text.title}</span>
        </div>

        <div className="breaking-content">
          <span className="breaking-message">{text.error}</span>
        </div>
      </section>
    );
  }

  // Empty News UI
  if (news.length === 0) {
    return (
      <section className="breaking-news" aria-label={text.title}>
        <div className="breaking-label">
          <span className="breaking-dot" />
          <span>{text.title}</span>
        </div>

        <div className="breaking-content">
          <span className="breaking-message">{text.empty}</span>
        </div>
      </section>
    );
  }

  // News UI
  return (
    <section className="breaking-news" aria-label={text.title}>
      <div className="breaking-label">
        <span className="breaking-dot" />
        <span>{text.title}</span>
      </div>

      <div className="breaking-content">
        <div className="breaking-track">
          {[...news, ...news].map((item, index) => {
            const key = `${item._id}-${index}`;

            // নির্বাচিত ভাষা অনুযায়ী শিরোনাম
            const title = isBangla ? item.titleBn : item.titleEn;

            // পুরোনো ডেটায় নতুন ফিল্ড না থাকলে fallback
            const fallbackTitle =
              title ||
              item.title ||
              (isBangla ? 'শিরোনাম পাওয়া যায়নি' : 'Title unavailable');

            // লিংক থাকলে clickable news
            if (item.link) {
              return (
                <Link
                  key={key}
                  to={item.link}
                  className="breaking-item"
                  title={fallbackTitle}
                >
                  {fallbackTitle}
                </Link>
              );
            }

            // লিংক না থাকলে সাধারণ text
            return (
              <span key={key} className="breaking-item" title={fallbackTitle}>
                {fallbackTitle}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BreakingNews;
