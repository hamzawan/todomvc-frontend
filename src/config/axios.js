import axios from 'axios'
import { useAuthStore } from 'stores/auth'
import router from '@/router'

const API_URL = process.env.VUE_API_BASE_URL

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && authStore.user?.token) {
    config.headers.Authorization = `Bearer ${authStore.user.token}`
  }

  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (authStore.refreshToken) {
          await authStore.refreshToken()
          originalRequest.headers.Authorization = `Bearer ${authStore.user.token}`
          return apiClient(originalRequest)
        }
      } catch (e) {
        console.log(e)
        authStore.logout()
        router.push('/login')
      }
    }

    // Handle 429 - Rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      if (retryAfter && !originalRequest._retryCount) {
        originalRequest._retryCount = 1
        const delay = parseInt(retryAfter) * 1000
        return new Promise((resolve) => {
          setTimeout(() => resolve(apiClient(originalRequest)), delay)
        })
      }
    }

    // Handle 5xx - Server errors with retry
    if (
      error.response?.status >= 500 &&
      (!originalRequest._retryCount || originalRequest._retryCount < 2)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      const delay = Math.pow(2, originalRequest._retryCount) * 1000
      return new Promise((resolve) => {
        setTimeout(() => resolve(apiClient(originalRequest)), delay)
      })
    }

    return Promise.reject(error)
  },
)

export default apiClient
