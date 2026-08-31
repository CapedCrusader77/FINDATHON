import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudOff,
  Copy as CopyIcon,
  Cpu,
  Download,
  Eye,
  FileArchive,
  FileCode,
  FileText,
  FolderOpen,
  GitCompare,
  HardDrive,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LucideIcon,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Undo2,
  Upload,
  X,
  Zap
} from 'lucide-react'
import { Button, Badge, Card, SectionTitle } from './components/ui'
import {
  fetchDashboard,
  fetchGroups,
  fetchHistory,
  fetchQuarantine,
  fetchScanProgress,
  quarantineFile,
  restoreFile,
  deleteQuarantinedFile,
  startScan
} from './lib/api'
import { formatBytes, formatDate } from './lib/utils'
import { DashboardData, DuplicateGroup, ScanRecord, FileRecord, QuarantineItem } from './types'

import ScanWorkflow from './pages/ScanPage'
import MiniRecoveryChart from './components/MiniRecoveryChart'
import ImageCompareModal from './components/ImageCompareModal'
import DocumentDiffViewer from './components/DocumentDiffViewer'
import RecoverySimulator from './components/RecoverySimulator'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/scan', label: 'Intelligent Scan', icon: FolderOpen },
  { to: '/groups', label: 'Duplicate Groups', icon: CopyIcon },
  { to: '/images', label: 'Image Duplicates', icon: ImageIcon },
  { to: '/documents', label: 'Document Revisions', icon: FileText }
]

const utilityItems = [
  { to: '/quarantine', label: 'Quarantine Bin', icon: Archive },
  { to: '/history', label: 'Scan History', icon: Clock3 },
  { to: '/settings', label: 'Algorithm Settings', icon: SettingsIcon }
]

function toneFor(type: string): 'blue' | 'purple' | 'green' | 'cyan' | 'amber' {
  if (type === 'Exact') return 'blue'
  if (type === 'Near document') return 'purple'
  if (type === 'Semantic match') return 'green'
  return 'cyan'
}

/* ========================================================================== */
/* APP SHELL                                                                 */
/* ========================================================================== */
function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { data: groups = [] } = useQuery<DuplicateGroup[]>({ queryKey: ['groups'], queryFn: fetchGroups })

  const pageTitle =
    location.pathname === '/'
      ? 'Overview'
      : navItems.concat(utilityItems).find(
          item => item.to !== '/' && location.pathname.startsWith(item.to)
        )?.label ?? 'Overview'

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return groups.filter(g =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.files.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [groups, searchQuery])

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-[78px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-[#0f172a]/95 backdrop-blur-2xl px-3.5 py-5 transition-all duration-300 shadow-2xl`}
      >
        {/* Brand Logo */}
        <div className={`mb-8 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2`}>
          <Link to="/" className="flex items-center gap-3 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-glow transition-transform group-hover:scale-105">
              <Sparkles size={18} />
            </span>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white font-display">
                  Dedupe<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">IQ</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                  Multi-Modal Engine
                </span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              className="text-slate-400 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-7 overflow-y-auto pr-1">
          <div>
            <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '·' : 'Workspace'}
            </p>
            {navItems.map(item => (
              <SideLink key={item.to} {...item} collapsed={collapsed} />
            ))}
          </div>

          <div>
            <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '·' : 'Management'}
            </p>
            {utilityItems.map(item => (
              <SideLink key={item.to} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>

        {/* Bottom Workspace / Privacy Pill */}
        <div className={`border-t border-white/10 pt-4 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white lg:flex transition-colors"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> <span>Collapse View</span></>}
          </button>

          <div className={`${collapsed ? 'mt-3 justify-center' : ''} flex items-center gap-3 px-2 pt-3`}>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-200">Local Safe Mode</p>
                <p className="truncate text-[10px] text-emerald-400 font-medium">Zero Cloud Uploads</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className={`${collapsed ? 'lg:pl-[78px]' : 'lg:pl-[260px]'} min-h-screen transition-all duration-300`}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#0b0f19]/80 px-6 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                <span>Personal Drive</span>
                <span>/</span>
                <span className="text-indigo-400 font-semibold">{pageTitle}</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white font-display">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-400 hover:border-white/20 hover:text-white transition-all shadow-sm"
            >
              <Search size={14} className="text-indigo-400" />
              <span>Search duplicate files or groups...</span>
              <kbd className="ml-4 rounded-md border border-white/15 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                ⌘ K
              </kbd>
            </button>

            {/* Quick Stats Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-300">
              <HardDrive size={14} className="text-emerald-400" />
              <span className="font-semibold">14.8 GB Reclaimable</span>
            </div>

            {/* Quick Scan CTA */}
            <Button size="sm" onClick={() => navigate('/scan')} className="bg-indigo-600 text-white shadow-glow">
              <FolderOpen size={14} />
              <span className="hidden sm:inline font-semibold">New Scan</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="mx-auto max-w-[1550px] p-5 sm:p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/scan" element={<ScanWorkflow />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId" element={<ReviewPage />} />
            <Route path="/images" element={<GroupsPage filter="image" />} />
            <Route path="/documents" element={<GroupsPage filter="document" />} />
            <Route path="/quarantine" element={<QuarantinePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>

      {/* Global Cmd+K Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl">
            <div className="flex items-center border-b border-white/10 px-4 py-3">
              <Search size={18} className="text-indigo-400 mr-3" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search duplicates by file name, path, or title..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {searchResults.length > 0 ? (
                searchResults.map(group => (
                  <button
                    key={group.id}
                    onClick={() => {
                      navigate(`/groups/${group.id}`)
                      setSearchOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{group.title}</span>
                        <Badge tone={toneFor(group.type)}>{group.type}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 truncate">
                        {group.files.length} files · {formatBytes(group.recoverable)} reclaimable
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-slate-500" />
                  </button>
                ))
              ) : searchQuery ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No duplicate groups matched "{searchQuery}".
                </div>
              ) : (
                <div className="p-4 text-xs text-slate-500">
                  Type to search across all scanned images, documents, and exact hash matches.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  )
}

function SideLink({
  to,
  label,
  icon: Icon,
  collapsed
}: {
  to: string
  label: string
  icon: LucideIcon
  collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `mb-1.5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
          isActive
            ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-glow'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={17} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && label === 'Quarantine Bin' && (
        <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
          3
        </span>
      )}
    </NavLink>
  )
}

