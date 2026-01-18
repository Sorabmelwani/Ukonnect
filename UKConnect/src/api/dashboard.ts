import apiClient from './client'

export interface DashboardTask {
  id: string
  userId: string
  templateId: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  url: string | null
  dueAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DashboardReminder {
  id: string
  userTaskId: string
  userId: string
  remindAt: string
  sentAt: string | null
  channel: string
  createdAt: string
}

export interface DashboardProfile {
  id: string
  userId: string
  fullName: string
  nationality: string
  city: string
  visaType: string
  purpose: string
  visaShareCode: string
  visaExpiryDate: string
  consentTerms: boolean
  consentAI: boolean
}

export interface DashboardData {
  total: number
  completed: number
  pending: number
  completionRate: number
  upcoming: DashboardTask[]
  reminders: DashboardReminder[]
  profile: DashboardProfile
}

export const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await apiClient.get<{ ok: boolean; dashboard: DashboardData }>('/dashboard')
  return response.data.dashboard
}

export const generateTasks = async (): Promise<DashboardTask[]> => {
  const response = await apiClient.post<DashboardTask[]>('/tasks/generate')
  return response.data
}

export const updateTaskStatus = async (taskId: string, status: 'COMPLETED' | 'PENDING'): Promise<DashboardTask> => {
  const response = await apiClient.patch<DashboardTask>(`/tasks/${taskId}`, { status })
  return response.data
}


