import { useUserStore } from "../stores/user";

// 监听storage事件确保多标签页同步
window.addEventListener('storage', (event) => {
  if (event.key === 'token' || event.key === 'refreshToken') {
    const userStore = useUserStore();
    userStore.setToken(
      localStorage.getItem("token") || "",
      localStorage.getItem("refreshToken") || ""
    );
  }
}); 