import axios from 'axios';
import { BASE_API_URL } from '../config/apiEndpoints';

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'accept': 'application/json'
  }
});

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;