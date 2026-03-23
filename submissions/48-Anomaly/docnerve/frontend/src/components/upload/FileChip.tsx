import { FileText, Image, X } from 'lucide-react'
import { formatBytes } from '../../lib/utils'

export function FileChip({
  file,
  onRemove,
}: {
  file: File
  onRemove: () => void
}) {
  const isPdf = file.name.toLowerCase().endsWith('.pdf')

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
        {isPdf ? <FileText className="h-4 w-4" /> : <Image className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-800">{file.name}</p>
        <p className="text-xs text-zinc-500">{formatBytes(file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
