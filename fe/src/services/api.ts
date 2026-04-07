import axios from 'axios';
import { publicEnv } from '@/config/publicEnv';

const api = axios.create({
  baseURL: publicEnv.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { email: string; name: string; password: string; role?: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  getProfile: () => api.get('/auth/profile').then((r) => r.data),
};

// Menu
export const menuApi = {
  getItems: (params?: Record<string, string>) =>
    api.get('/menu', { params }).then((r) => r.data),
  getCategories: () => api.get('/menu/categories').then((r) => r.data),
  getItem: (id: string) => api.get(`/menu/${id}`).then((r) => r.data),
};

// Orders
export const ordersApi = {
  create: (data: any) => api.post('/orders', data).then((r) => r.data),
  processPayment: (orderId: string, data: any) =>
    api.post(`/orders/${orderId}/payment`, data).then((r) => r.data),
  getMyOrders: () => api.get('/orders/my-orders').then((r) => r.data),
  getOrder: (id: string) => api.get(`/orders/${id}`).then((r) => r.data),
};

// Kitchen
export const kitchenApi = {
  getAllOrders: () => api.get('/kitchen/orders').then((r) => r.data),
  updateStatus: (orderId: string, status: string, note?: string) =>
    api.put(`/kitchen/orders/${orderId}/status`, { status, note }).then((r) => r.data),
};
