import { useCallback, useEffect, useRef, useState } from 'react';
import './AdvertisementManager.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');

/* ========================================
   Advertisement Size Presets
======================================== */

const SIZE_PRESETS = {
  auto: {
    label: 'Auto / Responsive',
    width: 728,
    height: 90,
  },

  leaderboard: {
    label: 'Leaderboard (728 × 90)',
    width: 728,
    height: 90,
  },

  'large-banner': {
    label: 'Large Banner (970 × 250)',
    width: 970,
    height: 250,
  },

  'medium-rectangle': {
    label: 'Medium Rectangle (300 × 250)',
    width: 300,
    height: 250,
  },

  square: {
    label: 'Square (300 × 300)',
    width: 300,
    height: 300,
  },

  'mobile-banner': {
    label: 'Mobile Banner (320 × 50)',
    width: 320,
    height: 50,
  },

  'large-mobile-banner': {
    label: 'Large Mobile Banner (320 × 100)',
    width: 320,
    height: 100,
  },

  custom: {
    label: 'Custom Size',
    width: 728,
    height: 90,
  },
};

/* ========================================
   Advertisement Placements
======================================== */

const PLACEMENTS = [
  { value: 'navbar', label: 'Navbar' },
  { value: 'header', label: 'Header' },
  { value: 'breaking-news', label: 'Breaking News' },
  { value: 'homepage-top', label: 'Homepage Top' },
  { value: 'homepage-middle', label: 'Homepage Middle' },
  { value: 'homepage-bottom', label: 'Homepage Bottom' },
  { value: 'in-article', label: 'Inside Article' },
  { value: 'article-bottom', label: 'Article Bottom' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'footer', label: 'Footer' },
  { value: 'popup', label: 'Popup' },
  { value: 'sticky-bottom', label: 'Sticky Bottom' },
];

/* ========================================
   Advertisement Animations
======================================== */

const ANIMATIONS = [
  { value: 'none', label: 'None' },
  { value: 'scroll-left', label: 'Scroll Left' },
  { value: 'scroll-right', label: 'Scroll Right' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'bounce', label: 'Bounce' },
];

/* ========================================
   Initial Form
======================================== */

const INITIAL_FORM = {
  title: '',
  targetUrl: '',

  adType: 'banner',
  placement: 'homepage-top',

  image: null,
  video: null,
  youtubeUrl: '',

  headline: '',
  description: '',

  sizePreset: 'leaderboard',
  width: 728,
  height: 90,
  fitMode: 'contain',

  animationType: 'none',
  animationSpeed: 20,
  durationSeconds: 10,

  backgroundColor: '#ffffff',
  textColor: '#111111',

  price: '',
  offer: '',
  contact: '',

  isActive: false,

  startAt: '',
  endAt: '',
};

/* ========================================
   Helper Functions
======================================== */

function getStoredFileUrl(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }

  if (/^(https?:|blob:|data:)/i.test(filePath)) {
    return filePath;
  }

  const baseUrl = API_URL.replace(/\/api\/?$/, '');

  return `${baseUrl}/${filePath.replace(/^\/+/, '')}`;
}

function getAuthToken() {
  return (
    localStorage.getItem('adminToken') || localStorage.getItem('token') || ''
  );
}

function getErrorMessage(errorData, fallback) {
  return (
    errorData?.message ||
    errorData?.error ||
    errorData?.errors?.[0]?.message ||
    fallback
  );
}

function getLocalDateTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function normalizeAd(ad = {}) {
  let adType = ad.adType || ad.type || 'banner';

  if (adType === 'image') {
    adType = 'banner';
  }

  if (adType === 'animated') {
    adType = 'text';
  }

  const sizePreset = SIZE_PRESETS[ad.sizePreset]
    ? ad.sizePreset
    : 'leaderboard';

  return {
    ...ad,

    adType,

    placement: ad.placement || ad.position || 'homepage-top',

    animationType: ad.animationType || ad.animation || 'none',

    sizePreset,

    width: Number(ad.width) || SIZE_PRESETS[sizePreset].width,

    height: Number(ad.height) || SIZE_PRESETS[sizePreset].height,

    fitMode: ['contain', 'cover', 'fill'].includes(ad.fitMode)
      ? ad.fitMode
      : 'contain',

    animationSpeed: Number(ad.animationSpeed) || 20,

    durationSeconds: Number(ad.durationSeconds) || 10,

    backgroundColor: ad.backgroundColor || '#ffffff',

    textColor: ad.textColor || '#111111',

    price: ad.price ?? '',

    offer: ad.offer ?? '',

    contact: ad.contact ?? '',

    youtubeUrl: ad.youtubeUrl || '',

    isActive:
      ad.isActive === true || ad.isActive === 'true' || ad.isActive === 1,
  };
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isValidYouTubeUrl(value) {
  try {
    const url = new URL(value);

    const hostname = url.hostname.toLowerCase();

    const allowedHosts = [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'www.youtu.be',
    ];

    return (
      allowedHosts.includes(hostname) &&
      (url.protocol === 'https:' || url.protocol === 'http:')
    );
  } catch {
    return false;
  }
}

/* ========================================
   Main Component
======================================== */

function AdvertisementManager() {
  const [advertisements, setAdvertisements] = useState([]);

  const [form, setForm] = useState({ ...INITIAL_FORM });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  const [imagePreview, setImagePreview] = useState('');

  const [videoPreview, setVideoPreview] = useState('');

  const [existingImage, setExistingImage] = useState('');

  const [existingVideo, setExistingVideo] = useState('');

  const imageInputRef = useRef(null);

  const videoInputRef = useRef(null);

  const mountedRef = useRef(false);

  const token = getAuthToken();

  const isEditing = Boolean(editingId);

  const isCustomSize = form.sizePreset === 'custom';

  const isVideoAd = form.adType === 'video';

  const isBannerAd = form.adType === 'banner';

  const isTextAd = form.adType === 'text';

  const isPopupAd = form.adType === 'popup';

  /* ========================================
     API Request Helper
  ======================================== */

  const apiRequest = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        ...(options.headers || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const isFormData =
        typeof FormData !== 'undefined' && options.body instanceof FormData;

      if (options.body && !isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, `Request failed: ${response.status}`)
        );
      }

      return result;
    },
    [token]
  );

  /* ========================================
     Load Advertisements
  ======================================== */

  const fetchAdvertisements = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const result = await apiRequest('/advertisements');

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.advertisements)
              ? result.advertisements
              : [];

        setAdvertisements(data.map(normalizeAd));

        setError('');

        return data;
      } catch (err) {
        setError(err.message || 'বিজ্ঞাপনের তালিকা Load করা যায়নি।');

        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiRequest]
  );

  /* ========================================
     Initial Load
  ======================================== */

  useEffect(() => {
    mountedRef.current = true;

    void fetchAdvertisements(true);

    return () => {
      mountedRef.current = false;
    };
  }, [fetchAdvertisements]);

  /* ========================================
     Cleanup Temporary Preview URLs
  ======================================== */

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      if (videoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [imagePreview, videoPreview]);

  /* ========================================
     Form Input Change
  ======================================== */

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setError('');
  }

  /* ========================================
     Advertisement Type Change
  ======================================== */

  function handleAdTypeChange(event) {
    const adType = event.target.value;

    setForm((previous) => ({
      ...previous,
      adType,
    }));

    setError('');
  }

  /* ========================================
     Size Preset Change
  ======================================== */

  function handleSizePresetChange(event) {
    const sizePreset = event.target.value;

    const preset = SIZE_PRESETS[sizePreset];

    if (!preset) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      sizePreset,
      width: preset.width,
      height: preset.height,
    }));

    setError('');
  }

  /* ========================================
     Image Selection
  ======================================== */

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setError('JPG, PNG, WEBP অথবা GIF Image নির্বাচন করো।');

      event.target.value = '';

      return;
    }

    setError('');
    setSuccess('');

    setForm((previous) => ({
      ...previous,
      image: file,
    }));

    setImagePreview((previousPreview) => {
      if (previousPreview.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreview);
      }

      return URL.createObjectURL(file);
    });
  }

  /* ========================================
     Video Selection
  ======================================== */

  function handleVideoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('video/')) {
      setError('শুধু Video ফাইল নির্বাচন করো।');

      event.target.value = '';

      return;
    }

    setError('');
    setSuccess('');

    setForm((previous) => ({
      ...previous,
      video: file,
    }));

    setVideoPreview((previousPreview) => {
      if (previousPreview.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreview);
      }

      return URL.createObjectURL(file);
    });
  }

  /* ========================================
     Reset Form
  ======================================== */

  function resetForm() {
    setForm({ ...INITIAL_FORM });

    setEditingId(null);

    setImagePreview('');

    setVideoPreview('');

    setExistingImage('');

    setExistingVideo('');

    setError('');

    setSuccess('');

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }

  /* ========================================
     Edit Advertisement
  ======================================== */

  function handleEdit(ad) {
    const normalized = normalizeAd(ad);

    setEditingId(ad._id);

    setError('');

    setSuccess('');

    setForm({
      ...INITIAL_FORM,

      title: normalized.title || '',

      targetUrl: normalized.targetUrl || '',

      adType: normalized.adType,

      placement: normalized.placement,

      image: null,

      video: null,

      youtubeUrl: normalized.youtubeUrl || '',

      headline: normalized.headline || '',

      description: normalized.description || '',

      sizePreset: normalized.sizePreset,

      width: normalized.width,

      height: normalized.height,

      fitMode: normalized.fitMode,

      animationType: normalized.animationType,

      animationSpeed: normalized.animationSpeed,

      durationSeconds: normalized.durationSeconds,

      backgroundColor: normalized.backgroundColor,

      textColor: normalized.textColor,

      price: normalized.price ?? '',

      offer: normalized.offer ?? '',

      contact: normalized.contact ?? '',

      isActive: normalized.isActive,

      startAt: getLocalDateTime(normalized.startAt),

      endAt: getLocalDateTime(normalized.endAt),
    });

    const imageUrl = getStoredFileUrl(normalized.image);

    const videoUrl = getStoredFileUrl(normalized.video);

    setExistingImage(imageUrl);

    setExistingVideo(videoUrl);

    setImagePreview(imageUrl);

    setVideoPreview(videoUrl);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }

    document.getElementById('advertisement-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  /* ========================================
     Form Validation
  ======================================== */

  function validateForm() {
    if (!form.title.trim()) {
      return 'বিজ্ঞাপনের Title লিখতে হবে।';
    }

    if (!form.placement) {
      return 'বিজ্ঞাপনের Placement নির্বাচন করো।';
    }

    if (form.targetUrl.trim() && !isValidHttpUrl(form.targetUrl.trim())) {
      return 'সঠিক HTTP অথবা HTTPS Target URL লিখো।';
    }

    if (isBannerAd && !form.image && !existingImage) {
      return 'Banner Advertisement-এর জন্য Image নির্বাচন করো।';
    }

    if (isVideoAd && !form.video && !existingVideo && !form.youtubeUrl.trim()) {
      return 'Video ফাইল অথবা YouTube URL দিতে হবে।';
    }

    if (
      isVideoAd &&
      form.youtubeUrl.trim() &&
      !isValidYouTubeUrl(form.youtubeUrl.trim())
    ) {
      return 'সঠিক YouTube URL দিতে হবে।';
    }

    if (
      (isTextAd || isPopupAd) &&
      !form.headline.trim() &&
      !form.description.trim() &&
      !form.image &&
      !existingImage
    ) {
      return 'Headline, Description অথবা Image দিতে হবে।';
    }

    const width = Number(form.width);

    if (!Number.isFinite(width) || width < 1 || width > 3000) {
      return 'Width 1 থেকে 3000-এর মধ্যে হতে হবে।';
    }

    const height = Number(form.height);

    if (!Number.isFinite(height) || height < 1 || height > 3000) {
      return 'Height 1 থেকে 3000-এর মধ্যে হতে হবে।';
    }

    const animationSpeed = Number(form.animationSpeed);

    if (
      !Number.isFinite(animationSpeed) ||
      animationSpeed < 5 ||
      animationSpeed > 60
    ) {
      return 'Animation Speed 5 থেকে 60-এর মধ্যে হতে হবে।';
    }

    const durationSeconds = Number(form.durationSeconds);

    if (
      !Number.isFinite(durationSeconds) ||
      durationSeconds < 3 ||
      durationSeconds > 60
    ) {
      return 'Duration 3 থেকে 60 সেকেন্ডের মধ্যে হতে হবে।';
    }

    if (
      String(form.price).trim() !== '' &&
      (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)
    ) {
      return 'Price শূন্য অথবা তার বেশি হতে হবে।';
    }

    if (form.startAt && Number.isNaN(new Date(form.startAt).getTime())) {
      return 'Start Date সঠিক নয়।';
    }

    if (form.endAt && Number.isNaN(new Date(form.endAt).getTime())) {
      return 'End Date সঠিক নয়।';
    }

    if (
      form.startAt &&
      form.endAt &&
      new Date(form.endAt) < new Date(form.startAt)
    ) {
      return 'End Date, Start Date-এর আগে হতে পারবে না।';
    }

    return '';
  }

  /* ========================================
     Create / Update Advertisement
  ======================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError('');
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      /* Required Fields */

      formData.append('title', form.title.trim());

      formData.append('targetUrl', form.targetUrl.trim());

      formData.append('adType', form.adType);

      formData.append('placement', form.placement);

      /* Size */

      formData.append('sizePreset', form.sizePreset);

      formData.append('width', String(Number(form.width)));

      formData.append('height', String(Number(form.height)));

      /* Media Display */

      formData.append('fitMode', form.fitMode);

      formData.append('animationType', form.animationType);

      formData.append('animationSpeed', String(Number(form.animationSpeed)));

      formData.append('durationSeconds', String(Number(form.durationSeconds)));

      /* Content */

      formData.append('headline', form.headline.trim());

      formData.append('description', form.description.trim());

      /* Design */

      formData.append('backgroundColor', form.backgroundColor);

      formData.append('textColor', form.textColor);

      /* Optional Fields
         Empty values are sent to support clearing old values.
      */

      formData.append('price', String(form.price ?? '').trim());

      formData.append('offer', String(form.offer ?? '').trim());

      formData.append('contact', String(form.contact ?? '').trim());

      formData.append('youtubeUrl', form.youtubeUrl.trim());

      /* Status */

      formData.append('isActive', String(Boolean(form.isActive)));

      /* Schedule */

      if (form.startAt) {
        formData.append('startAt', new Date(form.startAt).toISOString());
      } else if (isEditing) {
        formData.append('startAt', '');
      }

      if (form.endAt) {
        formData.append('endAt', new Date(form.endAt).toISOString());
      } else if (isEditing) {
        formData.append('endAt', '');
      }

      /* New Image */

      if (form.image instanceof File) {
        formData.append('image', form.image);
      }

      /* New Video */

      if (form.video instanceof File) {
        formData.append('video', form.video);
      }

      /* Endpoint */

      const endpoint = isEditing
        ? `/advertisements/${editingId}`
        : '/advertisements';

      const method = isEditing ? 'PUT' : 'POST';

      /* Upload Type */

      const uploadType =
        form.video instanceof File
          ? 'video'
          : form.image instanceof File
            ? 'image'
            : isVideoAd
              ? 'video'
              : 'image';

      /* API Request */

      const result = await apiRequest(endpoint, {
        method,

        headers: {
          'x-ad-upload-type': uploadType,
        },

        body: formData,
      });

      setSuccess(
        result.message ||
          (isEditing
            ? 'বিজ্ঞাপন সফলভাবে Update হয়েছে।'
            : 'বিজ্ঞাপন সফলভাবে তৈরি হয়েছে।')
      );

      resetForm();

      await fetchAdvertisements();
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপন Save করা যায়নি।');
    } finally {
      setSaving(false);
    }
  }

  /* ========================================
     Toggle Advertisement Status
  ======================================== */

  async function handleToggle(ad) {
    setError('');
    setSuccess('');

    try {
      const result = await apiRequest(`/advertisements/${ad._id}/toggle`, {
        method: 'PATCH',
      });

      setSuccess(result.message || 'Advertisement Status Update হয়েছে।');

      await fetchAdvertisements();
    } catch (err) {
      setError(err.message || 'Status Update করা যায়নি।');
    }
  }

  /* ========================================
     Delete Advertisement
  ======================================== */

  async function handleDelete(ad) {
    const confirmed = window.confirm(
      `তুমি কি "${ad.title}" বিজ্ঞাপনটি Delete করতে চাও?`
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await apiRequest(`/advertisements/${ad._id}`, {
        method: 'DELETE',
      });

      setSuccess(result.message || 'বিজ্ঞাপন Delete হয়েছে।');

      if (editingId === ad._id) {
        resetForm();
      }

      await fetchAdvertisements();
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপন Delete করা যায়নি।');
    }
  }

  /* ========================================
     Advertisement Preview
  ======================================== */

  function renderPreview() {
    const width = Math.min(Number(form.width) || 300, 970);

    const height = Math.min(Number(form.height) || 90, 350);

    const previewStyle = {
      width: '100%',
      maxWidth: `${width}px`,
      minHeight: `${height}px`,
      aspectRatio: `${width} / ${height}`,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: form.backgroundColor,
      color: form.textColor,
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      margin: '12px 0',
      boxSizing: 'border-box',
    };

    if (isBannerAd && imagePreview) {
      return (
        <div style={previewStyle}>
          <img
            src={imagePreview}
            alt="Advertisement Preview"
            style={{
              display: 'block',
              width: '100%',
              height: `${height}px`,
              objectFit: form.fitMode,
            }}
          />
        </div>
      );
    }

    if (isVideoAd && videoPreview) {
      return (
        <div style={previewStyle}>
          <video
            src={videoPreview}
            controls
            preload="metadata"
            style={{
              display: 'block',
              width: '100%',
              height: `${height}px`,
              objectFit: form.fitMode,
            }}
          />
        </div>
      );
    }

    if (isVideoAd && form.youtubeUrl.trim()) {
      return (
        <div className="ad-preview-note">
          YouTube Video URL দেওয়া হয়েছে।
          <br />
          URL যাচাই করে বিজ্ঞাপন Save করো।
        </div>
      );
    }

    if (isTextAd || isPopupAd) {
      return (
        <div
          style={{
            ...previewStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          {form.headline && (
            <h3 style={{ margin: '0 0 8px' }}>{form.headline}</h3>
          )}

          {form.description && <p style={{ margin: 0 }}>{form.description}</p>}

          {!form.headline && !form.description && (
            <span>Advertisement Preview</span>
          )}
        </div>
      );
    }

    return (
      <div className="ad-preview-placeholder" style={previewStyle}>
        {isBannerAd
          ? 'Image নির্বাচন করলে Preview দেখা যাবে'
          : 'Video বা YouTube URL দিলে Preview দেখানো হবে'}
      </div>
    );
  }

  /* ========================================
     Table Media Preview
  ======================================== */

  function renderMediaPreview(ad) {
    if (ad.adType === 'banner' && ad.image) {
      return (
        <img
          className="ad-table-image"
          src={getStoredFileUrl(ad.image)}
          alt={ad.title || 'Advertisement'}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    if (ad.adType === 'video') {
      return <span className="ad-media-label">Video</span>;
    }

    if (ad.adType === 'text') {
      return <span className="ad-media-label">Text</span>;
    }

    if (ad.adType === 'popup') {
      return <span className="ad-media-label">Popup</span>;
    }

    return <span>—</span>;
  }

  /* ========================================
     JSX
  ======================================== */

  return (
    <section className="advertisement-manager">
      {/* Header */}

      <div className="ad-manager-header">
        <div>
          <h2>Advertisement Management</h2>

          <p>বিজ্ঞাপন তৈরি, Edit, Update এবং Placement পরিচালনা করো।</p>
        </div>

        <button
          type="button"
          className="ad-refresh-button"
          onClick={() => fetchAdvertisements(true)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="ad-alert ad-alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="ad-alert ad-alert-success" role="status">
          {success}
        </div>
      )}

      {/* Form Layout */}

      <div className="ad-manager-layout" id="advertisement-form">
        <form className="ad-form" onSubmit={handleSubmit}>
          {/* Form Heading */}

          <div className="ad-form-heading">
            <h3>{isEditing ? 'Edit Advertisement' : 'Create Advertisement'}</h3>

            {isEditing && (
              <button
                type="button"
                className="ad-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="ad-form-grid">
            {/* Title */}

            <div className="ad-field ad-field-full">
              <label htmlFor="ad-title">Advertisement Title *</label>

              <input
                id="ad-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="যেমন: Special Eid Offer"
                required
              />
            </div>

            {/* Type */}

            <div className="ad-field">
              <label htmlFor="ad-type">Advertisement Type *</label>

              <select
                id="ad-type"
                name="adType"
                value={form.adType}
                onChange={handleAdTypeChange}
                required
              >
                <option value="banner">Image Banner</option>

                <option value="video">Video Advertisement</option>

                <option value="text">Animated Text</option>

                <option value="popup">Popup Advertisement</option>
              </select>
            </div>

            {/* Placement */}

            <div className="ad-field">
              <label htmlFor="ad-placement">Placement *</label>

              <select
                id="ad-placement"
                name="placement"
                value={form.placement}
                onChange={handleChange}
                required
              >
                {PLACEMENTS.map((placement) => (
                  <option key={placement.value} value={placement.value}>
                    {placement.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target URL */}

            <div className="ad-field ad-field-full">
              <label htmlFor="ad-target-url">Target URL</label>

              <input
                id="ad-target-url"
                name="targetUrl"
                type="url"
                value={form.targetUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            {/* Banner Image */}

            {isBannerAd && (
              <div className="ad-field ad-field-full">
                <label htmlFor="advertisement-image">
                  Advertisement Image *
                </label>

                <input
                  ref={imageInputRef}
                  id="advertisement-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                />

                {existingImage && !form.image && (
                  <small>
                    আগের Image ব্যবহার করা হবে। নতুন Image নির্বাচন করলে সেটি
                    Replace হবে।
                  </small>
                )}
              </div>
            )}

            {/* Video Advertisement */}

            {isVideoAd && (
              <>
                <div className="ad-field ad-field-full">
                  <label htmlFor="advertisement-video">Video File</label>

                  <input
                    ref={videoInputRef}
                    id="advertisement-video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />

                  {existingVideo && !form.video && (
                    <small>নতুন Video নির্বাচন না করলে আগের Video থাকবে।</small>
                  )}
                </div>

                <div className="ad-field ad-field-full">
                  <label htmlFor="ad-youtube-url">অথবা YouTube URL</label>

                  <input
                    id="ad-youtube-url"
                    name="youtubeUrl"
                    type="url"
                    value={form.youtubeUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </>
            )}

            {/* Text / Popup Content */}

            {(isTextAd || isPopupAd) && (
              <>
                <div className="ad-field ad-field-full">
                  <label htmlFor="ad-headline">Headline</label>

                  <input
                    id="ad-headline"
                    name="headline"
                    value={form.headline}
                    onChange={handleChange}
                    placeholder="বিজ্ঞাপনের শিরোনাম"
                  />
                </div>

                <div className="ad-field ad-field-full">
                  <label htmlFor="ad-description">Description</label>

                  <textarea
                    id="ad-description"
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="বিজ্ঞাপনের বিস্তারিত"
                  />
                </div>

                <div className="ad-field">
                  <label htmlFor="ad-background-color">Background Color</label>

                  <input
                    id="ad-background-color"
                    name="backgroundColor"
                    type="color"
                    value={form.backgroundColor}
                    onChange={handleChange}
                  />
                </div>

                <div className="ad-field">
                  <label htmlFor="ad-text-color">Text Color</label>

                  <input
                    id="ad-text-color"
                    name="textColor"
                    type="color"
                    value={form.textColor}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Size Preset */}

            <div className="ad-field">
              <label htmlFor="ad-size-preset">Advertisement Size</label>

              <select
                id="ad-size-preset"
                name="sizePreset"
                value={form.sizePreset}
                onChange={handleSizePresetChange}
              >
                {Object.entries(SIZE_PRESETS).map(([value, preset]) => (
                  <option key={value} value={value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fit Mode */}

            <div className="ad-field">
              <label htmlFor="ad-fit-mode">Image / Video Fit Mode</label>

              <select
                id="ad-fit-mode"
                name="fitMode"
                value={form.fitMode}
                onChange={handleChange}
              >
                <option value="contain">Contain — পুরো Media দেখা যাবে</option>

                <option value="cover">Cover — জায়গা পূর্ণ হবে</option>

                <option value="fill">Fill — জায়গা অনুযায়ী Stretch হবে</option>
              </select>
            </div>

            {/* Width */}

            <div className="ad-field">
              <label htmlFor="ad-width">Width (px)</label>

              <input
                id="ad-width"
                name="width"
                type="number"
                min="1"
                max="3000"
                value={form.width}
                disabled={!isCustomSize}
                onChange={handleChange}
                required
              />
            </div>

            {/* Height */}

            <div className="ad-field">
              <label htmlFor="ad-height">Height (px)</label>

              <input
                id="ad-height"
                name="height"
                type="number"
                min="1"
                max="3000"
                value={form.height}
                disabled={!isCustomSize}
                onChange={handleChange}
                required
              />
            </div>

            {/* Animation */}

            <div className="ad-field">
              <label htmlFor="ad-animation">Animation</label>

              <select
                id="ad-animation"
                name="animationType"
                value={form.animationType}
                onChange={handleChange}
              >
                {ANIMATIONS.map((animation) => (
                  <option key={animation.value} value={animation.value}>
                    {animation.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Animation Speed */}

            <div className="ad-field">
              <label htmlFor="ad-animation-speed">Animation Speed (5–60)</label>

              <input
                id="ad-animation-speed"
                name="animationSpeed"
                type="number"
                min="5"
                max="60"
                value={form.animationSpeed}
                onChange={handleChange}
                required
              />
            </div>

            {/* Duration */}

            <div className="ad-field">
              <label htmlFor="ad-duration">Duration (3–60 seconds)</label>

              <input
                id="ad-duration"
                name="durationSeconds"
                type="number"
                min="3"
                max="60"
                value={form.durationSeconds}
                onChange={handleChange}
                required
              />
            </div>

            {/* Price */}

            <div className="ad-field">
              <label htmlFor="ad-price">Price</label>

              <input
                id="ad-price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            {/* Offer */}

            <div className="ad-field">
              <label htmlFor="ad-offer">Offer</label>

              <input
                id="ad-offer"
                name="offer"
                value={form.offer}
                onChange={handleChange}
                placeholder="বিশেষ অফার"
              />
            </div>

            {/* Contact */}

            <div className="ad-field ad-field-full">
              <label htmlFor="ad-contact">Contact</label>

              <input
                id="ad-contact"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="যোগাযোগের তথ্য"
              />
            </div>

            {/* Start Date */}

            <div className="ad-field">
              <label htmlFor="ad-start-at">Start Date</label>

              <input
                id="ad-start-at"
                name="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={handleChange}
              />
            </div>

            {/* End Date */}

            <div className="ad-field">
              <label htmlFor="ad-end-at">End Date</label>

              <input
                id="ad-end-at"
                name="endAt"
                type="datetime-local"
                value={form.endAt}
                onChange={handleChange}
              />
            </div>

            {/* Active Status */}

            <div className="ad-field ad-field-full">
              <label className="ad-checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />

                <span>বিজ্ঞাপন Active রাখবে</span>
              </label>
            </div>
          </div>

          {/* Preview */}

          <div className="ad-preview-section">
            <h4>Advertisement Preview</h4>

            {renderPreview()}

            <p>
              নির্বাচিত Size: {form.width} × {form.height} px
            </p>
          </div>

          {/* Form Actions */}

          <div className="ad-form-actions">
            <button type="submit" className="ad-save-button" disabled={saving}>
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Update Advertisement'
                  : 'Create Advertisement'}
            </button>

            <button
              type="button"
              className="ad-reset-button"
              onClick={resetForm}
              disabled={saving}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Advertisement Information */}

        <aside className="ad-manager-info">
          <h3>Advertisement Settings</h3>

          <p>
            <strong>Type:</strong> {form.adType}
          </p>

          <p>
            <strong>Placement:</strong> {form.placement}
          </p>

          <p>
            <strong>Size:</strong> {form.width} × {form.height}
          </p>

          <p>
            <strong>Fit Mode:</strong> {form.fitMode}
          </p>

          <p>
            <strong>Animation:</strong> {form.animationType}
          </p>

          <p>
            <strong>Status:</strong> {form.isActive ? 'Active' : 'Inactive'}
          </p>

          <hr />

          <p>
            <strong>Auto:</strong> Responsive layout-এর জন্য।
          </p>

          <p>
            <strong>Leaderboard:</strong> Header বা Navbar-এর কাছাকাছি Banner-এর
            জন্য।
          </p>

          <p>
            <strong>Medium Rectangle:</strong> Article বা Sidebar-এর জন্য।
          </p>

          <p>
            <strong>Custom:</strong> নিজের প্রয়োজনমতো Width এবং Height সেট করতে
            পারবে।
          </p>
        </aside>
      </div>

      {/* ========================================
          Advertisement List
      ======================================== */}

      <div className="ad-list-section">
        <div className="ad-list-heading">
          <div>
            <h3>All Advertisements</h3>

            <p>মোট বিজ্ঞাপন: {advertisements.length}</p>
          </div>
        </div>

        {loading ? (
          <p className="ad-empty-state">Advertisement Loading হচ্ছে...</p>
        ) : advertisements.length === 0 ? (
          <p className="ad-empty-state">
            এখনো কোনো Advertisement তৈরি করা হয়নি।
          </p>
        ) : (
          <div className="ad-table-wrapper">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Media</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Placement</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {advertisements.map((ad) => (
                  <tr key={ad._id}>
                    {/* Media */}

                    <td>{renderMediaPreview(ad)}</td>

                    {/* Title */}

                    <td>
                      <strong>{ad.title}</strong>

                      {ad.headline && (
                        <small className="ad-table-subtitle">
                          {ad.headline}
                        </small>
                      )}
                    </td>

                    {/* Type */}

                    <td>{ad.adType}</td>

                    {/* Placement */}

                    <td>
                      {PLACEMENTS.find((item) => item.value === ad.placement)
                        ?.label || ad.placement}
                    </td>

                    {/* Size */}

                    <td>
                      {ad.width} × {ad.height}
                    </td>

                    {/* Status */}

                    <td>
                      <span
                        className={
                          ad.isActive
                            ? 'ad-status ad-status-active'
                            : 'ad-status ad-status-inactive'
                        }
                      >
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}

                    <td>
                      <div className="ad-table-actions">
                        <button
                          type="button"
                          className="ad-edit-button"
                          onClick={() => handleEdit(ad)}
                          disabled={saving}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="ad-toggle-button"
                          onClick={() => handleToggle(ad)}
                        >
                          {ad.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          className="ad-delete-button"
                          onClick={() => handleDelete(ad)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdvertisementManager;
