import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminRequest, adminLogout } from '../services/adminApi';

import './AdminDashboard.css';

function AdminDashboard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  // Backend থেকে সব সংবাদ লোড করা
  async function loadNews() {
    try {
      setLoading(true);
      setError('');

      const result = await adminRequest('/news/admin/all');

      setNews(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'সংবাদ লোড করা যায়নি।');

      // Token অবৈধ বা মেয়াদ শেষ হলে Login পেজে পাঠানো
      if (/token|unauthorized|authorization|অ্যাক্সেস/i.test(err.message)) {
        adminLogout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  // সংবাদ Delete করা
  async function handleDelete(id, title) {
    const confirmed = window.confirm(`"${title}" সংবাদটি Delete করতে চান?`);

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError('');

      await adminRequest(`/news/${id}`, {
        method: 'DELETE',
      });

      setNews((previousNews) => previousNews.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || 'সংবাদ Delete করা যায়নি।');
    } finally {
      setDeletingId(null);
    }
  }

  // Admin Logout
  function handleLogout() {
    adminLogout();
    navigate('/admin/login', { replace: true });
  }

  const publishedCount = news.filter(
    (item) => item.status === 'published'
  ).length;

  const draftCount = news.filter((item) => item.status === 'draft').length;

  const featuredCount = news.filter((item) => item.isFeatured).length;

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>NewsToday Admin</h1>
          <p>আপনার নিউজ ওয়েবসাইট পরিচালনা করুন</p>
        </div>

        <div className="admin-header-actions">
          <Link to="/" className="admin-home-link">
            Website দেখুন
          </Link>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-welcome">
          <div>
            <h2>Dashboard</h2>
            <p>আপনার ওয়েবসাইটের সংবাদ ব্যবস্থাপনা করুন।</p>
          </div>

          <Link to="/admin/news/new" className="admin-add-button">
            + নতুন সংবাদ
          </Link>
        </div>

        {/* Statistics */}
        <section className="admin-stats">
          <article className="admin-stat-card">
            <span>মোট সংবাদ</span>
            <strong>{news.length}</strong>
          </article>

          <article className="admin-stat-card">
            <span>প্রকাশিত সংবাদ</span>
            <strong>{publishedCount}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Draft সংবাদ</span>
            <strong>{draftCount}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Featured সংবাদ</span>
            <strong>{featuredCount}</strong>
          </article>
        </section>

        {/* Error Message */}
        {error && (
          <div className="admin-error" role="alert">
            {error}
            <button type="button" onClick={loadNews}>
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {/* News Table */}
        <section className="admin-news-section">
          <div className="admin-section-heading">
            <h2>সংবাদ পরিচালনা</h2>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={loadNews}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="admin-message">সংবাদ লোড হচ্ছে...</p>
          ) : news.length === 0 ? (
            <div className="admin-message">
              <p>এখনো কোনো সংবাদ পাওয়া যায়নি।</p>

              <Link to="/admin/news/new">প্রথম সংবাদ যোগ করুন</Link>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-news-table">
                <thead>
                  <tr>
                    <th>শিরোনাম</th>
                    <th>ক্যাটাগরি</th>
                    <th>স্ট্যাটাস</th>
                    <th>Featured</th>
                    <th>তারিখ</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>

                <tbody>
                  {news.map((item) => (
                    <tr key={item._id}>
                      <td className="admin-news-title">{item.title}</td>

                      <td>{item.category}</td>

                      <td>
                        <span
                          className={`admin-status ${
                            item.status === 'published'
                              ? 'status-published'
                              : 'status-draft'
                          }`}
                        >
                          {item.status === 'published' ? 'প্রকাশিত' : 'Draft'}
                        </span>
                      </td>

                      <td>{item.isFeatured ? 'হ্যাঁ' : 'না'}</td>

                      <td>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('bn-BD')
                          : '—'}
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <Link
                            to={`/admin/news/edit/${item._id}`}
                            className="admin-edit-button"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() => handleDelete(item._id, item.title)}
                            disabled={deletingId === item._id}
                          >
                            {deletingId === item._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminDashboard;
