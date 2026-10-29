import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminRequest, adminLogout } from '../services/adminApi';

import './AdminDashboard.css';

const QUEUE_STATUSES = [
  { value: '', label: 'সব Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const QUEUE_CATEGORIES = [
  { value: '', label: 'সব Category' },
  { value: 'কুমিল্লা', label: 'কুমিল্লা' },
  { value: 'জাতীয়', label: 'জাতীয়' },
  { value: 'রাজনীতি', label: 'রাজনীতি' },
  { value: 'আন্তর্জাতিক', label: 'আন্তর্জাতিক' },
  { value: 'খেলাধুলা', label: 'খেলাধুলা' },
  { value: 'বিনোদন', label: 'বিনোদন' },
  { value: 'প্রযুক্তি', label: 'প্রযুক্তি' },
  { value: 'ভিডিও', label: 'ভিডিও' },
];

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

function AdminDashboard() {
  // ========================================
  // 1. Existing News State
  // ========================================

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // ========================================
  // 2. Queue State
  // ========================================

  const [queueItems, setQueueItems] = useState([]);
  const [queueStats, setQueueStats] = useState(null);

  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [queueMessage, setQueueMessage] = useState('');

  const [queueStatus, setQueueStatus] = useState('');
  const [queueCategory, setQueueCategory] = useState('');

  const [queuePage, setQueuePage] = useState(1);
  const [queuePagination, setQueuePagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [queueActionId, setQueueActionId] = useState(null);
  const [collecting, setCollecting] = useState(false);

  const navigate = useNavigate();

  // ========================================
  // 3. Authentication Error Handling
  // ========================================

  const handleApiError = useCallback(
    (err) => {
      const message = err?.message || '';

      if (
        /token|unauthorized|authorization|access denied|অ্যাক্সেস/i.test(
          message
        )
      ) {
        adminLogout();
        navigate('/admin/login', { replace: true });
      }
    },
    [navigate]
  );

  // ========================================
  // 4. Load Existing News
  // ========================================

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await adminRequest('/news/admin/all');

      setNews(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'সংবাদ লোড করা যায়নি।');
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  // ========================================
  // 5. Load Queue Statistics
  // ========================================

  const loadQueueStats = useCallback(async () => {
    try {
      const result = await adminRequest('/admin/news-queue/stats');

      if (result.success) {
        setQueueStats(result.data);
      } else {
        throw new Error(result.message || 'Queue Statistics লোড করা যায়নি।');
      }
    } catch (err) {
      setQueueError(err.message || 'Queue Statistics লোড করা যায়নি।');

      handleApiError(err);
    }
  }, [handleApiError]);

  // ========================================
  // 6. Load Queue Items
  // ========================================

  const loadQueue = useCallback(async () => {
    try {
      setQueueLoading(true);
      setQueueError('');
      setQueueMessage('');

      const params = new URLSearchParams();

      params.set('page', String(queuePage));
      params.set('limit', '20');

      if (queueStatus) {
        params.set('status', queueStatus);
      }

      if (queueCategory) {
        params.set('category', queueCategory);
      }

      const result = await adminRequest(
        `/admin/news-queue?${params.toString()}`
      );

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || 'Queue-এর সংবাদ লোড করা যায়নি।');
      }

      setQueueItems(result.data);

      setQueuePagination(
        result.pagination || {
          total: result.data.length,
          page: queuePage,
          limit: 20,
          totalPages: 1,
        }
      );
    } catch (err) {
      setQueueError(err.message || 'Queue-এর সংবাদ লোড করা যায়নি।');

      handleApiError(err);
    } finally {
      setQueueLoading(false);
    }
  }, [queuePage, queueStatus, queueCategory, handleApiError]);

  // ========================================
  // 7. Initial Load
  // ========================================

  useEffect(() => {
    loadNews();
    loadQueueStats();
  }, [loadNews, loadQueueStats]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // ========================================
  // 8. Delete Existing News
  // ========================================

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
      handleApiError(err);
    } finally {
      setDeletingId(null);
    }
  }

  // ========================================
  // 9. Retry Failed Queue Item
  // ========================================

  async function handleRetryQueue(id, title) {
    const confirmed = window.confirm(
      `"${title}" সংবাদটি আবার Processing-এর জন্য পাঠাবেন?`
    );

    if (!confirmed) return;

    try {
      setQueueActionId(id);
      setQueueError('');
      setQueueMessage('');

      const result = await adminRequest(`/admin/news-queue/${id}/retry`, {
        method: 'PATCH',
      });

      if (!result.success) {
        throw new Error(result.message || 'Retry করা যায়নি।');
      }

      setQueueMessage(result.message || 'সংবাদটি আবার Pending করা হয়েছে।');

      await Promise.all([loadQueue(), loadQueueStats()]);
    } catch (err) {
      setQueueError(err.message || 'Retry করা যায়নি।');
      handleApiError(err);
    } finally {
      setQueueActionId(null);
    }
  }

  // ========================================
  // 10. Delete Queue Item
  // ========================================

  async function handleDeleteQueue(id, title) {
    const confirmed = window.confirm(`"${title}" Queue থেকে মুছে ফেলতে চান?`);

    if (!confirmed) return;

    try {
      setQueueActionId(id);
      setQueueError('');
      setQueueMessage('');

      const result = await adminRequest(`/admin/news-queue/${id}`, {
        method: 'DELETE',
      });

      if (!result.success) {
        throw new Error(result.message || 'Queue Item Delete করা যায়নি।');
      }

      setQueueMessage(result.message || 'Queue Item Delete করা হয়েছে।');

      await Promise.all([loadQueue(), loadQueueStats()]);
    } catch (err) {
      setQueueError(err.message || 'Queue Item Delete করা যায়নি।');

      handleApiError(err);
    } finally {
      setQueueActionId(null);
    }
  }

  // ========================================
  // 11. Manual RSS Collection
  // ========================================

  async function handleCollectNews() {
    try {
      setCollecting(true);
      setQueueError('');
      setQueueMessage('');

      const result = await adminRequest('/admin/news-queue/collect', {
        method: 'POST',
      });

      if (!result.success) {
        throw new Error(result.message || 'RSS Collection ব্যর্থ হয়েছে।');
      }

      setQueueMessage(result.message || 'RSS Collection সম্পন্ন হয়েছে।');

      await Promise.all([loadQueue(), loadQueueStats()]);
    } catch (err) {
      setQueueError(err.message || 'RSS Collection ব্যর্থ হয়েছে।');

      handleApiError(err);
    } finally {
      setCollecting(false);
    }
  }

  // ========================================
  // 12. Admin Logout
  // ========================================

  function handleLogout() {
    adminLogout();
    navigate('/admin/login', { replace: true });
  }

  // ========================================
  // 13. Existing News Statistics
  // ========================================

  const publishedCount = news.filter(
    (item) => item.status === 'published'
  ).length;

  const draftCount = news.filter((item) => item.status === 'draft').length;

  const featuredCount = news.filter((item) => item.isFeatured).length;

  // ========================================
  // 14. Date Formatter
  // ========================================

  function formatDate(date) {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('bn-BD');
  }

  // ========================================
  // 15. Dashboard UI
  // ========================================

  return (
    <main className="admin-dashboard">
      {/* Header */}{' '}
      <header className="admin-header">
        {' '}
        <div>
          {' '}
          <h1>NewsToday Admin</h1> <p>আপনার নিউজ ওয়েবসাইট পরিচালনা করুন</p>{' '}
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
        {/* Welcome */}
        <div className="admin-welcome">
          <div>
            <h2>Dashboard</h2>
            <p>সংবাদ, বিজ্ঞাপন এবং Auto News পরিচালনা করুন।</p>
          </div>

          <div className="admin-welcome-actions">
            <Link to="/admin/news/new" className="admin-add-button">
              + নতুন সংবাদ
            </Link>

            <Link
              to="/admin/advertisements"
              className="admin-advertisement-button"
            >
              Advertisement Management
            </Link>
          </div>
        </div>

        {/* Existing News Statistics */}
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

        {/* Existing News Error */}
        {error && (
          <div className="admin-error" role="alert">
            <span>{error}</span>

            <button type="button" onClick={loadNews} disabled={loading}>
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Existing News Table */}
        <section className="admin-news-section">
          <div className="admin-section-heading">
            <h2>সংবাদ পরিচালনা</h2>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={loadNews}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
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

                      <td>{formatDate(item.createdAt)}</td>

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

        {/* ========================================
        AUTO NEWS QUEUE DASHBOARD
    ======================================== */}

        <section className="admin-queue-section">
          <div className="admin-queue-header">
            <div>
              <span className="admin-eyebrow">RSS AUTOMATION</span>

              <h2>Auto News Queue</h2>

              <p>RSS থেকে সংগৃহীত সংবাদ এবং Processing Status পরিচালনা করুন।</p>
            </div>

            <div className="admin-queue-header-actions">
              <button
                type="button"
                className="admin-collect-button"
                onClick={handleCollectNews}
                disabled={collecting}
              >
                {collecting ? 'সংবাদ সংগ্রহ হচ্ছে...' : '↓ RSS Collect'}
              </button>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={() => Promise.all([loadQueue(), loadQueueStats()])}
                disabled={queueLoading}
              >
                {queueLoading ? 'Loading...' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Queue Statistics */}
          {queueStats && (
            <div className="admin-queue-stats">
              <article className="queue-stat-card queue-stat-total">
                <span>মোট Queue</span>
                <strong>{queueStats.total ?? 0}</strong>
              </article>

              <article className="queue-stat-card queue-stat-pending">
                <span>Pending</span>
                <strong>{queueStats.pending ?? 0}</strong>
              </article>

              <article className="queue-stat-card queue-stat-processing">
                <span>Processing</span>
                <strong>{queueStats.processing ?? 0}</strong>
              </article>

              <article className="queue-stat-card queue-stat-completed">
                <span>Completed</span>
                <strong>{queueStats.completed ?? 0}</strong>
              </article>

              <article className="queue-stat-card queue-stat-failed">
                <span>Failed</span>
                <strong>{queueStats.failed ?? 0}</strong>
              </article>
            </div>
          )}

          {/* Category Statistics */}
          {queueStats?.categories && (
            <div className="admin-category-stats">
              <h3>Category Overview</h3>

              <div className="admin-category-grid">
                {QUEUE_CATEGORIES.filter((category) => category.value).map(
                  (category) => {
                    const categoryStats = queueStats.categories[category.value];

                    return (
                      <button
                        type="button"
                        key={category.value}
                        className={`admin-category-card ${
                          queueCategory === category.value
                            ? 'category-card-active'
                            : ''
                        }`}
                        onClick={() => {
                          setQueueCategory(category.value);
                          setQueuePage(1);
                        }}
                      >
                        <span>{category.label}</span>

                        <strong>{categoryStats?.total ?? 0}</strong>

                        <small>Pending: {categoryStats?.pending ?? 0}</small>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Queue Messages */}
          {queueError && (
            <div className="admin-error" role="alert">
              <span>{queueError}</span>

              <button
                type="button"
                onClick={() => Promise.all([loadQueue(), loadQueueStats()])}
                disabled={queueLoading}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {queueMessage && (
            <div className="admin-success" role="status">
              {queueMessage}
            </div>
          )}

          {/* Queue Filters */}
          <div className="admin-queue-filters">
            <label>
              <span>Status</span>

              <select
                value={queueStatus}
                onChange={(event) => {
                  setQueueStatus(event.target.value);
                  setQueuePage(1);
                }}
              >
                {QUEUE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Category</span>

              <select
                value={queueCategory}
                onChange={(event) => {
                  setQueueCategory(event.target.value);
                  setQueuePage(1);
                }}
              >
                {QUEUE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="admin-clear-filter"
              onClick={() => {
                setQueueStatus('');
                setQueueCategory('');
                setQueuePage(1);
              }}
            >
              Filter Clear
            </button>
          </div>

          {/* Queue Table */}
          <div className="admin-queue-table-heading">
            <h3>Queue News List</h3>

            <span>মোট {queuePagination.total ?? 0}টি সংবাদ</span>
          </div>

          {queueLoading ? (
            <p className="admin-message">Queue লোড হচ্ছে...</p>
          ) : queueItems.length === 0 ? (
            <div className="admin-message">
              <p>এই Filter-এ কোনো Queue Item পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-queue-table">
                <thead>
                  <tr>
                    <th>মূল শিরোনাম</th>
                    <th>উৎস</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>তারিখ</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>

                <tbody>
                  {queueItems.map((item) => (
                    <tr key={item._id}>
                      <td className="queue-title-cell">
                        <strong>{item.title}</strong>

                        {item.lastError && (
                          <details className="queue-error-details">
                            <summary>শেষ Error দেখুন</summary>
                            <p>{item.lastError}</p>
                          </details>
                        )}

                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="queue-source-link"
                          >
                            মূল সংবাদ ↗
                          </a>
                        )}
                      </td>

                      <td>{item.source || '—'}</td>

                      <td>{item.category || '—'}</td>

                      <td>
                        <span
                          className={`queue-status-badge queue-status-${item.status}`}
                        >
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                      </td>

                      <td>{item.attempts ?? 0}</td>

                      <td>{formatDate(item.createdAt)}</td>

                      <td>
                        <div className="admin-row-actions queue-actions">
                          {item.status === 'failed' && (
                            <button
                              type="button"
                              className="queue-retry-button"
                              onClick={() =>
                                handleRetryQueue(item._id, item.title)
                              }
                              disabled={queueActionId === item._id}
                            >
                              {queueActionId === item._id
                                ? 'Working...'
                                : 'Retry'}
                            </button>
                          )}

                          {item.status !== 'processing' && (
                            <button
                              type="button"
                              className="admin-delete-button"
                              onClick={() =>
                                handleDeleteQueue(item._id, item.title)
                              }
                              disabled={queueActionId === item._id}
                            >
                              {queueActionId === item._id
                                ? 'Working...'
                                : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!queueLoading && queuePagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                onClick={() => setQueuePage((page) => Math.max(1, page - 1))}
                disabled={queuePage <= 1}
              >
                ← Previous
              </button>

              <span>
                Page {queuePage} of {queuePagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQueuePage((page) =>
                    Math.min(queuePagination.totalPages, page + 1)
                  )
                }
                disabled={queuePage >= queuePagination.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminDashboard;