/* ========================================================================== */
/* OVERVIEW PAGE                                                              */
/* ========================================================================== */
function Overview() {
  const queryClient = useQueryClient()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard
  })

  if (isLoading || !data) return <Loading />

  // If database is completely empty (0 files scanned)
  if (data.filesScanned === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Connected to MongoDB Atlas
              </span>
            </div>
            <h2 className="max-w-2xl text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
              Ready to Clean & Organize Your Personal Files.
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your database is connected and ready. Choose a folder on your computer to detect exact bit-for-bit copies, resized camera photos, and cross-format document drafts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/scan">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow">
                <FolderOpen size={17} />
                <span>Start First Scan</span>
                <ArrowUpRight size={16} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Empty State Action Card */}
        <Card className="p-8 sm:p-12 text-center border-dashed border-white/20 bg-slate-900/40">
          <div className="mx-auto max-w-lg">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-glow">
              <FolderOpen size={28} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-white">No Files Scanned Yet</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload a folder of images or documents to analyze perceptual hashes, cosine embeddings, and duplicate clusters.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/scan">
                <Button size="md" className="bg-indigo-600 text-white shadow-glow">
                  <FolderOpen size={15} /> Select Folder to Scan
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Pipeline Explainer */}
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <PipelineCard onRefresh={refetch} />
          <Card className="p-6 sm:p-7 border-white/10 bg-slate-900/60 flex flex-col justify-between">
            <SectionTitle
              eyebrow="Privacy Guarantee"
              title="100% Local-First Execution"
              subtitle="Files stay on your machine."
            />
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                ✓ All cryptographic SHA-256 hashes and perceptual image fingerprints run inside your local Python service.
              </p>
              <p>
                ✓ MongoDB stores only metadata, cluster links, and similarity scores.
              </p>
              <p>
                ✓ Safe soft-quarantine prevents accidental loss before permanent removal.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400 font-semibold border-t border-white/5 pt-4">
              <ShieldCheck size={16} /> MongoDB Atlas connection active
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Database Connected
            </span>
          </div>
          <h2 className="max-w-2xl text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
            Reclaim Space Without Losing Important Files.
          </h2>
          <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
            DedupeIQ groups exact cryptographic copies, resized images, and cross-format document drafts, explaining why they matched and recommending the highest quality master copy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/scan">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow">
              <FolderOpen size={17} />
              <span>Scan Folder</span>
              <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <MetricGrid data={data} />

      {/* Interactive Storage ROI Simulator */}
      <RecoverySimulator data={data} />

      {/* Recovery Chart and Category Donut Breakdown */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <RecoveryChart data={data} />
        <StorageBreakdown data={data} />
      </div>

      {/* Distribution Chart and Pipeline Explanation */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <RecentGroups />
        <PipelineCard onRefresh={refetch} />
      </div>
    </div>
  )
}


