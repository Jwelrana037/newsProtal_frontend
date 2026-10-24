import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './NewsCard.css';

import { getImageUrl } from '../utils/imageUrl';

function NewsCard({ news }) {
  const { language, t } = useLanguage();

  const title = language === 'en' ? news.titleEn || news.title : news.title;

  const description =
    language === 'en'
      ? news.descriptionEn || news.description
      : news.description;

  const category =
    language === 'en' ? news.categoryEn || news.category : news.category;

  const date = language === 'en' ? news.dateEn || news.date : news.date;

  return (
    <article className="news-card">
      <Link
        to={`/news/${news._id}`}
        className="news-card-image-link"
        aria-label={title}
      >
        <img
          className="news-card-image"
          src={getImageUrl(news.image)}
          alt={news.title}
          loading="lazy"
          onError={(event) => {
             event.currentTarget.onerror = null;
             event.currentTarget.src = 'news-placeholder.png';
          }}
        />


      </Link>

      <div className="news-card-body">
        <span className="news-card-category">{category}</span>

        <h2 className="news-card-title">
          <Link to={`/news/${news.id}`}>{title}</Link>
        </h2>

        <p className="news-card-description">{description}</p>

        <div className="news-card-footer">
          <time>{date}</time>

          <Link to={`/news/${news.id}`} className="news-card-read-more">
            {t.readMore} →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default NewsCard;
