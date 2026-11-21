import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('remotejob_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 unauth
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      if (localStorage.getItem('remotejob_token')) {
        localStorage.removeItem('remotejob_token');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login/', { email, password }),
  register: (data) => apiClient.post('/auth/register/', data),
  getMe: () => apiClient.get('/auth/me/'),
};

export const jobsAPI = {
  getJobs: (params) => apiClient.get('/jobs/', { params }),
  getJobDetail: (id) => apiClient.get(`/jobs/${id}/`),
  createJob: (data) => apiClient.post('/jobs/', data),
  updateJob: (id, data) => apiClient.put(`/jobs/${id}/`, data),
  deleteJob: (id) => apiClient.delete(`/jobs/${id}/`),
  applyToJob: (jobId, data) => apiClient.post(`/jobs/${jobId}/apply/`, data),
  saveJobToggle: (jobId) => apiClient.post(`/jobs/${jobId}/save/`),
  getSavedJobs: () => apiClient.get('/candidate/saved-jobs/'),
};

export const candidateAPI = {
  getProfile: () => apiClient.get('/candidate/profile/'),
  updateProfile: (data) => apiClient.put('/candidate/profile/', data),
  uploadResume: (formData) => apiClient.post('/candidate/resume/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResumes: () => apiClient.get('/candidate/resumes/'),
  getApplications: () => apiClient.get('/candidate/applications/'),
  withdrawApplication: (appId) => apiClient.post(`/candidate/applications/${appId}/withdraw/`),
};

export const recruiterAPI = {
  getProfile: () => apiClient.get('/recruiter/profile/'),
  updateProfile: (data) => apiClient.put('/recruiter/profile/', data),
  getJobs: () => apiClient.get('/recruiter/jobs/'),
  getJobApplications: (jobId, params) => apiClient.get(`/recruiter/jobs/${jobId}/applications/`, { params }),
  updateApplicationStatus: (appId, data) => apiClient.patch(`/recruiter/applications/${appId}/status/`, data),
  revealIdentity: (appId, reason) => apiClient.post(`/recruiter/applications/${appId}/reveal/`, { reason }),
  scheduleInterview: (appId, data) => apiClient.post(`/recruiter/applications/${appId}/schedule-interview/`, data),
  getTalent: (params) => apiClient.get('/recruiter/talent/', { params }),
};

export const interviewAPI = {
  getInterviews: () => apiClient.get('/interviews/'),
  updateStatus: (id, data) => apiClient.post(`/interviews/${id}/status/`, data),
  getIcsUrl: (id) => `${API_BASE}/interviews/${id}/ics/`,
};

export const notificationAPI = {
  getNotifications: () => apiClient.get('/notifications/'),
  markRead: (id) => apiClient.post(`/notifications/${id}/read/`),
  markAllRead: () => apiClient.post('/notifications/read-all/'),
};

export const publicAPI = {
  getCategories: () => apiClient.get('/public/categories/'),
  getFeaturedJobs: () => apiClient.get('/public/featured-jobs/'),
  getFAQs: () => apiClient.get('/public/faqs/'),
};

export const adminAPI = {
  getStats: () => apiClient.get('/admin/stats/'),
  getUsers: () => apiClient.get('/admin/users/'),
  toggleUserActive: (id) => apiClient.post(`/admin/users/${id}/toggle-active/`),
  getAuditLogs: () => apiClient.get('/admin/audit-logs/'),
};

export default apiClient;
