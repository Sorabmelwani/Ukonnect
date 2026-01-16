import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { refreshAccessToken } from './auth'

// Base Axios instance for all API calls
const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
})

// Utility function to handle logout and redirect
export const logout = () => {
  // Clear all auth tokens
  localStorage.removeItem('accessToken')
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  
  // Redirect to login page
  // Using window.location to ensure full page reload and clear any app state
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Track if a refresh is in progress to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
  config: InternalAxiosRequestConfig & { _retry?: boolean }
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
    } else {
      if (config.headers && token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      resolve(apiClient(config))
    }
  })
  
  failedQueue = []
}

// Attach auth token (if present) to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors - try refresh token on 401, logout on failure
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Check if the error is an unauthorized response
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await refreshAccessToken()
        
        if (newAccessToken) {
          // Token refresh successful - update tokens and retry original request
          processQueue(null, newAccessToken)
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
          
          isRefreshing = false
          return apiClient(originalRequest)
        } else {
          // Refresh token is invalid or expired
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(error as AxiosError, null)
        isRefreshing = false
        
        const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
        if (hasToken) {
          console.warn('Token refresh failed. Logging out...')
          logout()
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Handle 403 (Forbidden) - logout immediately as refresh won't help
    if (error.response?.status === 403) {
      const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      if (hasToken) {
        console.warn('Access forbidden. Logging out...')
        logout()
      }
    }
    
    // Reject the promise so the calling code can handle the error
    return Promise.reject(error)
  }
)

export default apiClient


