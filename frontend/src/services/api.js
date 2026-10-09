import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://greetingproject-p7ew.onrender.com/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Response interceptor to unwrap data
api.interceptors.response.use(
  (response) => {
    // If the backend wraps the payload in { success: true, data: ... }
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
