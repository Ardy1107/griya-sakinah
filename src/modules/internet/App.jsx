// Internet Module App - Sub-module of GRIYA SAKINAH
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './context/ThemeContext'
import { BlockProvider } from './context/BlockContext'
import DashboardBlokA from './pages/DashboardBlokA'
import DashboardBlokB from './pages/DashboardBlokB'
import PublicDashboard from './pages/PublicDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import CekStatus from './pages/CekStatus'
import Agreement from './pages/Agreement'
import './index.css'

// Helper to get default redirect based on current path
function DefaultRedirect() {
  const location = useLocation()
  const match = location.pathname.match(/\/blok-([ab])\/internet/i)
  if (match) {
    return <Navigate to={`/blok-${match[1].toLowerCase()}/internet`} replace />
  }
  return <Navigate to="/internet" replace />
}

// Smart Dashboard Router - renders block-specific page based on URL
function SmartDashboard() {
  const location = useLocation()
  const match = location.pathname.match(/\/blok-([ab])\/internet/i)

  if (match) {
    const block = match[1].toUpperCase()
    if (block === 'A') return <DashboardBlokA />
    if (block === 'B') return <DashboardBlokB />
  }

  // Fallback to generic dashboard (superadmin view)
  return <PublicDashboard />
}

function InternetApp() {
  return (
    <ThemeProvider>
      <BlockProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes - Smart routing per block */}
              <Route index element={<SmartDashboard />} />
              <Route path="cek-status" element={<CekStatus />} />
              <Route path="peraturan" element={<Agreement />} />

              {/* Admin Routes */}
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="login" element={<AdminLogin />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="admin/*" element={<AdminPanel />} />

              {/* Catch-all - redirect to correct internet home */}
              <Route path="*" element={<DefaultRedirect />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BlockProvider>
    </ThemeProvider>
  )
}

export default InternetApp
