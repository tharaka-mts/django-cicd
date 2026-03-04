import http from './http'
import type { Note } from '../types'

export type NotePayload = {
  title: string
  description: string
}

function normalizeNotesResponse(data: unknown): Note[] {
  if (Array.isArray(data)) return data as Note[]
  if (
    data &&
    typeof data === 'object' &&
    'results' in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: Note[] }).results
  }
  return []
}

export async function listNotes(): Promise<Note[]> {
  const { data } = await http.get('/api/notes/')
  return normalizeNotesResponse(data)
}

export async function createNote(payload: NotePayload): Promise<Note> {
  const { data } = await http.post<Note>('/api/notes/', payload)
  return data
}

export async function updateNote(id: number, payload: NotePayload): Promise<Note> {
  const { data } = await http.patch<Note>(`/api/notes/${id}/`, payload)
  return data
}

export async function deleteNote(id: number): Promise<void> {
  await http.delete(`/api/notes/${id}/`)
}
