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

const DEMO_EMAILS = ['alex.morgan@workspace.io', 'jordan.lee@storage.dev']

function isDemoAccount(email?: string | null): boolean {
  if (!email) return false
  return DEMO_EMAILS.includes(email.toLowerCase().trim())
}

function getStorageKey(email: string, key: string): string {
  const safeEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `dedupeiq_user_${safeEmail}_${key}`
}

function getCurrentUserEmail(): string | null {
  try {
    const session = localStorage.getItem('dedupeiq_auth_session')
    if (session) {
      const parsed = JSON.parse(session)
      return parsed.email || null
    }
  } catch {
    // ignore
  }
  return null
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)
  return response.json()
}

// ---------------------------------------------------------------------------
// PER-USER DASHBOARD
// ---------------------------------------------------------------------------
export async function fetchDashboard(emailParam?: string | null): Promise<DashboardData> {
  const email = emailParam || getCurrentUserEmail()

  // Demo accounts load live backend data
  if (isDemoAccount(email)) {
    try {
      return await get<DashboardData>('/api/dashboard')
    } catch {
      return emptyDashboard
    }
  }

  // Custom user accounts load their dedicated local workspace state
  if (!email) return emptyDashboard

  try {
    const saved = localStorage.getItem(getStorageKey(email, 'dashboard'))
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // fallback
  }

  return emptyDashboard
}

// ---------------------------------------------------------------------------
// PER-USER DUPLICATE GROUPS
// ---------------------------------------------------------------------------
export async function fetchGroups(emailParam?: string | null): Promise<DuplicateGroup[]> {
  const email = emailParam || getCurrentUserEmail()

  if (isDemoAccount(email)) {
    try {
      return await get<DuplicateGroup[]>('/api/duplicate-groups')
    } catch {
      return []
    }
  }

  if (!email) return []

  try {
    const saved = localStorage.getItem(getStorageKey(email, 'groups'))
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // fallback
  }

  return []
}

// ---------------------------------------------------------------------------
// PER-USER SCAN HISTORY
// ---------------------------------------------------------------------------
export async function fetchHistory(emailParam?: string | null): Promise<ScanRecord[]> {
  const email = emailParam || getCurrentUserEmail()

  if (isDemoAccount(email)) {
    try {
      return await get<ScanRecord[]>('/api/history')
    } catch {
      return []
    }
  }

  if (!email) return []

  try {
    const saved = localStorage.getItem(getStorageKey(email, 'history'))
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // fallback
  }

  return []
}

// ---------------------------------------------------------------------------
// PER-USER QUARANTINE BIN
// ---------------------------------------------------------------------------
export async function fetchQuarantine(emailParam?: string | null): Promise<QuarantineItem[]> {
  const email = emailParam || getCurrentUserEmail()

  if (isDemoAccount(email)) {
    try {
      return await get<QuarantineItem[]>('/api/quarantine')
    } catch {
      return []
    }
  }

  if (!email) return []

  try {
    const saved = localStorage.getItem(getStorageKey(email, 'quarantine'))
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // fallback
  }

  return []
}

// ---------------------------------------------------------------------------
// SCAN EXECUTION
// ---------------------------------------------------------------------------
export async function fetchScanProgress(id: string) {
  return get<{ phase: string; processed: number; total: number; current_file?: string; status?: string }>(
    `/api/scans/${id}/progress`
  )
}

