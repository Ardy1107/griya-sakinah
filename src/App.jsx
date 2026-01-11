import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import { SuperadminProvider } from './contexts/SuperadminContext';
import './index.css';

// Lazy load modules for better performance
import { lazy, Suspense } from 'react';

// Module Lazy Imports
const AngsuranApp = lazy(() => import('./modules/angsuran/App'));
const InternetApp = lazy(() => import('./modules/internet/App'));
const MushollaApp = lazy(() => import('./modules/musholla/App'));
const AdminApp = lazy(() => import('./admin/App'));
const CommunityApp = lazy(() => import('./community/App'));
const WargaPortal = lazy(() => import('./pages/WargaPortal/WargaPortal'));

// Superadmin Portal
const SuperadminLogin = lazy(() => import('./pages/SuperadminPortal/SuperadminLogin'));
const SuperadminDashboard = lazy(() => import('./pages/SuperadminPortal/SuperadminDashboard'));
const KelolaWarga = lazy(() => import('./pages/SuperadminPortal/KelolaWarga'));
const SpiritualApp = lazy(() => import('./modules/spiritual/App'));

// Loading Fallback
const LoadingScreen = () => (
    <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Memuat...</p>
    </div>
);

function App() {
    return (
        <SuperadminProvider>
            <BrowserRouter>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Warga Portal - Public access */}
                        <Route path="/warga" element={<WargaPortal />} />

                        {/* Superadmin Portal */}
                        <Route path="/superadmin/login" element={<SuperadminLogin />} />
                        <Route path="/superadmin" element={<SuperadminDashboard />} />
                        <Route path="/superadmin/warga" element={<KelolaWarga />} />

                        {/* Spiritual Abundance Module */}
                        <Route path="/spiritual/*" element={<SpiritualApp />} />

                        {/* Module Routes */}
                        <Route path="/angsuran/*" element={<AngsuranApp />} />
                        <Route path="/internet/*" element={<InternetApp />} />
                        <Route path="/musholla/*" element={<MushollaApp />} />

                        {/* Admin Portal */}
                        <Route path="/admin/*" element={<AdminApp />} />

                        {/* Community Hub */}
                        <Route path="/komunitas/*" element={<CommunityApp />} />

                        {/* Catch all - redirect to landing */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </SuperadminProvider>
    );
}

export default App;
