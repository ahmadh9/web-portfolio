import api from './api';

const quizService = {
  getCourseQuizzes: async (courseId) => {
    const res = await api.get(`/quizzes/course/${courseId}`);
    return res.data.quizzes;
  },
  getLessonQuiz: async (lessonId) => {
    const res = await api.get(`/quizzes/lesson/${lessonId}`);
    return res.data.quiz;
  },
  submitQuiz: async (lessonId, answers) => {
    const res = await api.post(`/quizzes/lesson/${lessonId}/submit`, { answers });
    return res.data;
  }
};

export default quizService;
