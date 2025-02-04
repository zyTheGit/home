import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
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
    path: '/tenants',
    component: () => import('../views/Tenants.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 如果需要登录且没有token
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } 
  // 如果已登录且要去登录页
  else if (token && to.path === '/login') {
    next(from.path) // 返回来源页面
  }
  // 其他情况正常放行
  else {
    next()
  }
})

export default router 