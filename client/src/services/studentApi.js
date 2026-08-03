import axiosInstance from './axiosInstance';

export const studentApi = {
  getMe: () => axiosInstance.get('/students/me'),
  updateMe: (payload) => axiosInstance.put('/students/me', payload),
  uploadResume: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return axiosInstance.post('/students/me/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('photo', file);
    return axiosInstance.post('/students/me/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  list: (params) => axiosInstance.get('/students', { params }),
  getById: (id) => axiosInstance.get(`/students/${id}`),
  verify: (id, payload) => axiosInstance.patch(`/students/${id}/verify`, payload),
};