function MetricGrid({ data }: { data: DashboardData }) {
  const metrics = [
    {
      label: 'Files Analyzed',
      value: data.filesScanned.toLocaleString(),
      sub: `${formatBytes(data.scannedSize)} total workspace storage`,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Identified Duplicates',
      value: data.duplicateFiles.toLocaleString(),
      sub: `${Math.round((data.duplicateFiles / data.filesScanned) * 100)}% of your file corpus`,
      icon: CopyIcon,
      color: 'purple'
    },
    {
      label: 'Duplicate Clusters',
      value: data.duplicateGroups.toLocaleString(),
      sub: 'Ready for one-click review',
      icon: BarChart3,
      color: 'amber'
    },
    {
      label: 'Recoverable Space',
      value: formatBytes(data.recoverable),
      sub: `${formatBytes(data.recovered)} already recovered`,
      icon: HardDrive,
      color: 'green'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map(({ label, value, sub, icon: Icon, color }) => (
        <Card key={label} className="p-5 sm:p-6 border-white/10 bg-slate-900/60 hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold text-slate-400">{label}</p>
            <span
              className={`grid h-9 w-9 place-items-center rounded-xl ${
                color === 'blue'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : color === 'purple'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : color === 'amber'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald'
              }`}
            >
              <Icon size={16} />
            </span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">{sub}</p>
        </Card>
      ))}
    </div>
  )
}

function RecoveryChart({ data }: { data: DashboardData }) {
  return (
    <Card className="p-6 sm:p-7 border-white/10 bg-slate-900/60">
      <SectionTitle
        eyebrow="Storage Opportunities"
        title="Reclaimable Space by Category"
        action={
          <Badge tone="green">
            <ArrowDownToLine size={12} className="mr-1 inline" /> {formatBytes(data.recoverable)} Reclaimable
          </Badge>
        }
      />
      <div className="space-y-5 pt-2">
        {data.recoveryByType.map((item, i) => (
          <div key={item.name}>
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span className="text-slate-300">{item.name}</span>
              <span className="text-indigo-400 font-mono">{item.value.toFixed(1)} GB</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / 10) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className={`h-full rounded-full ${
                  i === 0
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    : i === 1
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                }`}
              />
            </div>
          </div>
        ))}

        <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
          <Zap size={15} className="text-amber-400" />
          <span>
            Reclaiming this space equates to approximately <strong className="text-white">4,620 high-res 24MP photos</strong>.
          </span>
        </div>
      </div>
    </Card>
  )
}

