import { Routes, Route, useLocation } from 'react-router-dom';

import NewsDetails from './pages/NewsDetails';
import Navbar from './components/Navbar';
import CategoryNews from './pages/CategoryNews';
import SearchResults from './pages/SearchResults';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminNewsForm from './admin/AdminNewsForm';
import AdminLayout from './admin/AdminLayout';
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
      ```
      <Routes>
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />

            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="news/new" element={<AdminNewsForm />} />

            <Route path="news/edit/:id" element={<AdminNewsForm />} />

            <Route path="advertisements" element={<AdvertisementManager />} />
          </Route>
        </Route>

        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/news/:id" element={<NewsDetails />} />

        <Route path="/category/:slug" element={<CategoryNews />} />

        <Route path="/search" element={<SearchResults />} />

        {/* যদি Public Advertisement Page প্রয়োজন হয় */}
        <Route path="/advertisements" element={<AdvertisementManager />} />
      </Routes>
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;
