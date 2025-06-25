// src/services/authService.js
import api from './api';

const authService = {
  // تسجيل الدخول
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // حفظ التوكن والمستخدم
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // التسجيل
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    
    // حفظ التوكن والمستخدم
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // تسجيل الخروج
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // مسح البيانات المحلية
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  // الحصول على الملف الشخصي
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // تحديث الملف الشخصي
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    // تحديث المستخدم المحلي
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  // التحقق من حالة تسجيل الدخول
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // الحصول على التوكن
  getToken: () => {
    return localStorage.getItem('token');
  },

  // تسجيل الدخول بـ Google
  googleLogin: () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  },

  // التحقق من جلسة Google
  checkGoogleSession: async () => {
    try {
      const response = await api.get('/auth/session');
      if (response.data.authenticated) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Session check error:', error);
      return null;
    }
  }
};

export default authService;