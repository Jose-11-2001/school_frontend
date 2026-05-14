import axios from 'axios';

const API_BASE_URL = 'http://localhost:5123/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Student APIs
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  getStudentMarks: (studentId, year, term) => 
    api.get(`/students/marks/${studentId}?year=${year}&term=${term}`),
  getStudentRank: (studentId, year, term) => 
    api.get(`/students/rank/${studentId}?year=${year}&term=${term}`),
};

// Teacher Marks APIs
export const teacherMarksAPI = {
  getMyStudents: () => api.get('/TeacherMarks/my-students'),
  enterMarks: (data) => api.post('/TeacherMarks/enter-marks', data),
  publishResults: (subjectId, year, term) => 
    api.post(`/TeacherMarks/publish-results/${subjectId}/${year}/${term}`),
  getNotifications: () => api.get('/TeacherMarks/notifications'),
  markAsRead: (id) => api.put(`/TeacherMarks/notifications/${id}/read`),
  getUnreadCount: () => api.get('/TeacherMarks/notifications/unread-count'),
};

// Admin APIs
export const adminAPI = {
  // Teacher management
  getTeachers: () => api.get('/admin/teachers'),
  addTeacher: (data) => api.post('/admin/teachers', data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  
  // Class management
  getClasses: () => api.get('/admin/classes'),
  addClass: (data) => api.post('/admin/classes', data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  
  // Subject allocation
  allocateTeacher: (data) => api.post('/admin/allocate-teacher', data),
  getClassAllocations: (classId) => api.get(`/admin/class-allocations/${classId}`),
  removeAllocation: (id) => api.delete(`/admin/allocations/${id}`),
  
  // Results approval
  getPendingResults: () => api.get('/ResultsApproval/pending-results'),
  getResultsDetails: (subjectId, year, term) => 
    api.get(`/ResultsApproval/results-details/${subjectId}/${year}/${term}`),
  approveResults: (data) => api.post('/ResultsApproval/approve-results', data),
  getApprovedResults: () => api.get('/ResultsApproval/approved-results'),
  
  // Student management
  getAllStudents: () => api.get('/admin/all-students'),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
};

// Teacher Subjects APIs
export const teacherSubjectsAPI = {
  getMySubjects: () => api.get('/TeacherSubjects/my-subjects'),
};

// Student Subject APIs (for registration)
export const studentSubjectAPI = {
  getAvailableSubjects: () => api.get('/StudentSubject/available-subjects'),
  registerSubject: (subjectId) => api.post('/StudentSubject/register', { subjectId }),
  getMySubjects: () => api.get('/StudentSubject/my-subjects'),
  getTeacherStudents: () => api.get('/StudentSubject/teacher-students'),
};

// Subject APIs
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
};

// Student Notifications
export const studentNotificationsAPI = {
  getMyNotifications: () => api.get('/StudentNotifications/my-notifications'),
  getUnreadCount: () => api.get('/StudentNotifications/unread-count'),
  markAsRead: (id) => api.put(`/StudentNotifications/${id}/read`),
  markAllAsRead: () => api.put('/StudentNotifications/mark-all-read'),
};

export default api;