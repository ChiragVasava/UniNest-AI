/**
 * API Service Layer
 * Handles all communication with backend
 * Manages JWT token attachment to requests
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - Attach token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        if (!config.headers) config.headers = {} as any;
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    // If sending FormData, remove any forced Content-Type so the browser/axios
    // can set the correct multipart boundary header.
    try {
      if (config && (config as any).data && typeof FormData !== 'undefined' && (config as any).data instanceof FormData) {
        if (config.headers && (config.headers as any)['Content-Type']) {
          delete (config.headers as any)['Content-Type'];
        }
      }
    } catch (e) {
      // ignore (FormData may not be available in some environments)
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // If 401 Unauthorized, token might be expired
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints are now defined at the bottom of the file

// Student endpoints
export const studentAPI = {
  create: (data: Record<string, unknown>) => api.post('/students', data),
  getById: (id: string) => api.get(`/students/${id}`),
  getProfile: () => api.get('/students/me/profile'),
  updateProfile: (id: string, data: Record<string, unknown>) => api.put(`/students/${id}`, data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/students/${id}`, data),
  getAll: (limit = 10, offset = 0) =>
    api.get(`/students?limit=${limit}&offset=${offset}`),
  getByDepartment: (dept: string, cgpaMin = 0) =>
    api.get(`/students/eligible/${dept}?cgpaMin=${cgpaMin}`),
  getEligibleDrives: () => api.get('/drives/eligible/list'),
  getStatistics: () => api.get('/students/statistics'),
};

// Company endpoints
export const companyAPI = {
  create: (data: Record<string, unknown>) => api.post('/companies', data),
  getById: (id: string) => api.get(`/companies/${id}`),
  getProfile: () => api.get('/companies/me/profile'),
  updateProfile: (id: string, data: Record<string, unknown>) => api.put(`/companies/${id}`, data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/companies/${id}`, data),
  getAll: (limit = 10, offset = 0) =>
    api.get(`/companies?limit=${limit}&offset=${offset}`),
  getBySector: (sector: string, limit = 10, offset = 0) =>
    api.get(`/companies/by-sector/${sector}?limit=${limit}&offset=${offset}`),
  delete: (id: string) => api.delete(`/companies/${id}`),
  getStatistics: () => api.get('/companies/statistics'),
  getMyStatistics: (sortBy = 'name', sortOrder: 'asc' | 'desc' = 'asc') =>
    api.get(`/companies/me/statistics?sortBy=${sortBy}&sortOrder=${sortOrder}`),
};

// Drive endpoints
export const driveAPI = {
  create: (data: Record<string, unknown>) => api.post('/drives', data),
  getById: (id: string) => api.get(`/drives/${id}`),
  getMyDrives: (limit = 10, offset = 0) =>
    api.get(`/drives/me/company?limit=${limit}&offset=${offset}`),
  getAll: (limit = 10, offset = 0) =>
    api.get(`/drives?limit=${limit}&offset=${offset}`),
  getEligible: () => api.get('/drives/eligible/list'),
  update: (id: string, data: Record<string, unknown>) => api.put(`/drives/${id}`, data),
  delete: (id: string) => api.delete(`/drives/${id}`),
  getStatistics: () => api.get('/drives/statistics'),
};

// Application endpoints
export const applicationAPI = {
  apply: (driveId: string) => api.post('/applications', { driveId }),
  getById: (id: string) => api.get(`/applications/${id}`),
  getMyApplications: (limit = 10, offset = 0) =>
    api.get(`/applications/me/list?limit=${limit}&offset=${offset}`),
  getForDrive: (driveId: string, limit = 10, offset = 0) =>
    api.get(`/applications/drive/${driveId}?limit=${limit}&offset=${offset}`),
  getForDriveWithAts: (driveId: string, limit = 10, offset = 0) =>
    api.get(`/applications/drive/${driveId}/ats?limit=${limit}&offset=${offset}`),
  updateStatus: (id: string, status: string, rejectionReason?: string) =>
    api.put(`/applications/${id}/status`, { status, rejectionReason }),
  moveStage: (id: string, stage: string, note?: string) =>
    api.post(`/applications/${id}/stage`, { stage, note }),
  getTimeline: (id: string) => api.get(`/applications/${id}/timeline`),
  createInterviewSlot: (
    id: string,
    payload: { scheduledAt: string; mode?: 'ONLINE' | 'OFFLINE' | 'HYBRID'; meetingLink?: string; notes?: string }
  ) => api.post(`/applications/${id}/interviews`, payload),
  updateInterviewSlot: (
    interviewId: string,
    payload: { scheduledAt?: string; mode?: 'ONLINE' | 'OFFLINE' | 'HYBRID'; meetingLink?: string; notes?: string }
  ) => api.put(`/applications/interviews/${interviewId}`, payload),
  confirmInterviewSlot: (interviewId: string) =>
    api.post(`/applications/interviews/${interviewId}/confirm`),
  requestInterviewReschedule: (interviewId: string, note?: string) =>
    api.post(`/applications/interviews/${interviewId}/reschedule`, { note }),
  withdraw: (id: string) => api.delete(`/applications/${id}`),
  getShortlisted: (driveId: string) =>
    api.get(`/applications/drive/${driveId}/shortlisted`),
  getStatistics: () => api.get('/applications/statistics'),
};

// Resume endpoints are now defined at the bottom of the file

// Offer endpoints
export const offerAPI = {
  create: (data: Record<string, unknown>) => api.post('/offers', data),
  getById: (id: string) => api.get(`/offers/${id}`),
  getMyOffers: (limit = 10, offset = 0) =>
    api.get(`/offers/me/list?limit=${limit}&offset=${offset}`),
  getAccepted: () => api.get('/offers/me/accepted'),
  getForDrive: (driveId: string, limit = 10, offset = 0) =>
    api.get(`/offers/drive/${driveId}?limit=${limit}&offset=${offset}`),
  getAll: (limit = 10, offset = 0) =>
    api.get(`/offers?limit=${limit}&offset=${offset}`),
  getAllAccepted: (limit = 10, offset = 0) =>
    api.get(`/offers/accepted?limit=${limit}&offset=${offset}`),
  accept: (id: string) => api.post(`/offers/${id}/accept`),
  reject: (id: string) => api.post(`/offers/${id}/reject`),
  counter: (id: string, counterOfferText: string) =>
    api.post(`/offers/${id}/counter`, { counterOfferText }),
  respondToCounter: (id: string, decision: 'ACCEPT' | 'REJECT', note?: string) =>
    api.post(`/offers/${id}/counter/respond`, { decision, note }),
  getAuditTrail: (id: string) => api.get(`/offers/${id}/audit`),
  getStatistics: () => api.get('/offers/statistics'),
  generateEmail: (id: string) => api.post(`/offers/${id}/generate-email`),
};

// University endpoints
export const universityAPI = {
  manualOnboard: (data: Record<string, unknown>) => api.post('/universities/students/manual', data),
  bulkOnboard: (formData: FormData) => api.post('/universities/students/bulk', formData),
  getPendingStudents: () => api.get('/universities/students/pending'),
  verifyStudent: (id: string) => api.post(`/universities/students/${id}/verify`),
  rejectStudent: (id: string, reason: string) => api.post(`/universities/students/${id}/reject`, { reason }),
  toggleLockStudent: (id: string, lock: boolean) => api.post(`/universities/students/${id}/lock`, { lock }),
  getDepartments: () => api.get('/universities/departments'),
  createDepartment: (name: string, code: string) => api.post('/universities/departments', { name, code }),
  createSubDepartment: (deptId: string, name: string, code: string) =>
    api.post(`/universities/departments/${deptId}/sub-departments`, { name, code }),
  createClass: (subDeptId: string, name: string, batch: number) =>
    api.post(`/universities/sub-departments/${subDeptId}/classes`, { name, batch }),
  getClasses: (subDeptId: string) => api.get(`/universities/sub-departments/${subDeptId}/classes`),
  inviteCompany: (email: string, companyName: string) => api.post('/universities/companies/invite', { email, companyName }),
  getDriveRequests: () => api.get('/universities/drives/requests'),
  approveDrive: (id: string) => api.post(`/universities/drives/${id}/approve`),
};

// Admin endpoints
export const adminAPI = {
  createUniversity: (data: Record<string, unknown>) => api.post('/admin/universities', data),
  getUniversities: () => api.get('/admin/universities'),
  approveUniversity: (id: string) => api.post(`/admin/universities/${id}/approve`),
  suspendUniversity: (id: string) => api.post(`/admin/universities/${id}/suspend`),
  updateBillingPlan: (id: string, plan: string) => api.post(`/admin/universities/${id}/billing`, { plan }),
  getMetrics: () => api.get('/admin/dashboard/metrics'),
  globalSearchStudents: (params: Record<string, unknown>) => api.get('/admin/students', { params }),
};

// Update authAPI with OTP functions
export const authAPI = {
  register: (email: string, password: string, confirmPassword: string, role: string, universityName?: string, universityCode?: string) =>
    api.post('/auth/register', { email, password, confirmPassword, role, universityName, universityCode }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  sendOtp: (phone?: string) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (emailOtp: string, phoneOtp: string) => api.post('/auth/verify-otp', { emailOtp, phoneOtp }),
};

// Update resumeAPI with Feedback function
export const resumeAPI = {
  upload: (data: FormData | Record<string, unknown>) => api.post('/resumes', data),
  getById: (id: string) => api.get(`/resumes/${id}`),
  getMyResumes: (limit = 10, offset = 0) =>
    api.get(`/resumes/me/list?limit=${limit}&offset=${offset}`),
  getVerified: () => api.get('/resumes/me/verified'),
  getAll: (limit = 10, offset = 0) =>
    api.get(`/resumes?limit=${limit}&offset=${offset}`),
  getPending: (limit = 10, offset = 0) =>
    api.get(`/resumes/pending?limit=${limit}&offset=${offset}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/resumes/${id}`, data),
  verify: (id: string, verifyComment: string) =>
    api.post(`/resumes/${id}/verify`, { verifyComment }),
  reject: (id: string, rejectionReason: string) =>
    api.post(`/resumes/${id}/reject`, { verifyComment: rejectionReason }),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  getStatistics: () => api.get('/resumes/statistics'),
  getFeedback: (id: string) => api.get(`/resumes/${id}/feedback`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
