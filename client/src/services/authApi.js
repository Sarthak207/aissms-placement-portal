import axiosInstance from './axiosInstance';

export const authApi = {
  register: (payload) => axiosInstance.post('/auth/register', payload),
  login: (payload) => axiosInstance.post('/auth/login', payload),
  refresh: () => axiosInstance.post('/auth/refresh'),
  logout: () => axiosInstance.post('/auth/logout'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosInstance.post('/auth/reset-password', payload),
  me: () => axiosInstance.get('/auth/me'),
};
