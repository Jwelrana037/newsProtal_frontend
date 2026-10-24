import { Routes, Route } from 'react-router-dom';
import NewsDetails from './pages/NewsDetails';
import Navbar from './components/Navbar';
// import BreakingNews from './components/BreakingNews';
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
  return (
    <div className="app">
      <Navbar />
      {/* <BreakingNews /> */}

      {/* admin */}
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="news/new" element={<AdminNewsForm />} />
            <Route path="news/edit/:id" element={<AdminNewsForm />} />
            <Route path="advertisements" element={<AdvertisementManager />} />
          </Route>
        </Route>

        <Route path="/" element={<Home />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/category/:slug" element={<CategoryNews />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Advertisement Management */}
        <Route path="advertisements" element={<AdvertisementManager />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
