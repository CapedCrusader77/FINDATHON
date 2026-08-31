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

  const { data: groups = [] } = useQuery<DuplicateGroup[]>({ queryKey: ['groups'], queryFn: fetchGroups })
  const { data: dashboard } = useQuery<DashboardData>({ queryKey: ['dashboard'], queryFn: fetchDashboard })

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
    <div className="min-h-screen bg-[#0c0e14] text-[#f0f3f6] flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
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
        } fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1e2230] bg-[#11141d] transition-all duration-200 ease-out`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-[#1e2230]">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Sparkles size={15} />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-display font-bold text-sm tracking-tight text-white">
                  Dedupe<span className="text-brand-400">IQ</span>
                </span>
                <span className="ml-1.5 text-[9px] uppercase font-mono tracking-wider text-slate-400">
                  v1.0
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-[#1b1f2b] hover:text-white transition-colors"
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
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
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
                      `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#1c2130] text-brand-300 font-semibold border-l-2 border-brand-500 pl-2'
                          : 'text-slate-400 hover:bg-[#161922] hover:text-slate-200'
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
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
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
                      `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#1c2130] text-brand-300 font-semibold border-l-2 border-brand-500 pl-2'
                          : 'text-slate-400 hover:bg-[#161922] hover:text-slate-200'
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

        {/* User Footer Profile */}
        <div className="border-t border-[#1e2230] p-2.5 bg-[#0f121a]">
          <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-[#161922] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#222738] text-xs font-bold text-slate-200 border border-[#2d344a]">
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
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1e2230] bg-[#0c0e14]/90 px-5 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden grid h-8 w-8 place-items-center rounded border border-[#222634] text-slate-400 hover:text-white"
            >
              <Menu size={16} />
            </button>
            
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Workspace</span>
              <span className="text-slate-400 hidden sm:inline">/</span>
              <h1 className="font-bold text-sm text-white tracking-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Input Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 rounded-lg border border-[#222634] bg-[#11141d] px-3 py-1.5 text-xs text-slate-400 hover:border-[#373e54] hover:text-slate-200 transition-colors"
            >
              <Search size={13} className="text-slate-400" />
              <span className="hidden sm:inline">Search clusters or filenames...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden sm:inline-block rounded border border-[#2a3042] bg-[#161922] px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Reclaimable Indicator */}
            {dashboard && dashboard.recoverable > 0 && (
              <div className="hidden md:flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                <HardDrive size={12} />
                <span>{formatBytes(dashboard.recoverable)} Recoverable</span>
              </div>
            )}

            {/* Quick Action Button */}
            <Link to="/scan">
              <Button size="sm" className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs h-8">
                <Plus size={13} />
                <span className="hidden sm:inline">Scan Folder</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-5 sm:p-8 max-w-[1550px] w-full mx-auto">
          {children}
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
