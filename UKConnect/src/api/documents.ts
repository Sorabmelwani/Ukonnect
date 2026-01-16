import apiClient from './client'

export type DocumentCategory = 'IDENTITY' | 'VISA' | 'FINANCE' | 'HEALTH' | 'EDUCATION' | 'HOUSING' | 'OTHER'

export interface Document {
  id: string
  userId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  category: DocumentCategory | null
  notes: string | null
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

export interface UploadDocumentResponse {
  ok: boolean
  document: Document
}

export interface UploadDocumentParams {
  file: File
  category?: DocumentCategory
  notes?: string
}

export const uploadDocument = async ({ file, category, notes }: UploadDocumentParams): Promise<Document> => {
  const formData = new FormData()
  formData.append('file', file)
  
  if (category) {
    formData.append('category', category)
  }
  
  if (notes) {
    formData.append('notes', notes)
  }

  const response = await apiClient.post<UploadDocumentResponse>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data.document
}

export const getDocuments = async (): Promise<Document[]> => {
  try {
    const response = await apiClient.get<{ ok: boolean; documents: Document[] }>('/documents')
    return response.data.documents || []
  } catch (error) {
    // If the endpoint doesn't exist or fails, return empty array
    console.warn('Failed to fetch documents:', error)
    return []
  }
}

export const downloadDocument = async (documentId: string, filename: string): Promise<void> => {
  try {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    })

    // Create a blob URL and trigger download
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to download document')
  }
}

