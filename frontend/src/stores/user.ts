import { defineStore } from "pinia";
import type { UserInfo } from "../types";

interface UserState {
  token: string;
  refreshToken: string;
  userInfo: UserInfo | null;
  isRefreshing: boolean;
}

const safeLocalStorage = {
  getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return sessionStorage.getItem(key);
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      sessionStorage.setItem(key, value);
    }
  }
};

export const useUserStore = defineStore('user', {
  persist: {
    key: "user-store",
    storage: localStorage,
  },

  state: (): UserState => ({
    userInfo: null,
    token: safeLocalStorage.getItem("token") || "",
    refreshToken: safeLocalStorage.getItem("refreshToken") || "",
    isRefreshing: false,
  }),

  getters: {
    isAdmin: (state) => state.userInfo?.role === 'admin',
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    setToken(token: string, refreshToken: string) {
      this.token = token;
      this.refreshToken = refreshToken;
      safeLocalStorage.setItem("token", token);
      safeLocalStorage.setItem("refreshToken", refreshToken);
    },

    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
      console.log("UserInfo set:", this.userInfo); // 调试日志
    },

    clearUserInfo() {
      this.token = "";
      this.refreshToken = "";
      this.userInfo = null;
      safeLocalStorage.setItem("token", "");
      safeLocalStorage.setItem("refreshToken", "");
      sessionStorage.removeItem("user-store"); // 清除可能存在的session备份
    },
  },
});
