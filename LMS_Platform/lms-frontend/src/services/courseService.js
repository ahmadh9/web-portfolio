// src/services/courseService.js
import api from './api';

const courseService = {
  // جلب جميع الكورسات
  getAllCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // جلب كورس واحد
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // إنشاء كورس جديد
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // تحديث كورس
  updateCourse: async (id, courseData) => {
    // تحويل thumbnail إلى thumbnail_url للتوافق مع الباكند
    const data = { ...courseData };
    if (data.thumbnail !== undefined) {
      data.thumbnail_url = data.thumbnail;
      delete data.thumbnail;
    }
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  },

  // حذف كورس
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // الموافقة على كورس (للأدمن) - استخدام is_published فقط
  approveCourse: async (id) => {
    try {
      const response = await api.patch(`/courses/${id}`, { 
        is_published: true
      });
      return response.data;
    } catch (error) {
      console.error('Approve error:', error.response?.data);
      throw error;
    }
  },

  // رفض كورس (للأدمن) - استخدام PUT مع الباكند الموجود
  rejectCourse: async (id, reason) => {
    try {
      // استخدام نفس endpoint الموجود في الباكند
      const response = await api.put(`/courses/${id}/approve`, { 
        status: 'rejected',
        rejection_reason: reason 
      });
      return response.data;
    } catch (error) {
      console.error('Reject error:', error.response?.data);
      throw error;
    }
  },

  // البحث في الكورسات
  searchCourses: async (query, filters = {}) => {
    const response = await api.get('/search/courses', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // رفع صورة الكورس
  uploadCourseThumbnail: async (courseId, file) => {
    const formData = new FormData();
    formData.append('courseThumbnail', file);
    
    const response = await api.post(`/files/course/${courseId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // جلب وحدات الكورس
  getCourseModules: async (courseId) => {
    const response = await api.get(`/modules/course/${courseId}`);
    return response.data;
  },

  // إنشاء وحدة جديدة
  createModule: async (courseId, moduleData) => {
    const response = await api.post(`/modules/course/${courseId}`, moduleData);
    return response.data;
  },

  // تحديث وحدة
  updateModule: async (moduleId, moduleData) => {
    const response = await api.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  },

  // حذف وحدة
  deleteModule: async (moduleId) => {
    const response = await api.delete(`/modules/${moduleId}`);
    return response.data;
  },

  // جلب دروس الوحدة
  getModuleLessons: async (moduleId) => {
    const response = await api.get(`/lessons/module/${moduleId}`);
    return response.data;
  },

  // إنشاء درس جديد
  createLesson: async (moduleId, lessonData) => {
    const response = await api.post(`/lessons/module/${moduleId}`, lessonData);
    return response.data;
  },

  // جلب درس واحد
  getLessonById: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  // تحديث درس
  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
  },

  // حذف درس
  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  },

  // تسجيل إكمال الدرس
  markLessonComplete: async (lessonId) => {
    const response = await api.post(`/lessons/${lessonId}/complete`);
    return response.data;
  },

  // جلب التقييمات
  getCourseReviews: async (courseId, params = {}) => {
    const response = await api.get(`/reviews/course/${courseId}`, { params });
    return response.data;
  },

  // إضافة تقييم
  createReview: async (courseId, reviewData) => {
    const response = await api.post(`/reviews/course/${courseId}`, reviewData);
    return response.data;
  },

  // جلب إحصائيات الكورس
  getCourseStatistics: async (courseId) => {
    const response = await api.get(`/analytics/course/${courseId}/statistics`);
    return response.data;
  },
};

export default courseService;