import React, { useState, useEffect, useMemo, ReactNode } from 'react'
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronRight,
  HardDrive,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchGroups, fetchDashboard } from '../lib/api'
import { DuplicateGroup, DashboardData } from '../types'
import { formatBytes } from '../lib/utils'
import { Button, Badge } from './ui'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/scan', label: 'Intelligent Scan', icon: FolderOpen },
  { to: '/groups', label: 'Duplicate Groups', icon: CopyIcon },
  { to: '/images', label: 'Image Duplicates', icon: ImageIcon },
  { to: '/documents', label: 'Document Revisions', icon: FileText }
]

const managementItems = [
  { to: '/quarantine', label: 'Quarantine Bin', icon: Archive },
  { to: '/history', label: 'Scan History', icon: Clock3 },
  { to: '/settings', label: 'Algorithm Settings', icon: Sliders }
]

export default function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const { data: groups = [] } = useQuery<DuplicateGroup[]>({
    queryKey: ['groups', user?.email],
    queryFn: () => fetchGroups(user?.email)
  })
  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.email],
    queryFn: () => fetchDashboard(user?.email)
  })

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

  // Page title mapping
  const currentNav = [...navItems, ...managementItems].find(
    item => item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )
  const pageTitle = currentNav?.label || 'Workspace Review'

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return groups.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.files.some(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
    )
  }, [groups, searchQuery])

  return (
    <div className="app-canvas min-h-screen text-[#f4f1eb] flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } app-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-200 ease-out`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#292d32]">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-500 text-[#221311] shadow-glow">
              <Sparkles size={16} strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-display font-bold text-[0.92rem] tracking-tight text-white">
                  Dedupe<span className="text-brand-400">IQ</span>
                </span>
                <span className="ml-2 rounded-full border border-white/10 px-1.5 py-0.5 text-[8px] uppercase font-mono tracking-wider text-slate-400">
                  local
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-7">
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <p className="eyebrow px-2 pb-2 text-slate-500">
                Workspace
              </p>
            )}
            <nav className="space-y-0.5">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-500/12 text-brand-200 font-semibold shadow-[inset_0_0_0_1px_rgba(248,117,103,0.16)]'
                          : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Management Navigation */}
          <div>
            {!collapsed && (
              <p className="eyebrow px-2 pb-2 text-slate-500">
                Operations
              </p>
            )}
            <nav className="space-y-0.5">
              {managementItems.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-500/12 text-brand-200 font-semibold shadow-[inset_0_0_0_1px_rgba(248,117,103,0.16)]'
                          : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>

        {/* About / Landing Page link */}
        {!collapsed && (
          <div className="px-3 pb-2">
            <Link
              to="/landing"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-semibold text-slate-500 hover:text-brand-300 hover:bg-brand-500/8 transition-colors border border-transparent hover:border-brand-500/20"
            >
              <span className="text-sm">🌐</span>
              <span>View Landing Page</span>
              <ChevronRight size={11} className="ml-auto" />
            </Link>
          </div>
        )}

        {/* User Footer Profile */}
        <div className="border-t border-[#292d32] p-3 bg-black/10">
          <div className="flex items-center justify-between rounded-xl p-2 hover:bg-white/[0.045] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#d9c5a7] text-xs font-bold text-[#2a211a]">
                {user?.avatarInitials || 'US'}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white leading-tight">{user?.name || 'Local User'}</p>
                  <p className="truncate text-[10px] text-slate-400 leading-tight mt-0.5">{user?.role || 'Administrator'}</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${collapsed ? 'lg:pl-16' : 'lg:pl-64'} flex-1 flex flex-col transition-all duration-200 ease-out min-h-screen`}>
        {/* Desktop Top Bar */}
        <header className="app-topbar sticky top-0 z-30 flex h-16 items-center justify-between border-b px-5 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden grid h-8 w-8 place-items-center rounded border border-[#222634] text-slate-400 hover:text-white"
            >
              <Menu size={16} />
            </button>
            
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-slate-400 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Personal workspace</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <h1 className="font-bold text-sm text-white tracking-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Input Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-[#30353b] bg-white/[0.035] px-3.5 py-2 text-xs text-slate-400 hover:border-[#555c64] hover:text-slate-200 transition-colors"
            >
              <Search size={13} className="text-slate-400" />
              <span className="hidden sm:inline">Search clusters or filenames...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden sm:inline-block rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Reclaimable Indicator */}
            {dashboard && dashboard.recoverable > 0 && (
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                <HardDrive size={12} />
                <span>{formatBytes(dashboard.recoverable)} Recoverable</span>
              </div>
            )}

            {/* Quick Action Button */}
            <Link to="/scan">
              <Button size="sm" className="bg-brand-500 hover:bg-brand-400 text-[#241312] font-bold text-xs h-9 shadow-glow">
                <Plus size={13} />
                <span className="hidden sm:inline">Scan Folder</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="relative flex-1 p-5 sm:p-8 lg:p-10 max-w-[1550px] w-full mx-auto">
          <div className="grain absolute inset-0" />
          <div className="relative">
          {children}
          </div>
        </main>
      </div>

      {/* Global Cmd+K Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-[#272d3f] bg-[#11141d] shadow-elevated">
            <div className="flex items-center border-b border-[#1e2230] px-4 py-3">
              <Search size={16} className="text-brand-400 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search duplicate clusters by file name or path..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded border border-[#222634]"
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
                      className="flex w-full items-center justify-between rounded-lg p-2.5 text-left hover:bg-[#1c2130] transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{group.title}</span>
                          <Badge tone={group.type === 'Exact' ? 'blue' : group.type === 'Near image' ? 'purple' : 'green'}>
                            {group.type}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400 truncate">
                          {group.files.length} copies · {formatBytes(group.recoverable)} recoverable
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No duplicate clusters found matching "{searchQuery}"
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Type to search across indexed duplicates, photos, and documents.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
