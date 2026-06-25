import axios from 'axios';

const API_BASE_URL = 'https://school-yathu.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config?.url);
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data?.message || 'Internal server error');
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API (Matches Swagger: /api/Auth)
// ============================================
export const authAPI = {
  // POST /api/Auth/login
  login: (data) => api.post('/Auth/login', data),
  
  // POST /api/Auth/change-password
  changePassword: (data) => api.post('/Auth/change-password', data),
  
  // POST /api/Auth/register (Admin only)
  register: (data) => api.post('/Auth/register', data),
  
  // POST /api/Auth/reset-password/{userId} (Admin only)
  resetPassword: (userId) => api.post(`/Auth/reset-password/${userId}`),
  
  // POST /api/Auth/generate-email (Admin only)
  generateEmail: (data) => api.post('/Auth/generate-email', data),
  
  // POST /api/Auth/generate-password (Admin only)
  generatePassword: () => api.post('/Auth/generate-password'),
};

// ============================================
// ADMIN API (Matches Swagger: /api/Admin)
// ============================================
export const adminAPI = {
  // GET /api/Admin/teachers
  getTeachers: () => api.get('/Admin/teachers'),
  
  // POST /api/Admin/teachers
  addTeacher: (data) => api.post('/Admin/teachers', data),
  
  // PUT /api/Admin/teachers/{id}
  updateTeacher: (id, data) => api.put(`/Admin/teachers/${id}`, data),
  
  // DELETE /api/Admin/teachers/{id}
  deleteTeacher: (id) => api.delete(`/Admin/teachers/${id}`),
  
  // GET /api/Admin/classes
  getClasses: () => api.get('/Admin/classes'),
  
  // POST /api/Admin/classes
  addClass: (data) => api.post('/Admin/classes', data),
  
  // PUT /api/Admin/classes/{id}
  updateClass: (id, data) => api.put(`/Admin/classes/${id}`, data),
  
  // DELETE /api/Admin/classes/{id}
  deleteClass: (id) => api.delete(`/Admin/classes/${id}`),
  
  // GET /api/Admin/all-students
  getAllStudents: () => api.get('/Admin/all-students'),
  
  // PUT /api/Admin/students/{id}
  updateStudent: (id, data) => api.put(`/Admin/students/${id}`, data),
  
  // DELETE /api/Admin/students/{id}
  deleteStudent: (id) => api.delete(`/Admin/students/${id}`),
  
  // POST /api/Admin/allocate-teacher
  allocateTeacher: (data) => api.post('/Admin/allocate-teacher', data),
  
  // GET /api/Admin/class-allocations/{classId}
  getClassAllocations: (classId) => api.get(`/Admin/class-allocations/${classId}`),
  
  // DELETE /api/Admin/allocations/{id}
  removeAllocation: (id) => api.delete(`/Admin/allocations/${id}`),
};

