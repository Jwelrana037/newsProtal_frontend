import { useEffect, useState } from 'react';
import { adminRequest } from '../services/adminApi';

const INITIAL_FORM = {
  title: '',
  targetUrl: '',
  type: 'image',
  position: 'homepage-top',
  image: null,
  video: null,
  isActive: true,
  startAt: '',
  endAt: '',
  headline: '',
  description: '',
  price: '',
  offer: '',
  contact: '',
  backgroundColor: '#ffffff',
  textColor: '#111111',
  animation: 'fade',
  durationSeconds: 10,
};

const POSITIONS = [
  ['header', 'হেডার (Header)'],
  ['breaking-news', 'ব্রেকিং নিউজের নিচে'],
  ['homepage-top', 'হোমপেজের উপরে'],
  ['homepage-middle', 'হোমপেজের মাঝখানে'],
  ['homepage-bottom', 'হোমপেজের নিচে'],
  ['in-article', 'সংবাদের ভিতরে'],
  ['article-bottom', 'সংবাদের শেষে'],
  ['sidebar', 'সাইডবার (Sidebar)'],
  ['footer', 'ফুটার (Footer)'],
  ['popup', 'পপআপ (Popup)'],
  ['navbar', 'নেভিগেশন বার (Navbar)'],
];

const AD_TYPES = [
  ['image', 'ছবির বিজ্ঞাপন'],
  ['video', 'ভিডিও বিজ্ঞাপন'],
  ['animated', 'Animated বিজ্ঞাপন'],
];

const ANIMATIONS = [
  ['none', 'কোনো অ্যানিমেশন নেই'],
  ['fade', 'Fade'],
  ['slide', 'Slide'],
  ['zoom', 'Zoom'],
];

const styles = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: 16,
    color: '#1f2937',
  },
  form: {
    display: 'grid',
    gap: 18,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    background: '#ffffff',
  },
  field: {
    display: 'grid',
    gap: 7,
  },
  label: {
    fontWeight: 600,
  },
  input: {
    boxSizing: 'border-box',
    display: 'block',
    width: '100%',
    padding: 11,
    border: '1px solid #d1d5db',
    borderRadius: 7,
    fontSize: 15,
  },
  section: {
    display: 'grid',
    gap: 14,
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 16,
  },
  buttonRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  button: {
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: 7,
    cursor: 'pointer',
    fontWeight: 600,
  },
  adCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    background: '#ffffff',
  },
};

function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
    /\/+$/,
    ''
  );
}

function getMediaUrl(media) {
  if (!media) return '';

  if (/^(https?:)?\/\//i.test(media)) {
    return media;
  }

  const baseUrl = getApiBaseUrl().replace(/\/api\/?$/, '');

  return `${baseUrl}${media.startsWith('/') ? '' : '/'}${media}`;
}

