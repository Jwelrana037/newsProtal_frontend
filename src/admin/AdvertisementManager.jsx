import { useEffect, useState } from 'react';
import { adminRequest } from '../services/adminApi';

function AdvertisementManager() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    targetUrl: '',
    image: null,
    isActive: true,
    position: 'navbar',
  });

  const [preview, setPreview] = useState('');

  useEffect(() => {
    loadAdvertisements();
  }, []);

  async function loadAdvertisements() {
    setLoading(true);
    setError('');

    try {
      const data = await adminRequest('/advertisements');

      setAdvertisements(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.advertisements)
            ? data.advertisements
            : Array.isArray(data?.data)
              ? data.data
              : []
      );
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপনের তালিকা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked, files } = event.target;

    if (name === 'image') {
      const file = files?.[0] || null;

      setForm((previous) => ({ ...previous, image: file }));

      setPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return file ? URL.createObjectURL(file) : '';
      });

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.image) {
      setError('প্রথমে বিজ্ঞাপনের ছবি নির্বাচন করো।');
      return;
    }

    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('targetUrl', form.targetUrl.trim());
    body.append('image', form.image);
    body.append('isActive', String(form.isActive));
    body.append('position', form.position);

    try {
      await adminRequest('/advertisements', {
        method: 'POST',
        body,
      });

      setSuccess('বিজ্ঞাপন সফলভাবে যোগ হয়েছে।');
      setForm({
        title: '',
        targetUrl: '',
        image: null,
        isActive: true,
        position: 'navbar',
      });

      setPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return '';
      });

      event.target.reset();
      await loadAdvertisements();
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপন যোগ করা যায়নি।');
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
      'এই বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলতে চাও?'
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await adminRequest(`/advertisements/${ad._id}`, {
        method: 'DELETE',
      });

      setSuccess('বিজ্ঞাপন মুছে ফেলা হয়েছে।');
      await loadAdvertisements();
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপন মুছে ফেলা যায়নি।');
    }
  }

  return (
    <section>
      {' '}
      <h1>Advertisement Management</h1>{' '}
      <p>Navbar-এ দেখানোর জন্য বিজ্ঞাপন যোগ ও পরিচালনা করো।</p>
      {error && (
        <p role="alert" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}
      {success && (
        <p role="status" style={{ color: 'green' }}>
          {success}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="ad-title">বিজ্ঞাপনের নাম</label>
          <input
            id="ad-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            placeholder="যেমন: আমাদের স্পন্সর"
          />
        </div>

        <div>
          <label htmlFor="ad-target">বিজ্ঞাপনে ক্লিক করলে যে URL খুলবে</label>
          <input
            id="ad-target"
            name="targetUrl"
            type="url"
            value={form.targetUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="ad-image">বিজ্ঞাপনের ছবি</label>
          <input
            id="ad-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            required
          />
          <small>JPG, PNG, WebP বা GIF; সর্বোচ্চ ৫ MB।</small>
        </div>

        {preview && (
          <div>
            <p>ছবির প্রিভিউ:</p>
            <img
              src={preview}
              alt="বিজ্ঞাপনের প্রিভিউ"
              style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
            />
          </div>
        )}

        <div>
          <label>
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
            />
            বিজ্ঞাপন সক্রিয় রাখো
          </label>
        </div>

        <button type="submit">বিজ্ঞাপন যোগ করো</button>
      </form>
      <hr />
      <h2>বিজ্ঞাপনের তালিকা</h2>
      {loading ? (
        <p>বিজ্ঞাপনের তালিকা লোড হচ্ছে...</p>
      ) : advertisements.length === 0 ? (
        <p>এখনো কোনো বিজ্ঞাপন যোগ করা হয়নি।</p>
      ) : (
        <div>
          {advertisements.map((ad) => (
            <article
              key={ad._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <h3>{ad.title}</h3>
              <p>অবস্থান: {ad.position || 'navbar'}</p>
              <p>স্ট্যাটাস: {ad.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</p>
              <p>
                <a
                  href={ad.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  বিজ্ঞাপনের লিংক
                </a>
              </p>

              <button type="button" onClick={() => handleToggle(ad)}>
                {ad.isActive ? 'নিষ্ক্রিয় করো' : 'সক্রিয় করো'}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(ad)}
                style={{ marginLeft: 8 }}
              >
                মুছে ফেলো
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdvertisementManager;
