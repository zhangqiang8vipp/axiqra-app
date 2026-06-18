import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { title: '登录', guestOnly: true },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/RegisterPage.vue'),
        meta: { title: '注册', guestOnly: true },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { title: '仪表盘', requiresAuth: true },
      },
      {
        path: 'public-cases',
        name: 'public-cases',
        component: () => import('@/pages/PublicCasesPage.vue'),
        meta: { title: '公开案例' },
      },
      {
        path: 'public-cases/:id',
        name: 'public-case-detail',
        component: () => import('@/pages/PublicCaseDetailPage.vue'),
        meta: { title: '案例详情' },
      },
      {
        path: 'tool-models',
        name: 'tool-models',
        component: () => import('@/pages/ToolModelsPage.vue'),
        meta: { title: '工具模型' },
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('@/pages/SearchPage.vue'),
        meta: { title: '搜索结果' },
      },
      {
        path: 'workspaces',
        name: 'workspaces',
        component: () => import('@/pages/WorkspacesPage.vue'),
        meta: { title: '工作空间', requiresAuth: true },
      },
      {
        path: 'workspaces/:id',
        name: 'workspace-detail',
        component: () => import('@/pages/WorkspaceDetailPage.vue'),
        meta: { title: '工作空间详情', requiresAuth: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: '404' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  document.title = to.meta.title
    ? `${to.meta.title} - Axiqra`
    : 'Axiqra'

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && authStore.isLoggedIn) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
