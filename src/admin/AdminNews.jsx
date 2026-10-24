import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import newsData from '../data/newsData';
import './AdminNews.css';

function AdminNews() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const categories = [
    'জাতীয়',
    'রাজনীতি',
    'আন্তর্জাতিক',
    'খেলাধুলা',
    'প্রযুক্তি',
    'বিনোদন',
  ];

  const filteredNews = useMemo(() => {
    return newsData.filter((news) => {
      const matchesSearch = news.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = category === 'all' || news.category === category;

      // Sample newsData has no real publishing status yet.
      // Use "all" until backend-backed statuses are implemented.
      const matchesStatus = status === 'all';

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  return (
    <div className="admin-news-page">
      <div className="admin-news-heading">
        <div>
          <h2>All News</h2>
          <p>আপনার সব সংবাদ পরিচালনা করুন।</p>
        </div>

        <Link to="/admin/news/new" className="admin-news-create">
          + Create News
        </Link>
      </div>

      <section className="admin-news-panel">
        <div className="admin-news-filters">
          <input
            type="search"
            placeholder="সংবাদের শিরোনাম খুঁজুন..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search news"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">সব ক্যাটাগরি</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">সব Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
          </select>
        </div>

        <div className="admin-news-table-wrapper">
          <table className="admin-news-table">
            <thead>
              <tr>
                <th>সংবাদের শিরোনাম</th>
                <th>ক্যাটাগরি</th>
                <th>তারিখ</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredNews.map((news) => (
                <tr key={news.id}>
                  <td>
                    <div className="admin-news-title">{news.title}</div>
                  </td>

                  <td>{news.category}</td>

                  <td>{news.date}</td>

                  <td>
                    <span className="admin-news-status">Sample Data</span>
                  </td>

                  <td>
                    <Link
                      to={`/admin/news/new?edit=${news.id}`}
                      className="admin-news-edit"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredNews.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-news-empty">
                    কোনো সংবাদ পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-news-footer">
          মোট {filteredNews.length} টি নমুনা সংবাদ
        </div>
      </section>
    </div>
  );
}

export default AdminNews;
