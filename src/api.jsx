import axios from 'axios';

// TEMPORARY: Use mock data instead of real API
const USE_MOCK_DATA = true;  // Set to false when backend is ready

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

// Mock responses for testing
if (USE_MOCK_DATA) {
  // Intercept requests and return mock data
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log('API Error (using mock data):', error.config?.url);
      
      // Mock responses based on URL
      const url = error.config?.url || '';
      
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          data: {
            token: 'mock-token-123',
            user: { id: 1, name: 'Test User', role: 'Admin' }
          }
        });
      }
      
      if (url.includes('/admin/teachers')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Mathematics' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', subject: 'English' }
          ]
        });
      }
      
      if (url.includes('/admin/classes')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Form 1A', capacity: 40 },
            { id: 2, name: 'Form 1B', capacity: 38 }
          ]
        });
      }
      
      // Default mock response
      return Promise.resolve({ data: [] });
    }
  );
}

// Your existing API exports remain the same...
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const studentAPI = {
  getAll: () => api.get('/Student'),
  getById: (id) => api.get(`/Student/${id}`),
  create: (data) => api.post('/Student', data),
  getStudentMarks: (studentId, year, term) => 
    api.get(`/Student/marks/${studentId}?year=${year}&term=${term}`),
  getStudentRank: (studentId, year, term) => 
    api.get(`/Student/rank/${studentId}?year=${year}&term=${term}`),
};

export const teacherMarksAPI = {
  getMyStudents: () => api.get('/TeacherMarks/my-students'),
  enterMarks: (data) => api.post('/TeacherMarks/enter-marks', data),
  publishResults: (subjectId, year, term) => 
    api.post(`/TeacherMarks/publish-results/${subjectId}/${year}/${term}`),
  getNotifications: () => api.get('/TeacherMarks/notifications'),
  markAsRead: (id) => api.put(`/TeacherMarks/notifications/${id}/read`),
  getUnreadCount: () => api.get('/TeacherMarks/notifications/unread-count'),
};

export const adminAPI = {
  getTeachers: () => api.get('/admin/teachers'),
  addTeacher: (data) => api.post('/admin/teachers', data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  getClasses: () => api.get('/admin/classes'),
  addClass: (data) => api.post('/admin/classes', data),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  allocateTeacher: (data) => api.post('/admin/allocate-teacher', data),
  getClassAllocations: (classId) => api.get(`/admin/class-allocations/${classId}`),
  removeAllocation: (id) => api.delete(`/admin/allocations/${id}`),
  getPendingResults: () => api.get('/ResultsApproval/pending-results'),
  getResultsDetails: (subjectId, year, term) => 
    api.get(`/ResultsApproval/results-details/${subjectId}/${year}/${term}`),
  approveResults: (data) => api.post('/ResultsApproval/approve-results', data),
  getApprovedResults: () => api.get('/ResultsApproval/approved-results'),
  getAllStudents: () => api.get('/admin/all-students'),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
};

export const teacherSubjectsAPI = {
  getMySubjects: () => api.get('/TeacherSubjects/my-subjects'),
};

export const studentSubjectAPI = {
  getAvailableSubjects: () => api.get('/StudentSubject/available-subjects'),
  registerSubject: (subjectId) => api.post('/StudentSubject/register', { subjectId }),
  getMySubjects: () => api.get('/StudentSubject/my-subjects'),
  getTeacherStudents: () => api.get('/StudentSubject/teacher-students'),
};

export const subjectAPI = {
  getAll: () => api.get('/subjects'),
};

export const studentNotificationsAPI = {
  getMyNotifications: () => api.get('/StudentNotifications/my-notifications'),
  getUnreadCount: () => api.get('/StudentNotifications/unread-count'),
  markAsRead: (id) => api.put(`/StudentNotifications/${id}/read`),
  markAllAsRead: () => api.put('/StudentNotifications/mark-all-read'),
};

export default api;