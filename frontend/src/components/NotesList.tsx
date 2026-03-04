import type { Note } from '../types'
import NoteItem from './NoteItem'

type NotesListProps = {
  notes: Note[]
  loading: boolean
  deletingId: number | null
  updatingId: number | null
  onUpdate: (id: number, payload: { title: string; description: string }) => Promise<boolean>
  onDelete: (id: number) => Promise<void>
  onEditingChange: (isEditing: boolean) => void
}

export default function NotesList({
  notes,
  loading,
  deletingId,
  updatingId,
  onUpdate,
  onDelete,
  onEditingChange,
}: NotesListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
      <h2 className="mb-3 text-xl font-semibold">Notes List</h2>

      {loading && <p>Loading notes...</p>}
      {!loading && notes.length === 0 && <p>No notes found.</p>}

      <ul className="space-y-3">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            deleting={deletingId === note.id}
            updating={updatingId === note.id}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEditingChange={onEditingChange}
          />
        ))}
      </ul>
    </section>
  )
}
