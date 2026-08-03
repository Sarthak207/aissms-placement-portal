import axiosInstance from './axiosInstance';

export const applicationApi = {
  apply: (driveId) => axiosInstance.post('/applications', { driveId }),
  withdraw: (id) => axiosInstance.delete(`/applications/${id}`),
  myApplications: () => axiosInstance.get('/applications/me'),
  getById: (id) => axiosInstance.get(`/applications/${id}`),
  updateStatus: (id, payload) => axiosInstance.patch(`/applications/${id}/status`, payload),
};
