import { createRouter, createWebHistory, type NavigationGuardReturn } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import useSession from '../session'

export const PATH_REGISTER = '/register'
export const PATH_LOGIN = '/login'
export const PATH_HOME = '/'

export const PATH_CURRENCY_TABLE_QUOTES = '/currency-table-quotes'
export const PATH_CURRENCY_GRAPH_QUOTES = '/currency-graph-quotes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: PATH_HOME,
      name: 'home',
      component: HomeView
    },
    {
      path: PATH_LOGIN,
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: PATH_REGISTER,
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: PATH_CURRENCY_TABLE_QUOTES,
      name: 'currency-table-quotes',
      component: () => import('@/views/CurrencyTableView.vue'),
      meta: { isPrivate: true }
    },
    {
      path: PATH_CURRENCY_GRAPH_QUOTES,
      name: 'currency-graph-quotes',
      component: () => import('@/views/CurrencyGraphView.vue'),
      meta: { isPrivate: true }
    }
  ]
})

router.beforeEach(async (to, from) => {
  let toPath: NavigationGuardReturn = true
  if (to.meta.isPrivate) {
    const { session } = useSession()
    if (await session.value.isExpired()) {
      toPath = PATH_LOGIN
    }
  }
  return toPath
})

export default router
