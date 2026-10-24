const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Admin Login
export async function adminLogin(email, password) {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Admin Login ব্যর্থ হয়েছে।');
  }

  return result;
}

// Admin Token সংগ্রহ
export function getAdminToken() {
  return localStorage.getItem('adminToken');
}

// Admin Logout
export function adminLogout() {
  localStorage.removeItem('adminToken');
}

// Admin API Request
export async function adminRequest(endpoint, options = {}) {
  const token = getAdminToken();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // FormData হলে Content-Type নিজে সেট করা যাবে না।
  // JSON body হলে application/json ব্যবহার করতে হবে।
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Request ব্যর্থ হয়েছে।');
  }

  return result;
}

// Admin-এর ছবি Upload করা
export async function uploadNewsImage(file) {
  const token = getAdminToken();

  const formData = new FormData();

  // Backend-এর upload.single('image')-এর সঙ্গে নাম মিলতে হবে
  formData.append('image', file);

  const response = await fetch(`${API_URL}/news/upload-image`, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${token}`,
    },

    // FormData পাঠানোর সময় Content-Type নিজে সেট করবেন না।
    // Browser নিজে multipart/form-data Boundary যোগ করবে।
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'ছবি Upload করা যায়নি।');
  }

  return result;
}