// ============================================
// STUDENT API (Matches Swagger: /api/Student)
// ============================================
export const studentAPI = {
  // GET /api/Student
  getAll: () => api.get('/Student'),
  
  // POST /api/Student
  create: (data) => api.post('/Student', data),
  
  // GET /api/Student/student-by-email
  getByEmail: (email) => api.get(`/Student/student-by-email?email=${encodeURIComponent(email)}`),
  
  // GET /api/Student/student-by-name
  getByName: (name) => api.get(`/Student/student-by-name?name=${encodeURIComponent(name)}`),
  
  // GET /api/Student/by-admission/{admissionNumber}
  getByAdmission: (admissionNumber) => api.get(`/Student/by-admission/${admissionNumber}`),
  
  // PUT /api/Student/{id}
  update: (id, data) => api.put(`/Student/${id}`, data),
  
  // DELETE /api/Student/{id}
  delete: (id) => api.delete(`/Student/${id}`),
  
  // GET /api/Student/student-subjects
  getStudentSubjects: (className, stream) => 
    api.get(`/Student/student-subjects?className=${encodeURIComponent(className)}&stream=${encodeURIComponent(stream)}`),
  
  // GET /api/Student/my-subjects
  getMySubjects: () => api.get('/Student/my-subjects'),
  
  // GET /api/Student/student-results
  getStudentResults: (admissionNumber, year, term) => 
    api.get(`/Student/student-results?admissionNumber=${encodeURIComponent(admissionNumber)}&year=${year}&term=${encodeURIComponent(term)}`),
  
  // GET /api/Student/my-marks/{subjectId}
  getMyMarks: (subjectId, year, term) => 
    api.get(`/Student/my-marks/${subjectId}?year=${year}&term=${encodeURIComponent(term)}`),
  
  // GET /api/Student/marks/{studentId}
  getStudentMarks: (studentId, year, term) => 
    api.get(`/Student/marks/${studentId}?year=${year}&term=${encodeURIComponent(term)}`),
  
  // GET /api/Student/rank/{studentId}
  getStudentRank: (studentId, year, term) => 
    api.get(`/Student/rank/${studentId}?year=${year}&term=${encodeURIComponent(term)}`),
  
  // GET /api/Student/class-ranking
  getClassRankings: (className, year, term) => 
    api.get(`/Student/class-ranking?className=${encodeURIComponent(className)}&year=${year}&term=${encodeURIComponent(term)}`),
  
  // GET /api/Student/dashboard
  getDashboard: () => api.get('/Student/dashboard'),
};

// ============================================
// TEACHER MARKS API (Matches Swagger: /api/TeacherMarks)
// ============================================
export const teacherMarksAPI = {
  // GET /api/TeacherMarks/my-students
  getMyStudents: () => api.get('/TeacherMarks/my-students'),
  
  // GET /api/TeacherMarks/student-marks/{studentId}/{subjectId}/{year}/{term}
  getStudentMarks: (studentId, subjectId, year, term) => 
    api.get(`/TeacherMarks/student-marks/${studentId}/${subjectId}/${year}/${encodeURIComponent(term)}`),
  
  // POST /api/TeacherMarks/enter-marks
  enterMarks: (data) => api.post('/TeacherMarks/enter-marks', data),
  
  // POST /api/TeacherMarks/publish-results/{subjectId}/{year}/{term}
  publishResults: (subjectId, year, term) => 
    api.post(`/TeacherMarks/publish-results/${subjectId}/${year}/${encodeURIComponent(term)}`),
};

// ============================================
// TEACHER SUBJECTS API (Matches Swagger: /api/TeacherSubjects)
// ============================================
export const teacherSubjectsAPI = {
  // GET /api/TeacherSubjects/my-subjects
  getMySubjects: () => api.get('/TeacherSubjects/my-subjects'),
  
  // POST /api/TeacherSubjects/assign (Admin only)
  assign: (data) => api.post('/TeacherSubjects/assign', data),
  
  // GET /api/TeacherSubjects/all-assignments (Admin only)
  getAllAssignments: () => api.get('/TeacherSubjects/all-assignments'),
  
  // DELETE /api/TeacherSubjects/remove/{id} (Admin only)
  remove: (id) => api.delete(`/TeacherSubjects/remove/${id}`),
};

// ============================================
// STUDENT SUBJECT API (Matches Swagger: /api/StudentSubject)
// ============================================
export const studentSubjectAPI = {
  // GET /api/StudentSubject/available-subjects
  getAvailableSubjects: () => api.get('/StudentSubject/available-subjects'),
  
  // POST /api/StudentSubject/register
  registerSubject: (subjectId) => api.post('/StudentSubject/register', { subjectId }),
  
  // GET /api/StudentSubject/my-subjects
  getMySubjects: () => api.get('/StudentSubject/my-subjects'),
  
  // GET /api/StudentSubject/teacher-students
  getTeacherStudents: () => api.get('/StudentSubject/teacher-students'),
};

