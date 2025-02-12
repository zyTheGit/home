
import { AxiosError } from 'axios';
import request from '../utils/request';
import type {
  House,
  Tenant,
  Statistics,
  LoginResponse,
  UserInfo,
  Payment,
  ApiResponse,
} from '../types';
import { useUserStore } from '../stores/user';


// API 接口定义
export const authApi = {
  login: (phone: string, password: string) =>
    request.post<ApiResponse<LoginResponse>>('/auth/login', { phone, password }),
  logout: () => request.post<ApiResponse<void>>('/auth/logout'),
  getCurrentUser: () => request.get<ApiResponse<UserInfo>>('/auth/me'),
  refreshToken: (refreshToken: string) => 
    request.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken }),
};

export const houseApi = {
  getHouses: () => request.get<House[]>('/houses'),
  getHouse: (id: number) => request.get<House>(`/houses/${id}`),
  createHouse: (data: Partial<House>) => request.post<House>('/houses', data),
  updateHouse: (id: number, data: Partial<House>) =>
    request.patch<House>(`/houses/${id}`, data),
  deleteHouse: (id: number) => request.delete(`/houses/${id}`),
};

export const tenantApi = {
  getTenants: () => request.get<Tenant[]>('/tenants'),
  getTenant: (id: number) => request.get<Tenant>(`/tenants/${id}`),
  createTenant: (data: Partial<Tenant>) => request.post<Tenant>('/tenants', data),
  updateTenant: (id: number, data: Partial<Tenant>) =>
    request.patch<Tenant>(`/tenants/${id}`, data),
  deleteTenant: (id: number) => request.delete(`/tenants/${id}`),
};

export const paymentApi = {
  createPayment: (data: Partial<Payment>) =>
    request.post<Payment>('/payments', data),
  getBalance: (houseId: number) =>
    request.get<number>(`/payments/house/${houseId}/balance`),
  getTenantPayments: (tenantId: number) =>
    request.get<Payment[]>(`/payments/tenant/${tenantId}`),
  getHousePaymentStatus: (houseId: number) =>
    request.get<PaymentStatus>(`/payments/house/${houseId}/status`),
  getHousePayments(houseId: number, userId?: number) {
    return request.get(`/payments/house/${houseId}`, {
      params: { userId },
    });
  },
};

export const statisticsApi = {
  getOverview: () => request.get<Statistics>('/statistics/overview'),
  getMonthlyStats: () => request.get<Statistics>('/statistics/monthly'),
};

// 添加类型定义
interface PaymentStatus {
  status: 'paid' | 'unpaid' | 'no_tenant';
  amount: number;
  lastPaymentDate: string | null;
  monthsDiff: number;
}

// 修改重试处理逻辑
const retryHandler = (error: AxiosError) => {
  if (error.config && error.response?.status === 401) {
    return authApi.refreshToken(useUserStore().refreshToken).then(() => request(error.config!))
  }
  return Promise.reject(error)
}

// 在请求拦截器中添加
request.interceptors.response.use(undefined, error => {
  return retryHandler(error)
})
