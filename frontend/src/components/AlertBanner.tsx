type AlertBannerProps = {
  errorMessage: string
  successMessage: string
}

export default function AlertBanner({ errorMessage, successMessage }: AlertBannerProps) {
  if (!errorMessage && !successMessage) return null

  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
        errorMessage
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {errorMessage || successMessage}
    </div>
  )
}
