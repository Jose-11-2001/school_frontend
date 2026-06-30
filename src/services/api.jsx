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
// AUTH API
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
// ADMIN API
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
  getDepartments: () => api.get('/Admin/departments'),
  createDepartment: (data) => api.post('/Admin/departments', data),
  updateDepartment: (id, data) => api.put(`/Admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/Admin/departments/${id}`),
  assignHeadOfDepartment: (data) => api.post('/Admin/assign-head-of-department', data),
  removeHeadOfDepartment: (departmentId) => api.post(`/Admin/remove-head-of-department`, { departmentId }),
  assignFormTeacher: (data) => api.post('/Admin/assign-form-teacher', data),
  getSubjects: () => api.get('/Admin/subjects'),
  createSubject: (data) => api.post('/Admin/subjects', data),
  updateSubject: (id, data) => api.put(`/Admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/Admin/subjects/${id}`),
  getPendingResults: () => api.get('/Admin/pending-results'),
  approveResults: (data) => api.post('/Admin/approve-results', data),
  getApprovedResults: () => api.get('/Admin/approved-results'),
  getStatistics: () => api.get('/Admin/statistics'),
  getStudentsByClass: (classId) => api.get(`/Admin/students-by-class/${classId}`),
  getTeacherSubjects: (teacherId) => api.get(`/Admin/teacher-subjects/${teacherId}`),
};

// ============================================
// STUDENT API
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
  getAvailableSubjects: () => api.get('/Student/available-subjects'),
  selectSubject: (data) => api.post('/Student/select-subject', data),
};

// ============================================
// CONTACTS API
// ============================================
export const contactsAPI = {
  getContacts: () => api.get('/Contacts'),
};

