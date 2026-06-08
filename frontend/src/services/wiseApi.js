import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== EXISTING FUNCTIONS (Keep these) ==========
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const getBalances = async () => {
  const response = await api.get('/wise/balances');
  return response.data;
};

export const createQuote = async (sourceCurrency, targetCurrency, amount) => {
  const response = await api.post('/wise/quote', { sourceCurrency, targetCurrency, amount });
  return response.data;
};

// ========== NEW FUNCTIONS FOR OPTION 1 (Bank Transfer) ==========

// Get Wise bank details to show customer
export const getBankDetails = async (currency = 'USD') => {
  const response = await api.get(`/payments/bank-details?currency=${currency}`);
  return response.data;
};

// Create a pending order with reference number
export const createBankTransferOrder = async (planType, amount, currency) => {
  const response = await api.post('/payments/bank-transfer-order', {
    planType,
    amount,
    currency
  });
  return response.data;
};

// Check if a bank transfer order is paid
export const checkOrderStatus = async (orderId) => {
  const response = await api.get(`/payments/order/${orderId}/status`);
  return response.data;
};

// ========== NEW FUNCTIONS FOR OPTION 2 (Wise Redirect) ==========

// Initiate Wise redirect payment (gets OAuth URL)
export const initiateWisePayment = async (planType, amount, currency) => {
  const response = await api.post('/payments/wise-redirect/initiate', {
    planType,
    amount,
    currency
  });
  return response.data;
};

// Complete payment after redirect (handles the callback)
export const completeWisePayment = async (code, state, orderId) => {
  const response = await api.post('/payments/wise-redirect/complete', {
    code,
    state,
    orderId
  });
  return response.data;
};

export default api;