// ============================================
// SUBJECTS API (Matches Swagger: /api/Subjects)
// ============================================
export const subjectAPI = {
  // GET /api/Subjects
  getAll: () => api.get('/Subjects'),
  
  // POST /api/Subjects (Admin only)
  create: (data) => api.post('/Subjects', data),
};

// ============================================
// NOTIFICATIONS API (Matches Swagger: /api/Notifications)
// ============================================
export const notificationsAPI = {
  // GET /api/Notifications/student
  getStudentNotifications: () => api.get('/Notifications/student'),
  
  // GET /api/Notifications/teacher
  getTeacherNotifications: () => api.get('/Notifications/teacher'),
  
  // GET /api/Notifications/admin
  getAdminNotifications: () => api.get('/Notifications/admin'),
  
  // GET /api/Notifications/unread-count
  getUnreadCount: () => api.get('/Notifications/unread-count'),
  
  // PUT /api/Notifications/{id}/read
  markAsRead: (id) => api.put(`/Notifications/${id}/read`),
  
  // PUT /api/Notifications/read-all
  markAllAsRead: () => api.put('/Notifications/read-all'),
  
  // POST /api/Notifications/send (Admin only)
  send: (data) => api.post('/Notifications/send', data),
};

// ============================================
// STUDENT NOTIFICATIONS API (Matches Swagger: /api/StudentNotifications)
// ============================================
export const studentNotificationsAPI = {
  // GET /api/StudentNotifications/my-notifications
  getMyNotifications: () => api.get('/StudentNotifications/my-notifications'),
  
  // GET /api/StudentNotifications/unread-count
  getUnreadCount: () => api.get('/StudentNotifications/unread-count'),
  
  // PUT /api/StudentNotifications/{id}/read
  markAsRead: (id) => api.put(`/StudentNotifications/${id}/read`),
  
  // PUT /api/StudentNotifications/mark-all-read
  markAllAsRead: () => api.put('/StudentNotifications/mark-all-read'),
};

// ============================================
// STUDENT REGISTRATION API (Matches Swagger: /api/StudentRegistration)
// ============================================
export const studentRegistrationAPI = {
  // GET /api/StudentRegistration/classes
  getClasses: () => api.get('/StudentRegistration/classes'),
  
  // GET /api/StudentRegistration/available-subjects/{className}/{stream}
  getAvailableSubjects: (className, stream, root) => 
    api.get(`/StudentRegistration/available-subjects/${encodeURIComponent(className)}/${encodeURIComponent(stream)}?root=${root || ''}`),
  
  // GET /api/StudentRegistration/registered-students
  getRegisteredStudents: (className, stream) => 
    api.get(`/StudentRegistration/registered-students?className=${className || ''}&stream=${stream || ''}`),
  
  // GET /api/StudentRegistration/student-subjects
  getStudentSubjects: (className, stream) => 
    api.get(`/StudentRegistration/student-subjects?className=${encodeURIComponent(className)}&stream=${encodeURIComponent(stream)}`),
  
  // POST /api/StudentRegistration/register
  registerStudent: (data) => api.post('/StudentRegistration/register', data),
  
  // GET /api/StudentRegistration/student-details/{studentId}
  getStudentDetails: (studentId) => api.get(`/StudentRegistration/student-details/${studentId}`),
  
  // PUT /api/StudentRegistration/update/{studentId}
  updateStudent: (studentId, data) => api.put(`/StudentRegistration/update/${studentId}`, data),
};

