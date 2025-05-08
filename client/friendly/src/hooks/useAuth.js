import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import {
  setCredentials,
  setLoading,
  setError,
  logout as logoutAction,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      // TODO: Implement token verification
    }
  }, [dispatch, isAuthenticated]);

  const register = async (userData) => {
    try {
      dispatch(setLoading(true));
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      dispatch(setCredentials({ user, token }));
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Registration failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async (credentials) => {
    try {
      dispatch(setLoading(true));
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      dispatch(setCredentials({ user, token }));
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Login failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      dispatch(logoutAction());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      dispatch(setLoading(true));
      await authAPI.resetPassword(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Password reset failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateProfile = async (userData) => {
    try {
      dispatch(setLoading(true));
      const response = await authAPI.updateProfile(userData);
      dispatch(setCredentials({ user: response.data, token: localStorage.getItem('token') }));
      toast.success('Profile updated successfully');
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Profile update failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
  };
};

export default useAuth;