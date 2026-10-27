const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getPublishedNews() {
  const response = await fetch(`${API_URL}/news`);

  if (!response.ok) {
    throw new Error('সংবাদ লোড করা যায়নি।');
  }

  const result = await response.json();

  return result.data;
}

// Pagination সহ Published News আনা
export async function getPublishedNewsPaginated(page = 1, limit = 10) {
  const response = await fetch(`${API_URL}/news?page=${page}&limit=${limit}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'সংবাদ লোড করা যায়নি।');
  }

  return result;
}

export async function getNewsById(id) {
  const response = await fetch(`${API_URL}/news/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error('সংবাদ পাওয়া যায়নি।');
  }

  const result = await response.json();

  return result.data;
}

// Featured News আনা
export async function getFeaturedNews() {
  const response = await fetch(`${API_URL}/news/featured`);

  if (!response.ok) {
    throw new Error('Featured সংবাদ লোড করা যায়নি।');
  }

  const result = await response.json();

  return result.data;
}

// বিভাগ অনুযায়ী সংবাদ আনা
export async function getNewsByCategory(category) {
  const response = await fetch(
    `${API_URL}/news/category/${encodeURIComponent(category)}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'সংবাদ লোড করা যায়নি।');
  }

  return result.data;
}

// শিরোনাম ও বিবরণ দিয়ে সংবাদ খোঁজা
export async function searchNews(query) {
  const response = await fetch(
    `${API_URL}/news/search?q=${encodeURIComponent(query)}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'সংবাদ খুঁজে পাওয়া যায়নি।');
  }

  return result.data;
}

// ========================================
// News Image Upload
// ========================================

export async function uploadNewsImage(file) {
  const formData = new FormData();

  formData.append('image', file);

  const response = await fetch(`${API_URL}/news/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'ছবি আপলোড করা যায়নি।');
  }

  return result;
}
