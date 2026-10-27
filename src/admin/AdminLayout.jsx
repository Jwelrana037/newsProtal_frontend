import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import './AdminLayout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminLayout() {
  const location = useLocation();

  const [admin, setAdmin] = useState({
    name: 'Admin User',
    email: '',
  });

  const [profileLoading, setProfileLoading] = useState(true);

  // Backend থেকে Admin Profile লোড করা
  const fetchAdminProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setAdmin({ name: 'Admin User', email: '' });
        return;
      }

      const response = await fetch(`${API_URL}/admin/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setAdmin({
          name: result.data.name || 'Admin User',
          email: result.data.email || '',
        });
      } else {
        console.error(
          'Admin Profile Load Error:',
          result.message || 'Profile লোড করা যায়নি'
        );
      }
    } catch (error) {
      console.error('Admin Profile Load Error:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // প্রথমবার এবং Profile পেজে ফিরে এলে তথ্য লোড করা
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile, location.pathname]);

  // Profile আপডেটের পর অন্য পেজ থেকেও Header রিফ্রেশ করার ব্যবস্থা
  useEffect(() => {
    const handleProfileUpdated = () => {
      fetchAdminProfile();
    };

    window.addEventListener('admin-profile-updated', handleProfileUpdated);

    return () => {
      window.removeEventListener('admin-profile-updated', handleProfileUpdated);
    };
  }, [fetchAdminProfile]);

  // Avatar-এর প্রথম অক্ষর
  const avatarLetter = admin.name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon">N</span>

          <div>
            <h2>NewsToday</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-navigation">
          <p className="admin-nav-label">MAIN MENU</p>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span>▦</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/news"
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span>▤</span>
            All News
          </NavLink>

          <NavLink
            to="/admin/news/new"
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span>＋</span>
            Create News
          </NavLink>

          <NavLink
            to="/admin/advertisements"
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span>▧</span>
            Advertisements
          </NavLink>

          <NavLink
            to="/admin/videos"
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span>▷</span>
            Video News
          </NavLink>

          <p className="admin-nav-label">ACCOUNT</p>

          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span>⚙</span>
            Profile Settings
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <p>NewsToday CMS</p>
          <span>Content Management System</span>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-header-label">WORKSPACE</p>
            <h1>News Management</h1>
          </div>

          {/* Dynamic Admin Profile */}
          <div className="admin-profile" title={admin.email}>
            <div className="admin-avatar">{avatarLetter}</div>

            <div>
              <strong>{profileLoading ? 'Loading...' : admin.name}</strong>
              <span>{admin.email || 'Administrator'}</span>
            </div>
          </div>
        </header>

        {/* Nested Pages */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
