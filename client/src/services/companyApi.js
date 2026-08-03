import axiosInstance from './axiosInstance';

export const companyApi = {
  create: (payload) => axiosInstance.post('/companies', payload),
  getMine: () => axiosInstance.get('/companies/me'),
  list: (params) => axiosInstance.get('/companies', { params }),
  getById: (id) => axiosInstance.get(`/companies/${id}`),
  update: (id, payload) => axiosInstance.put(`/companies/${id}`, payload),
  approve: (id, status) => axiosInstance.patch(`/companies/${id}/approve`, { status }),
  bookmark: (id) => axiosInstance.post(`/companies/${id}/bookmark`),
};
