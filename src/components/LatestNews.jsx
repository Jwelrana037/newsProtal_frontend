import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './LatestNews.css';

function LatestNews({ newsList = [] }) {
  const { language, t } = useLanguage();

  return (
    <section className="latest-news">
      <div className="latest-news-heading">
        <h2>{t.latestNews}</h2>
      </div>

      <div className="latest-news-list">
        {newsList.map((news) => {
          const title =
            language === 'en' ? news.titleEn || news.title : news.title;

          const category =
            language === 'en'
              ? news.categoryEn || news.category
              : news.category;

          return (
            <article className="latest-news-item" key={news.id}>
              <Link to={`/news/${news.id}`} className="latest-news-image-link">
                <img
                  src={news.image}
                  alt={title}
                  className="latest-news-image"
                  loading="lazy"
                />
              </Link>

              <div className="latest-news-content">
                <span>{category}</span>

                <h3>
                  <Link to={`/news/${news.id}`}>{title}</Link>
                </h3>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default LatestNews;