function AdvertisementManager() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    loadAdvertisements();

    return () => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAdvertisements() {
    setLoading(true);
    setError('');

    try {
      const data = await adminRequest('/advertisements');

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.advertisements)
          ? data.advertisements
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setAdvertisements(list);
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপনের তালিকা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }

  function clearPreview() {
    setPreview((previous) => {
      if (previous.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }

      return '';
    });
  }

  function handleChange(event) {
    const { name, value, checked, type, files } = event.target;

    if (name === 'image' || name === 'video') {
      const file = files?.[0] || null;

      setForm((previous) => ({
        ...previous,
        [name]: file,
        ...(name === 'image' ? { video: null } : { image: null }),
      }));

      clearPreview();

      if (file) {
        setPreview(URL.createObjectURL(file));
      }

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM });
    setEditingId(null);
    clearPreview();

    const imageInput = document.getElementById('ad-image');
    const videoInput = document.getElementById('ad-video');

    if (imageInput) imageInput.value = '';
    if (videoInput) videoInput.value = '';

    setError('');
    setSuccess('');
  }

  function beginEdit(ad) {
    clearPreview();

    setEditingId(ad._id);

    setForm({
      ...INITIAL_FORM,
      title: ad.title || '',
      targetUrl: ad.targetUrl || '',
      type: ad.type || 'image',
      position: ad.position || 'navbar',
      isActive: Boolean(ad.isActive),
      startAt: toDateTimeLocal(ad.startAt),
      endAt: toDateTimeLocal(ad.endAt),
      headline: ad.headline || '',
      description: ad.description || '',
      price: ad.price || '',
      offer: ad.offer || '',
      contact: ad.contact || '',
      backgroundColor: ad.backgroundColor || '#ffffff',
      textColor: ad.textColor || '#111111',
      animation: ad.animation || 'fade',
      durationSeconds: ad.durationSeconds || 10,
      image: null,
      video: null,
    });

    const existingMedia = ad.type === 'video' ? ad.video : ad.image;

    setPreview(existingMedia || '');

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!form.title.trim() || !form.targetUrl.trim()) {
      setError('বিজ্ঞাপনের নাম ও লিংক দিতে হবে।');
      return;
    }

    if (!['image', 'video', 'animated'].includes(form.type)) {
      setError('বিজ্ঞাপনের ধরন সঠিক নয়।');
      return;
    }

    if (!POSITIONS.some(([value]) => value === form.position)) {
      setError('বিজ্ঞাপনের অবস্থান নির্বাচন করো।');
      return;
    }

    if (form.type === 'image' && !form.image && !(editingId && preview)) {
      setError('বিজ্ঞাপনের ছবি নির্বাচন করো।');
      return;
    }

    if (form.type === 'video' && !form.video && !(editingId && preview)) {
      setError('বিজ্ঞাপনের ভিডিও নির্বাচন করো।');
      return;
    }

    if (
      form.startAt &&
      form.endAt &&
      new Date(form.startAt) > new Date(form.endAt)
    ) {
      setError('শুরুর সময় শেষের সময়ের পরে হতে পারবে না।');
      return;
    }

    const duration = Number(form.durationSeconds);

    if (
      form.type === 'animated' &&
      (!Number.isFinite(duration) || duration < 3 || duration > 60)
    ) {
      setError('অ্যানিমেশনের সময় ৩ থেকে ৬০ সেকেন্ডের মধ্যে হতে হবে।');
      return;
    }

    const body = new FormData();

    body.append('title', form.title.trim());
    body.append('targetUrl', form.targetUrl.trim());
    body.append('type', form.type);
    body.append('position', form.position);
    body.append('isActive', String(form.isActive));

    body.append(
      'startAt',
      form.startAt ? new Date(form.startAt).toISOString() : ''
    );

    body.append('endAt', form.endAt ? new Date(form.endAt).toISOString() : '');

    body.append('headline', form.headline.trim());
    body.append('description', form.description.trim());
    body.append('price', form.price.trim());
    body.append('offer', form.offer.trim());
    body.append('contact', form.contact.trim());
    body.append('backgroundColor', form.backgroundColor);
    body.append('textColor', form.textColor);
    body.append('animation', form.animation);
    body.append('durationSeconds', String(duration || 10));

    if (form.type === 'image' && form.image) {
      body.append('image', form.image);
    }

    if (form.type === 'video' && form.video) {
      body.append('video', form.video);
    }

    setSaving(true);

    try {
      if (editingId) {
        const options = {
          method: 'PUT',
          body,
        };

        if (form.type === 'video') {
          options.headers = {
            'x-ad-upload-type': 'video',
          };
        }

        await adminRequest(`/advertisements/${editingId}`, options);

        setSuccess('বিজ্ঞাপন সফলভাবে আপডেট হয়েছে।');
      } else {
        const endpoint =
          form.type === 'video' ? '/advertisements/video' : '/advertisements';

        await adminRequest(endpoint, {
          method: 'POST',
          body,
        });

        setSuccess('বিজ্ঞাপন সফলভাবে যোগ হয়েছে।');
      }

      resetForm();
      await loadAdvertisements();
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপন সংরক্ষণ করা যায়নি।');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(ad) {
    setError('');
    setSuccess('');

    try {
      await adminRequest(`/advertisements/${ad._id}/toggle`, {
        method: 'PATCH',
      });

      setSuccess('বিজ্ঞাপনের স্ট্যাটাস আপডেট হয়েছে।');

      await loadAdvertisements();
    } catch (err) {
      setError(err.message || 'স্ট্যাটাস পরিবর্তন করা যায়নি।');
    }
  }

  async function handleDelete(ad) {
    const confirmed = window.confirm(
      `“${ad.title}” বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলতে চাও?`
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await adminRequest(`/advertisements/${ad._id}`, {
        method: 'DELETE',
      });

      if (editingId === ad._id) {
        resetForm();
      }

      setSuccess('বিজ্ঞাপন মুছে ফেলা হয়েছে.');

      await loadAdvertisements();
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপন মুছে ফেলা যায়নি।');
    }
  }

  function renderMediaPreview(ad) {
    const media = ad.type === 'video' ? ad.video : ad.image;

    if (!media) return null;

    const src = getMediaUrl(media);

    if (ad.type === 'video') {
      return (
        <video
          src={src}
          controls
          muted
          style={{
            display: 'block',
            width: '100%',
            maxWidth: 420,
            maxHeight: 240,
            marginTop: 10,
          }}
        />
      );
    }

    return (
      <img
        src={src}
        alt={ad.title || 'বিজ্ঞাপনের ছবি'}
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: 180,
          objectFit: 'contain',
          marginTop: 10,
        }}
      />
    );
  }

  return (
    <section style={styles.page}>
      <header style={{ marginBottom: 20 }}>
        <h1>বিজ্ঞাপন পরিচালনা</h1>
        <p>ছবি, ভিডিও ও Animated বিজ্ঞাপন তৈরি, সম্পাদনা এবং পরিচালনা করো।</p>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            padding: 12,
            marginBottom: 16,
            color: '#991b1b',
            background: '#fee2e2',
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          style={{
            padding: 12,
            marginBottom: 16,
            color: '#166534',
            background: '#dcfce7',
            borderRadius: 8,
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>{editingId ? 'বিজ্ঞাপন সম্পাদনা' : 'নতুন বিজ্ঞাপন'}</h2>

        <div style={styles.field}>
          <label htmlFor="ad-title" style={styles.label}>
            বিজ্ঞাপনের নাম
          </label>

          <input
            id="ad-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="ad-target" style={styles.label}>
            বিজ্ঞাপনের URL
          </label>

          <input
            id="ad-target"
            name="targetUrl"
            type="url"
            value={form.targetUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="ad-type" style={styles.label}>
            বিজ্ঞাপনের ধরন
          </label>

          <select
            id="ad-type"
            name="type"
            value={form.type}
            onChange={(event) => {
              clearPreview();

              setForm((previous) => ({
                ...previous,
                type: event.target.value,
                image: null,
                video: null,
              }));
            }}
            style={styles.input}
          >
            {AD_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label htmlFor="ad-position" style={styles.label}>
            বিজ্ঞাপনের অবস্থান
          </label>

          <select
            id="ad-position"
            name="position"
            value={form.position}
            onChange={handleChange}
            style={styles.input}
          >
            {POSITIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <small>
            বিজ্ঞাপনটি ওয়েবসাইটের কোন অংশে দেখাতে চাও, এখানে সেটি নির্বাচন করো।
          </small>
        </div>

        {form.type === 'image' && (
          <div style={styles.field}>
            <label htmlFor="ad-image" style={styles.label}>
              বিজ্ঞাপনের ছবি
            </label>

            <input
              id="ad-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleChange}
              required={!editingId}
            />

            <small>JPG, PNG, WebP অথবা GIF ছবি নির্বাচন করো।</small>
          </div>
        )}

        {form.type === 'video' && (
          <div style={styles.field}>
            <label htmlFor="ad-video" style={styles.label}>
              বিজ্ঞাপনের ভিডিও
            </label>

            <input
              id="ad-video"
              name="video"
              type="file"
              accept="video/mp4,video/webm,.mp4,.webm"
              onChange={handleChange}
              required={!editingId}
            />

            <small>MP4 অথবা WebM ভিডিও নির্বাচন করো।</small>
          </div>
        )}

        {form.type === 'animated' && (
          <div style={styles.section}>
            <h3>Animated বিজ্ঞাপনের ডিজাইন</h3>

            <div style={styles.field}>
              <label htmlFor="ad-headline" style={styles.label}>
                শিরোনাম (Headline)
              </label>

              <input
                id="ad-headline"
                name="headline"
                value={form.headline}
                onChange={handleChange}
                maxLength={200}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-description" style={styles.label}>
                বিবরণ (Description)
              </label>

              <textarea
                id="ad-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-price" style={styles.label}>
                মূল্য (Price)
              </label>

              <input
                id="ad-price"
                name="price"
                value={form.price}
                onChange={handleChange}
                maxLength={100}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-offer" style={styles.label}>
                অফার (Offer)
              </label>

              <input
                id="ad-offer"
                name="offer"
                value={form.offer}
                onChange={handleChange}
                maxLength={200}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-contact" style={styles.label}>
                যোগাযোগ (Contact)
              </label>

              <input
                id="ad-contact"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                maxLength={200}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-bg" style={styles.label}>
                ব্যাকগ্রাউন্ডের রং
              </label>

              <input
                id="ad-bg"
                name="backgroundColor"
                type="color"
                value={form.backgroundColor}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-text-color" style={styles.label}>
                লেখার রং
              </label>

              <input
                id="ad-text-color"
                name="textColor"
                type="color"
                value={form.textColor}
                onChange={handleChange}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-animation" style={styles.label}>
                অ্যানিমেশন
              </label>

              <select
                id="ad-animation"
                name="animation"
                value={form.animation}
                onChange={handleChange}
                style={styles.input}
              >
                {ANIMATIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label htmlFor="ad-duration" style={styles.label}>
                অ্যানিমেশনের সময় (সেকেন্ড)
              </label>

              <input
                id="ad-duration"
                name="durationSeconds"
                type="number"
                min="3"
                max="60"
                value={form.durationSeconds}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 8,
                background: form.backgroundColor,
                color: form.textColor,
                textAlign: 'center',
                overflowWrap: 'anywhere',
              }}
            >
              <strong>{form.headline || 'বিজ্ঞাপনের শিরোনাম'}</strong>

              <p>{form.description || 'বিজ্ঞাপনের বিবরণ এখানে দেখা যাবে'}</p>

              {form.price && <p>মূল্য: {form.price}</p>}
              {form.offer && <p>{form.offer}</p>}
              {form.contact && <p>যোগাযোগ: {form.contact}</p>}

              <small>Animation: {form.animation}</small>
            </div>
          </div>
        )}

        {preview && (
          <div style={styles.field}>
            <strong>মিডিয়া প্রিভিউ</strong>

            {form.type === 'video' ? (
              <video
                src={
                  preview.startsWith('blob:') ? preview : getMediaUrl(preview)
                }
                controls
                muted
                style={{
                  width: '100%',
                  maxWidth: 500,
                  maxHeight: 280,
                }}
              />
            ) : (
              <img
                src={
                  preview.startsWith('blob:') ? preview : getMediaUrl(preview)
                }
                alt="বিজ্ঞাপনের প্রিভিউ"
                style={{
                  maxWidth: '100%',
                  maxHeight: 220,
                  objectFit: 'contain',
                }}
              />
            )}
          </div>
        )}

        <div style={styles.field}>
          <label htmlFor="ad-start" style={styles.label}>
            বিজ্ঞাপন শুরুর সময়
          </label>

          <input
            id="ad-start"
            name="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="ad-end" style={styles.label}>
            বিজ্ঞাপন শেষের সময়
          </label>

          <input
            id="ad-end"
            name="endAt"
            type="datetime-local"
            value={form.endAt}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <label>
          <input
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
          />{' '}
          বিজ্ঞাপন সক্রিয় রাখো
        </label>

        <div style={styles.buttonRow}>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.button,
              background: '#166534',
              color: '#ffffff',
              borderColor: '#166534',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? 'সংরক্ষণ হচ্ছে...'
              : editingId
                ? 'পরিবর্তন সংরক্ষণ'
                : 'বিজ্ঞাপন যোগ করো'}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} style={styles.button}>
              বাতিল
            </button>
          )}
        </div>
      </form>

      <hr style={{ margin: '32px 0' }} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h2>বিজ্ঞাপনের তালিকা</h2>

        <button
          type="button"
          onClick={loadAdvertisements}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'লোড হচ্ছে...' : 'তালিকা রিফ্রেশ'}
        </button>
      </div>

      {loading ? (
        <p>বিজ্ঞাপনের তালিকা লোড হচ্ছে...</p>
      ) : advertisements.length === 0 ? (
        <p>এখনো কোনো বিজ্ঞাপন যোগ করা হয়নি।</p>
      ) : (
        advertisements.map((ad) => (
          <article key={ad._id} style={styles.adCard}>
            <h3>{ad.title}</h3>

            <p>
              <strong>ধরন:</strong> {ad.type || 'image'}
            </p>

            <p>
              <strong>অবস্থান:</strong>{' '}
              {POSITIONS.find(([value]) => value === ad.position)?.[1] ||
                ad.position ||
                'navbar'}
            </p>

            <p>
              <strong>স্ট্যাটাস:</strong>{' '}
              {ad.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </p>

            {ad.startAt && (
              <p>
                <strong>শুরু:</strong> {new Date(ad.startAt).toLocaleString()}
              </p>
            )}

            {ad.endAt && (
              <p>
                <strong>শেষ:</strong> {new Date(ad.endAt).toLocaleString()}
              </p>
            )}

            {renderMediaPreview(ad)}

            {ad.type === 'animated' && (
              <div
                style={{
                  marginTop: 12,
                  padding: 16,
                  background: ad.backgroundColor || '#ffffff',
                  color: ad.textColor || '#111111',
                  borderRadius: 8,
                  overflowWrap: 'anywhere',
                }}
              >
                <strong>{ad.headline}</strong>
                <p>{ad.description}</p>

                {ad.price && <p>মূল্য: {ad.price}</p>}
                {ad.offer && <p>{ad.offer}</p>}
                {ad.contact && <p>যোগাযোগ: {ad.contact}</p>}
              </div>
            )}

            {ad.targetUrl && (
              <p>
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  বিজ্ঞাপনের লিংক দেখো
                </a>
              </p>
            )}

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={() => beginEdit(ad)}
                style={styles.button}
              >
                সম্পাদনা
              </button>

              <button
                type="button"
                onClick={() => handleToggle(ad)}
                style={{
                  ...styles.button,
                  background: ad.isActive ? '#fef3c7' : '#dcfce7',
                }}
              >
                {ad.isActive ? 'নিষ্ক্রিয় করো' : 'সক্রিয় করো'}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(ad)}
                style={{
                  ...styles.button,
                  color: '#b91c1c',
                }}
              >
                মুছে ফেলো
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}

export default AdvertisementManager;
