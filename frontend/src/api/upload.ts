import http from './http'
import type { UploadedFileItem, UploadResponse } from '../types'

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await http.post<UploadResponse>('/api/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data
}

export async function listUploads(): Promise<UploadedFileItem[]> {
  const { data } = await http.get<UploadedFileItem[]>('/api/uploads/')
  return data
}
