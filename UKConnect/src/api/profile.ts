import apiClient from './client'

export interface Profile {
  id: string
  userId: string
  fullName: string
  email?: string
  nationality: string
  city: string
  visaType: string
  purpose: string
  visaShareCode?: string
  visaExpiryDate?: string
  phoneNumber?: string
  consentTerms: boolean
  consentAI: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProfileResponse {
  email: string
  profile: Profile
}

export interface ProfileUpdateResponse {
  ok: boolean
  profile: Profile
}

export const fetchProfile = async (): Promise<{ email: string; profile: Profile }> => {
  const response = await apiClient.get<ProfileResponse>('/me/profile')
  return {
    email: response.data.email,
    profile: response.data.profile
  }
}

export const updateProfile = async (profileData: {
  fullName: string
  nationality: string
  city: string
  visaType: string
}): Promise<Profile> => {
  const response = await apiClient.put<Profile>('/me/profile', profileData)
  return response.data
}

export interface Settings {
  notifications: {
    email: boolean
    push: boolean
  }
  privacy: {
    profileVisible: boolean
    showNationality: boolean
    showLocation: boolean
  }
}

export interface SettingsResponse {
  ok: boolean
  settings: Settings
}

export interface SettingsUpdateRequest {
  notificationEmail: boolean
  notificationPush: boolean
  profileVisible: boolean
  showNationality: boolean
  showLocation: boolean
}

export const fetchSettings = async (): Promise<Settings> => {
  const response = await apiClient.get<SettingsResponse>('/me/settings')
  return response.data.settings
}

export const updateSettings = async (settings: SettingsUpdateRequest): Promise<Settings> => {
  const response = await apiClient.put<SettingsResponse>('/me/settings', settings)
  return response.data.settings
}

