export type GroupType = 'Exact' | 'Near image' | 'Near document' | 'Semantic match'
export type Confidence = 'Exact duplicate' | 'Almost certain' | 'Highly similar' | 'Possible duplicate'

export interface FileRecord {
  id: string; name: string; path: string; type: 'image' | 'document' | 'other'; extension: string
  size: number; modifiedAt: string; dimensions?: string; pages?: number; quality: number
  isRecommended?: boolean; status?: 'active' | 'quarantined'
}

export interface DuplicateGroup {
  id: string; title: string; type: GroupType; files: FileRecord[]; similarity: number
  recoverable: number; confidence: Confidence; explanation: string; signals: { label: string; value?: string; score?: number }[]
}

export interface DashboardData {
  isDemo?: boolean; filesScanned: number; duplicateFiles: number; duplicateGroups: number
  recoverable: number; recovered: number; scannedSize: number
  storageBreakdown: { name: string; value: number; color: string }[]
  duplicateBreakdown: { name: string; value: number; color: string }[]
  recoveryByType: { name: string; value: number }[]
}

export interface ScanRecord { id: string; name: string; files: number; size: number; groups: number; recovered: number; date: string; status: string }
