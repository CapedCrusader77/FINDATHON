export type GroupType = 'Exact' | 'Near image' | 'Near document' | 'Semantic match'
export type Confidence = 'Exact duplicate' | 'Almost certain' | 'Highly similar' | 'Possible duplicate'

export interface FileRecord {
  id: string
  name: string
  path: string
  type: 'image' | 'document' | 'other'
  extension: string
  size: number
  modifiedAt: string
  dimensions?: string
  megapixels?: string
  pages?: number
  quality: number
  isRecommended?: boolean
  status?: 'active' | 'quarantined'
  phash?: string
  sha256?: string
  imageUrl?: string
  previewText?: string
  exif?: {
    camera?: string
    lens?: string
    iso?: string
    exposure?: string
    date?: string
    colorSpace?: string
  }
}

export interface DiffSegment {
  type: 'added' | 'removed' | 'unchanged'
  text: string
  lineNumA?: number
  lineNumB?: number
}

export interface DuplicateGroup {
  id: string
  title: string
  category: 'image' | 'document' | 'exact'
  type: GroupType
  files: FileRecord[]
  similarity: number
  recoverable: number
  confidence: Confidence
  explanation: string
  recommendationReason: string
  signals: {
    label: string
    value?: string
    score?: number
    description?: string
    isWarning?: boolean
  }[]
  diffData?: {
    fileA: string
    fileB: string
    segments: DiffSegment[]
    wordOverlap: number
    addedLines: number
    removedLines: number
  }
}

export interface DashboardData {
  isDemo?: boolean
  filesScanned: number
  duplicateFiles: number
  duplicateGroups: number
  recoverable: number
  recovered: number
  scannedSize: number
  storageBreakdown: { name: string; value: number; color: string; bytes: number }[]
  duplicateBreakdown: { name: string; value: number; color: string }[]
  recoveryByType: { name: string; value: number; color?: string; bytes: number }[]
}

export interface ScanRecord {
  id: string
  name: string
  files: number
  size: number
  groups: number
  recovered: number
  date: string
  status: string
  duration?: string
}

export interface QuarantineItem {
  id: string
  fileId: string
  name: string
  originalPath: string
  quarantinePath: string
  size: number
  type: 'image' | 'document' | 'other'
  extension: string
  quarantinedAt: string
  expiresAt: string
  similarity: number
  groupTitle: string
}

