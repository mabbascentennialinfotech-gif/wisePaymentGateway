import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Get bank details from Wise
export const getBankDetails = async (currency = 'USD') => {
  const response = await api.get('/bank-details', { params: { currency } });
  return response.data;
};

export default api;