import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

import { adminLogin, getAdminToken } from '../services/adminApi';

import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // আগে থেকেই Token থাকলে Dashboard-এ পাঠানো
  if (getAdminToken()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const result = await adminLogin(email, password);

      // Backend-এর Response-এ Token থাকতে হবে
      const token = result.token || result.data?.token;

      if (!token) {
        throw new Error('Backend থেকে Login Token পাওয়া যায়নি।');
      }

      localStorage.setItem('adminToken', token);

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-logo">N</div>

        <h1>Admin Login</h1>

        <p>NewsToday Management System</p>

        {error && (
          <div className="admin-login-error" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="admin-email">Email Address</label>

        <input
          id="admin-email"
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="admin-password">Password</label>

        <input
          id="admin-password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Dashboard'}
        </button>

        <Link toHome="/" />
      </form>
    </main>
  );
}

function Link({ toHome }) {
  return null;
}

export default AdminLogin;
