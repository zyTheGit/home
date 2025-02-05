import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { authApi } from '../api'
import Home from '../views/Home.vue'
import HouseDetail from '../views/HouseDetail.vue'
import TenantDetail from '../views/TenantDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/houses',
    component: () => import('../views/Houses.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/houses/:id',
    name: 'HouseDetail',
    component: HouseDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/tenants',
    component: () => import('../views/Tenants.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tenants/:id',
    name: 'TenantDetail',
    component: TenantDetail,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.meta.requiresAuth;
  const requiresAdmin = to.meta.requiresAdmin;

  // 如果需要登录但没有token
  if (requiresAuth && !userStore.token) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  // 如果有token但没有用户信息，尝试获取用户信息
  if (userStore.token && !userStore.userInfo) {
    try {
      const { data } = await authApi.getCurrentUser();
      userStore.setUserInfo(data);
    } catch (error) {
      userStore.clearUser();
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }
  }

  // 如果需要管理员权限但不是管理员
  if (requiresAdmin && !userStore.isAdmin()) {
    next('/');
    return;
  }

  next();
})

export default router