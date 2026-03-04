import { FormEvent, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { createNote, deleteNote, listNotes, updateNote } from './api/notes'
import { uploadFile } from './api/upload'
import type { ApiError, Note, UploadResponse } from './types'
import AlertBanner from './components/AlertBanner'
import CreateNoteForm from './components/CreateNoteForm'
import NotesList from './components/NotesList'
import UploadCard from './components/UploadCard'

type FormState = {
  title: string
  description: string
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined
    if (typeof data?.detail === 'string') return data.detail
  }
  return fallback
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [hasInlineEditing, setHasInlineEditing] = useState(false)

  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const fetchNotes = async ({ withSpinner = false } = {}) => {
    if (withSpinner) setLoading(true)
    try {
      const data = await listNotes()
      setNotes(data)
      return true
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to load notes.'))
      return false
    } finally {
      if (withSpinner) setLoading(false)
    }
  }

  useEffect(() => {
    void fetchNotes({ withSpinner: true })
  }, [])

  const reloadAfterMutation = async () => {
    const ok = await fetchNotes()
    if (!ok) window.location.reload()
    return ok
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    if (hasInlineEditing) {
      setErrorMessage('Finish inline edit before creating a new note.')
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description,
    }

    if (!payload.title) {
      setErrorMessage('Title is required.')
      return
    }

    clearMessages()
    setSubmitting(true)

    try {
      await createNote(payload)
      await reloadAfterMutation()
      setSuccessMessage('Note created.')
      setForm(EMPTY_FORM)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to create note.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (id: number, payload: { title: string; description: string }) => {
    clearMessages()
    setUpdatingId(id)

    try {
      const updated = await updateNote(id, payload)
      setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)))
      await new Promise((resolve) => setTimeout(resolve, 300))
      await reloadAfterMutation()
      setSuccessMessage('Note updated.')
      return true
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to update note.'))
      return false
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (deletingId !== null) return

    clearMessages()
    setDeletingId(id)

    try {
      await deleteNote(id)
      await reloadAfterMutation()
      setSuccessMessage('Note deleted.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to delete note.'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || uploading) return

    clearMessages()
    setUploading(true)

    try {
      const result = await uploadFile(selectedFile)
      setUploadResult(result)
      setSuccessMessage('Upload successful.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Upload failed.'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,#f8fafc_45%),radial-gradient(circle_at_80%_0%,#fef3c7_0%,transparent_35%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold tracking-tight">Notes Dashboard</h1>
          <p className="mt-2 text-slate-600">Minimal notes CRUD with S3 upload demo.</p>
        </header>

        <AlertBanner errorMessage={errorMessage} successMessage={successMessage} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <CreateNoteForm
              form={form}
              onChange={setForm}
              onSubmit={handleCreate}
              submitting={submitting}
              disabled={hasInlineEditing}
            />
            <UploadCard
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
              onUpload={() => void handleUpload()}
              uploading={uploading}
              uploadResult={uploadResult}
            />
          </div>

          <NotesList
            notes={notes}
            loading={loading}
            deletingId={deletingId}
            updatingId={updatingId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEditingChange={setHasInlineEditing}
          />
        </div>
      </div>
    </main>
  )
}
