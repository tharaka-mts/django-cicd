export type Note = {
  id: number
  title: string
  description: string
  created_at: string
}

export type UploadResponse = {
  key: string
  bucket: string
  presigned_url: string
}

export type ApiError = {
  detail?: string
  [key: string]: unknown
}
