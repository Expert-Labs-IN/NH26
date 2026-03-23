import { useEffect, useRef, useState } from 'react'
import { getJobStatus } from '../api/client'
import type { JobResponse } from '../types'

const POLL_INTERVAL_MS = 1500

export function useJobPolling(jobId: string | null) {
  const [job, setJob] = useState<JobResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!jobId) {
      setJob(null)
      setError('Missing job id')
      return
    }

    let cancelled = false

    const clearPending = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const poll = async () => {
      try {
        const data = await getJobStatus(jobId)
        if (cancelled) return

        setJob(data)
        setError(null)

        if (data.status === 'complete' || data.status === 'error') {
          clearPending()
          return
        }

        timeoutRef.current = window.setTimeout(poll, POLL_INTERVAL_MS)
      } catch (err) {
        if (cancelled) return
        clearPending()
        setError(err instanceof Error ? err.message : 'Polling failed')
      }
    }

    void poll()

    return () => {
      cancelled = true
      clearPending()
    }
  }, [jobId])

  return { job, error }
}
