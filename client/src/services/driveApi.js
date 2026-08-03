import axiosInstance from './axiosInstance';

export const driveApi = {
  create: (payload) => axiosInstance.post('/drives', payload),
  list: (params) => axiosInstance.get('/drives', { params }),
  getById: (id) => axiosInstance.get(`/drives/${id}`),
  update: (id, payload) => axiosInstance.put(`/drives/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/drives/${id}`),
  open: (id) => axiosInstance.patch(`/drives/${id}/open`),
  close: (id) => axiosInstance.patch(`/drives/${id}/close`),
  eligibleStudents: (id) => axiosInstance.get(`/drives/${id}/eligible-students`),
  applicants: (id, params) => axiosInstance.get(`/drives/${id}/applicants`, { params }),
  exportApplicants: (id) =>
    axiosInstance.get(`/drives/${id}/applicants`, { params: { export: 'excel' }, responseType: 'blob' }),
};
