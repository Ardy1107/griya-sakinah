import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p style={{ color: '#94a3b8' }}>Memuat...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

// Public Route (redirect if already logged in)
const PublicAdminRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p style={{ color: '#94a3b8' }}>Memuat...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

function AdminRoutes() {
    return (
        <Routes>
            {/* Admin Login */}
            <Route
                index
                element={
                    <PublicAdminRoute>
                        <AdminLogin />
                    </PublicAdminRoute>
                }
            />

            {/* Admin Dashboard */}
            <Route
                path="dashboard"
                element={
                    <ProtectedAdminRoute>
                        <AdminDashboard />
                    </ProtectedAdminRoute>
                }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
}

function AdminApp() {
    return (
        <AdminAuthProvider>
            <AdminRoutes />
        </AdminAuthProvider>
    );
}

export default AdminApp;
