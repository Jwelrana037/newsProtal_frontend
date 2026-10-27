import { Routes, Route, useLocation } from 'react-router-dom';

import NewsDetails from './pages/NewsDetails';
import Navbar from './components/Navbar';
import CategoryNews from './pages/CategoryNews';
import SearchResults from './pages/SearchResults';

import AdminLogin from './admin/AdminLogin';
import AdminRegister from './admin/AdminRegister';
import AdminDashboard from './admin/AdminDashboard';
import AdminNewsForm from './admin/AdminNewsForm';
import AdminLayout from './admin/AdminLayout';
import AdminProfile from './admin/AdminProfile';
import AdminNews from './admin/AdminNews';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdvertisementManager from './admin/AdvertisementManager';

import Footer from './components/Footer';
import Home from './pages/Home';

import './App.css';

function App() {
  const location = useLocation();

  // Admin পেজে Public Navbar ও Footer দেখাব না
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Registration */}
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Dashboard */}
            <Route index element={<AdminDashboard />} />

            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            {/* News Management */}
            <Route path="news/new" element={<AdminNewsForm />} />

            <Route path="news/edit/:id" element={<AdminNewsForm />} />

            {/* Advertisement Management */}
            <Route path="advertisements" element={<AdvertisementManager />} />

            {/* Admin Profile Settings */}
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/news/:id" element={<NewsDetails />} />

        <Route path="/category/:slug" element={<CategoryNews />} />

        <Route path="/search" element={<SearchResults />} />

        {/* Public Advertisement Page */}
        <Route path="/advertisements" element={<AdvertisementManager />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;
