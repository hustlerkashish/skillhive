// client/src/api.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // Log the API URL for debugging

const API = axios.create({ 
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 10000
});

// Add request interceptor to include auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Making request to:', config.url, config);
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access denied:', error.response.data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/signup', userData);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.post('/auth/reset-password', { token, newPassword: password });

// User API
export const getUserProfile = () => API.get('/users/profile');
export const updateUserProfile = (data) => API.put('/users/profile', data);
export const uploadProfilePicture = (formData) => {
  return API.post('/users/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Course API
export const getCourses = (params = {}) => API.get('/courses', { params });
export const getFeaturedCourses = () => API.get('/courses/featured');
export const getCourse = (courseId) => API.get(`/courses/${courseId}`);
export const createCourse = (courseData) => API.post('/courses', courseData);
export const updateCourse = (courseId, courseData) => API.put(`/courses/${courseId}`, courseData);
export const deleteCourse = (courseId) => API.delete(`/courses/${courseId}`);
export const getInstructorCourses = () => API.get('/courses/instructor');
export const getInstructorAnalytics = () => API.get('/courses/instructor/analytics');
export const getCourseAnalytics = (courseId) => API.get(`/courses/${courseId}/analytics`);
export const enrollInCourse = (courseId) => API.post(`/courses/${courseId}/enroll`);

// Course progress tracking
export const updateLectureProgress = async (courseId, lectureId, watchTime) => {
  const response = await API.post(
    `/courses/${courseId}/lectures/${lectureId}/progress`,
    { watchTime }
  );
  return response.data;
};

export const getCourseProgress = async (courseId) => {
  const response = await API.get(`/courses/${courseId}/progress`);
  return response.data;
};

// Export the API instance for custom requests
export default API;
