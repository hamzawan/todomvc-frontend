import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Add a global navigation guard
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Initialize auth store from localStorage if not already initialized
    // This ensures we have the latest data from localStorage
    if (!authStore.user && !authStore.accessToken) {
      console.log('Initializing auth store from localStorage...')
      authStore.initialize()
    }

    // Add a small delay to ensure localStorage data is loaded
    // This is especially important on page refresh
    await new Promise((resolve) => setTimeout(resolve, 0))

    const isAuthenticated = authStore.isAuthenticated

    const requiresAuth = to.meta?.requiresAuth

    // Check if the route requires authentication
    if (requiresAuth && !isAuthenticated) {
      console.log('Nav guard: User not authenticated, redirecting to login...')
      next({ path: '/login' })
    }

    // Special case: if going to root path and authenticated, redirect to dashboard
    else if (to.path === '/' && isAuthenticated) {
      console.log('Nav guard: Root path with auth, redirecting to dashboard...')
      next({ path: '/dashboard' })
    }

    // Special case: if going to root path and not authenticated, redirect to login
    else if (to.path === '/' && !isAuthenticated) {
      console.log('Nav guard: Root path without auth, redirecting to login...')
      next({ path: '/login' })
    } else {
      // Allow navigation
      console.log('Nav guard: Navigation allowed')
      next()
    }
  })

  return Router
})
