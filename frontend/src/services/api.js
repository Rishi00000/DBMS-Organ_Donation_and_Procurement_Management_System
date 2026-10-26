import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
};

// Hospital APIs
export const hospitalAPI = {
  getAll: (params) => api.get('/hospitals', { params }),
  getById: (id) => api.get(`/hospitals/${id}`),
  create: (data) => api.post('/hospitals', data),
  update: (id, data) => api.put(`/hospitals/${id}`, data),
  approve: (id) => api.put(`/hospitals/${id}/approve`),
  reject: (id) => api.put(`/hospitals/${id}/reject`),
  getStaff: (id) => api.get(`/hospitals/${id}/staff`),
};

// Donor APIs
export const donorAPI = {
  getAll: (params) => api.get('/donors', { params }),
  getById: (id) => api.get(`/donors/${id}`),
  create: (data) => api.post('/donors', data),
  update: (id, data) => api.put(`/donors/${id}`, data),
  delete: (id) => api.delete(`/donors/${id}`),
};

// Recipient APIs
export const recipientAPI = {
  getAll: (params) => api.get('/recipients', { params }),
  getById: (id) => api.get(`/recipients/${id}`),
  create: (data) => api.post('/recipients', data),
  update: (id, data) => api.put(`/recipients/${id}`, data),
  delete: (id) => api.delete(`/recipients/${id}`),
  getWaitlist: () => api.get('/recipients/waitlist'),
};

// Organ APIs
export const organAPI = {
  getAll: (params) => api.get('/organs', { params }),
  getAvailable: () => api.get('/organs/available'),
  getById: (id) => api.get(`/organs/${id}`),
  create: (data) => api.post('/organs', data),
  update: (id, data) => api.put(`/organs/${id}`, data),
  delete: (id) => api.delete(`/organs/${id}`),
  triggerMatching: (id) => api.post(`/organs/${id}/match`),
};

// Match APIs
export const matchAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  getRecipientMatches: (recipientId) => api.get(`/matches/recipient/${recipientId}`),
  accept: (id) => api.post(`/matches/${id}/accept`),
  reject: (id, reason) => api.post(`/matches/${id}/reject`, { reason }),
  getStats: () => api.get('/matches/stats'),
};

// Transplant APIs
export const transplantAPI = {
  getAll: (params) => api.get('/transplants', { params }),
  getById: (id) => api.get(`/transplants/${id}`),
  updateStatus: (id, data) => api.put(`/transplants/${id}/status`, data),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  generateReport: (params) => api.get('/admin/reports', { params }),
};

export default api;
