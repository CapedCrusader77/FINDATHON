import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import AppShell from './components/AppShell'
import OverviewPage from './pages/OverviewPage'
import ScanPage from './pages/ScanPage'
import DuplicateGroupsPage from './pages/DuplicateGroupsPage'
import ReviewGroupPage from './pages/ReviewGroupPage'
import QuarantinePage from './pages/QuarantinePage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-400 font-mono bg-[#0a0c13]">
        Initializing workspace session...
      </div>
    )
  }

  if (!isAuthenticated) {
    // Show login, then redirect back to /dashboard
    return <AuthPage />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/groups" element={<DuplicateGroupsPage />} />
        <Route path="/groups/:groupId" element={<ReviewGroupPage />} />
        <Route path="/images" element={<DuplicateGroupsPage filter="image" />} />
        <Route path="/documents" element={<DuplicateGroupsPage filter="document" />} />
        <Route path="/quarantine" element={<QuarantinePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public landing page — visible to everyone including judges */}
          <Route path="/landing" element={<LandingPage />} />

          {/* All app routes (login gated) — original paths preserved */}
          <Route path="/*" element={<AuthenticatedApp />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
