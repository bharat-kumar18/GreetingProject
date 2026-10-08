import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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
