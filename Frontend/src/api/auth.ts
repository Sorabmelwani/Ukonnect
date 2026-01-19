import apiClient from './client'
import axios from 'axios'

interface LoginPayload {
  email: string
  password: string
}

interface SignupPayload {
  fullName: string
  email: string
  password: string
  visaType?: string
  purpose?: string
  city?: string
  nationality?: string
  goals?: string
}

interface VerifyVisaPayload {
  visaShareCode: string
  visaExpiryDate: string
}

interface AuthUser {
  id: string
  email: string
}

export interface AuthResponse {
  ok: boolean
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export const storeTokens = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken)
    // optional compatibility key if anything still reads authToken
    localStorage.setItem('authToken', accessToken)
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data)
  storeTokens(response.data.accessToken, response.data.refreshToken)
  return response.data
}

export const signup = async (data: SignupPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data)
  storeTokens(response.data.accessToken, response.data.refreshToken)
  return response.data
}

export const verifyVisa = async (data: VerifyVisaPayload): Promise<{ ok: boolean }> => {
  const response = await apiClient.post<{ ok: boolean }>('/me/verify-visa', data)
  return response.data
}

// Refresh token function - uses axios directly to avoid interceptors
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    return null
  }

  try {
    // Use axios directly (not apiClient) to avoid interceptors
    const response = await axios.post<AuthResponse>(
      'http://localhost:4000/auth/refresh',
      { refreshToken },
      { withCredentials: true }
    )
    
    if (response.data.accessToken) {
      storeTokens(response.data.accessToken, response.data.refreshToken)
      return response.data.accessToken
    }
    return null
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

interface ForgotPasswordPayload {
  email: string
}

interface VerifyOTPPayload {
  email: string
  otp: string
}

interface ResetPasswordPayload {
  email: string
  otp: string
  newPassword: string
}

export const requestPasswordReset = async (data: ForgotPasswordPayload): Promise<{ ok: boolean; message: string }> => {
  const response = await apiClient.post<{ ok: boolean; message: string }>('/auth/forgot-password', data)
  return response.data
}

export const verifyOTP = async (data: VerifyOTPPayload): Promise<{ ok: boolean; message: string }> => {
  const response = await apiClient.post<{ ok: boolean; message: string }>('/auth/verify-otp', data)
  return response.data
}

export const resetPassword = async (data: ResetPasswordPayload): Promise<{ ok: boolean; message: string }> => {
  const response = await apiClient.post<{ ok: boolean; message: string }>('/auth/reset-password', data)
  return response.data
}

