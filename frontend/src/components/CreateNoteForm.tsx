import { FormEvent } from 'react'

type FormState = {
  title: string
  description: string
}

type CreateNoteFormProps = {
  form: FormState
  onChange: (next: FormState) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  submitting: boolean
  disabled?: boolean
}

export default function CreateNoteForm({ form, onChange, onSubmit, submitting, disabled = false }: CreateNoteFormProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold">Create Note</h2>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          type="text"
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          placeholder="Title"
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          required
          disabled={disabled}
        />
        <textarea
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          placeholder="Description"
          rows={4}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={submitting || disabled}
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create'}
        </button>
      </form>
    </section>
  )
}
