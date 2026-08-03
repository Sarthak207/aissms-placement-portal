import axiosInstance from './axiosInstance';

function download(blob, filename) {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export const reportApi = {
  downloadPlacementReport: async (format = 'pdf') => {
    const { data } = await axiosInstance.get('/reports/placement', { params: { format }, responseType: 'blob' });
    download(data, `placement-report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  },
  downloadBranchReport: async (branchId, format = 'pdf') => {
    const { data } = await axiosInstance.get(`/reports/branch/${branchId}`, { params: { format }, responseType: 'blob' });
    download(data, `branch-report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  },
};
