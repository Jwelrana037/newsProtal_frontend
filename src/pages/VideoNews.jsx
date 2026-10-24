import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import videoData from '../data/videoData';
import './VideoNews.css';

function VideoNews() {
  const { language, t } = useLanguage();

  const [selectedVideo, setSelectedVideo] = useState(videoData[0] || null);

  if (!selectedVideo) {
    return (
      <main className="video-news-page">
        <h1>{t.allVideos}</h1>
        <p>{t.noNews}</p>
      </main>
    );
  }

  const selectedTitle =
    language === 'en'
      ? selectedVideo.titleEn || selectedVideo.title
      : selectedVideo.title;

  const selectedDescription =
    language === 'en'
      ? selectedVideo.descriptionEn || selectedVideo.description
      : selectedVideo.description;

  return (
    <main className="video-news-page">
      <header className="video-news-header">
        <h1>{t.allVideos}</h1>
        <p>{t.videoDescription}</p>
      </header>

      <section className="featured-video">
        <div className="featured-video-player">
          {selectedVideo.videoType === 'youtube' && selectedVideo.youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}`}
              title={selectedTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : selectedVideo.videoUrl ? (
            <video controls src={selectedVideo.videoUrl}>
              Your browser does not support video playback.
            </video>
          ) : (
            <p>{t.noNews}</p>
          )}
        </div>

        <div className="featured-video-info">
          <h2>{selectedTitle}</h2>
          <p>{selectedDescription}</p>
        </div>
      </section>

      <section className="video-list-section">
        <h2>{t.allVideos}</h2>

        <div className="video-grid">
          {videoData.map((video) => {
            const title =
              language === 'en' ? video.titleEn || video.title : video.title;

            const description =
              language === 'en'
                ? video.descriptionEn || video.description
                : video.description;

            return (
              <button
                type="button"
                className={`video-card ${
                  selectedVideo.id === video.id ? 'active' : ''
                }`}
                key={video.id}
                onClick={() => setSelectedVideo(video)}
              >
                <img src={video.thumbnail} alt={title} loading="lazy" />

                <div className="video-card-content">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default VideoNews;
