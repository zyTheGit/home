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

// 白名单路由
const whiteList = ["/login", "/register"];

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  console.log("Route guard - Current token:", userStore.token); // 调试日志
  console.log("Route guard - Target path:", to.path); // 调试日志
  if (userStore.token) {
    if (to.path === "/login") {
      console.log("Already logged in, redirecting to home"); // 调试日志
      next("/");
    } else {
      next();
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      console.log("No token, redirecting to login"); // 调试日志
      next(`/login?redirect=${to.path}`);
    }
  }
});

export default router;
