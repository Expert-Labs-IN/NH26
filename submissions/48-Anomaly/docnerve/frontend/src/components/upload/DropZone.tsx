import { FileUp } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '../../lib/utils'

export function DropZone({
  onDrop,
  disabled = false,
}: {
  onDrop: (files: File[]) => void
  disabled?: boolean
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/tiff': ['.tiff', '.tif'],
    },
    maxFiles: 20,
    multiple: true,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'rounded-[28px] border-2 border-dashed border-zinc-300 bg-white/80 p-8 text-center shadow-sm transition-colors sm:p-12',
        !disabled && 'cursor-pointer hover:border-zinc-400 hover:bg-white',
        isDragActive && 'border-zinc-900 bg-white',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <input {...getInputProps()} />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
        <FileUp className="h-7 w-7" />
      </div>
      <p className="mt-5 text-base font-semibold text-zinc-900">
        {isDragActive ? 'Drop documents to start the investigation' : 'Drop documents here or click to browse'}
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        PDF, PNG, JPG, TIFF. Upload at least 2 documents so DocNerve can compare them.
      </p>
    </div>
  )
}