export async function startScan(payload: { name: string; fileCount: number; totalSize: number; files?: File[]; root_path?: string }) {
  let backendResult: { id: string; status: string }
  if (payload.files?.length) {
    const body = new FormData()
    body.append('name', payload.name)
    payload.files.forEach(file => body.append('files', file, file.webkitRelativePath || file.name))
    backendResult = await fetch('/api/scans', { method: 'POST', body }).then(r => r.json())
  } else {
    backendResult = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json())
  }

  // Update user's personal workspace history
  const email = getCurrentUserEmail()
  if (email && !isDemoAccount(email)) {
    try {
      const historyKey = getStorageKey(email, 'history')
      const existingHistory: ScanRecord[] = JSON.parse(localStorage.getItem(historyKey) || '[]')
      const newRecord: ScanRecord = {
        id: backendResult.id,
        name: payload.name,
        files: payload.fileCount || (payload.files?.length ?? 1),
        size: payload.totalSize || 0,
        groups: 0,
        recovered: 0,
        status: 'Completed',
        date: new Date().toISOString()
      }
      existingHistory.unshift(newRecord)
      localStorage.setItem(historyKey, JSON.stringify(existingHistory))

      // Update dashboard
      const dashKey = getStorageKey(email, 'dashboard')
      const currentDash: DashboardData = JSON.parse(localStorage.getItem(dashKey) || JSON.stringify(emptyDashboard))
      currentDash.filesScanned += newRecord.files
      currentDash.scannedSize += newRecord.size
      localStorage.setItem(dashKey, JSON.stringify(currentDash))
    } catch {
      // ignore
    }
  }

  return backendResult
}

// ---------------------------------------------------------------------------
// QUARANTINE ACTIONS (SYNCS BACKEND AND USER STORE)
// ---------------------------------------------------------------------------
export async function quarantineFile(id: string) {
  let res: any = { status: 'quarantined' }
  try {
    res = await fetch(`/api/files/${id}/quarantine`, { method: 'POST' }).then(r => r.json())
  } catch {
    // continue
  }

  const email = getCurrentUserEmail()
  if (email && !isDemoAccount(email)) {
    try {
      const groupsKey = getStorageKey(email, 'groups')
      const groups: DuplicateGroup[] = JSON.parse(localStorage.getItem(groupsKey) || '[]')
      const quarantineKey = getStorageKey(email, 'quarantine')
      const quarantineList: QuarantineItem[] = JSON.parse(localStorage.getItem(quarantineKey) || '[]')

      for (const group of groups) {
        const file = group.files.find(f => f.id === id)
        if (file) {
          quarantineList.push({
            id: file.id,
            fileId: file.id,
            name: file.name,
            originalPath: file.path,
            quarantinePath: `.dedupeiq/quarantine/${file.name}`,
            size: file.size,
            type: file.type,
            extension: file.extension || file.name.split('.').pop() || '',
            quarantinedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
            similarity: group.similarity || 100,
            groupTitle: group.title
          })

          // Update group
          group.files = group.files.filter(f => f.id !== id)
        }
      }

      localStorage.setItem(groupsKey, JSON.stringify(groups))
      localStorage.setItem(quarantineKey, JSON.stringify(quarantineList))
    } catch {
      // ignore
    }
  }


  return res
}

export async function restoreFile(id: string) {
  let res: any = { status: 'restored' }
  try {
    res = await fetch(`/api/files/${id}/restore`, { method: 'POST' }).then(r => r.json())
  } catch {
    // continue
  }

  const email = getCurrentUserEmail()
  if (email && !isDemoAccount(email)) {
    try {
      const quarantineKey = getStorageKey(email, 'quarantine')
      let quarantineList: QuarantineItem[] = JSON.parse(localStorage.getItem(quarantineKey) || '[]')
      quarantineList = quarantineList.filter(item => item.id !== id)
      localStorage.setItem(quarantineKey, JSON.stringify(quarantineList))
    } catch {
      // ignore
    }
  }

  return res
}

export async function deleteQuarantinedFile(id: string) {
  let res: any = { status: 'deleted' }
  try {
    res = await fetch(`/api/quarantine/${id}`, { method: 'DELETE' }).then(r => r.json())
  } catch {
    // continue
  }

  const email = getCurrentUserEmail()
  if (email && !isDemoAccount(email)) {
    try {
      const quarantineKey = getStorageKey(email, 'quarantine')
      let quarantineList: QuarantineItem[] = JSON.parse(localStorage.getItem(quarantineKey) || '[]')
      quarantineList = quarantineList.filter(item => item.id !== id)
      localStorage.setItem(quarantineKey, JSON.stringify(quarantineList))
    } catch {
      // ignore
    }
  }

  return res
}
