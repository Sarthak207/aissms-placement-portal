import axiosInstance from './axiosInstance';

export const interviewApi = {
  schedule: (payload) => axiosInstance.post('/interviews', payload),
  update: (id, payload) => axiosInstance.put(`/interviews/${id}`, payload),
  myInterviews: () => axiosInstance.get('/interviews/me'),
};
