// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // إذا كنت تستخدم الـ cookies/ sessions
});

// إضافة الـ token أوتوماتيكياً لكل طلب
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// التعامل المركزي مع الأخطاء
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
          break;
        case 403:
          toast.error(data.error || 'You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Requested resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          // رسالة الخطأ القادمة من الباكند أو رسالة افتراضية
          toast.error(data.error || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Error setting up request.');
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.withCredentials = true;
  return config;
});

export default api;
