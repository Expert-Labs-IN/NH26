import axios from 'axios'
import type {
  AnalyzeResponse,
  HealthResponse,
  JobResponse,
  SampleDocsResponse,
} from '../types'

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const api = axios.create({
  baseURL: BASE_URL || undefined,
  timeout: 120_000,
})

export async function analyzeDocuments(files: File[]): Promise<AnalyzeResponse> {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))

  const res = await api.post<AnalyzeResponse>('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getJobStatus(jobId: string): Promise<JobResponse> {
  const res = await api.get<JobResponse>(`/results/${jobId}`)
  return res.data
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>('/health')
  return res.data
}

export async function getSampleDocs(): Promise<SampleDocsResponse> {
  const res = await api.get<SampleDocsResponse>('/sample-docs')
  return res.data
}

export function getReportDownloadUrl(jobId: string): string {
  return `${BASE_URL}/download/${jobId}/report`
}
