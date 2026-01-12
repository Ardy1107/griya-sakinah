import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { VideoPlayerProvider } from './context/VideoPlayerContext';
import { initializeNotifications } from '../../services/notificationService';
import Dashboard from './pages/Dashboard';
import SEFTDashboard from './pages/SEFT/SEFTDashboard';
import SEFTRelease from './pages/SEFT/SEFTRelease';
import SEFTAmplify from './pages/SEFT/SEFTAmplify';
import SEFTProxy from './pages/SEFT/SEFTProxy';
import SEFTProxyChild from './pages/SEFT/SEFTProxyChild';
import IridologyAnalysis from './pages/Iridology/IridologyAnalysis';
import MultiModalScan from './pages/HealthScan/MultiModalScan';
import VideoLibrary from './pages/Video/VideoLibrary';
import DoaCollection from './pages/Doa/DoaCollection';
import ZikirTracker from './pages/Zikir/ZikirTracker';
import HabitTracker from './pages/Habit/HabitTracker';
import MuhasabahJournal from './pages/Muhasabah/MuhasabahJournal';
import KebaikanTracker from './pages/Kebaikan/KebaikanTracker';
import DoaDiamdiam from './pages/Kebaikan/DoaDiamdiam';
import ActsOfKindness from './pages/Kebaikan/ActsOfKindness';
import Memaafkan from './pages/Kebaikan/Memaafkan';
import SyukurJournal from './pages/Syukur/SyukurJournal';
import QalbuMeterPage from './pages/Syukur/QalbuMeterPage';
import AbundanceDashboard from './pages/Abundance/AbundanceDashboard';
import TilawahTracker from './pages/Tilawah/TilawahTracker';
import ShalatTracker from './pages/Shalat/ShalatTracker';
import PuasaTracker from './pages/Puasa/PuasaTracker';
import SedekahTracker from './pages/Sedekah/SedekahTracker';
import IstighfarCounter from './pages/Istighfar/IstighfarCounter';
import MotivasiHarian from './pages/Motivasi/MotivasiHarian';
import './spiritual.css';

export default function App() {
    // Initialize notifications when app loads (only works on native Android)
    useEffect(() => {
        initializeNotifications();
    }, []);

    return (
        <VideoPlayerProvider>
            <div className="spiritual-module">
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
            </div>
        </VideoPlayerProvider>
    );
}
