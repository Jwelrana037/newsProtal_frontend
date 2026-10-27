import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminRequest } from '../services/adminApi';
import './AdminNews.css';

function AdminNews() {
const [newsList, setNewsList] = useState([]);
const [search, setSearch] = useState('');
const [category, setCategory] = useState('all');
const [status, setStatus] = useState('all');
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

const categories = [
'জাতীয়',
'রাজনীতি',
'আন্তর্জাতিক',
'খেলাধুলা',
'প্রযুক্তি',
'বিনোদন',
'অর্থনীতি',
'শিক্ষা',
'অপরাধ',
'স্বাস্থ্য',
'চাকরি',
'ধর্ম',
'পরিবেশ',
];

// Backend থেকে সব সংবাদ লোড করা
const fetchNews = useCallback(async () => {
try {
setLoading(true);
setError('');


  const result = await adminRequest('/news/admin/all');

  // Backend response যদি { data: [...] } হয়
  const news = Array.isArray(result)
    ? result
    : Array.isArray(result.data)
      ? result.data
      : [];

  setNewsList(news);
} catch (err) {
  setError(err.message || 'সংবাদ লোড করা যায়নি।');
} finally {
  setLoading(false);
}


}, []);

useEffect(() => {
fetchNews();
}, [fetchNews]);

// Search, Category এবং Status অনুযায়ী সংবাদ Filter
const filteredNews = useMemo(() => {
return newsList.filter((news) => {
const title = news.title || news.titleEn || '';


  const matchesSearch = title
    .toLowerCase()
    .includes(search.trim().toLowerCase());

  const matchesCategory =
    category === 'all' ||
    news.category === category ||
    news.categoryEn === category;

  const newsStatus = String(news.status || 'draft').toLowerCase();

  const matchesStatus =
    status === 'all' ||
    newsStatus === status ||
    (status === 'review' && newsStatus === 'in review');

  return matchesSearch && matchesCategory && matchesStatus;
});


}, [newsList, search, category, status]);

// সংবাদ Delete করা
const handleDelete = async (id) => {
const confirmed = window.confirm(
'আপনি কি নিশ্চিত যে এই সংবাদটি Delete করতে চান?'
);


if (!confirmed) return;

try {
  await adminRequest(`/news/${id}`, {
    method: 'DELETE',
  });

  setNewsList((previousNews) =>
    previousNews.filter((news) => news._id !== id)
  );

  window.alert('সংবাদ সফলভাবে Delete হয়েছে।');
} catch (err) {
  window.alert(err.message || 'সংবাদ Delete করা যায়নি।');
}


};

// তারিখ Format করা
const formatDate = (date) => {
if (!date) return '—';


const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) {
  return date;
}

return parsedDate.toLocaleDateString('bn-BD', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});


};

return ( <div className="admin-news-page"> <div className="admin-news-heading"> <div> <h2>All News</h2> <p>আপনার সব সংবাদ পরিচালনা করুন।</p> </div>


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

    {loading && (
      <p className="admin-news-message">সংবাদ লোড হচ্ছে...</p>
    )}

    {!loading && error && (
      <div className="admin-news-message admin-news-error">
        <p>{error}</p>

        <button type="button" onClick={fetchNews}>
          আবার চেষ্টা করুন
        </button>
      </div>
    )}

    {!loading && !error && (
      <>
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
                <tr key={news._id}>
                  <td>
                    <div className="admin-news-title">
                      {news.title || news.titleEn || 'শিরোনাম নেই'}
                    </div>
                  </td>

                  <td>{news.category || news.categoryEn || '—'}</td>

                  <td>
                    {formatDate(news.createdAt || news.date)}
                  </td>

                  <td>
                    <span
                      className={`admin-news-status status-${String(
                        news.status || 'draft'
                      )
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {news.status || 'Draft'}
                    </span>
                  </td>

                  <td>
                    <div className="admin-news-actions">
                      <Link
                        to={`/admin/news/new?edit=${news._id}`}
                        className="admin-news-edit"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="admin-news-delete"
                        onClick={() => handleDelete(news._id)}
                      >
                        Delete
                      </button>
                    </div>
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
          মোট {filteredNews.length} টি সংবাদ
        </div>
      </>
    )}
  </section>
</div>


);
}

export default AdminNews;
