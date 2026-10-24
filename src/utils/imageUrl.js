const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API URL থেকে Backend-এর Base URL তৈরি
const BACKEND_URL = API_URL.replace(/\/+$/, '').replace(/\/api$/, '');

export function getImageUrl(image) {
  if (!image) return '/news-placeholder.png';

  // বাইরের Image URL হলে সেটিই ব্যবহার
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // Backend-এর Upload Path হলে সম্পূর্ণ URL তৈরি
  return `${BACKEND_URL}/${image.replace(/^\/+/, '')}`;
}
