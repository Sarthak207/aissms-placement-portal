import axiosInstance from './axiosInstance';

export const offerApi = {
  issue: (payload) => axiosInstance.post('/offers', payload),
  myOffers: () => axiosInstance.get('/offers/me'),
  download: (id) => axiosInstance.get(`/offers/${id}/download`),
};
