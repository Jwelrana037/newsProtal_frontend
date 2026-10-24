import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import NewsCard from '../components/NewsCard';
import { useLanguage } from '../context/LanguageContext';
import { getPublishedNews } from '../services/api';
import { getNewsByCategory } from '../services/api';
import './CategoryNews.css';

const categories = {
  national: {
    bn: 'জাতীয়',
    en: 'National',
  },
  politics: {
    bn: 'রাজনীতি',
    en: 'Politics',
  },
  international: {
    bn: 'আন্তর্জাতিক',
    en: 'International',
  },
  sports: {
    bn: 'খেলাধুলা',
    en: 'Sports',
  },
  technology: {
    bn: 'প্রযুক্তি',
    en: 'Technology',
  },
  entertainment: {
    bn: 'বিনোদন',
    en: 'Entertainment',
  },
};

function CategoryNews() {
  const { slug } = useParams();
  const { language } = useLanguage();

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isEnglish = language === 'en';
  const category = categories[slug];

  useEffect(() => {
    let isMounted = true;

    async function fetchNews() {
      try {
        setLoading(true);
        setError('');

        const news = await getNewsByCategory(slug);

        if (isMounted) {
          setNewsList(Array.isArray(news) ? news : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message ||
              (language === 'en'
                ? 'News could not be loaded.'
                : 'সংবাদ লোড করা যায়নি।')
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (slug && category) {
      fetchNews();
    } else {
      setNewsList([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [slug, category, language]);

  if (!category) {
    return (
      <main className="category-news-page">
        <div className="category-news-message">
          {isEnglish ? 'Category not found.' : 'এই বিভাগটি পাওয়া যায়নি।'}
        </div>
      </main>
    );
  }

  const filteredNews = newsList;

  const categoryTitle = isEnglish ? category.en : category.bn;

  return (
    <main className="category-news-page">
      <div className="category-news-container">
        <header className="category-news-header">
          <h1>{categoryTitle}</h1>

          <p>
            {isEnglish
              ? `Latest news from ${category.en}`
              : `${category.bn} বিভাগের সর্বশেষ সংবাদ`}
          </p>
        </header>

        {loading && (
          <div className="category-news-message">
            {isEnglish ? 'Loading news...' : 'সংবাদ লোড হচ্ছে...'}
          </div>
        )}

        {!loading && error && (
          <div
            className="category-news-message category-news-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && filteredNews.length > 0 && (
          <>
            <div className="category-news-count">
              {isEnglish
                ? `${filteredNews.length} news articles`
                : `মোট ${filteredNews.length}টি সংবাদ`}
            </div>

            <div className="category-news-grid">
              {filteredNews.map((news) => (
                <NewsCard key={news._id} news={news} />
              ))}
            </div>
          </>
        )}

        {!loading && !error && filteredNews.length === 0 && (
          <div className="category-news-message">
            {isEnglish
              ? 'No news found in this category.'
              : 'এই বিভাগে এখনো কোনো সংবাদ প্রকাশিত হয়নি।'}
          </div>
        )}
      </div>
    </main>
  );
}

export default CategoryNews;
