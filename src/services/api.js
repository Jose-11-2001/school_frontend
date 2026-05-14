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
  enterMarks: (data) => api.post('/students/marks', data),
  getStudentMarks: (studentId, year, term) => 
    api.get(`/students/marks/${studentId}?year=${year}&term=${term}`),
  getStudentRank: (studentId, year, term) => 
    api.get(`/students/rank/${studentId}?year=${year}&term=${term}`),
  getClassRanking: (className, year, term) => 
    api.get(`/students/class-ranking?className=${className}&year=${year}&term=${term}`),
  getTopStudents: (year, term, top = 10) => 
    api.get(`/students/top-students?year=${year}&term=${term}&top=${top}`),
};

// Subject APIs
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
};

export default api;