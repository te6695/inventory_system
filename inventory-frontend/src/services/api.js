import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add CSRF token for all non-GET requests
    if (config.method !== 'get' && config.method !== 'GET') {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      
      switch (status) {
        case 401:
          // If it's a login request, let the login component handle the error
          if (config.url.includes('/login')) {
            return Promise.reject(error);
          }
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        
        case 403:
          toast.error('You are not authorized to perform this action.');
          break;
        
        case 422:
          // Validation errors
          if (data.errors) {
            Object.values(data.errors).forEach(errors => {
              errors.forEach(error => toast.error(error));
            });
          }
          break;
        
        default:
          toast.error(data.message || 'Something went wrong!');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Something went wrong!');
    }
    
    return Promise.reject(error);
  }
);

export default api;