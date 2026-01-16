// Internet Module App - Sub-module of GRIYA SAKINAH
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './context/ThemeContext'
import { BlockProvider } from './context/BlockContext'
import PublicDashboard from './pages/PublicDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import CekStatus from './pages/CekStatus'
import './index.css'

// Helper to get default redirect based on current path
function DefaultRedirect() {
  const location = useLocation()
  // Extract block from path if present
  const match = location.pathname.match(/\/blok-([ab])\/internet/i)
  if (match) {
    return <Navigate to={`/blok-${match[1].toLowerCase()}/internet`} replace />
  }
  return <Navigate to="/internet" replace />
}

function InternetApp() {
  return (
    <ThemeProvider>
      <BlockProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route index element={<PublicDashboard />} />
              <Route path="cek-status" element={<CekStatus />} />

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
