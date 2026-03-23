import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const emailService = {
  fetchEmails: () => api.get('/emails'),
  getEmail: (id) => api.get(`/emails/${id}`),
  triageEmail: (id) => api.post(`/triage/${id}`),
  ignoreEmail: (id) => api.patch(`/emails/${id}/ignore`),
  getStats: () => api.get('/stats'),
  sendReply: (id, body) => api.post(`/emails/${id}/send-reply`, { body }),
};

export const calendarService = {
  scanEvents: () => api.post('/emails/scan-calendar'),
  createEvent: (emailId, payload) => api.post('/calendar/create', { emailId, payload }),
  fetchEvents: () => api.get('/calendar/events'),
};

export const notificationService = {
  fetchNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

export default api;
