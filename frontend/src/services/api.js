import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api', // Relative path proxied via Vite in development
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle token expiration (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If request fails with 401 and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try refreshing access token
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, clear credentials / logout in app state if necessary
        console.error('Silent session refresh failed:', refreshError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
