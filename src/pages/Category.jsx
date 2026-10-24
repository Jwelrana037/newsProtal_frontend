import { useParams } from 'react-router-dom';
import newsData from '../data/newsData';
import NewsCard from '../components/NewsCard';
import { useLanguage } from '../context/LanguageContext';
import './Category.css';

const categoryMap = {
  national: 'জাতীয়',
  politics: 'রাজনীতি',
  international: 'আন্তর্জাতিক',
  sports: 'খেলাধুলা',
  technology: 'প্রযুক্তি',
  entertainment: 'বিনোদন',
};

function Category() {
  const { slug } = useParams();
  const { language, t } = useLanguage();

  const categoryName = categoryMap[slug];

  const filteredNews = newsData.filter((news) =>
    language === 'en'
      ? news.categoryEn ===
        {
          national: 'National',
          politics: 'Politics',
          international: 'International',
          sports: 'Sports',
          technology: 'Technology',
          entertainment: 'Entertainment',
        }[slug]
      : news.category === categoryName
  );

  const pageTitle =
    language === 'en'
      ? {
          national: 'National',
          politics: 'Politics',
          international: 'International',
          sports: 'Sports',
          technology: 'Technology',
          entertainment: 'Entertainment',
        }[slug] || t.allNews
      : categoryName || t.allNews;

  return (
    <main className="category-page">
      <header className="category-header">
        <h1>{pageTitle}</h1>
      </header>

      {filteredNews.length > 0 ? (
        <div className="news-grid">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      ) : (
        <p className="category-empty">{t.noNews}</p>
      )}
    </main>
  );
}

export default Category;
