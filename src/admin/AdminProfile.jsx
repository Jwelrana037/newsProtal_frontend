import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProfile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Admin Profile লোড করা

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        if (!token) {
          navigate('/admin/login', { replace: true });
          return;
        }

        console.log('Profile loading started');

        const response = await fetch(`${API_URL}/admin/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        const result = await response.json();

        console.log('Profile API status:', response.status);
        console.log('Profile API response:', result);

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Profile লোড করা যায়নি');
        }

        const admin = result.data;

        if (isMounted) {
          setProfile({
            name: admin.name || '',
            email: admin.email || '',
          });

          setForm((previous) => ({
            ...previous,
            name: admin.name || '',
            email: admin.email || '',
          }));
        }
      } catch (err) {
        if (isMounted) {
          console.error('Profile loading error:', err);
          setError(err.message || 'সার্ভারের সঙ্গে যোগাযোগ করা যায়নি');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Profile loading finished');
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Input পরিবর্তন
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Profile Update
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!form.currentPassword) {
      setError('পরিবর্তন নিশ্চিত করতে বর্তমান Password দিন।');
      return;
    }

    const payload = {
      currentPassword: form.currentPassword,
    };

    if (form.name.trim() !== profile.name) {
      payload.name = form.name.trim();
    }

    if (form.email.trim().toLowerCase() !== profile.email.toLowerCase()) {
      payload.email = form.email.trim();
    }

    if (form.newPassword) {
      payload.newPassword = form.newPassword;
    }

    if (
      payload.name === undefined &&
      payload.email === undefined &&
      payload.newPassword === undefined
    ) {
      setError('পরিবর্তন করার জন্য নাম, Email অথবা নতুন Password দিন।');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login', { replace: true });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Profile Update ব্যর্থ হয়েছে');
      }

      window.dispatchEvent(new Event('admin-profile-updated'));

      setProfile({
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      });

      const updatedAdmin = result.data;

      setProfile({
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      });

      setForm({
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        currentPassword: '',
        newPassword: '',
      });

      if (result.requireLoginAgain) {
        localStorage.removeItem('adminToken');

        setMessage('Password পরিবর্তন হয়েছে। নিরাপত্তার জন্য আবার Login করুন।');

        setTimeout(() => {
          navigate('/admin/login', { replace: true });
        }, 1800);

        return;
      }

      setMessage(result.message || 'Profile সফলভাবে আপডেট হয়েছে।');
    } catch (err) {
      setError(err.message || 'Profile Update করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    console.log('AdminProfile rendered');
    console.log('Profile data:', profile);
    console.log('Loading:', loading);
    console.log('Error:', error);
    return (
      <div className="admin-profile-page">
        <div className="profile-status">Profile লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <section className="admin-profile-page">
      <div className="profile-page-heading">
        <div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h2>Profile Settings</h2>
          <p>আপনার Admin Account-এর তথ্য পরিবর্তন করুন।</p>
        </div>

        <div className="profile-heading-avatar">
          {profile.name.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-heading">
          <div>
            <h3>Personal Information</h3>
            <p>নাম, Email এবং Password আপডেট করুন।</p>
          </div>
          <span className="profile-role-badge">Administrator</span>
        </div>

        {message && (
          <div className="profile-alert profile-alert-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="profile-alert profile-alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="admin-name">Admin Name</label>
              <input
                id="admin-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                maxLength={254}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="profile-section-divider">
            <h3>Change Password</h3>
            <p>
              Password পরিবর্তন করতে চাইলে নতুন Password দিন। পরিবর্তন না করলে
              এই ঘরটি খালি রাখুন।
            </p>
          </div>

          <div className="profile-field">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              placeholder="কমপক্ষে ১২ অক্ষর"
            />
          </div>

          <div className="profile-field profile-current-password">
            <label htmlFor="current-password">
              Current Password <span>*</span>
            </label>
            <input
              id="current-password"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              required
              placeholder="বর্তমান Password লিখুন"
            />
            <small>
              নাম, Email অথবা Password পরিবর্তন নিশ্চিত করতে বর্তমান Password
              প্রয়োজন।
            </small>
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-cancel-button"
              onClick={() => {
                setForm({
                  name: profile.name,
                  email: profile.email,
                  currentPassword: '',
                  newPassword: '',
                });
                setMessage('');
                setError('');
              }}
              disabled={saving}
            >
              Reset
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AdminProfile;