// ============================================
// SUBJECTS API
// ============================================
export const subjectAPI = {
  getAll: () => api.get('/Subjects'),
  create: (data) => api.post('/Subjects', data),
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsAPI = {
  getStudentNotifications: () => api.get('/Notifications/student'),
  getTeacherNotifications: () => api.get('/Notifications/teacher'),
  getAdminNotifications: () => api.get('/Notifications/admin'),
  getHeadOfDepartmentNotifications: () => api.get('/Notifications/head-of-department'),
  getFormTeacherNotifications: () => api.get('/Notifications/form-teacher'),
  getUnreadCount: () => api.get('/Notifications/unread-count'),
  markAsRead: (id) => api.put(`/Notifications/${id}/read`),
  markAllAsRead: () => api.put('/Notifications/read-all'),
  send: (data) => api.post('/Notifications/send', data),
};

// ============================================
// TEACHER MARKS API
// ============================================
export const teacherMarksAPI = {
  getMyStudents: () => api.get('/TeacherMarks/my-students'),
  getStudentMarks: (studentId, subjectId, year, term) => 
    api.get(`/TeacherMarks/student-marks/${studentId}/${subjectId}/${year}/${encodeURIComponent(term)}`),
  enterMarks: (data) => api.post('/TeacherMarks/enter-marks', data),
  publishResults: (subjectId, year, term) => 
    api.post(`/TeacherMarks/publish-results/${subjectId}/${year}/${encodeURIComponent(term)}`),
  submitForApproval: (data) => api.post('/TeacherMarks/submit-for-approval', data),
};

// ============================================
// TEACHER SUBJECTS API
// ============================================
export const teacherSubjectsAPI = {
  getMySubjects: () => api.get('/TeacherSubjects/my-subjects'),
  assign: (data) => api.post('/TeacherSubjects/assign', data),
  getAllAssignments: () => api.get('/TeacherSubjects/all-assignments'),
  remove: (id) => api.delete(`/TeacherSubjects/remove/${id}`),
};

// ============================================
// STUDENT SUBJECT API
// ============================================
export const studentSubjectAPI = {
  getAvailableSubjects: () => api.get('/StudentSubject/available-subjects'),
  register: (subjectId) => api.post('/StudentSubject/register', { subjectId }),
  getMySubjects: () => api.get('/StudentSubject/my-subjects'),
  getTeacherStudents: () => api.get('/StudentSubject/teacher-students'),
};

// ============================================
// RESULTS APPROVAL API
// ============================================
export const resultsApprovalAPI = {
  getPendingResults: () => api.get('/ResultsApproval/pending-results'),
  getResultsDetails: (subjectId, year, term) => 
    api.get(`/ResultsApproval/results-details/${subjectId}/${year}/${encodeURIComponent(term)}`),
  approveResults: (data) => api.post('/ResultsApproval/approve-results', data),
  getApprovedResults: () => api.get('/ResultsApproval/approved-results'),
  submitForApproval: (data) => api.post('/ResultsApproval/submit-for-approval', data),
};

// ============================================
// STUDENT REGISTRATION API
// ============================================
export const studentRegistrationAPI = {
  getClasses: () => api.get('/StudentRegistration/classes'),
  getAvailableSubjects: (className, stream, root) => 
    api.get(`/StudentRegistration/available-subjects/${encodeURIComponent(className)}/${encodeURIComponent(stream)}${root ? `?root=${encodeURIComponent(root)}` : ''}`),
  getRegisteredStudents: (className, stream) => 
    api.get(`/StudentRegistration/registered-students?className=${className || ''}&stream=${stream || ''}`),
  getStudentSubjects: (className, stream) => 
    api.get(`/StudentRegistration/student-subjects?className=${encodeURIComponent(className)}&stream=${encodeURIComponent(stream)}`),
  register: (data) => api.post('/StudentRegistration/register', data),
  getStudentDetails: (studentId) => api.get(`/StudentRegistration/student-details/${studentId}`),
  updateStudent: (studentId, data) => api.put(`/StudentRegistration/update/${studentId}`, data),
};

// ============================================
// HEAD OF DEPARTMENT API
// ============================================
export const hodAPI = {
  getMyDepartment: () => api.get('/HeadOfDepartment/my-department'),
  getDepartmentTeachers: () => api.get('/HeadOfDepartment/department-teachers'),
  getDepartmentSubjects: () => api.get('/HeadOfDepartment/department-subjects'),
  assignTeacherToSubject: (data) => api.post('/HeadOfDepartment/assign-teacher-to-subject', data),
  removeTeacherFromSubject: (assignmentId) => api.delete(`/HeadOfDepartment/remove-teacher-from-subject/${assignmentId}`),
  getDepartmentStudentResults: (year, term) => 
    api.get(`/HeadOfDepartment/department-student-results?year=${year}&term=${encodeURIComponent(term)}`),
  getDepartmentStats: () => api.get('/HeadOfDepartment/department-stats'),
  getPendingApprovals: (year, term) => 
    api.get(`/HeadOfDepartment/pending-approvals?year=${year}&term=${encodeURIComponent(term)}`),
  getActivityLog: () => api.get('/HeadOfDepartment/activity-log'),
  getPerformanceReport: (year, term) => 
    api.get(`/HeadOfDepartment/performance-report?year=${year}&term=${encodeURIComponent(term)}`),
};

// ============================================
// FORM TEACHER API
// ============================================
export const formTeacherAPI = {
  getMyClasses: () => api.get('/FormTeacher/my-classes'),
  getMyStudents: (classId) => api.get(`/FormTeacher/my-students${classId ? `?classId=${classId}` : ''}`),
  getSubjectSelections: (classId, pendingOnly) => 
    api.get(`/FormTeacher/subject-selections${classId ? `?classId=${classId}` : ''}${pendingOnly !== undefined ? `&pendingOnly=${pendingOnly}` : ''}`),
  approveSubjectSelection: (selectionId) => api.post(`/FormTeacher/approve-subject-selection/${selectionId}`),
  getClassResultsSummary: (year, term) => 
    api.get(`/FormTeacher/class-results-summary?year=${year}&term=${encodeURIComponent(term)}`),
  submitResults: (data) => api.post('/FormTeacher/submit-results', data),
};

export default api;