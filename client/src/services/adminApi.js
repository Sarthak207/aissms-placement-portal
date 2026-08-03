import axiosInstance from './axiosInstance';

export const adminApi = {
  listDepartments: () => axiosInstance.get('/admin/departments'),
  createDepartment: (payload) => axiosInstance.post('/admin/departments', payload),
  listBranches: () => axiosInstance.get('/admin/branches'),
  createBranch: (payload) => axiosInstance.post('/admin/branches', payload),
  listUsers: (params) => axiosInstance.get('/admin/users', { params }),
  createUser: (payload) => axiosInstance.post('/admin/users', payload),
  updateUser: (id, payload) => axiosInstance.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  auditLogs: (params) => axiosInstance.get('/admin/audit-logs', { params }),
};
