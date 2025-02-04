import axios, { AxiosError } from 'axios'
import type { House, Tenant, Statistics } from '../types'
import { showSuccessToast, showFailToast } from 'vant'

// 定义后端响应数据的类型
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
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
    // 如果响应中包含message且不是GET请求，显示成功提示
    const method = response.config.method?.toUpperCase()
    if (response.data.message && method !== 'GET') {
      showSuccessToast(response.data.message)
    }
    return response.data
  },
  (error: AxiosError<ApiResponse>) => {
    // 错误处理
    const response = error.response
    const errorMsg = response?.data?.message || error.message || '请求失败'

    // 根据状态码处理不同的错误情况
    switch (response?.status) {
      case 401:
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token')
        window.location.href = '/login'
        break
      case 403:
        showFailToast('没有权限执行此操作')
        break
      case 404:
        showFailToast('请求的资源不存在')
        break
      case 422:
        // 验证错误，显示具体的错误信息
        if (Array.isArray(response.data.message)) {
          showFailToast(response.data.message.join('\n'))
        } else {
          showFailToast(errorMsg)
        }
        break
      default:
        showFailToast(errorMsg)
    }

    return Promise.reject(error)
  }
)

// API 接口定义
export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ token: string }>>('/auth/login', { username, password }),
}

export const houseApi = {
  getHouses: () =>
    api.get<ApiResponse<House[]>>('/houses'),
  getHouse: (id: number) =>
    api.get<ApiResponse<House>>(`/houses/${id}`),
  createHouse: (house: Omit<House, 'id'>) =>
    api.post<ApiResponse<House>>('/houses', house),
  updateHouse: (id: number, house: Partial<House>) =>
    api.patch<ApiResponse<House>>(`/houses/${id}`, house),
  deleteHouse: (id: number) =>
    api.delete<ApiResponse<void>>(`/houses/${id}`)
}

export const tenantApi = {
  getTenants: () =>
    api.get<ApiResponse<Tenant[]>>('/tenants'),
  getTenant: (id: number) =>
    api.get<ApiResponse<Tenant>>(`/tenants/${id}`),
  createTenant: (tenant: Omit<Tenant, 'id'>) =>
    api.post<ApiResponse<Tenant>>('/tenants', tenant),
  updateTenant: (id: number, tenant: Partial<Tenant>) =>
    api.patch<ApiResponse<Tenant>>(`/tenants/${id}`, tenant),
  deleteTenant: (id: number) =>
    api.delete<ApiResponse<void>>(`/tenants/${id}`)
}

export const statisticsApi = {
  getStatistics: () =>
    api.get<ApiResponse<Statistics>>('/statistics')
}