import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminRegister.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    token: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/register-with-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            email: formData.email.trim().toLowerCase(),
            name: formData.name.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Admin Account তৈরি করা যায়নি।');
      }

      setSuccess(true);
      setMessage(result.message || 'Admin Account সফলভাবে তৈরি হয়েছে।');

      setFormData({
        name: '',
        email: '',
        password: '',
        token: '',
      });

      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (error) {
      setMessage(error.message || 'Server-এর সঙ্গে সংযোগ করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-register-page">
      <section className="admin-register-card">
        <div className="admin-register-heading">
          <h1>Admin Registration</h1>

          <p>Invitation Token ব্যবহার করে Admin Account তৈরি করুন।</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-register-field">
            <label htmlFor="name">Full Name</label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="আপনার নাম লিখুন"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="admin-register-field">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="আপনার Email লিখুন"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-register-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="কমপক্ষে ১২ অক্ষর"
              value={formData.password}
              onChange={handleChange}
              minLength={12}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="admin-register-field">
            <label htmlFor="token">Invitation Token</label>

            <textarea
              id="token"
              name="token"
              placeholder="আপনার Invitation Token পেস্ট করুন"
              value={formData.token}
              onChange={handleChange}
              rows={3}
              spellCheck={false}
              autoComplete="off"
              required
            />
          </div>

          {message && (
            <div
              className={`admin-register-message ${
                success ? 'success' : 'error'
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="admin-register-button"
            disabled={loading}
          >
            {loading ? 'Account তৈরি হচ্ছে...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="admin-register-login">
          আগে থেকেই Account আছে? <Link to="/admin/login">Admin Login</Link>
        </p>
      </section>
    </main>
  );
}

export default AdminRegister;
