import axios from 'axios'
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://school-yathu.onrender.com/api';
const USE_MOCK_DATA = false;

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

// ============= API Exports =============

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
  getMySubjects: () => api.get('/Student/my-subjects'),
  getMyMarks: (subjectId, year, term) => 
    api.get(`/Student/my-marks/${subjectId}?year=${year}&term=${term}`),
  getDashboard: () => api.get('/Student/dashboard'),
};

export const teacherMarksAPI = {
  getMyStudents: () => api.get('/TeacherMarks/my-students'),
  getStudentMarks: (studentId, subjectId, year, term) => 
    api.get(`/TeacherMarks/student-marks/${studentId}/${subjectId}/${year}/${term}`),
  enterMarks: (data) => api.post('/TeacherMarks/enter-marks', data),
  publishResults: (subjectId, year, term) => 
    api.post(`/TeacherMarks/publish-results/${subjectId}/${year}/${term}`),
  getNotifications: () => api.get('/TeacherMarks/notifications'),
  markAsRead: (id) => api.put(`/TeacherMarks/notifications/${id}/read`),
  markAllAsRead: () => api.put('/TeacherMarks/notifications/mark-all-read'),
  getUnreadCount: () => api.get('/TeacherMarks/notifications/unread-count'),
};

export const adminAPI = {
  getTeachers: () => api.get('/admin/teachers'),
  addTeacher: (data) => api.post('/admin/teachers', data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  getClasses: () => api.get('/admin/classes'),
  addClass: (data) => api.post('/admin/classes', data),
  updateClass: (id, data) => api.put(`/admin/classes/${id}`, data),
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
  getClassSubjects: (classId) => api.get(`/TeacherSubjects/class-subjects/${classId}`),
  assignToClass: (data) => api.post('/TeacherSubjects/assign-to-class', data),
  getAllAssignments: () => api.get('/TeacherSubjects/all-assignments'),
  getAllClassAssignments: () => api.get('/TeacherSubjects/all-class-assignments'),
  removeFromClass: (id) => api.delete(`/TeacherSubjects/remove-from-class/${id}`),
  removeAssignment: (id) => api.delete(`/TeacherSubjects/remove/${id}`),
  getAvailableSubjects: () => api.get('/TeacherSubjects/available-subjects'),
};

export const studentSubjectAPI = {
  getAvailableSubjects: () => api.get('/StudentSubject/available-subjects'),
  registerSubject: (subjectId) => api.post('/StudentSubject/register', { subjectId }),
  getMySubjects: () => api.get('/StudentSubject/my-subjects'),
  getTeacherStudents: () => api.get('/StudentSubject/teacher-students'),
};

export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
};

export const studentNotificationsAPI = {
  getMyNotifications: () => api.get('/StudentNotifications/my-notifications'),
  getUnreadCount: () => api.get('/StudentNotifications/unread-count'),
  markAsRead: (id) => api.put(`/StudentNotifications/${id}/read`),
  markAllAsRead: () => api.put('/StudentNotifications/mark-all-read'),
};

export const adminSubjectAllocationAPI = {
  getAvailableSubjects: () => api.get('/AdminSubjectAllocation/available-subjects'),
  getTeachers: () => api.get('/AdminSubjectAllocation/teachers'),
  getClasses: () => api.get('/AdminSubjectAllocation/classes'),
  getStudentsByClass: (className, stream) => 
    api.get(`/AdminSubjectAllocation/students-by-class/${className}/${stream}`),
  getStudentAllocations: (classId, year) => 
    api.get(`/AdminSubjectAllocation/student-allocations?classId=${classId}&year=${year}`),
  getStudentSubjects: (studentId, year) => 
    api.get(`/AdminSubjectAllocation/student-subjects/${studentId}?year=${year}`),
  allocateToStudent: (data) => api.post('/AdminSubjectAllocation/allocate-subjects-to-student', data),
  bulkAllocateToClass: (data) => api.post('/AdminSubjectAllocation/bulk-allocate-to-class', data),
  removeAllocation: (allocationId) => 
    api.delete(`/AdminSubjectAllocation/remove-allocation/${allocationId}`),
  getAvailableSubjectsForStudent: (studentId, year) => 
    api.get(`/AdminSubjectAllocation/available-subjects-for-student/${studentId}?year=${year}`),
  getSummary: () => api.get('/AdminSubjectAllocation/summary'),
};

export const studentRegistrationAPI = {
  getAvailableSubjects: (className, stream, root) => 
    api.get(`/StudentRegistration/available-subjects/${className}/${stream}?root=${root || ''}`),
  getRegisteredStudents: (className, stream, year) => 
    api.get(`/StudentRegistration/registered-students?className=${className || ''}&stream=${stream || ''}&year=${year || ''}`),
  registerStudent: (data) => api.post('/StudentRegistration/register', data),
  getStudentDetails: (studentId) => api.get(`/StudentRegistration/student-details/${studentId}`),
  updateStudent: (studentId, data) => api.put(`/StudentRegistration/update/${studentId}`, data),
};

export default api;