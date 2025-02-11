import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user";
import Home from "../views/Home.vue";
import HouseDetail from "../views/HouseDetail.vue";
import TenantDetail from "../views/TenantDetail.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    component: () => import("../views/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/houses",
    component: () => import("../views/Houses.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/houses/:id",
    name: "HouseDetail",
    component: HouseDetail,
    meta: {
      requiresAuth: true,
      showBackForAdmin: true, // 新增标记
    },
  },
  {
    path: "/tenants/:id",
    name: "TenantDetail",
    component: TenantDetail,
    meta: {
      requiresAuth: true,
      showBackForAdmin: true, // 新增标记
    },
  },
  {
    path: "/tenants",
    component: () => import("../views/Tenants.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/tenants/:id",
    name: "TenantDetail",
    component: TenantDetail,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ left: 0, top: 0 });
      }, 500);
    });
  },
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token;
  const tenant = userStore.userInfo?.tenant;

  // 未登录状态下只能访问登录页
  if (!token && to.path !== '/login') {
    return next('/login');
  }

  // 已登录状态下的登录页访问处理
  if (to.path === '/login' && token) {
    return userStore.isAdmin ? next('/') : next(`/tenants/${tenant.id}`);
  }

  // 普通用户权限控制
  if (!userStore.isAdmin && tenant) { 
    const allowedPaths = [
      `/tenants/${tenant.id}`,  // 允许访问自己的租客详情
      `/houses/${tenant.houseId}`,  // 允许访问自己租住的房屋详情
    ];

    if (!allowedPaths.includes(to.path) && !to.path.startsWith('/houses/')) {
      return next(`/tenants/${tenant.id}`);
    }
  }

  next();
});

export default router;
