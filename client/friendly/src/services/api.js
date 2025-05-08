import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5500/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  verifyResetToken: (token) => api.get(`/auth/reset-password/${token}`),
  setNewPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),
};

// Post API calls
export const postAPI = {
  getPosts: (page = 1) => api.get(`/posts?page=${page}`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  addComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),
};

// User API calls
export const userAPI = {
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  uploadProfilePhoto: (formData) =>
    api.post('/auth/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadCoverPhoto: (formData) =>
    api.post('/auth/profile/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Follow API calls
export const followAPI = {
  followUser: (userId) => api.post(`/follow/${userId}`),
  unfollowUser: (userId) => api.delete(`/follow/${userId}`),
  getFollowers: (userId) => api.get(`/follow/followers/${userId}`),
  getFollowing: (userId) => api.get(`/follow/following/${userId}`),
};

// Message API calls
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (recipientId, content) =>
    api.post('/messages', { recipientId, content }),
};

// Notification API calls
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
};

// Search API calls
export const searchAPI = {
  searchUsers: (query) => api.get(`/search/users?q=${query}`),
  searchPosts: (query) => api.get(`/search/posts?q=${query}`),
};

export default api;