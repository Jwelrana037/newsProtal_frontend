import { useState } from 'react';
import { Link } from 'react-router-dom';
import videoData from '../data/videoData';
import './AdminVideos.css';

function AdminVideos() {
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState('');

  const filteredVideos = videoData.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleDeleteClick(video) {
    setSelectedVideo(video);
    setShowDeleteModal(true);
  }

  function handleDeleteConfirm() {
    // Backend DELETE API will be connected later.
    setMessage(`"${selectedVideo.title}" ডিলিট করার জন্য Backend API প্রয়োজন।`);

    setShowDeleteModal(false);
    setSelectedVideo(null);
  }

  function handleAddVideo() {
    setMessage(
      'ভিডিও যুক্ত করার Form পরবর্তী ধাপে তৈরি করব। এখনো Database সংযুক্ত হয়নি।'
    );
  }

  return (
    <div className="admin-videos-page">
      <div className="admin-videos-heading">
        <div>
          <h2>Video Management</h2>
          <p>আপনার ভিডিও সংবাদ পরিচালনা করুন।</p>
        </div>

        <button
          type="button"
          className="admin-video-add-button"
          onClick={handleAddVideo}
        >
          + Add Video
        </button>
      </div>

      <section className="admin-videos-panel">
        <div className="admin-videos-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ভিডিওর শিরোনাম খুঁজুন..."
            aria-label="Search videos"
          />

          <span>{filteredVideos.length} টি ভিডিও</span>
        </div>

        {message && (
          <div className="admin-video-message" role="status">
            <p>{message}</p>

            <button type="button" onClick={() => setMessage('')}>
              বন্ধ করুন
            </button>
          </div>
        )}

        <div className="admin-videos-grid">
          {filteredVideos.map((video) => (
            <article className="admin-video-card" key={video.id}>
              <div className="admin-video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />

                <span className="admin-video-type">
                  {video.videoType === 'youtube' ? 'YouTube' : 'Uploaded'}
                </span>
              </div>

              <div className="admin-video-content">
                <span className="admin-video-category">{video.category}</span>

                <h3>{video.title}</h3>

                <p>{video.description}</p>

                <div className="admin-video-actions">
                  <Link to="/videos" className="admin-video-view-button">
                    Preview
                  </Link>

                  <button
                    type="button"
                    className="admin-video-delete-button"
                    onClick={() => handleDeleteClick(video)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {filteredVideos.length === 0 && (
            <p className="admin-video-empty">কোনো ভিডিও পাওয়া যায়নি।</p>
          )}
        </div>
      </section>

      {showDeleteModal && selectedVideo && (
        <div
          className="video-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDeleteModal(false);
            }
          }}
        >
          <section
            className="video-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-delete-title"
          >
            <div className="video-delete-icon">!</div>

            <h3 id="video-delete-title">ভিডিও ডিলিট করতে চাও?</h3>

            <p>
              <strong>{selectedVideo.title}</strong> — এই নমুনা ভিডিওটি ডিলিট
              করার অনুরোধ করা হয়েছে।
            </p>

            <div className="video-modal-actions">
              <button
                type="button"
                className="video-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                বাতিল
              </button>

              <button
                type="button"
                className="video-modal-confirm"
                onClick={handleDeleteConfirm}
              >
                নিশ্চিত করুন
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminVideos;
