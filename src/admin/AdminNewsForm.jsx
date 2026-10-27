import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { adminRequest } from '../services/adminApi';
import { uploadNewsImage } from '../services/adminApi';

import { getImageUrl} from '../utils/imageUrl';
import './AdminNewsForm.css';

// ========================================
// Initial Form Data
// ========================================

const initialForm = {
  title: '',
  titleEn: '',

  description: '',
  descriptionEn: '',

  content: '',
  contentEn: '',

  category: 'জাতীয়',
  categoryEn: 'National',

  division: '',
  district: '',
  upazila: '',

  image: '',

  author: 'NewsToday Desk',

  status: 'draft',

  isFeatured: false,
};

// ========================================
// News Categories
// ========================================

const categories = [
  { bn: 'জাতীয়', en: 'National' },
  { bn: 'রাজনীতি', en: 'Politics' },
  { bn: 'আন্তর্জাতিক', en: 'International' },
  { bn: 'খেলাধুলা', en: 'Sports' },
  { bn: 'প্রযুক্তি', en: 'Technology' },
  { bn: 'বিনোদন', en: 'Entertainment' },
  { bn: 'অর্থনীতি', en: 'Economy' },
  { bn: 'শিক্ষা', en: 'Education' },
  { bn: 'অপরাধ', en: 'Crime' },
  { bn: 'স্বাস্থ্য', en: 'Health' },
  { bn: 'চাকরি', en: 'Jobs' },
  { bn: 'ধর্ম', en: 'Religion' },
  { bn: 'পরিবেশ', en: 'Environment' },
];

// ========================================
// Bangladesh Divisions
// ========================================

const divisions = [
  'ঢাকা',
  'চট্টগ্রাম',
  'রাজশাহী',
  'খুলনা',
  'বরিশাল',
  'সিলেট',
  'রংপুর',
  'ময়মনসিংহ',
];

// ========================================
// Admin News Form Component
// ========================================

function AdminNewsForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState({ ...initialForm });

  const [loading, setLoading] = useState(false);

  const [fetchingNews, setFetchingNews] = useState(isEditMode);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  // ========================================
  // Load Existing News for Editing
  // ========================================

  useEffect(() => {
    if (!isEditMode) {
      setFetchingNews(false);
      return;
    }

    let isMounted = true;

    const fetchNews = async () => {
      try {
        setFetchingNews(true);
        setError('');

        const response = await adminRequest('/news/admin/all');

        const newsList = Array.isArray(response.data)
          ? response.data
          : response.data?.data;

        if (!Array.isArray(newsList)) {
          throw new Error('সংবাদের তালিকা পাওয়া যায়নি।');
        }

        const existingNews = newsList.find(
          (news) => String(news._id) === String(id)
        );

        if (!existingNews) {
          throw new Error('সম্পাদনার জন্য সংবাদটি পাওয়া যায়নি।');
        }

        if (isMounted) {
          setForm({
            ...initialForm,
            ...existingNews,

            title: existingNews.title || '',
            titleEn: existingNews.titleEn || '',

            description: existingNews.description || '',
            descriptionEn: existingNews.descriptionEn || '',

            content: existingNews.content || '',
            contentEn: existingNews.contentEn || '',

            category: existingNews.category || 'জাতীয়',
            categoryEn: existingNews.categoryEn || 'National',

            division: existingNews.division || '',
            district: existingNews.district || '',
            upazila: existingNews.upazila || '',

            image: existingNews.image || '',

            author: existingNews.author || 'NewsToday Desk',

            status: existingNews.status || 'draft',

            isFeatured: Boolean(existingNews.isFeatured),
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || 'সংবাদ লোড করা যায়নি।'
          );
        }
      } finally {
        if (isMounted) {
          setFetchingNews(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  // ========================================
  // Handle Input Changes
  // ========================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,

      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ========================================
  // Handle Category Change
  // ========================================

  const handleCategoryChange = (event) => {
    const selectedCategory = categories.find(
      (category) => category.bn === event.target.value
    );

    if (!selectedCategory) {
      return;
    }

    setForm((previousForm) => ({
      ...previousForm,

      category: selectedCategory.bn,
      categoryEn: selectedCategory.en,
    }));
  };

  // ========================================
  // Handle Image Upload
  // ========================================

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setSuccess('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // Validate image type

    if (!allowedTypes.includes(file.type)) {
      setError('শুধুমাত্র JPG, PNG, WEBP অথবা GIF ছবি আপলোড করতে পারবে।');

      event.target.value = '';

      return;
    }

    // Maximum image size: 5 MB

    if (file.size > 5 * 1024 * 1024) {
      setError('ছবির সাইজ সর্বোচ্চ ৫ MB হতে পারবে।');

      event.target.value = '';

      return;
    }

    try {
      setUploadingImage(true);

      const response = await uploadNewsImage(file);

      const imagePath =
        response?.data?.image ||
        response?.data?.imageUrl ||
        response?.image ||
        response?.imageUrl;

      if (!imagePath) {
        throw new Error('ছবি আপলোড হয়েছে, কিন্তু ছবির URL পাওয়া যায়নি।');
      }

      setForm((previousForm) => ({
        ...previousForm,
        image: imagePath,
      }));

      setSuccess('ছবি সফলভাবে আপলোড হয়েছে।');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'ছবি আপলোড করা যায়নি।'
      );
    } finally {
      setUploadingImage(false);

      // একই ফাইল আবার নির্বাচন করার সুযোগ

      event.target.value = '';
    }
  };

  // ========================================
  // Validate Form
  // ========================================

  const validateForm = () => {
    if (!form.title.trim()) {
      return 'বাংলা শিরোনাম লিখুন।';
    }

    if (!form.description.trim()) {
      return 'বাংলা সংক্ষিপ্ত বিবরণ লিখুন।';
    }

    if (!form.content.trim()) {
      return 'বাংলা সংবাদ বিস্তারিত লিখুন।';
    }

    if (!form.category) {
      return 'সংবাদের ক্যাটাগরি নির্বাচন করুন।';
    }

    if (form.status !== 'draft' && form.status !== 'published') {
      return 'সঠিক প্রকাশনার স্ট্যাটাস নির্বাচন করুন।';
    }

    return '';
  };

  // ========================================
  // Handle Form Submit
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (uploadingImage) {
      setError('ছবি আপলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন।');
      return;
    }

    const payload = {
      title: form.title.trim(),
      titleEn: form.titleEn.trim(),

      description: form.description.trim(),
      descriptionEn: form.descriptionEn.trim(),

      content: form.content.trim(),
      contentEn: form.contentEn.trim(),

      category: form.category,
      categoryEn: form.categoryEn,

      division: form.division,
      district: form.district.trim(),
      upazila: form.upazila.trim(),

      image: form.image.trim(),

      author: form.author.trim() || 'NewsToday Desk',

      status: form.status,

      isFeatured: Boolean(form.isFeatured),
    };

    try {
      setLoading(true);

      if (isEditMode) {
        await adminRequest(`/news/${id}`, {
          method: 'PUT',
          data: payload,
        });

        setSuccess('সংবাদ সফলভাবে আপডেট হয়েছে।');
      } else {
        await adminRequest('/news', {
          method: 'POST',
          data: payload,
        });

        setSuccess('সংবাদ সফলভাবে তৈরি হয়েছে।');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Loading State
  // ========================================

  if (fetchingNews) {
    return (
      <main className="admin-news-form-page">
        <div className="admin-form-message">সংবাদ লোড হচ্ছে...</div>
      </main>
    );
  }

  // ========================================
  // Main JSX
  // ========================================

  return (
    <main className="admin-news-form-page">
      <div className="admin-news-form-container">
        {/* Header */}

        <header className="admin-form-header">
          <div>
            <h1>{isEditMode ? 'সংবাদ সম্পাদনা' : 'নতুন সংবাদ তৈরি'}</h1>

            <p>NewsToday-এর জন্য সংবাদ তৈরি, সম্পাদনা ও প্রকাশ করুন।</p>
          </div>

          <Link to="/admin/dashboard" className="admin-form-back-button">
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </header>

        {/* Error Message */}

        {error && (
          <div className="admin-form-alert error" role="alert">
            {error}
          </div>
        )}

        {/* Success Message */}

        {success && (
          <div className="admin-form-alert success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ================================== */}
          {/* Bangla News */}
          {/* ================================== */}

          <section className="admin-form-section">
            <h2>বাংলা সংবাদ</h2>

            <div className="admin-field">
              <label htmlFor="title">
                শিরোনাম <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="সংবাদের শিরোনাম লিখুন"
                maxLength={200}
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="description">
                সংক্ষিপ্ত বিবরণ <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="সংবাদের সংক্ষিপ্ত বিবরণ লিখুন"
                rows={4}
                maxLength={2000}
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="content">
                বিস্তারিত সংবাদ <span>*</span>
              </label>

              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="সম্পূর্ণ সংবাদ লিখুন"
                rows={10}
                required
              />
            </div>
          </section>

          {/* ================================== */}
          {/* English News */}
          {/* ================================== */}

          <section className="admin-form-section">
            <h2>English News</h2>

            <div className="admin-field">
              <label htmlFor="titleEn">English Title</label>

              <input
                id="titleEn"
                name="titleEn"
                type="text"
                value={form.titleEn}
                onChange={handleChange}
                placeholder="Enter English title"
                maxLength={200}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="descriptionEn">Short Description</label>

              <textarea
                id="descriptionEn"
                name="descriptionEn"
                value={form.descriptionEn}
                onChange={handleChange}
                placeholder="Enter English description"
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="contentEn">Full News Content</label>

              <textarea
                id="contentEn"
                name="contentEn"
                value={form.contentEn}
                onChange={handleChange}
                placeholder="Enter full English news"
                rows={10}
              />
            </div>
          </section>

          {/* ================================== */}
          {/* Location */}
          {/* ================================== */}

          <section className="admin-form-section">
            <h2>সংবাদের অবস্থান</h2>

            <div className="admin-field">
              <label htmlFor="division">বিভাগ</label>

              <select
                id="division"
                name="division"
                value={form.division}
                onChange={handleChange}
              >
                <option value="">বিভাগ নির্বাচন করুন</option>

                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="district">জেলা</label>

              <input
                id="district"
                name="district"
                type="text"
                value={form.district}
                onChange={handleChange}
                placeholder="যেমন: কুমিল্লা"
                maxLength={100}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="upazila">উপজেলা</label>

              <input
                id="upazila"
                name="upazila"
                type="text"
                value={form.upazila}
                onChange={handleChange}
                placeholder="যেমন: দাউদকান্দি"
                maxLength={100}
              />
            </div>
          </section>

          {/* ================================== */}
          {/* Image Upload */}
          {/* ================================== */}

          <section className="admin-form-section">
            <h2>সংবাদের ছবি</h2>

            <div className="admin-field">
              <label htmlFor="imageUpload">কম্পিউটার থেকে ছবি আপলোড</label>

              <input
                id="imageUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage || loading}
              />

              <small>JPG, PNG, WEBP অথবা GIF। সর্বোচ্চ ৫ MB।</small>
            </div>

            <div className="admin-field">
              <label htmlFor="image">অথবা ছবির URL লিখুন</label>

              <input
                id="image"
                name="image"
                type="text"
                value={form.image}
                onChange={handleChange}
                placeholder="/uploads/news/image.jpg অথবা https://..."
              />
            </div>

            {form.image && (
              <div className="admin-image-preview">
                <p>ছবির প্রিভিউ</p>

                <img
                  src={getImageUrl(form.image)}
                  alt="সংবাদের প্রিভিউ"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {uploadingImage && (
              <p className="admin-form-uploading">ছবি আপলোড হচ্ছে...</p>
            )}
          </section>

          {/* ================================== */}
          {/* Category and Publishing Settings */}
          {/* ================================== */}

          <section className="admin-form-section">
            <h2>প্রকাশনা সেটিংস</h2>

            <div className="admin-field">
              <label htmlFor="category">
                ক্যাটাগরি <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                required
              >
                {categories.map((category) => (
                  <option key={category.bn} value={category.bn}>
                    {category.bn} / {category.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="author">সংবাদের লেখক</label>

              <input
                id="author"
                name="author"
                type="text"
                value={form.author}
                onChange={handleChange}
                placeholder="NewsToday Desk"
                maxLength={100}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="status">প্রকাশনার স্ট্যাটাস</label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="draft">Draft — খসড়া</option>

                <option value="published">Published — প্রকাশিত</option>
              </select>
            </div>

            <label className="admin-featured-checkbox">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
              />

              <span>Featured News হিসেবে দেখাও</span>
            </label>
          </section>

          {/* ================================== */}
          {/* Form Actions */}
          {/* ================================== */}

          <div className="admin-form-actions">
            <Link to="/admin/dashboard" className="admin-form-cancel-button">
              বাতিল
            </Link>

            <button
              type="submit"
              className="admin-form-submit-button"
              disabled={loading || uploadingImage}
            >
              {loading
                ? 'সংরক্ষণ হচ্ছে...'
                : isEditMode
                  ? 'সংবাদ আপডেট করুন'
                  : 'সংবাদ সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminNewsForm;
