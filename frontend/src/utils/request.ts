import axios from "axios";
import { useUserStore } from "../stores/user";
import router from "../router";
import { authApi } from "../api";

// 创建 axios 实例
const request = axios.create({
  baseURL: "/api", // 使用相对路径，Nginx 会代理到正确的地址
  timeout: 10000, // 10秒超时
});

// 在文件顶部添加状态变量
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // showLoading({ message: '加载中...', forbidClick: true });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;
    
    // 非401错误直接处理
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // 防止重复刷新
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => request(originalRequest))
        .catch(err => Promise.reject(err));
    }

    isRefreshing = true;
    const userStore = useUserStore();

    try {
      // 确保携带当前刷新令牌
      const { data } = await authApi.refreshToken(userStore.refreshToken);
      
      // 更新存储中的令牌
      userStore.setToken(data.token, data.refreshToken);
      
      // 重试原始请求
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      processQueue(null);
      return request(originalRequest);
    } catch (refreshError) {
      // 刷新失败时清除用户信息
      userStore.clearUserInfo();
      router.push('/login');
      processQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default request;
