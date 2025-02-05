import axios, { AxiosError } from 'axios'
import type { House, Tenant, Statistics, LoginResponse, UserInfo, Payment } from '../types'
import { showNotify } from 'vant'

// 定义后端响应数据的类型
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
  errors?: string[];
}

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000, // 10秒超时
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const method = response.config.method?.toUpperCase()
    if (response.data.message && method !== 'GET') {
      showNotify({ type: 'success', message: response.data.message })
    }
    return response.data
  },
  (error: AxiosError<ApiResponse>) => {
    const response = error.response
    const data = response?.data

    if (data?.errors && data.errors.length > 0) {
      // 显示所有验证错误
      data.errors.forEach(error => {
        showNotify({
          type: 'danger',
          message: error,
          duration: 3000
        })
      })
    } else {
      const errorMsg = data?.message || error.message || '请求失败'
      showNotify({
        type: 'danger',
        message: errorMsg
      })
    }

    // 特殊状态码处理
    switch (response?.status) {
      case 401:
        localStorage.removeItem('token')
        window.location.href = '/login'
        break
      case 403:
        showNotify({ type: 'danger', message: '没有权限执行此操作' })
        break
    }

    return Promise.reject(error)
  }
)

// API 接口定义
export const authApi = {
  login: (phone: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', { phone, password }),
  logout: () => api.post<ApiResponse<void>>('/auth/logout'),
  getCurrentUser: () => 
    api.get<ApiResponse<UserInfo>>('/auth/me')
}

export const houseApi = {
  getHouses: () => api.get<House[]>('/houses'),
  getHouse: (id: number) => api.get<House>(`/houses/${id}`),
  createHouse: (data: Partial<House>) => api.post<House>('/houses', data),
  updateHouse: (id: number, data: Partial<House>) => api.patch<House>(`/houses/${id}`, data),
  deleteHouse: (id: number) => api.delete(`/houses/${id}`)
}

export const tenantApi = {
  getTenants: () => api.get<Tenant[]>('/tenants'),
  getTenant: (id: number) => api.get<Tenant>(`/tenants/${id}`),
  createTenant: (data: Partial<Tenant>) => api.post<Tenant>('/tenants', data),
  updateTenant: (id: number, data: Partial<Tenant>) => api.patch<Tenant>(`/tenants/${id}`, data),
  deleteTenant: (id: number) => api.delete(`/tenants/${id}`)
}

export const paymentApi = {
  getHousePayments: (houseId: number) => api.get<Payment[]>(`/payments/house/${houseId}`),
  createPayment: (data: Partial<Payment>) => api.post<Payment>('/payments', data),
  getBalance: (houseId: number) => api.get<number>(`/payments/house/${houseId}/balance`),
  getTenantPayments: (tenantId: number) => api.get<Payment[]>(`/payments/tenant/${tenantId}`),
  getHousePaymentStatus: (houseId: number) => 
    api.get<PaymentStatus>(`/payments/house/${houseId}/status`),
}

export const statisticsApi = {
  getOverview: () => api.get<Statistics>('/statistics/overview'),
  getMonthlyStats: () => api.get<Statistics>('/statistics/monthly')
}

// 添加类型定义
interface PaymentStatus {
  status: 'paid' | 'unpaid' | 'no_tenant';
  amount: number;
  lastPaymentDate: string | null;
  monthsDiff: number;
}

export default api