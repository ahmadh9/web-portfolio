// src/utils/courseHelpers.js

// التحقق من أن الكورس يمكن عرضه للطلاب
export const isCourseVisible = (course) => {
  return course.status === 'approved' && course.is_published === true;
};

// التحقق من حالة الكورس
export const getCourseStatus = (course) => {
  if (course.status === 'approved' && course.is_published) {
    return 'Published';
  } else if (course.status === 'approved' && !course.is_published) {
    return 'Approved (Not Published)';
  } else if (course.status === 'rejected') {
    return 'Rejected';
  } else {
    return 'Pending Approval';
  }
};

// لون الحالة
export const getCourseStatusColor = (course) => {
  if (course.status === 'approved' && course.is_published) {
    return 'success';
  } else if (course.status === 'approved' && !course.is_published) {
    return 'info';
  } else if (course.status === 'rejected') {
    return 'error';
  } else {
    return 'warning';
  }
};