import { DashboardData, DuplicateGroup, ScanRecord, QuarantineItem } from '../types'

const emptyDashboard: DashboardData = {
  isDemo: false,
  filesScanned: 0,
  duplicateFiles: 0,
  duplicateGroups: 0,
  recoverable: 0,
  recovered: 0,
  scannedSize: 0,
  storageBreakdown: [],
  duplicateBreakdown: [],
  recoveryByType: []
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)
  return response.json()
}

export async function fetchDashboard(): Promise<DashboardData> {
  try {
    return await get<DashboardData>('/api/dashboard')
  } catch {
    return emptyDashboard
  }
}

export async function fetchGroups(): Promise<DuplicateGroup[]> {
  try {
    return await get<DuplicateGroup[]>('/api/duplicate-groups')
  } catch {
    return []
  }
}

export async function fetchHistory(): Promise<ScanRecord[]> {
  try {
    return await get<ScanRecord[]>('/api/history')
  } catch {
    return []
  }
}

export async function fetchQuarantine(): Promise<QuarantineItem[]> {
  try {
    return await get<QuarantineItem[]>('/api/quarantine')
  } catch {
    return []
  }
}

export async function fetchScanProgress(id: string) {
  return get<{ phase: string; processed: number; total: number; current_file?: string; status?: string }>(
    `/api/scans/${id}/progress`
  )
}

export async function startScan(payload: { name: string; fileCount: number; totalSize: number; files?: File[]; root_path?: string }) {
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
