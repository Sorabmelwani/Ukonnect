import apiClient from './client'

export interface ChatRequest {
  message: string
}

export interface ChatSource {
  type: string
  title: string
  content: string
}

export interface ChatResponse {
  ok: boolean
  answer: string
  disclaimer: string
  sources: ChatSource[]
}

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>('/ai/chat', { message })
  return response.data
}

