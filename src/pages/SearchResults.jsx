import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import NewsCard from '../components/NewsCard';
import { getPublishedNews } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

import './SearchResults.css';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();

  // URL থেকে Search Query নেওয়া
  const query = searchParams.get('q')?.trim() || '';

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Backend থেকে প্রকাশিত সংবাদ লোড করা
  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError('');

        const news = await getPublishedNews();

        setNewsList(Array.isArray(news) ? news : []);
      } catch (err) {
        setError(
          err.message ||
            (language === 'en'
              ? 'Could not load news.'
              : 'সংবাদ লোড করা যায়নি।')
        );
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [language]);

  // বাংলা ও ইংরেজি শিরোনাম, বিবরণ ও কনটেন্টে Search
  const filteredNews = newsList.filter((news) => {
    if (!query) return false;

    const searchableText = [
      news.title,
      news.titleEn,
      news.description,
      news.descriptionEn,
      news.content,
      news.contentEn,
      news.category,
      news.categoryEn,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();

    return searchableText.includes(query.toLocaleLowerCase());
  });

  return (
    <main className="search-results-page">
      <div className="search-results-container">
        <header className="search-results-header">
          <h1>{language === 'en' ? 'Search Results' : 'সংবাদ অনুসন্ধান'}</h1>

          <p>
            {language === 'en'
              ? `Search query: "${query}"`
              : `আপনার অনুসন্ধান: "${query}"`}
          </p>
        </header>

        {!query && (
          <div className="search-results-message">
            {language === 'en'
              ? 'Please enter a search term.'
              : 'অনুগ্রহ করে সার্চ বক্সে কোনো শব্দ লিখুন।'}
          </div>
        )}

        {loading && (
          <div className="search-results-message">
            {language === 'en' ? 'Loading news...' : 'সংবাদ লোড হচ্ছে...'}
          </div>
        )}

        {!loading && error && (
          <div className="search-results-message search-results-error">
            {error}
          </div>
        )}

        {!loading && !error && query && filteredNews.length > 0 && (
          <>
            <p className="search-results-count">
              {language === 'en'
                ? `${filteredNews.length} news articles found`
                : `মোট ${filteredNews.length}টি সংবাদ পাওয়া গেছে`}
            </p>

            <div className="search-results-grid">
              {filteredNews.map((news) => (
                <NewsCard key={news._id} news={news} />
              ))}
            </div>
          </>
        )}

        {!loading && !error && query && filteredNews.length === 0 && (
          <div className="search-results-message">
            <h2>
              {language === 'en' ? 'No news found!' : 'কোনো সংবাদ পাওয়া যায়নি!'}
            </h2>

            <p>
              {language === 'en'
                ? 'Try another keyword.'
                : 'অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন।'}
            </p>

            <Link to="/" className="search-back-home">
              {language === 'en' ? 'Back to Home' : 'হোম পেজে ফিরে যান'}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default SearchResults;
