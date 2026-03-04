import type { UploadedFileItem, UploadResponse } from '../types'

type UploadCardProps = {
  selectedFile: File | null
  onFileChange: (file: File | null) => void
  onUpload: () => void
  uploading: boolean
  uploadResult: UploadResponse | null
  uploads: UploadedFileItem[]
}

function isImageUrl(value: string): boolean {
  return /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(value)
}

export default function UploadCard({
  selectedFile,
  onFileChange,
  onUpload,
  uploading,
  uploadResult,
  uploads,
}: UploadCardProps) {
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

      {uploads.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Uploaded Files</h3>
          <ul className="space-y-2">
            {uploads.map((item) => {
              const showItemPreview =
                isImageUrl(item.key) || isImageUrl(item.presigned_url)

              return (
                <li key={item.id} className="rounded-lg border bg-slate-50 p-3 text-sm">
                  {showItemPreview && (
                    <img
                      src={item.presigned_url}
                      alt={item.key}
                      className="mb-2 max-h-40 w-full rounded border object-contain"
                    />
                  )}
                  <p className="break-all">
                    <strong>Key:</strong> {item.key}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                  <a href={item.presigned_url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                    Open Link
                  </a>
                  <p className="text-xs text-slate-500">Link may expire.</p>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
