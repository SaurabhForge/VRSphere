import axios from 'axios';

const DEFAULT_RENDER_API_URL = 'https://vrsphere-backend.onrender.com/api';

const normalizeApiBaseUrl = (url) => {
  const normalized = url.replace(/\/$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    return DEFAULT_RENDER_API_URL;
  }
  return '/api';
};

const API = axios.create({ baseURL: getApiBaseUrl() });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('vrsphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Events
export const fetchEvents = (page = 1) => API.get(`/events?page=${page}`);
export const fetchEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data);
export const joinEvent = (id) => API.post(`/events/${id}/join`);
export const joinByCode = (code) => API.post('/events/join-code', { code });
export const deleteEvent = (id) => API.delete(`/events/${id}`);

export default API;
