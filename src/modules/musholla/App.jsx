import { Routes, Route, Navigate } from 'react-router-dom';
import PublicDashboard from './pages/PublicDashboard';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import DonationsPage from './pages/admin/DonationsPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import GalleryPage from './pages/admin/GalleryPage';
import ReportsPage from './pages/admin/ReportsPage';
import './musholla.css';

function MushollaApp() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route index element={<PublicDashboard />} />
            <Route path="login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="donasi" element={<DonationsPage />} />
                <Route path="pengeluaran" element={<ExpensesPage />} />
                <Route path="galeri" element={<GalleryPage />} />
                <Route path="laporan" element={<ReportsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/musholla" replace />} />
        </Routes>
    );
}

export default MushollaApp;
