import { defineStore } from 'pinia';

interface UserState {
  token: string;
  userInfo: {
    id: number;
    username: string;
    role: 'admin' | 'user';
    tenant: {
      id: number;
      houseId: number;
    } | null;
  } | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: null
  }),

  getters: {
    isAdmin: (state) => state.userInfo?.role === 'admin',
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
      console.log('Token set:', this.token); // 调试日志
    },

    setUserInfo(userInfo: UserState['userInfo']) {
      this.userInfo = userInfo;
      console.log('UserInfo set:', this.userInfo); // 调试日志
    },

    clearUserInfo() {
      console.log('Clearing user info'); // 调试日志
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('token');
    }
  },

  persist: {
    key: 'user-store',
    storage: localStorage
  }
});