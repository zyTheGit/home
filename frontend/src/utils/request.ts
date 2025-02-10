import axios from "axios";
import { useUserStore } from "../stores/user";
import router from "../router";
import { showNotify } from "vant";

// 创建 axios 实例
const request = axios.create({
  baseURL: "/api", // 使用相对路径，Nginx 会代理到正确的地址
  timeout: 10000, // 10秒超时
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token;

    console.log("Request interceptor - Token:", token); // 调试日志

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Response interceptor - Error:", error.response?.status); // 调试日志

    const response = error.response;
    const data = response?.data;

    // 特殊状态码处理
    switch (response?.status) {
      case 401:
        const userStore = useUserStore();
        // 清除用户信息
        userStore.clearUserInfo();
        // 如果不是登录页面，则重定向到登录页
        const currentPath = router.currentRoute.value.path;
        if (currentPath !== "/login") {
          await router.push({
            path: "/login",
            query: { redirect: currentPath },
          });
        }
        break;
      case 403:
        showNotify({ type: "danger", message: "没有权限执行此操作" });
        break;
    }

    if (data?.errors && data.errors.length > 0) {
      // 显示所有验证错误
      data.errors.forEach((e: string) => {
        showNotify({
          type: "danger",
          message: e,
          duration: 3000,
        });
      });
    } else {
      const errorMsg = data?.message || error.message || "请求失败";
      showNotify({
        type: "danger",
        message: errorMsg,
      });
    }

    return Promise.reject(error);
  }
);

export default request;
