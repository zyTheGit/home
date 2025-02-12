import { createRouter, createWebHistory } from "vue-router";
import { showNotify } from "vant";
import { useUserStore } from "../stores/user";
import Home from "../views/Home.vue";
import HouseDetail from "../views/HouseDetail.vue";
import TenantDetail from "../views/TenantDetail.vue";
import { authApi } from "../api";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: Home,
    meta: {
      requiresAuth: true,
      title: "首页",
      showBack: false,
    },
  },
  {
    path: "/login",
    component: () => import("../views/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/houses",
    component: () => import("../views/Houses.vue"),
    meta: { requiresAuth: true, showBack: true, requiresAdmin: true },
  },
  {
    path: "/houses/:id",
    name: "HouseDetail",
    component: HouseDetail,
    meta: {
      requiresAuth: true,
      title: "房屋详情",
      showBack: true,
    },
  },
  {
    path: "/tenants/:id",
    name: "TenantDetail",
    component: TenantDetail,
    meta: {
      requiresAuth: true,
      title: "租客详情",
      showBack: true,
      showBackForAdmin: true,
    },
  },
  {
    path: "/tenants",
    component: () => import("../views/Tenants.vue"),
    meta: { requiresAuth: true, showBack: true, requiresAdmin: true },
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

  // 添加主动令牌检查
  if (userStore.token && !userStore.isRefreshing) {
    try {
      // 静默检查令牌有效性
      await authApi.getCurrentUser();
    } catch (error) {
      if (error.response?.status === 401) {
        userStore.clearUserInfo();
        return next("/login");
      }
    }
  }

  const token = userStore.token;
  const tenant = userStore.userInfo?.tenant;

  // 未登录状态下只能访问登录页
  if (!token && to.path !== "/login") {
    return next("/login");
  }

  // 已登录状态下的登录页访问处理
  if (to.path === "/login" && token) {
    return userStore.isAdmin ? next("/") : next(`/tenants/${tenant?.id}`);
  }

  // 普通用户权限控制
  if (!userStore.isAdmin && tenant) {
    const allowedPaths = [
      `/tenants/${tenant.id}`,
      `/houses/${tenant.houseId}`,
      "/", // 允许首页
      "/about", // 允许关于页面
    ];

    // 精确匹配路径或房屋详情页
    if (
      !allowedPaths.includes(to.path) &&
      !to.path.startsWith(`/houses/${tenant.houseId}`)
    ) {
      return next(`/tenants/${tenant.id}`);
    }
  }

  // 添加管理员权限校验
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    showNotify({ type: "danger", message: "无权限访问" });
    return next(from.path);
  }

  next();
});

export default router;
