import { DashboardData, DuplicateGroup, ScanRecord, QuarantineItem } from '../types'

async function get<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)
  return response.json()
}

export async function fetchDashboard(): Promise<DashboardData> {
  return await get('/api/dashboard')
}

export async function fetchGroups(): Promise<DuplicateGroup[]> {
  return await get('/api/duplicate-groups')
}

export async function fetchHistory(): Promise<ScanRecord[]> {
  return await get('/api/history')
}

export async function fetchQuarantine(): Promise<QuarantineItem[]> {
  try {
    return await get('/api/quarantine')
  } catch {
    return []
  }
}

export async function fetchScanProgress(id: string) {
  return get<{ phase: string; processed: number; total: number; current_file?: string; status?: string }>(
    `/api/scans/${id}/progress`
  )
}

export async function startScan(payload: { name: string; fileCount: number; totalSize: number; files?: File[] }) {
  if (payload.files?.length) {
    const body = new FormData()
    body.append('name', payload.name)
    payload.files.forEach(file => body.append('files', file, file.webkitRelativePath || file.name))
    return await fetch('/api/scans', { method: 'POST', body }).then(r => r.json())
  }
  return await fetch('/api/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(r => r.json())
}

export async function quarantineFile(id: string) {
  return await fetch(`/api/files/${id}/quarantine`, { method: 'POST' }).then(r => r.json())
}

export async function restoreFile(id: string) {
  return await fetch(`/api/files/${id}/restore`, { method: 'POST' }).then(r => r.json())
}

export async function deleteQuarantinedFile(id: string) {
  return await fetch(`/api/quarantine/${id}`, { method: 'DELETE' }).then(r => r.json())
}
