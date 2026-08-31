import { DashboardData, DuplicateGroup, ScanRecord } from '../types'
import { demoDashboard, demoGroups, demoHistory } from '../data/demo'

async function get<T>(path: string): Promise<T> { const response = await fetch(path); if (!response.ok) throw new Error('Request failed'); return response.json() }
export async function fetchDashboard(): Promise<DashboardData> { try { return await get('/api/dashboard') } catch { return demoDashboard } }
export async function fetchGroups(): Promise<DuplicateGroup[]> { try { return await get('/api/duplicate-groups') } catch { return demoGroups } }
export async function fetchHistory(): Promise<ScanRecord[]> { try { return await get('/api/history') } catch { return demoHistory } }
export async function fetchScanProgress(id: string) { return get<{ phase: string; processed: number; total: number; current_file?: string; status?: string }>(`/api/scans/${id}/progress`) }
export async function startScan(payload: { name: string; fileCount: number; totalSize: number; files?: File[] }) {
  try {
    if (payload.files?.length) {
      const body = new FormData(); body.append('name', payload.name)
      payload.files.forEach(file => body.append('files', file, file.webkitRelativePath || file.name))
      return await fetch('/api/scans', { method: 'POST', body }).then(r => r.json())
    }
    return await fetch('/api/scans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json())
  }
  catch { return { id: `demo-${Date.now()}`, status: 'completed' } }
}
export async function quarantineFile(id: string) { try { await fetch(`/api/files/${id}/quarantine`, { method: 'POST' }) } catch {} }
