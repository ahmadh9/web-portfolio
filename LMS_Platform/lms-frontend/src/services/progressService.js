import api from './api';

const progressService = {
  // هل أكمل الطالب هذا الدرس؟
  async isLessonCompleted(lessonId) {
    // يمكن تعمل endpoint خاص أو تعتمد progress الكلي (هنا مجازاً)
    const res = await api.get(`/progress/lesson/${lessonId}`);
    return res.data.completed;
  },
  // يسجّل الدرس كمكتمل
  async markLessonAsDone(lessonId) {
    await api.post(`/progress/lesson/${lessonId}/complete`);
  }
};
export default progressService;
