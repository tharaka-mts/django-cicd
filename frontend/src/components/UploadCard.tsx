import type { UploadResponse } from '../types'

type UploadCardProps = {
  selectedFile: File | null
  onFileChange: (file: File | null) => void
  onUpload: () => void
  uploading: boolean
  uploadResult: UploadResponse | null
}

function isImageUrl(value: string): boolean {
  return /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(value)
}

export default function UploadCard({ selectedFile, onFileChange, onUpload, uploading, uploadResult }: UploadCardProps) {
  const showImagePreview = uploadResult
    ? isImageUrl(uploadResult.key) || isImageUrl(uploadResult.presigned_url)
    : false

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
      <h2 className="mb-3 text-xl font-semibold">Upload File</h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input type="file" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
        <button
          type="button"
          onClick={onUpload}
          disabled={!selectedFile || uploading}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {uploadResult && (
        <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm">
          <p>
            <strong>Key:</strong> {uploadResult.key}
          </p>
          <p>
            <strong>Bucket:</strong> {uploadResult.bucket}
          </p>
          <p>
            <a href={uploadResult.presigned_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
              Open Presigned URL
            </a>
          </p>
          <p className="mt-1 text-xs text-slate-500">Link may expire.</p>

          {showImagePreview && (
            <img
              src={uploadResult.presigned_url}
              alt="Uploaded preview"
              className="mt-3 max-h-64 w-full rounded border object-contain"
            />
          )}
        </div>
      )}
    </section>
  )
}
