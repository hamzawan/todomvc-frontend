import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'
import localStorageService from 'services/localStorage.service'
import { handleAuthRequest } from '@/utils/apiHelper'

// Constants for localStorage keys
const STORAGE_KEYS = {
  USER: 'user',
  ACCESS_TOKEN: 'accessToken',
  ACCESS_TOKEN_EXPIRY: 'accessTokenExpiry',
}

// Helper function to get initial state from localStorage
const getInitialState = () => ({
  user: localStorageService.getItem(STORAGE_KEYS.USER) || null,
  accessToken: localStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null,
  accessTokenExpiry: localStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY) || null,
})

export const useAuthStore = defineStore('auth', {
  state: getInitialState,

  getters: {
    isAuthenticated: (state) => {
      if (!state.accessToken || !state.accessTokenExpiry) return false
      const currentTime = Math.floor(Date.now() / 1000)
      return currentTime < state.accessTokenExpiry
    },

    // Additional useful getters
    isTokenExpired: (state) => {
      if (!state.accessTokenExpiry) return true
      const currentTime = Math.floor(Date.now() / 1000)
      return currentTime >= state.accessTokenExpiry
    },

    userRole: (state) => state.user?.role || null,

    userName: (state) => state.user?.name || null,
  },

  actions: {
    /**
     * Set authentication data in both state and localStorage
     */
    setAuthData({ user, accessToken, accessTokenExpiry }) {
      this.user = user
      this.accessToken = accessToken
      this.accessTokenExpiry = accessTokenExpiry

      // Persist to localStorage
      localStorageService.setItem(STORAGE_KEYS.USER, user)
      localStorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      localStorageService.setItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY, accessTokenExpiry)
    },

    /**
     * Clear authentication data from both state and localStorage
     */
    clearAuthData() {
      this.user = null
      this.accessToken = null
      this.accessTokenExpiry = null

      localStorageService.removeItem(STORAGE_KEYS.USER)
      localStorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorageService.removeItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY)
    },

    /**
     * Show error notification
     */
    showErrorNotification(message = 'An unknown error occurred') {
      Notify.create({
        message,
        color: 'negative', // Using 'negative' instead of 'danger' for Quasar consistency
        position: 'top',
        timeout: 5000,
      })
    },

    /**
     * Handle API errors consistently
     */
    handleApiError(error, defaultMessage = 'An unknown error occurred') {
      const message = error.response?.data?.message || error.message || defaultMessage
      this.showErrorNotification(message)
      return false
    },

    /**
     * Sign up a new user
     */
    async signup(payload) {
      try {
        const response = await axios.post('/auth/signup', payload)

        if (response.data?.success) {
          // Optionally show success notification
          Notify.create({
            message: 'Account created successfully!',
            color: 'positive',
            position: 'top',
            timeout: 3000,
          })
          return true
        } else {
          this.showErrorNotification(response.data?.message)
          return false
        }
      } catch (error) {
        return this.handleApiError(error, 'Failed to create account')
      }
    },

    /**
     * Log in user
     */
    async login(payload) {
      try {
        return await handleAuthRequest(this, () => axios.post('/auth/login', payload), this.router)
      } catch (error) {
        return this.handleApiError(error, 'Login failed')
      }
    },

    /**
     * Set/reset password
     */
    async setPassword(token, uidb64, payload) {
      try {
        return await handleAuthRequest(
          this,
          () => axios.post(`/auth/reset_password/${token}/${uidb64}`, payload),
          this.router,
        )
      } catch (error) {
        return this.handleApiError(error, 'Failed to set password')
      }
    },

    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
      try {
        const response = await axios.post('/auth/forgot_password', { email })

        if (response.data?.success) {
          Notify.create({
            message: 'Password reset email sent!',
            color: 'positive',
            position: 'top',
            timeout: 5000,
          })
          return true
        } else {
          this.showErrorNotification(response.data?.message)
          return false
        }
      } catch (error) {
        return this.handleApiError(error, 'Failed to send reset email')
      }
    },

    /**
     * Refresh access token
     */
    async refreshToken() {
      try {
        const response = await axios.post('/auth/refresh')

        if (response.data?.success && response.data?.accessToken) {
          this.setAuthData({
            user: this.user, // Keep existing user data
            accessToken: response.data.accessToken,
            accessTokenExpiry: response.data.accessTokenExpiry,
          })
          return true
        }
        return false
      } catch (error) {
        console.log(error)
        // If refresh fails, logout user
        this.logout()
        return false
      }
    },

    /**
     * Check if token needs refresh and refresh if necessary
     */
    async checkAndRefreshToken() {
      if (!this.accessToken || !this.accessTokenExpiry) {
        return false
      }

      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = this.accessTokenExpiry - currentTime

      // Refresh if token expires in less than 5 minutes (300 seconds)
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
        return await this.refreshToken()
      }

      return true
    },

    /**
     * Log out user
     */
    async logout(showNotification = true) {
      try {
        // Attempt to notify server about logout (optional)
        await axios.post('/auth/logout').catch(() => {
          // Ignore errors on logout endpoint
        })
      } finally {
        // Always clear local data regardless of server response
        this.clearAuthData()

        if (showNotification) {
          Notify.create({
            message: 'Logged out successfully',
            color: 'positive',
            position: 'top',
            timeout: 2000,
          })
        }

        // Redirect to login
        this.router?.push('/login')
      }
    },

    /**
     * Update user profile data
     */
    async updateUser(userData) {
      try{
        await axios.put('/auth/update', userData)

        this.user = { ...this.user, ...userData }
        localStorageService.setItem(STORAGE_KEYS.USER, this.user)
      }
      catch(error){
        console.log(error)
      }
    },

    /**
     * Initialize store (useful for app startup)
     */
    initialize() {
      // Force reload from localStorage in case state wasn't properly initialized
      const user = localStorageService.getItem(STORAGE_KEYS.USER)
      const accessToken = localStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const accessTokenExpiry = localStorageService.getItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY)

      // Only update state if we have data in localStorage
      this.user = user
      this.accessToken = accessToken
      this.accessTokenExpiry = accessTokenExpiry
    },
  },
})

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
