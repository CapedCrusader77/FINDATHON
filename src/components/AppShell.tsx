import React, { useState, useEffect, useMemo, ReactNode } from 'react'
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import {
  LayoutDashboard, FolderOpen, Copy as CopyIcon, Image as ImageIcon,
  FileText, Archive, Clock3, Sliders, Sparkles, Search,
  Plus, ShieldCheck, LogOut, ChevronRight, HardDrive,
  Wifi, BatteryCharging, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchGroups, fetchDashboard, fetchQuarantine } from '../lib/api'
import { DuplicateGroup, DashboardData, QuarantineItem } from '../types'
import { formatBytes } from '../lib/utils'
import { Button, Badge } from './ui'

const dockItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, gradient: 'from-blue-500 to-indigo-600' },
  { to: '/scan', label: 'Scan Engine', icon: FolderOpen, gradient: 'from-indigo-500 to-purple-600' },
  { to: '/groups', label: 'All Clusters', icon: CopyIcon, gradient: 'from-purple-500 to-pink-600' },
  { to: '/images', label: 'Photos', icon: ImageIcon, gradient: 'from-pink-500 to-rose-600' },
  { to: '/documents', label: 'Documents', icon: FileText, gradient: 'from-amber-500 to-orange-600' },
  { to: '/quarantine', label: 'Quarantine', icon: Archive, gradient: 'from-emerald-500 to-teal-600', badgeKey: 'quarantine' },
  { to: '/history', label: 'History', icon: Clock3, gradient: 'from-cyan-500 to-blue-600' },
  { to: '/settings', label: 'Settings', icon: Sliders, gradient: 'from-slate-500 to-slate-700' },
]

function DockIcon({ item, quarantineCount }: { item: typeof dockItems[0], quarantineCount: number }) {
  const location = useLocation()
  const [hovered, setHovered] = useState(false)
  const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  const Icon = item.icon
  const badgeCount = item.badgeKey === 'quarantine' ? quarantineCount : 0

  return (
    <div className="relative flex flex-col items-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute -top-9 rounded-lg border border-white/[0.16] bg-[#0c101d]/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur-xl pointer-events-none whitespace-nowrap z-50"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      <NavLink
        to={item.to}
        end={item.to === '/'}
        className="relative"
      >
        <motion.div
          whileHover={{ y: -7, scale: 1.22 }}
          whileTap={{ scale: 0.91 }}
          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
          className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-all duration-150 ${
            isActive
              ? `bg-gradient-to-br ${item.gradient} text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]`
              : 'bg-white/[0.07] text-slate-300 hover:bg-white/[0.14] hover:text-white border border-white/[0.09]'
          }`}
        >
          <Icon size={21} />
          {badgeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg"
            >
              {badgeCount}
            </motion.span>
          )}
        </motion.div>
      </NavLink>

      <motion.span
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
        className="mt-1 h-1 w-1 rounded-full bg-white shadow-[0_0_5px_#fff]"
      />
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(p => !p) }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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

  const currentNav = dockItems.find(item =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return groups.filter(g =>
      g.title.toLowerCase().includes(q) || g.files.some(f => f.name.toLowerCase().includes(q))
    )
  }, [groups, searchQuery])

  return (
    <div className="relative min-h-screen bg-[#08090d] text-[#f8fafc] flex flex-col overflow-x-hidden pb-28">
      {/* Ambient mesh */}
      <div className="rainbow-mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
        <div className="mesh-blob blob-4" />
      </div>

      {/* macOS Top Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-white/[0.08] bg-[#08090d]/75 px-5 sm:px-8 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full tl-close cursor-pointer hover:scale-110 transition-transform" onClick={logout} title="Sign out" />
            <span className="h-3 w-3 rounded-full tl-minimize cursor-pointer hover:scale-110 transition-transform" />
            <span className="h-3 w-3 rounded-full tl-expand cursor-pointer hover:scale-110 transition-transform" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-slate-600">|</span>
            <motion.span
              key={currentNav?.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-semibold text-white text-xs"
            >
              {currentNav?.label ?? 'Workspace'}
            </motion.span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live clock */}
          <span className="hidden md:block font-mono text-[11px] text-slate-400 tabular-nums">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          {/* Spotlight */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:border-white/[0.22] hover:bg-white/[0.08] transition-all backdrop-blur-md"
          >
            <Search size={13} className="text-slate-400" />
            <span className="hidden sm:inline">Spotlight...</span>
            <kbd className="hidden sm:inline-block rounded-md border border-white/[0.12] bg-white/[0.06] px-1.5 text-[9px] font-mono">⌘K</kbd>
          </motion.button>

          {/* Reclaimable badge */}
          {dashboard && dashboard.recoverable > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md"
            >
              <HardDrive size={11} />
              {formatBytes(dashboard.recoverable)} free
            </motion.div>
          )}

          <Link to="/scan">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-8 shadow-[0_0_18px_rgba(59,130,246,0.4)] rounded-xl">
                <Plus size={13} /><span className="hidden sm:inline">Scan</span>
              </Button>
            </motion.div>
          </Link>

          {/* Avatar + logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.10]">
            <motion.div
              whileHover={{ scale: 1.08 }}
              title={user?.email}
              className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-bold shadow-sm cursor-pointer"
            >
              {user?.avatarInitials ?? 'US'}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={logout}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
              title="Sign Out"
            >
              <LogOut size={13} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Page Content */}
      <main className="relative z-10 flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Dock */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 280, damping: 24 }}
        className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      >
        <div className="pointer-events-auto flex items-end gap-2 rounded-2xl glass-dock px-3 py-2.5 shadow-dock">
          {dockItems.map(item => (
            <DockIcon key={item.to} item={item} quarantineCount={quarantine.length} />
          ))}
          {/* Divider + Logout */}
          <div className="h-10 w-px bg-white/[0.12] mx-1" />
          <motion.button
            whileHover={{ y: -7, scale: 1.22 }}
            whileTap={{ scale: 0.91 }}
            onClick={logout}
            title="Sign Out"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.07] border border-white/[0.09] text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </motion.div>

      {/* Spotlight Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.94, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed left-1/2 top-20 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/[0.18] bg-[#0f1422]/92 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] backdrop-blur-3xl"
            >
              <div className="flex items-center border-b border-white/[0.10] px-4 py-3.5 gap-3">
                <Search size={18} className="text-blue-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search clusters, files, or formats..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.12] bg-white/[0.05] text-slate-400 hover:text-white text-[10px] font-mono">
                  <X size={13} />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                <AnimatePresence>
                  {searchResults.length > 0 ? (
                    searchResults.map((group, i) => (
                      <motion.button
                        key={group.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { navigate(`/groups/${group.id}`); setSearchOpen(false) }}
                        className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-white/[0.09] transition-colors group"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{group.title}</span>
                            <Badge tone="blue">{group.type}</Badge>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-400">{group.files.length} copies · {formatBytes(group.recoverable)} reclaimable</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-500 group-hover:text-white shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </motion.button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      {searchQuery.trim() ? 'No matching clusters found.' : 'Start typing to search across indexed files and clusters.'}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
