import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
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
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-xs text-slate-400 font-mono">
        Initializing workspace session...
      </div>
    )
  }

  return (
    <Routes>
      {/* Standalone Authentication Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Protected Dashboard Routes inside AppShell */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <AppShell>
              <OverviewPage />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/scan"
        element={
          isAuthenticated ? (
            <AppShell>
              <ScanPage />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/groups"
        element={
          isAuthenticated ? (
            <AppShell>
              <DuplicateGroupsPage />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          isAuthenticated ? (
            <AppShell>
              <ReviewGroupPage />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/images"
        element={
          isAuthenticated ? (
            <AppShell>
              <DuplicateGroupsPage filter="image" />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/documents"
        element={
          isAuthenticated ? (
            <AppShell>
              <DuplicateGroupsPage filter="document" />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/quarantine"
        element={
          isAuthenticated ? (
            <AppShell>
              <QuarantinePage />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/history"
        element={
          isAuthenticated ? (
            <AppShell>
              <HistoryPage />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <AppShell>
              <SettingsPage />
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthenticatedApp />
      </ToastProvider>
    </AuthProvider>
  )
}
