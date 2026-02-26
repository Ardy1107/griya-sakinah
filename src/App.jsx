import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import { SuperadminProvider } from './contexts/SuperadminContext';
import UpdateChecker from './components/UpdateChecker';
import OTAUpdater from './components/OTAUpdater';
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
const KalenderApp = lazy(() => import('./modules/kalender/App'));
const VotingApp = lazy(() => import('./modules/voting/App'));
const KeamananApp = lazy(() => import('./modules/keamanan/App'));
const ChatApp = lazy(() => import('./modules/chat/App'));

// Loading Fallback
const LoadingScreen = () => (
    <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Memuat...</p>
    </div>
);

import ModuleErrorBoundary from './components/ModuleErrorBoundary';

function App() {
    return (
        <SuperadminProvider>
            <UpdateChecker />
            <OTAUpdater />
            <BrowserRouter>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Warga Portal - Public access */}
                        <Route path="/warga" element={
                            <ModuleErrorBoundary moduleName="Portal Warga">
                                <WargaPortal />
                            </ModuleErrorBoundary>
                        } />

                        {/* Superadmin Portal */}
                        <Route path="/superadmin/login" element={<SuperadminLogin />} />
                        <Route path="/superadmin" element={<SuperadminDashboard />} />
                        <Route path="/superadmin/warga" element={<KelolaWarga />} />

                        {/* Spiritual Abundance Module */}
                        <Route path="/spiritual/*" element={
                            <ModuleErrorBoundary moduleName="Spiritual Abundance">
                                <SpiritualApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Module Routes */}
                        <Route path="/angsuran/*" element={
                            <ModuleErrorBoundary moduleName="Angsuran">
                                <AngsuranApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Internet Module - Block-specific routes */}
                        <Route path="/blok-a/internet/*" element={
                            <ModuleErrorBoundary moduleName="Internet">
                                <InternetApp />
                            </ModuleErrorBoundary>
                        } />
                        <Route path="/blok-b/internet/*" element={
                            <ModuleErrorBoundary moduleName="Internet">
                                <InternetApp />
                            </ModuleErrorBoundary>
                        } />
                        <Route path="/internet/*" element={
                            <ModuleErrorBoundary moduleName="Internet">
                                <InternetApp />
                            </ModuleErrorBoundary>
                        } />

                        <Route path="/musholla/*" element={
                            <ModuleErrorBoundary moduleName="Musholla">
                                <MushollaApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Kalender Komunitas */}
                        <Route path="/kalender/*" element={
                            <ModuleErrorBoundary moduleName="Kalender">
                                <KalenderApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Voting & Polling */}
                        <Route path="/voting/*" element={
                            <ModuleErrorBoundary moduleName="Voting">
                                <VotingApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Keamanan Lingkungan */}
                        <Route path="/keamanan/*" element={
                            <ModuleErrorBoundary moduleName="Keamanan">
                                <KeamananApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Chat Warga */}
                        <Route path="/chat/*" element={
                            <ModuleErrorBoundary moduleName="Chat">
                                <ChatApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Admin Portal */}
                        <Route path="/admin/*" element={
                            <ModuleErrorBoundary moduleName="Admin">
                                <AdminApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Community Hub */}
                        <Route path="/komunitas/*" element={
                            <ModuleErrorBoundary moduleName="Komunitas">
                                <CommunityApp />
                            </ModuleErrorBoundary>
                        } />

                        {/* Catch all - redirect to landing */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </SuperadminProvider>
    );
}

export default App;
