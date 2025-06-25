// src/services/enrollmentService.js
import api from './api';

const enrollmentService = {
  // التسجيل في كورس
  enrollInCourse: async (courseId) => {
    const response = await api.post('/enrollments', { course_id: courseId });
    return response.data;
  },

  // جلب الكورسات المسجل فيها
  getMyEnrollments: async () => {
    const response = await api.get('/enrollments/my-courses');
    return response.data;
  },

  // جلب طلاب كورس معين (للمدرس)
  getCourseStudents: async (courseId) => {
    const response = await api.get(`/enrollments/course/${courseId}/students`);
    return response.data;
  },

  // تحديث تقدم الطالب
  updateProgress: async (enrollmentId, progress) => {
    const response = await api.put(`/enrollments/${enrollmentId}/progress`, { progress });
    return response.data;
  },

  // جلب إحصائيات التسجيل (للأدمن)
  getEnrollmentStats: async () => {
    const response = await api.get('/enrollments/stats');
    return response.data;
  },

  // جلب تقدم الطالب في كورس
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/progress/course/${courseId}`);
    return response.data;
  },

  // جلب تقدم الطالب في وحدة
  getModuleProgress: async (moduleId) => {
    const response = await api.get(`/progress/module/${moduleId}`);
    return response.data;
  },

  // التحقق من التسجيل
  checkEnrollment: async (courseId) => {
    try {
      const enrollments = await api.get('/enrollments/my-courses');
      return enrollments.data.some(enrollment => enrollment.course_id === parseInt(courseId));
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  },
};

export default enrollmentService;