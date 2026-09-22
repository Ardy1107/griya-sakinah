import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { VideoPlayerProvider } from './context/VideoPlayerContext';
import { initializeNotifications } from '../../services/notificationService';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const SEFTDashboard = lazy(() => import('./pages/SEFT/SEFTDashboard'));
const SEFTRelease = lazy(() => import('./pages/SEFT/SEFTRelease'));
const SEFTAmplify = lazy(() => import('./pages/SEFT/SEFTAmplify'));
const SEFTProxy = lazy(() => import('./pages/SEFT/SEFTProxy'));
const SEFTProxyChild = lazy(() => import('./pages/SEFT/SEFTProxyChild'));
const IridologyAnalysis = lazy(() => import('./pages/Iridology/IridologyAnalysis'));
const MultiModalScan = lazy(() => import('./pages/HealthScan/MultiModalScan'));
const VideoLibrary = lazy(() => import('./pages/Video/VideoLibrary'));
const DoaCollection = lazy(() => import('./pages/Doa/DoaCollection'));
const ZikirTracker = lazy(() => import('./pages/Zikir/ZikirTracker'));
const HabitTracker = lazy(() => import('./pages/Habit/HabitTracker'));
const MuhasabahJournal = lazy(() => import('./pages/Muhasabah/MuhasabahJournal'));
const KebaikanTracker = lazy(() => import('./pages/Kebaikan/KebaikanTracker'));
const DoaDiamdiam = lazy(() => import('./pages/Kebaikan/DoaDiamdiam'));
const ActsOfKindness = lazy(() => import('./pages/Kebaikan/ActsOfKindness'));
const Memaafkan = lazy(() => import('./pages/Kebaikan/Memaafkan'));
const SyukurJournal = lazy(() => import('./pages/Syukur/SyukurJournal'));
const QalbuMeterPage = lazy(() => import('./pages/Syukur/QalbuMeterPage'));
const AbundanceDashboard = lazy(() => import('./pages/Abundance/AbundanceDashboard'));
const TilawahTracker = lazy(() => import('./pages/Tilawah/TilawahTracker'));
const ShalatTracker = lazy(() => import('./pages/Shalat/ShalatTracker'));
const PuasaTracker = lazy(() => import('./pages/Puasa/PuasaTracker'));
const SedekahTracker = lazy(() => import('./pages/Sedekah/SedekahTracker'));
const IstighfarCounter = lazy(() => import('./pages/Istighfar/IstighfarCounter'));
const MotivasiHarian = lazy(() => import('./pages/Motivasi/MotivasiHarian'));
import './spiritual.css';

export default function App() {
    // Initialize notifications when app loads (only works on native Android)
    useEffect(() => {
        initializeNotifications();
    }, []);

    return (
        <VideoPlayerProvider>
            <div className="spiritual-module">
                <Suspense fallback={<div className="loading-screen"><div className="loading-spinner"></div><p>Memuat...</p></div>}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />

                        {/* UTAMA - Program Inti */}
                        <Route path="/abundance" element={<AbundanceDashboard />} />
                        <Route path="/seft" element={<SEFTDashboard />} />
                        <Route path="/seft/release" element={<SEFTRelease />} />
                        <Route path="/seft/amplify" element={<SEFTAmplify />} />
                        <Route path="/seft/proxy" element={<SEFTProxy />} />
                        <Route path="/seft/proxy-child" element={<SEFTProxyChild />} />
                        <Route path="/seft/iridology" element={<IridologyAnalysis />} />
                        <Route path="/health-scan" element={<MultiModalScan />} />
                        <Route path="/videos" element={<VideoLibrary />} />
                        <Route path="/videos/:category" element={<VideoLibrary />} />

                        {/* IBADAH HARIAN */}
                        <Route path="/shalat" element={<ShalatTracker />} />
                        <Route path="/tilawah" element={<TilawahTracker />} />
                        <Route path="/zikir" element={<ZikirTracker />} />
                        <Route path="/istighfar" element={<IstighfarCounter />} />

                        {/* AMALAN SUNNAH */}
                        <Route path="/puasa" element={<PuasaTracker />} />
                        <Route path="/sedekah" element={<SedekahTracker />} />
                        <Route path="/kebaikan" element={<KebaikanTracker />} />
                        <Route path="/kebaikan/doa-diamdiam" element={<DoaDiamdiam />} />
                        <Route path="/kebaikan/acts" element={<ActsOfKindness />} />
                        <Route path="/kebaikan/memaafkan" element={<Memaafkan />} />
                        <Route path="/doa" element={<DoaCollection />} />

                        {/* REFLEKSI & HATI */}
                        <Route path="/muhasabah" element={<MuhasabahJournal />} />
                        <Route path="/syukur" element={<SyukurJournal />} />
                        <Route path="/syukur/qalbu" element={<QalbuMeterPage />} />

                        {/* LAINNYA */}
                        <Route path="/habit" element={<HabitTracker />} />
                        <Route path="/motivasi" element={<MotivasiHarian />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </div>
        </VideoPlayerProvider>
    );
}
