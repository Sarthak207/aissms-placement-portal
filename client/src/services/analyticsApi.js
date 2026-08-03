import axiosInstance from './axiosInstance';

export const analyticsApi = {
  overview: () => axiosInstance.get('/analytics/overview'),
  trends: () => axiosInstance.get('/analytics/trends'),
  topRecruiters: (limit) => axiosInstance.get('/analytics/top-recruiters', { params: { limit } }),
  funnel: () => axiosInstance.get('/analytics/funnel'),
};
