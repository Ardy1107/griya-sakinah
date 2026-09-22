import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Units = lazy(() => import('./pages/Units/Units'));
const UnitDetail = lazy(() => import('./pages/Units/UnitDetail'));
const Payments = lazy(() => import('./pages/Payments/Payments'));
const Expenses = lazy(() => import('./pages/Expenses/Expenses'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const AuditLog = lazy(() => import('./pages/AuditLog/AuditLog'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const PaymentMonitoring = lazy(() => import('./pages/PaymentMonitoring/PaymentMonitoring'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory/TransactionHistory'));
const WargaSearch = lazy(() => import('./pages/WargaSearch'));
const HousingMap = lazy(() => import('./pages/HousingMap/HousingMap'));
const MaintenanceTracker = lazy(() => import('./pages/MaintenanceTracker/MaintenanceTracker'));
const ContactDirectory = lazy(() => import('./pages/ContactDirectory/ContactDirectory'));
import './angsuran.css';

// Protected Route Component - Only for admin access
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Memuat...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/angsuran/admin/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/angsuran/admin/dashboard" replace />;
    }

    return children;
};

// Admin Login Route (redirect if already logged in)
const AdminLoginRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Memuat...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/angsuran/admin/dashboard" replace />;
    }

    return children;
};

function AngsuranRoutes() {
    return (
        <Suspense fallback={<div className="loading-screen"><div className="loading-spinner"></div><p>Memuat...</p></div>}>
            <Routes>
                {/* Default route - Warga Search (public, no login) */}
                <Route index element={<WargaSearch />} />
                <Route path="search" element={<WargaSearch />} />

                {/* Hidden Admin Routes */}
                <Route path="admin">
                    {/* Admin Login (hidden access) */}
                    <Route
                        path="login"
                        element={
                            <AdminLoginRoute>
                                <Login />
                            </AdminLoginRoute>
                        }
                    />

                    {/* Protected Admin Routes with Layout */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            path="dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="units"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <Units />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="units/:unitId"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <UnitDetail />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="payments"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                                    <Payments />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="expenses"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <Expenses />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="history"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <TransactionHistory />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="audit"
                            element={
                                <ProtectedRoute allowedRoles={['developer', 'superadmin']}>
                                    <AuditLog />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="monitoring"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <PaymentMonitoring />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="map"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <HousingMap />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="reports"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <Reports />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="maintenance"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <MaintenanceTracker />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="contacts"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <ContactDirectory />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="settings"
                            element={
                                <ProtectedRoute allowedRoles={['admin', 'developer', 'superadmin']}>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin index redirect */}
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                </Route>

                {/* Legacy routes - redirect to new paths */}
                <Route path="login" element={<Navigate to="/angsuran/admin/login" replace />} />
                <Route path="dashboard" element={<Navigate to="/angsuran/admin/dashboard" replace />} />
                <Route path="units" element={<Navigate to="/angsuran/admin/units" replace />} />
                <Route path="units/:unitId" element={<Navigate to="/angsuran/admin/units/:unitId" replace />} />
                <Route path="payments" element={<Navigate to="/angsuran/admin/payments" replace />} />
                <Route path="expenses" element={<Navigate to="/angsuran/admin/expenses" replace />} />
                <Route path="history" element={<Navigate to="/angsuran/admin/history" replace />} />
                <Route path="audit" element={<Navigate to="/angsuran/admin/audit" replace />} />
                <Route path="monitoring" element={<Navigate to="/angsuran/admin/monitoring" replace />} />
                <Route path="reports" element={<Navigate to="/angsuran/admin/reports" replace />} />
                <Route path="settings" element={<Navigate to="/angsuran/admin/settings" replace />} />

                {/* Catch all - redirect to search */}
                <Route path="*" element={<Navigate to="/angsuran" replace />} />
            </Routes>
        </Suspense>
    );
}

function AngsuranApp() {
    return (
        <AuthProvider>
            <AngsuranRoutes />
        </AuthProvider>
    );
}

export default AngsuranApp;
