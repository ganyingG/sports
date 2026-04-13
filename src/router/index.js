import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
  path: '/test',
  name: 'Test',
  component: () => import('../views/TestView.vue')
},
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/MyLogin.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/MyRegister.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashBoard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('../views/MyStudents.vue'),
        meta: { title: '学生管理' }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../views/MyProjects.vue'),
        meta: { title: '项目管理' }
      },
      {
        path: 'referees',
        name: 'Referees',
        component: () => import('../views/MyReferees.vue'),
        meta: { title: '裁判管理' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('../views/MyEquipment.vue'),
        meta: { title: '器材管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 刷新页面时，从 localStorage 恢复登录状态
  const localToken = localStorage.getItem('token')
  if (localToken && !authStore.isAuthenticated) {
    authStore.refreshLoginState()
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 直接检查 localStorage 中的 token
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }

  // 如果已登录且访问登录/注册页，跳转到首页
  const token = localStorage.getItem('token')
  if ((to.path === '/login' || to.path === '/register') && token) {
    next('/dashboard')
    return
  }

  next()
})

export default router