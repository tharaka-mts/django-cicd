import { FormEvent, useEffect, useState } from 'react'
import type { Note } from '../types'

type NoteItemProps = {
  note: Note
  deleting: boolean
  updating: boolean
  onUpdate: (id: number, payload: { title: string; description: string }) => Promise<boolean>
  onDelete: (id: number) => Promise<void>
  onEditingChange: (isEditing: boolean) => void
}

type EditForm = {
  title: string
  description: string
}

export default function NoteItem({ note, deleting, updating, onUpdate, onDelete, onEditingChange }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({ title: note.title, description: note.description || '' })
  const [inlineError, setInlineError] = useState('')

  useEffect(() => {
    if (!isEditing) {
      setEditForm({ title: note.title, description: note.description || '' })
    }
  }, [note, isEditing])

  const startEdit = () => {
    setInlineError('')
    setIsEditing(true)
    onEditingChange(true)
  }

  const cancelEdit = () => {
    setInlineError('')
    setIsEditing(false)
    setEditForm({ title: note.title, description: note.description || '' })
    onEditingChange(false)
  }

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description,
    }

    if (!payload.title) {
      setInlineError('Title is required.')
      return
    }

    setInlineError('')
    const ok = await onUpdate(note.id, payload)
    if (ok) {
      setIsEditing(false)
      onEditingChange(false)
    }
  }

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {isEditing ? (
        <form className="space-y-2" onSubmit={submitEdit}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <input
                type="text"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                value={editForm.title}
                onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
              <textarea
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                value={editForm.description}
                onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
              />
              {inlineError && <p className="text-xs text-rose-600">{inlineError}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="submit"
                disabled={updating}
                className="rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{note.title}</p>
            <p className="text-slate-700">{note.description || 'No description'}</p>
            <p className="text-xs text-slate-500">{new Date(note.created_at).toLocaleString()}</p>
          </div>
          <div className="mt-1 flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={startEdit}
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => void onDelete(note.id)}
              disabled={deleting}
              className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
