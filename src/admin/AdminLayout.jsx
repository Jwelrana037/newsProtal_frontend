import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
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

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Admin User</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
