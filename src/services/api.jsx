import axios from 'axios';

const API_BASE_URL = 'https://school-yathu.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API (Matches Swagger: /api/Auth) - ✅ CORRECTED
// ============================================
export const authAPI = {
  login: (data) => api.post('/Auth/login', data),
  changePassword: (data) => api.post('/Auth/change-password', data),
  register: (data) => api.post('/Auth/register', data),
  resetPassword: (userId) => api.post(`/Auth/reset-password/${userId}`),
  generateEmail: (data) => api.post('/Auth/generate-email', data),
  generatePassword: () => api.post('/Auth/generate-password'),
};

// ============================================
// ADMIN API (Matches Swagger: /api/Admin) - ✅ CORRECTED
// ============================================
export const adminAPI = {
  getTeachers: () => api.get('/Admin/teachers'),
  addTeacher: (data) => api.post('/Admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/Admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/Admin/teachers/${id}`),
  getClasses: () => api.get('/Admin/classes'),
  addClass: (data) => api.post('/Admin/classes', data),
  updateClass: (id, data) => api.put(`/Admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/Admin/classes/${id}`),
  getAllStudents: () => api.get('/Admin/all-students'),
  updateStudent: (id, data) => api.put(`/Admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/Admin/students/${id}`),
  allocateTeacher: (data) => api.post('/Admin/allocate-teacher', data),
  getClassAllocations: (classId) => api.get(`/Admin/class-allocations/${classId}`),
  removeAllocation: (id) => api.delete(`/Admin/allocations/${id}`),
};

// ============================================
// STUDENT API (Matches Swagger: /api/Student) - ✅ CORRECTED
// ============================================
export const studentAPI = {
  getAll: () => api.get('/Student'),
  create: (data) => api.post('/Student', data),
  getByEmail: (email) => api.get(`/Student/student-by-email?email=${encodeURIComponent(email)}`),
  getByName: (name) => api.get(`/Student/student-by-name?name=${encodeURIComponent(name)}`),
  getByAdmission: (admissionNumber) => api.get(`/Student/by-admission/${admissionNumber}`),
  update: (id, data) => api.put(`/Student/${id}`, data),
  delete: (id) => api.delete(`/Student/${id}`),
  getStudentSubjects: (className, stream) => 
    api.get(`/Student/student-subjects?className=${encodeURIComponent(className)}&stream=${encodeURIComponent(stream)}`),
  getMySubjects: () => api.get('/Student/my-subjects'),
  getStudentResults: (admissionNumber, year, term) => 
    api.get(`/Student/student-results?admissionNumber=${encodeURIComponent(admissionNumber)}&year=${year}&term=${encodeURIComponent(term)}`),
  getMyMarks: (subjectId, year, term) => 
    api.get(`/Student/my-marks/${subjectId}?year=${year}&term=${encodeURIComponent(term)}`),
  getStudentMarks: (studentId, year, term) => 
    api.get(`/Student/marks/${studentId}?year=${year}&term=${encodeURIComponent(term)}`),
  getStudentRank: (studentId, year, term) => 
    api.get(`/Student/rank/${studentId}?year=${year}&term=${encodeURIComponent(term)}`),
  getClassRankings: (className, year, term) => 
    api.get(`/Student/class-ranking?className=${encodeURIComponent(className)}&year=${year}&term=${encodeURIComponent(term)}`),
  getDashboard: () => api.get('/Student/dashboard'),
};

// ============================================
// SUBJECTS API (Matches Swagger: /api/Subjects) - ✅ CORRECTED
// ============================================
export const subjectAPI = {
  getAll: () => api.get('/Subjects'),
  create: (data) => api.post('/Subjects', data),
};

// ============================================
// NOTIFICATIONS API (Matches Swagger: /api/Notifications) - ✅ CORRECTED
// ============================================
export const notificationsAPI = {
  getStudentNotifications: () => api.get('/Notifications/student'),
  getTeacherNotifications: () => api.get('/Notifications/teacher'),
  getAdminNotifications: () => api.get('/Notifications/admin'),
  getUnreadCount: () => api.get('/Notifications/unread-count'),
  markAsRead: (id) => api.put(`/Notifications/${id}/read`),
  markAllAsRead: () => api.put('/Notifications/read-all'),
  send: (data) => api.post('/Notifications/send', data),
};

// ============================================
// TEACHER MARKS API (Matches Swagger: /api/TeacherMarks) - ✅ CORRECTED
// ============================================
export const teacherMarksAPI = {
  getMyStudents: () => api.get('/TeacherMarks/my-students'),
  getStudentMarks: (studentId, subjectId, year, term) => 
    api.get(`/TeacherMarks/student-marks/${studentId}/${subjectId}/${year}/${encodeURIComponent(term)}`),
  enterMarks: (data) => api.post('/TeacherMarks/enter-marks', data),
  publishResults: (subjectId, year, term) => 
    api.post(`/TeacherMarks/publish-results/${subjectId}/${year}/${encodeURIComponent(term)}`),
};

export default api;