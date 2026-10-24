import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './HeroNews.css';

function HeroNews({ news }) {
  const { language, t } = useLanguage();

  if (!news) {
    return null;
  }

  const title = language === 'en' ? news.titleEn || news.title : news.title;

  const description =
    language === 'en'
      ? news.descriptionEn || news.description
      : news.description;

  const category =
    language === 'en' ? news.categoryEn || news.category : news.category;

  return (
    <article className="hero-news">
      <Link to={`/news/${news.id}`} className="hero-news-image-link">
        <img className="hero-news-image" src={news.image} alt={title} />
      </Link>

      <div className="hero-news-content">
        <span className="hero-news-category">{category}</span>

        <h1>
          <Link to={`/news/${news.id}`}>{title}</Link>
        </h1>

        <p>{description}</p>

        <Link to={`/news/${news.id}`} className="hero-news-button">
          {t.readMore} →
        </Link>
      </div>
    </article>
  );
}

export default HeroNews;
