import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentAdmin: () => api.get('/auth/me'),
};

// Department API
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getStats: (code) => api.get(`/departments/${code}/stats`),
};

// Student API
export const studentAPI = {
  filterForPlacements: (params) => api.get('/students/filter/placements', { params }),
  getFilterOptions: () => api.get('/students/filter-options'),
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getByRegNo: (regNo) => api.get(`/students/regno/${regNo}`),
  getByDeptAndYear: (deptCode, year) => api.get(`/students/filter/${deptCode}/${year}`),
  getPlacedStudents: (params) => api.get('/students/placed', { params }),
  getTopPerformers: (params) => api.get('/students/analytics/top-performers', { params }),
  getPlacementStats: () => api.get('/students/analytics/placements'),
  getPlacementStats: (params) => api.get('/students/analytics/placements', { params }),
  getDashboardStats: () => api.get('/students/analytics/dashboard'),
  update: (id, data) => api.put(`/students/${id}`, data),
};

export default api;