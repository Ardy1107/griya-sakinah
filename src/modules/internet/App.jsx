// Internet Module App - Sub-module of GRIYA SAKINAH
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './context/ThemeContext'
import PublicDashboard from './pages/PublicDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import CekStatus from './pages/CekStatus'
import './index.css'

function InternetApp() {
  return (
    <ThemeProvider>
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

            {/* Catch-all - redirect to internet home */}
            <Route path="*" element={<Navigate to="/internet" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default InternetApp


