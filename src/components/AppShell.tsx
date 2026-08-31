import React, { useState, useEffect, useMemo, ReactNode } from 'react'
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderOpen,
  Copy as CopyIcon,
  Image as ImageIcon,
  FileText,
  Archive,
  Clock3,
  Sliders,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  LogOut,
  ChevronRight,
  HardDrive,
  Menu,
  X,
  User as UserIcon,
  Wifi,
  BatteryCharging
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchGroups, fetchDashboard, fetchQuarantine } from '../lib/api'
import { DuplicateGroup, DashboardData, QuarantineItem } from '../types'
import { formatBytes } from '../lib/utils'
import { Button, Badge, TrafficLights } from './ui'

interface AppShellProps {
  children: ReactNode
}

const dockItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, color: 'from-blue-500 to-indigo-600' },
  { to: '/scan', label: 'Scan Engine', icon: FolderOpen, color: 'from-indigo-500 to-purple-600' },
  { to: '/groups', label: 'All Groups', icon: CopyIcon, color: 'from-purple-500 to-pink-600' },
  { to: '/images', label: 'Photos', icon: ImageIcon, color: 'from-pink-500 to-rose-600' },
  { to: '/documents', label: 'Documents', icon: FileText, color: 'from-amber-500 to-orange-600' },
  { to: '/quarantine', label: 'Quarantine', icon: Archive, color: 'from-emerald-500 to-teal-600', badgeKey: 'quarantine' },
  { to: '/history', label: 'History', icon: Clock3, color: 'from-cyan-500 to-blue-600' },
  { to: '/settings', label: 'Settings', icon: Sliders, color: 'from-slate-600 to-slate-800' }
]

export default function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredDock, setHoveredDock] = useState<string | null>(null)

  const { data: groups = [] } = useQuery<DuplicateGroup[]>({
    queryKey: ['groups', user?.email],
    queryFn: () => fetchGroups(user?.email)
  })
  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.email],
    queryFn: () => fetchDashboard(user?.email)
  })
  const { data: quarantine = [] } = useQuery<QuarantineItem[]>({
    queryKey: ['quarantine', user?.email],
    queryFn: () => fetchQuarantine(user?.email)
  })

  // Keyboard shortcut Cmd/Ctrl + K or Cmd/Ctrl + Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === ' ')) {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentNav = dockItems.find(
    item => item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )
  const pageTitle = currentNav?.label || 'Workspace Review'

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return groups.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.files.some(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
    )
  }, [groups, searchQuery])

  return (
    <div className="relative min-h-screen bg-[#08090d] text-[#f8fafc] flex flex-col selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden pb-24">
      {/* Fluid Rainbow Mesh Backdrop */}
      <div className="rainbow-mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
        <div className="mesh-blob blob-4" />
      </div>

      {/* macOS Top Status & Menu Bar */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-white/[0.08] bg-[#08090d]/75 px-5 sm:px-8 backdrop-blur-2xl">
        {/* Left: Window Traffic Lights & Title */}
        <div className="flex items-center gap-4">
          <TrafficLights />
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">DedupeIQ Pro</span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <h1 className="font-bold text-xs sm:text-sm text-white tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Center / Right: Spotlight Search & Quick Stats */}
        <div className="flex items-center gap-3">
          {/* Spotlight Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-xs text-slate-300 hover:border-white/[0.22] hover:bg-white/[0.08] transition-all backdrop-blur-md"
          >
            <Search size={13} className="text-slate-400" />
            <span className="hidden sm:inline">Spotlight search...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden sm:inline-block rounded-md border border-white/[0.12] bg-white/[0.06] px-1.5 py-0.2 text-[9px] font-mono text-slate-300">
              ⌘K
            </kbd>
          </button>

          {/* Recoverable Storage Indicator */}
          {dashboard && dashboard.recoverable > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.8 text-[11px] font-semibold text-emerald-300 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <HardDrive size={12} />
              <span>{formatBytes(dashboard.recoverable)} Reclaimable</span>
            </div>
          )}

          {/* New Scan Trigger */}
          <Link to="/scan">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-8 shadow-glowBlue rounded-xl">
              <Plus size={13} />
              <span className="hidden sm:inline">Scan Folder</span>
            </Button>
          </Link>

          {/* User Profile Avatar & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.10]">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-bold shadow-sm" title={user?.email}>
              {user?.avatarInitials || 'US'}
            </div>
            <button
              onClick={logout}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
              title="Lock / Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Workspace Content */}
      <main className="relative z-10 flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>

      {/* Floating macOS Liquid Acrylic Dock */}
      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 rounded-2xl macos-dock-glass p-2 shadow-dock"
        >
          {dockItems.map(item => {
            const Icon = item.icon
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            const badgeCount = item.badgeKey === 'quarantine' ? quarantine.length : 0

            return (
              <div key={item.to} className="relative group flex flex-col items-center">
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredDock === item.to && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: -8, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      className="absolute -top-7 rounded-lg border border-white/[0.15] bg-[#0c101d]/90 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-xl backdrop-blur-xl pointer-events-none whitespace-nowrap z-50"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dock Icon Button */}
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onMouseEnter={() => setHoveredDock(item.to)}
                  onMouseLeave={() => setHoveredDock(null)}
                  className={`relative grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-2xl transition-all duration-200 transform group-hover:scale-115 group-hover:-translate-y-1.5 group-active:scale-95 ${
                    isActive
                      ? `bg-gradient-to-br ${item.color} text-white shadow-glowBlue`
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.14] hover:text-white border border-white/[0.08]'
                  }`}
                >
                  <Icon size={20} className="transition-transform group-hover:scale-105" />

                  {/* Notification Badge */}
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 grid h-4.5 w-4.5 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>

                {/* Active macOS Indicator Dot */}
                <span
                  className={`mt-1 h-1 w-1 rounded-full transition-all duration-200 ${
                    isActive ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-transparent'
                  }`}
                />
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Spotlight Search Modal (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.18] bg-[#0f1422]/90 shadow-window backdrop-blur-3xl">
            <div className="flex items-center border-b border-white/[0.10] px-4 py-3.5">
              <Search size={18} className="text-blue-400 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Spotlight search files, clusters, or formats..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-medium"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-0.5 rounded-md border border-white/[0.12] bg-white/[0.05]"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map(group => (
                    <button
                      key={group.id}
                      onClick={() => {
                        navigate(`/groups/${group.id}`)
                        setSearchOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-white/[0.08] transition-colors group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{group.title}</span>
                          <Badge tone={group.type === 'Exact' ? 'blue' : group.type === 'Near image' ? 'purple' : 'green'}>
                            {group.type}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                          {group.files.length} copies · {formatBytes(group.recoverable)} reclaimable
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-slate-500 group-hover:text-white shrink-0" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching duplicate files or clusters found.
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Type to search across indexed documents, photos, and duplicate clusters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