// ============================================
// ADMIN SUBJECT ALLOCATION API (Matches Swagger: /api/AdminSubjectAllocation)
// ============================================
export const adminSubjectAllocationAPI = {
  // GET /api/AdminSubjectAllocation/available-subjects
  getAvailableSubjects: () => api.get('/AdminSubjectAllocation/available-subjects'),
  
  // GET /api/AdminSubjectAllocation/teachers
  getTeachers: () => api.get('/AdminSubjectAllocation/teachers'),
  
  // GET /api/AdminSubjectAllocation/classes
  getClasses: () => api.get('/AdminSubjectAllocation/classes'),
  
  // GET /api/AdminSubjectAllocation/students-by-class/{className}/{stream}
  getStudentsByClass: (className, stream) => 
    api.get(`/AdminSubjectAllocation/students-by-class/${encodeURIComponent(className)}/${encodeURIComponent(stream)}`),
  
  // GET /api/AdminSubjectAllocation/student-allocations
  getStudentAllocations: (classId, year) => 
    api.get(`/AdminSubjectAllocation/student-allocations?classId=${classId}&year=${year || ''}`),
  
  // GET /api/AdminSubjectAllocation/student-subjects/{studentId}
  getStudentSubjects: (studentId, year) => 
    api.get(`/AdminSubjectAllocation/student-subjects/${studentId}?year=${year || ''}`),
  
  // POST /api/AdminSubjectAllocation/allocate-subjects-to-student
  allocateToStudent: (data) => api.post('/AdminSubjectAllocation/allocate-subjects-to-student', data),
  
  // POST /api/AdminSubjectAllocation/bulk-allocate-to-class
  bulkAllocateToClass: (data) => api.post('/AdminSubjectAllocation/bulk-allocate-to-class', data),
  
  // DELETE /api/AdminSubjectAllocation/remove-allocation/{allocationId}
  removeAllocation: (allocationId) => api.delete(`/AdminSubjectAllocation/remove-allocation/${allocationId}`),
  
  // GET /api/AdminSubjectAllocation/available-subjects-for-student/{studentId}
  getAvailableSubjectsForStudent: (studentId, year) => 
    api.get(`/AdminSubjectAllocation/available-subjects-for-student/${studentId}?year=${year || ''}`),
  
  // POST /api/AdminSubjectAllocation/allocate-teacher-to-subject
  allocateTeacherToSubject: (data) => api.post('/AdminSubjectAllocation/allocate-teacher-to-subject', data),
  
  // GET /api/AdminSubjectAllocation/summary
  getSummary: () => api.get('/AdminSubjectAllocation/summary'),
};

// ============================================
// RESULTS APPROVAL API (Matches Swagger: /api/ResultsApproval)
// ============================================
export const resultsApprovalAPI = {
  // GET /api/ResultsApproval/pending-results
  getPendingResults: () => api.get('/ResultsApproval/pending-results'),
  
  // GET /api/ResultsApproval/results-details/{subjectId}/{year}/{term}
  getResultsDetails: (subjectId, year, term) => 
    api.get(`/ResultsApproval/results-details/${subjectId}/${year}/${encodeURIComponent(term)}`),
  
  // POST /api/ResultsApproval/approve-results
  approveResults: (data) => api.post('/ResultsApproval/approve-results', data),
  
  // GET /api/ResultsApproval/approved-results
  getApprovedResults: () => api.get('/ResultsApproval/approved-results'),
};

// ============================================
// RESULTS API (Matches Swagger: /api/Results)
// ============================================
export const resultsAPI = {
  // GET /api/Results/student-results
  getStudentResults: (admissionNumber, year, term) => 
    api.get(`/Results/student-results?admissionNumber=${encodeURIComponent(admissionNumber)}&year=${year}&term=${encodeURIComponent(term)}`),
};

// ============================================
// USERS API (Matches Swagger: /api/Users)
// ============================================
export const usersAPI = {
  // GET /api/Users/teachers
  getTeachers: () => api.get('/Users/teachers'),
};

// ============================================
// HEALTH CHECK
// ============================================
export const healthAPI = {
  // GET /health
  check: () => api.get('/health'),
};

// Default export for the configured axios instance
export default api;