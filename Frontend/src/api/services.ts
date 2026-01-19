import apiClient from './client'

export interface Service {
  id: string
  name: string
  category: string
  city: string
  address: string | null
  postcode: string | null
  phone: string | null
  website: string
  description: string
  createdAt: string
}

export interface ServicesResponse {
  ok: boolean
  services: Service[]
}

export const fetchServices = async (city?: string, category?: string, q?: string): Promise<Service[]> => {
  const params = new URLSearchParams()
  if (city) params.append('city', city)
  if (category) params.append('category', category)
  if (q) params.append('q', q)
  
  const response = await apiClient.get<ServicesResponse>(`/services?${params.toString()}`)
  return response.data.services || []
}

