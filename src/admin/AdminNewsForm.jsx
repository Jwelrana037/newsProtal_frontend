import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { adminRequest } from '../services/adminApi';
import './AdminNewsForm.css';

import { uploadNewsImage } from '../services/adminApi';
import { getImageUrl } from '../utils/imageUrl';

const initialForm = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  content: '',
  contentEn: '',
  category: 'জাতীয়',
  categoryEn: 'National',
  image: '',
  author: 'NewsToday Desk',
  status: 'draft',
  isFeatured: false,
};

const categories = [
  { bn: 'জাতীয়', en: 'National' },
  { bn: 'রাজনীতি', en: 'Politics' },
  { bn: 'আন্তর্জাতিক', en: 'International' },
  { bn: 'খেলাধুলা', en: 'Sports' },
  { bn: 'প্রযুক্তি', en: 'Technology' },
  { bn: 'বিনোদন', en: 'Entertainment' },
];

function AdminNewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  // Edit করার সময় আগের সংবাদ লোড করা
  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;

    async function loadExistingNews() {
      try {
        setLoading(true);
        setError('');

        // Admin API ব্যবহার করায় Draft সংবাদও পাওয়া যাবে
        const result = await adminRequest('/news/admin/all');

        const allNews = Array.isArray(result.data) ? result.data : [];

        const existingNews = allNews.find((item) => item._id === id);

        if (!existingNews) {
          throw new Error('সংবাদটি পাওয়া যায়নি।');
        }

        if (!cancelled) {
          setForm({
            ...initialForm,
            ...existingNews,
            image: existingNews.image || '',
            isFeatured: Boolean(existingNews.isFeatured),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'সংবাদ লোড করা যায়নি।');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadExistingNews();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  // Input পরিবর্তন হলে State আপডেট
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    // Frontend-এর প্রাথমিক Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setError('শুধু JPEG, PNG, WEBP ও GIF ছবি নির্বাচন করুন।');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('ছবির সাইজ সর্বোচ্চ 5 MB হতে পারবে।');
      event.target.value = '';
      return;
    }

    try {
      setError('');
      setSuccess('');
      setUploadingImage(true);

      const result = await uploadNewsImage(file);

      // MongoDB-তে পরে এই Path সংরক্ষিত হবে
      setForm((previousForm) => ({
        ...previousForm,
        image: result.data.image,
      }));

      setSuccess('ছবি সফলভাবে Upload হয়েছে।');
    } catch (err) {
      setError(err.message || 'ছবি Upload করা যায়নি।');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  // Category পরিবর্তনের সঙ্গে English Category-ও আপডেট
  function handleCategoryChange(event) {
    const selectedCategory = categories.find(
      (item) => item.bn === event.target.value
    );

    if (!selectedCategory) return;

    setForm((previousForm) => ({
      ...previousForm,
      category: selectedCategory.bn,
      categoryEn: selectedCategory.en,
    }));
  }

  // নতুন সংবাদ তৈরি অথবা পুরোনো সংবাদ আপডেট
  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        titleEn: form.titleEn.trim(),
        description: form.description.trim(),
        descriptionEn: form.descriptionEn.trim(),
        content: form.content.trim(),
        contentEn: form.contentEn.trim(),
        category: form.category,
        categoryEn: form.categoryEn,
        image: form.image.trim(),
        author: form.author.trim() || 'NewsToday Desk',
        status: form.status,
        isFeatured: form.isFeatured,
      };

      const endpoint = isEditing ? `/news/${id}` : '/news';

      const method = isEditing ? 'PUT' : 'POST';

      await adminRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      setSuccess(
        isEditing
          ? 'সংবাদ সফলভাবে আপডেট হয়েছে।'
          : 'নতুন সংবাদ সফলভাবে তৈরি হয়েছে।'
      );

      // সফল হলে Dashboard-এ ফিরে যাওয়া
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'সংরক্ষণ করা যায়নি।');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-form-page">
        <p>সংবাদের তথ্য লোড হচ্ছে...</p>
      </main>
    );
  }

  return (
    <main className="admin-form-page">
      <div className="admin-form-container">
        <header className="admin-form-header">
          <div>
            <h1>{isEditing ? 'সংবাদ Edit করুন' : 'নতুন সংবাদ যোগ করুন'}</h1>
            <p>বাংলা ও ইংরেজি ভাষায় সংবাদটির তথ্য পূরণ করুন।</p>
          </div>

          <Link to="/admin/dashboard" className="admin-form-back">
            ← Dashboard
          </Link>
        </header>

        {error && (
          <div className="admin-form-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-form-success" role="status">
            {success}
          </div>
        )}

        <form className="admin-news-form" onSubmit={handleSubmit}>
          <section className="admin-form-section">
            <h2>১. বাংলা সংবাদ</h2>

            <div className="admin-field">
              <label htmlFor="title">সংবাদের শিরোনাম *</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="সংবাদের বাংলা শিরোনাম"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="description">সংক্ষিপ্ত বিবরণ *</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="সংবাদের সংক্ষিপ্ত বিবরণ লিখুন"
                rows="3"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="content">বিস্তারিত সংবাদ *</label>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="সংবাদের সম্পূর্ণ বিবরণ লিখুন"
                rows="8"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="imageUpload">সংবাদের ছবি Upload করুন</label>

              <input
                id="imageUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />

              <small>JPEG, PNG, WEBP অথবা GIF। সর্বোচ্চ 5 MB।</small>

              {uploadingImage && <p>ছবি Upload হচ্ছে...</p>}

              {form.image && (
                <div className="admin-image-preview">
                  <p>ছবির Preview</p>

                  <img
                    src={getImageUrl(form.image)}
                    alt="News preview"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="admin-form-section">
            <h2>২. English News</h2>

            <div className="admin-field">
              <label htmlFor="titleEn">English Title</label>
              <input
                id="titleEn"
                name="titleEn"
                value={form.titleEn}
                onChange={handleChange}
                placeholder="Enter English news title"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="descriptionEn">English Description</label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                value={form.descriptionEn}
                onChange={handleChange}
                placeholder="Enter a short description"
                rows="3"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="contentEn">English Content</label>
              <textarea
                id="contentEn"
                name="contentEn"
                value={form.contentEn}
                onChange={handleChange}
                placeholder="Enter full news content"
                rows="8"
              />
            </div>
          </section>

          <section className="admin-form-section">
            <h2>৩. সংবাদ সেটিংস</h2>

            <div className="admin-field">
              <label htmlFor="category">ক্যাটাগরি *</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                required
              >
                {categories.map((category) => (
                  <option key={category.bn} value={category.bn}>
                    {category.bn} — {category.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="image">ছবির URL</label>
              <input
                id="image"
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/news-image.jpg"
              />
              <small>
                আপাতত ছবির URL দিন। সরাসরি ছবি Upload করার ব্যবস্থা পরে যোগ করা
                যাবে।
              </small>
            </div>

            {form.image && (
              <div className="admin-image-preview">
                <p>ছবির Preview</p>
                <img
                  src={form.image}
                  alt="News preview"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="admin-field">
              <label htmlFor="author">লেখকের নাম</label>
              <input
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="NewsToday Desk"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="status">সংবাদের অবস্থা *</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="draft">Draft — খসড়া</option>
                <option value="published">Published — প্রকাশিত</option>
              </select>
            </div>

            <label className="admin-featured-option">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
              />
              <span>এই সংবাদটি Featured News হিসেবে দেখান</span>
            </label>
          </section>

          <div className="admin-form-actions">
            <Link to="/admin/dashboard" className="admin-form-cancel">
              বাতিল
            </Link>

            <button type="submit" disabled={saving}>
              {saving
                ? 'সংরক্ষণ হচ্ছে...'
                : isEditing
                  ? 'সংবাদ আপডেট করুন'
                  : 'সংবাদ প্রকাশ / সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminNewsForm;