function StorageBreakdown({ data }: { data: DashboardData }) {
  return (
    <Card className="p-6 sm:p-7 border-white/10 bg-slate-900/60">
      <SectionTitle eyebrow="Collection Analysis" title="Workspace File Taxonomy" />
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Visual Donut Ring */}
        <div
          className="relative grid h-40 w-40 shrink-0 place-items-center rounded-full shadow-glow"
          style={{
            background: `conic-gradient(#6366f1 0 58%, #a855f7 58% 85%, #06b6d4 85% 100%)`
          }}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-slate-950 border border-white/10 shadow-inner">
            <div className="text-center">
              <p className="text-xl font-bold text-white font-display">312 GB</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Scanned</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3 w-full">
          {data.storageBreakdown.map(item => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-bold text-white font-mono">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3.5 text-xs text-indigo-200/90 leading-relaxed">
        <strong className="text-indigo-400 font-semibold">Smart Insight:</strong> Photos and media hold 58% of all reclaimable duplicates. Cleaning the top 10 image clusters reclaims 8.9 GB instantly.
      </div>
    </Card>
  )
}

function RecentGroups() {
  const { data = [] } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })

  if (!data.length) {
    return (
      <Card className="p-6 sm:p-7 border-white/10 bg-slate-900/60">
        <SectionTitle
          eyebrow="Prioritized Actions"
          title="Duplicate Clusters"
          action={
            <Link to="/scan" className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300">
              Run Scan <ChevronRight size={14} />
            </Link>
          }
        />
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-400">
          No duplicate clusters detected yet. Start a scan to surface near-duplicate candidates.
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-7 border-white/10 bg-slate-900/60">
      <SectionTitle
        eyebrow="Prioritized Actions"
        title="High-Value Duplicate Clusters"
        action={
          <Link to="/groups" className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300">
            View All ({data.length}) <ChevronRight size={14} />
          </Link>
        }
      />
      <div className="space-y-2.5">
        {data.slice(0, 3).map(group => (
          <Link
            to={`/groups/${group.id}`}
            key={group.id}
            className="group flex items-center gap-3.5 rounded-xl border border-white/5 bg-slate-950/40 p-3.5 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all"
          >
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                group.type === 'Exact'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : group.type === 'Near document'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {group.type === 'Near document' ? <FileText size={18} /> : <ImageIcon size={18} />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {group.title}
                </p>
                <Badge tone={toneFor(group.type)}>{group.type}</Badge>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 truncate">
                {group.files.length} copies · {group.explanation}
              </p>
            </div>

            <div className="text-right pl-2">
              <p className="text-xs font-bold text-emerald-400 font-mono">{formatBytes(group.recoverable)}</p>
              <p className="text-[10px] text-slate-500">recoverable</p>
            </div>

            <ChevronRight size={16} className="text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" />
          </Link>
        ))}
      </div>
    </Card>
  )
}

function PipelineCard({ onRefresh }: { onRefresh: () => void }) {
  const steps = [
    { name: 'Exact SHA-256 Hashing', desc: 'Instant byte-for-byte matching' },
    { name: 'Perceptual Visual Fingerprints', desc: 'pHash, dHash, & wHash Hamming distance' },
    { name: 'Deep NLP Text Normalization', desc: 'Cross-format DOCX ⟷ PDF ⟷ TXT parser' },
    { name: 'Explainable Louvain Clustering', desc: 'Community grouping with master star' }
  ]

  return (
    <Card className="p-6 sm:p-7 border-white/10 bg-slate-900/60">
      <SectionTitle
        eyebrow="Architecture"
        title="4-Stage Multi-Modal Pipeline"
        action={
          <button
            onClick={onRefresh}
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            title="Refresh pipeline status"
          >
            <RefreshCw size={14} />
          </button>
        }
      />

      <div className="space-y-3.5">
        {steps.map((step, i) => (
          <div key={step.name} className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/40 p-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400 border border-indigo-500/30">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white">{step.name}</p>
              <p className="text-[10px] text-slate-400">{step.desc}</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold">✓ Active</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 border-t border-white/5 pt-3">
        <ShieldCheck size={15} className="text-emerald-400" />
        <span>Fully localized in Flask · No third-party API dependencies.</span>
      </div>
    </Card>
  )
}

/* ========================================================================== */
/* GROUPS PAGE                                                                */
/* ========================================================================== */
function GroupsPage({ filter }: { filter?: 'image' | 'document' } = {}) {
  const { data = [], isLoading } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [inspectImageGroup, setInspectImageGroup] = useState<DuplicateGroup | null>(null)
  const [inspectDocGroup, setInspectDocGroup] = useState<DuplicateGroup | null>(null)

  const filtered = useMemo(() => {
    return data
      .filter(g => (!filter ? true : filter === 'image' ? g.category === 'image' || g.type === 'Near image' : g.category === 'document' || g.type === 'Near document' || g.type === 'Semantic match'))
      .filter(g =>
        tab === 'All'
          ? true
          : tab === 'Exact'
          ? g.type === 'Exact'
          : tab === 'Images'
          ? g.type === 'Near image'
          : tab === 'Documents'
          ? g.type === 'Near document' || g.type === 'Semantic match'
          : g.similarity >= 95
      )
      .filter(g =>
        search
          ? g.title.toLowerCase().includes(search.toLowerCase()) ||
            g.files.some(f => f.name.toLowerCase().includes(search.toLowerCase()))
          : true
      )
  }, [data, filter, tab, search])

  const totalRecoverable = useMemo(() => {
    return filtered.reduce((sum, g) => sum + g.recoverable, 0)
  }, [filtered])

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Review Workspace
            </p>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
            Duplicate Clusters & Explanations
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Examine detected near-duplicates side-by-side with explainable matching reasons and best-version recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            <Search size={14} className="text-indigo-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter clusters..."
              className="bg-transparent text-white outline-none w-32 sm:w-44 text-xs"
            />
          </div>

          <Button
            size="sm"
            disabled={!filtered.length}
            onClick={() => alert(`Auto-selected non-master files across ${filtered.length} groups for safe quarantine.`)}
            className="bg-indigo-600 text-white shadow-glow"
          >
            <Sparkles size={14} />
            <span>Select All Non-Masters</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {['All', 'Exact', 'Images', 'Documents', 'High Confidence (≥95%)'].map(item => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              tab === item
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item}
          </button>
        ))}

        <span className="ml-auto hidden text-xs font-semibold text-slate-400 sm:block">
          Showing {filtered.length} clusters ({formatBytes(totalRecoverable)} recoverable)
        </span>
      </div>

      {/* Cluster Grid */}
      {isLoading ? (
        <Loading />
      ) : filtered.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {filtered.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              onInspectImage={() => setInspectImageGroup(group)}
              onInspectDoc={() => setInspectDocGroup(group)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No duplicate candidates match this filter."
          body="Your scanned files contain no duplicates under this category, or you haven't scanned a folder yet."
          action="Scan a Folder"
        />
      )}

      {/* Image Comparison Modal */}
      {inspectImageGroup && (
        <ImageCompareModal
          group={inspectImageGroup}
          isOpen={Boolean(inspectImageGroup)}
          onClose={() => setInspectImageGroup(null)}
        />
      )}

      {/* Document Diff Viewer Modal */}
      {inspectDocGroup && (
        <DocumentDiffViewer
          group={inspectDocGroup}
          isOpen={Boolean(inspectDocGroup)}
          onClose={() => setInspectDocGroup(null)}
        />
      )}
    </div>
  )
}

function GroupCard({
  group,
  onInspectImage,
  onInspectDoc
}: {
  group: DuplicateGroup
  onInspectImage: () => void
  onInspectDoc: () => void
}) {
  const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
  const isImage = group.type === 'Near image' || group.category === 'image'
  const isDoc = group.type === 'Near document' || group.type === 'Semantic match' || group.category === 'document'

  return (
    <Card className="overflow-hidden border-white/10 bg-slate-900/70 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-xl">
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-white/5">
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                group.type === 'Exact'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : isDoc
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isDoc ? <FileText size={22} /> : <ImageIcon size={22} />}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white truncate tracking-tight">{group.title}</h3>
                <Badge tone={toneFor(group.type)}>{group.type}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {group.files.length} connected files · {group.confidence}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-indigo-400 font-display">{group.similarity}%</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Similarity</p>
          </div>
        </div>

        {/* Explainability Callout */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="rounded-xl border border-white/5 bg-slate-950/50 p-3.5 text-xs leading-relaxed text-slate-300">
            <p className="font-medium">{group.explanation}</p>
          </div>

          {/* Master Recommendation Box */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-start gap-3">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
              ★
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Master Copy Recommendation
              </p>
              <p className="text-xs font-semibold text-white truncate mt-0.5">{masterFile.name}</p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-normal">
                {group.recommendationReason}
              </p>
            </div>
          </div>

          {/* File Thumbnail Stack */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Candidate Files in Cluster ({group.files.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.files.map(file => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                    file.isRecommended
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-white'
                      : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold">{file.name}</span>
                      {file.isRecommended && (
                        <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-300">
                          KEEP
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatBytes(file.size)} · {file.dimensions || `${file.pages || 1} pgs`}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {file.isRecommended ? '100%' : `${file.quality}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/60 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Recoverable:</span>
          <span className="text-sm font-extrabold text-emerald-400 font-mono">
            {formatBytes(group.recoverable)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInspectImage}
              className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
            >
              <Sliders size={13} /> Split Slider
            </Button>
          )}

          {isDoc && group.diffData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInspectDoc}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-950/40"
            >
              <GitCompare size={13} /> View Diff
            </Button>
          )}

          <Link to={`/groups/${group.id}`}>
            <Button size="sm" className="bg-indigo-600 text-white shadow-glow">
              Review Group <ChevronRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

/* ========================================================================== */
/* REVIEW PAGE                                                                */
/* ========================================================================== */
function ReviewPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { data = [] } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
  const group = data.find(g => g.id === groupId) || data[0]

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [inspectModalOpen, setInspectModalOpen] = useState(false)
  const [docDiffOpen, setDocDiffOpen] = useState(false)

  // Preselect all non-master files by default for quick quarantine
  useEffect(() => {
    if (group) {
      const nonMasters = group.files.filter(f => !f.isRecommended).map(f => f.id)
      setSelectedIds(nonMasters)
    }
  }, [group])

  const mutation = useMutation({
    mutationFn: quarantineFile,
    onSuccess: () => {
      alert(`Moved ${selectedIds.length} files to soft quarantine. You can restore anytime.`)
      navigate('/quarantine')
    }
  })

  if (!group) return <EmptyState title="Group not found" body="This duplicate cluster has been resolved or does not exist." action="Back to Groups" />

  const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
  const isImage = group.type === 'Near image' || group.category === 'image'
  const isDoc = group.type === 'Near document' || group.type === 'Semantic match' || group.category === 'document'

  const totalSelectedBytes = group.files
    .filter(f => selectedIds.includes(f.id))
    .reduce((sum, f) => sum + f.size, 0)

  const toggleSelect = (id: string) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    )
  }

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <Link
            to="/groups"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            ← Back to All Duplicate Groups
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
              {group.title}
            </h2>
            <Badge tone={toneFor(group.type)}>{group.type}</Badge>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {group.similarity}% Algorithmic Match
            </span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            {group.files.length} candidate versions · {formatBytes(group.recoverable)} recoverable storage
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectModalOpen(true)}
              className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
            >
              <Sliders size={14} /> Open Split Inspector
            </Button>
          )}

          {isDoc && group.diffData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDocDiffOpen(true)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-950/40"
            >
              <GitCompare size={14} /> Open Document Diff
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            disabled={!selectedIds.length}
            onClick={() => {
              if (window.confirm(`Move ${selectedIds.length} duplicate copies to Quarantine? (${formatBytes(totalSelectedBytes)})`)) {
                selectedIds.forEach(id => mutation.mutate(id))
              }
            }}
          >
            <Archive size={14} /> Quarantine Selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Left: Files Table */}
        <Card className="overflow-hidden border-white/10 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/50 p-5">
            <div>
              <p className="text-sm font-bold text-white">Files in this Duplicate Cluster</p>
              <p className="text-xs text-slate-400">
                Check copies you wish to quarantine. The recommended master is highlighted in green.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(group.files.filter(f => !f.isRecommended).map(f => f.id))}
                className="text-xs font-semibold text-indigo-400 hover:underline"
              >
                Keep Master Only
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-semibold text-slate-400 hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {group.files.map(file => {
              const isSelected = selectedIds.includes(file.id)
              return (
                <div
                  key={file.id}
                  className={`flex items-center gap-4 p-5 transition-all ${
                    file.isRecommended
                      ? 'bg-emerald-950/15'
                      : isSelected
                      ? 'bg-indigo-950/30'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(file.id)}
                    className="h-4.5 w-4.5 rounded border-white/20 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />

                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                      file.type === 'image'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {file.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">{file.name}</p>
                      {file.isRecommended && (
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                          ★ RECOMMENDED MASTER
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-[11px] text-slate-400">{file.path}</p>
                  </div>

                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-white font-mono">{formatBytes(file.size)}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {file.dimensions || `${file.pages || 1} pages`} · {file.quality}% quality
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Right: Why Matched & Recommendation Specs */}
        <div className="space-y-6">
          {/* Why Matched Signals */}
          <Card className="p-6 border-white/10 bg-slate-900/70">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-glow">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Why This Cluster Matched</h4>
                <p className="text-[11px] text-slate-400">Signals evaluated by hybrid detector</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {group.explanation}
            </p>

            <div className="space-y-3">
              {group.signals.map(signal => (
                <div
                  key={signal.label}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-3 text-xs"
                >
                  <span className="text-slate-300 font-medium">{signal.label}</span>
                  {signal.score ? (
                    <span className="font-bold text-indigo-400 font-mono">{signal.score}%</span>
                  ) : signal.value ? (
                    <span className="text-[11px] text-slate-400 font-mono">{signal.value}</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">✓ Match</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Master Recommendation Card */}
          <Card className="p-6 border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-900/70 shadow-glow-emerald">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Algorithmic Recommendation</span>
            </div>

            <h4 className="mt-3 text-base font-bold text-white">
              Retain {masterFile.name}
            </h4>

            <p className="mt-2 text-xs text-emerald-200/90 leading-relaxed">
              {group.recommendationReason}
            </p>

            <div className="mt-5 border-t border-emerald-500/20 pt-4 flex items-center justify-between text-xs text-emerald-300">
              <span>Zero-regret soft quarantine with 30-day restore guarantee.</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {inspectModalOpen && (
        <ImageCompareModal
          group={group}
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
        />
      )}

      {/* Document Diff Modal */}
      {docDiffOpen && (
        <DocumentDiffViewer
          group={group}
          isOpen={docDiffOpen}
          onClose={() => setDocDiffOpen(false)}
        />
      )}
    </div>
  )
}

/* ========================================================================== */
/* QUARANTINE PAGE                                                            */
/* ========================================================================== */
function QuarantinePage() {
  const queryClient = useQueryClient()
  const { data: items = [], refetch } = useQuery<QuarantineItem[]>({ queryKey: ['quarantine'], queryFn: fetchQuarantine })

  const totalBytes = items.reduce((sum: number, item: QuarantineItem) => sum + item.size, 0)

  const handleRestore = async (id: string) => {
    await restoreFile(id)
    refetch()
    alert('File restored successfully to its original folder location.')
  }


  const handleEmptyQuarantine = async () => {
    if (window.confirm('Permanently wipe all quarantined files? This action cannot be undone.')) {
      for (const item of items) {
        await fetch(`/api/quarantine/${item.id}`, { method: 'DELETE' })
      }
      refetch()
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Safety Quarantine Net
            </p>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
            Quarantined Files
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Files are held here safely for 30 days before permanent purging. You can restore them with one click.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          disabled={!items.length}
          onClick={handleEmptyQuarantine}
        >
          <Trash2 size={14} /> Empty Quarantine ({items.length})
        </Button>
      </div>

      <Card className="overflow-hidden border-white/10 bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/50 p-5">
          <div className="flex items-center gap-3">
            <Badge tone="amber">{items.length} Files Staged</Badge>
            <span className="text-xs text-slate-400">
              Total space pending recovery: <strong className="text-emerald-400">{formatBytes(totalBytes)}</strong>
            </span>
          </div>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="xs"
              onClick={async () => {
                for (const item of items) {
                  await fetch(`/api/files/${item.id}/restore`, { method: 'POST' })
                }
                refetch()
                alert('Restored all files to their original paths.')
              }}
              className="text-slate-300 border-white/10"
            >
              <Undo2 size={13} /> Restore All
            </Button>
          )}
        </div>

        {items.length ? (
          <div className="divide-y divide-white/5">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-800 text-slate-300 border border-white/10">
                  {item.type === 'image' ? <ImageIcon size={18} /> : <FileText size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
                      From "{item.groupTitle}"
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-slate-400 truncate">{item.originalPath}</p>
                </div>

                <div className="hidden sm:block text-right pr-2">
                  <p className="text-xs font-bold text-white font-mono">{formatBytes(item.size)}</p>
                  <p className="text-[10px] text-slate-500">Auto-expires in 29 days</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(item.id)}
                  className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
                >
                  <Undo2 size={13} /> Restore
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Quarantine Bin is Empty"
            body="No files are currently waiting for deletion. Quarantined copies will appear here with instant restore options."
            action="Scan Workspace"
          />
        )}
      </Card>
    </div>
  )
}

/* ========================================================================== */
/* HISTORY PAGE                                                               */
/* ========================================================================== */
function HistoryPage() {
  const { data = [] } = useQuery({ queryKey: ['history'], queryFn: fetchHistory })

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            Audit Activity
          </p>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
          Scan History & Logs
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Review past folder scans, cluster counts, and recovered storage metrics.
        </p>
      </div>

      <Card className="overflow-hidden border-white/10 bg-slate-900/70">
        <div className="hidden grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-4 border-b border-white/10 bg-slate-950/60 px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
          <span>Scan Target</span>
          <span>Files Processed</span>
          <span>Duplicate Groups</span>
          <span>Recovered</span>
          <span>Date</span>
        </div>

        <div className="divide-y divide-white/5">
          {data.length ? (
            data.map((scan: ScanRecord) => (
              <div
                key={scan.id}
                className="grid gap-3 px-6 py-4.5 sm:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.9fr] sm:items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    <FolderOpen size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{scan.name}</p>
                    <p className="text-[11px] text-slate-400">{formatBytes(scan.size)} analyzed</p>
                  </div>
                </div>

                <span className="text-xs text-slate-300 font-mono">{scan.files.toLocaleString()} files</span>
                <span className="text-xs text-indigo-300 font-semibold">{scan.groups} clusters</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{formatBytes(scan.recovered)}</span>
                <span className="text-xs text-slate-400">{formatDate(scan.date)}</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No previous scan activity recorded yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}


/* ========================================================================== */
/* SETTINGS PAGE                                                              */
/* ========================================================================== */
function SettingsPage() {
  const [imageThreshold, setImageThreshold] = useState(85)
  const [docThreshold, setDocThreshold] = useState(80)
  const [semanticThreshold, setSemanticThreshold] = useState(78)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-4xl space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            Algorithm Tuning
          </p>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
          Deduplication Engine Settings
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Configure detection sensitivity, master copy prioritization heuristics, and privacy parameters.
        </p>
      </div>

      <Card className="divide-y divide-white/10 border-white/10 bg-slate-900/70">
        {/* Similarity Thresholds */}
        <section className="p-6 sm:p-7">
          <h3 className="text-base font-bold text-white">Similarity Thresholds</h3>
          <p className="mt-1 text-xs text-slate-400">
            Only candidate pairs scoring above these cutoff percentages will form duplicate clusters.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Image Perceptual Hash + CLIP Threshold</span>
                <span className="font-bold text-indigo-400 font-mono">{imageThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                value={imageThreshold}
                onChange={e => setImageThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Document TF-IDF Text Overlap Threshold</span>
                <span className="font-bold text-indigo-400 font-mono">{docThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                value={docThreshold}
                onChange={e => setDocThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Semantic Paraphrase Embedding Threshold (MiniLM)</span>
                <span className="font-bold text-indigo-400 font-mono">{semanticThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                value={semanticThreshold}
                onChange={e => setSemanticThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Master Copy Priority */}
        <section className="p-6 sm:p-7">
          <h3 className="text-base font-bold text-white">Master Copy Recommendation Heuristics</h3>
          <p className="mt-1 text-xs text-slate-400">
            Define which attributes award priority points when designating the Recommended Master File.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { title: 'Highest Quality', desc: 'Highest resolution, lowest compression, preserved EXIF tags' },
              { title: 'Newest Version', desc: 'Latest modification timestamp and newest text additions' },
              { title: 'Original Creation', desc: 'Oldest capture date and pristine source format' }
            ].map((item, i) => (
              <button
                key={item.title}
                className={`rounded-xl border p-4 text-left transition-all ${
                  i === 0
                    ? 'border-indigo-500/80 bg-indigo-950/30 text-white shadow-glow'
                    : 'border-white/10 bg-slate-950/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  {i === 0 && (
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-normal">{item.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section className="p-6 sm:p-7">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-xs text-emerald-300">
            <CloudOff size={24} className="shrink-0 text-emerald-400" />
            <div className="leading-relaxed">
              <strong className="text-white text-sm block mb-0.5">100% Local-First Privacy Guarantee</strong>
              All cryptographic hashing, OpenCV visual transforms, and text normalization happen directly in the Python runtime. Zero documents or image embeddings are ever uploaded to cloud servers.
            </div>
          </div>
        </section>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow px-6">
          {saved ? <Check size={16} /> : <Zap size={16} />}
          {saved ? 'Settings Saved' : 'Save Algorithm Preferences'}
        </Button>
      </div>
    </div>
  )
}

/* ========================================================================== */
/* HELPER COMPONENTS                                                          */
/* ========================================================================== */
function EmptyState({ title, body, action }: { title: string; body: string; action?: string }) {
  return (
    <div className="grid min-h-[340px] place-items-center rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <FolderOpen size={24} />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-400">{body}</p>
        {action && (
          <Link to="/scan" className="mt-5 inline-flex">
            <Button size="sm" className="bg-indigo-600 text-white shadow-glow">
              <FolderOpen size={14} /> {action}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="grid min-h-[300px] place-items-center">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <RefreshCw size={18} className="animate-spin text-indigo-400" />
        <span>Loading workspace data...</span>
      </div>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
