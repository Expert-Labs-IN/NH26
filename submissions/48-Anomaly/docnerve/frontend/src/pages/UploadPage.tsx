import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  FileUp,
  ImageIcon,
  Loader2,
  ScanSearch,
  Shield,
} from 'lucide-react'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'
import { analyzeDocuments } from '../api/client'
import { cn, formatBytes } from '../lib/utils'

export default function UploadPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`))
      const deduped = accepted.filter((f) => !seen.has(`${f.name}-${f.size}-${f.lastModified}`))
      return [...prev, ...deduped]
    })
    setError(null)
  }, [])

  const removeFile = (target: File) => {
    setFiles((prev) =>
      prev.filter(
        (f) =>
          !(f.name === target.name && f.size === target.size && f.lastModified === target.lastModified),
      ),
    )
  }

  const handleSubmit = async () => {
    if (files.length < 1) {
      setError('Upload at least 1 document or image.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await analyzeDocuments(files)
      navigate(`/results/${response.job_id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = typeof err.response?.data?.detail === 'string' ? err.response.data.detail : null
        setError(detail || err.message || 'Failed to start processing.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to start processing.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/tiff': ['.tiff', '.tif'],
    },
    maxFiles: 50,
    multiple: true,
    disabled: isSubmitting,
  })

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-icon">
              <ScanSearch size={20} />
            </div>
            <div>
              <p className="navbar-title">DocNerve</p>
              <p className="navbar-subtitle">Document review</p>
            </div>
          </div>
        </div>
      </header>

      <main className="upload-main">
        <section className="upload-hero">
          <div className="hero-badge">
            <ScanSearch size={14} />
            <span>Upload workspace</span>
          </div>
          <h1 className="hero-title">
            Upload documents.
            <br />
            <span className="hero-emphasis">Review text, fields, and findings.</span>
          </h1>
          <p className="hero-desc">
            Upload PDF or image files. DocNerve reads text, extracts key fields, and compares
            related records across the set.
          </p>
        </section>

        <section className="upload-card">
          <div
            {...getRootProps()}
            className={cn(
              'dropzone',
              isDragActive && 'dropzone-active',
              isSubmitting && 'dropzone-disabled',
            )}
          >
            <input {...getInputProps()} />
            <div className="dropzone-icon">
              <FileUp size={28} />
            </div>
            <p className="dropzone-title">
              {isDragActive ? 'Drop files here' : 'Drag files here or click to browse'}
            </p>
            <p className="dropzone-subtitle">PDF, PNG, JPG, TIFF</p>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((file) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="file-chip">
                  <div className="file-chip-info">
                    <ImageIcon size={16} className="file-chip-icon" />
                    <span className="file-chip-name">{file.name}</span>
                    <span className="file-chip-size">{formatBytes(file.size)}</span>
                  </div>
                  <button
                    className="file-chip-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file)
                    }}
                    aria-label="Remove"
                    type="button"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="upload-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="upload-actions">
            <div className="upload-hint">
              <span className="file-count-badge">{files.length}</span>
              <span>file{files.length !== 1 ? 's' : ''} selected</span>
            </div>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || files.length < 1}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start review
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </section>

        <section className="features-row">
          <div className="feature-card">
            <div className="feature-icon">
              <ScanSearch size={20} />
            </div>
            <h3>OCR text</h3>
            <p>Read scanned pages, PDFs, and image files in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FileText size={20} />
            </div>
            <h3>Field extraction</h3>
            <p>Pull out dates, amounts, vendors, identifiers, and other key values.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={20} />
            </div>
            <h3>Cross checks</h3>
            <p>Compare related documents for conflicts, missing records, and risk signals.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
