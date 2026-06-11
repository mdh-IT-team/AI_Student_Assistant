import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const loginUser = async (email, password) => {
  try {
    // 1. Create Login API Request
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: email,
      password: password
    });
    
    // If successful, save the security token given by the backend
    if (response.data && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  } catch (error) {
    // 2. Handle Login Error (extract error message from backend)
    throw error.response?.data?.detail || 'Login failed. Please try again.';
  }

}
export const registerUser = async (email, password, fullName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: email,
      password: password,
      full_name: fullName
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Registration failed. Please try again.';
  }
};
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Could not fetch user profile.';
  }
  };