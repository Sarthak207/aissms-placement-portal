import axiosInstance from './axiosInstance';

export const announcementApi = {
  list: (params) => axiosInstance.get('/announcements', { params }),
  create: (payload) => axiosInstance.post('/announcements', payload),
};
