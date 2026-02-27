import { Routes, Route, Navigate } from 'react-router-dom';
import SecurityDashboard from './pages/SecurityDashboard';
import PanicButton from './pages/PanicButton';
import AlertHistory from './pages/AlertHistory';
import SecurityAdmin from './pages/SecurityAdmin';
import IncidentReport from './pages/IncidentReport';

export default function KeamananApp() {
    return (
        <Routes>
            <Route index element={<SecurityDashboard />} />
            <Route path="panic" element={<PanicButton />} />
            <Route path="lapor" element={<IncidentReport />} />
            <Route path="riwayat" element={<AlertHistory />} />
            <Route path="admin" element={<SecurityAdmin />} />
            <Route path="*" element={<Navigate to="/keamanan" replace />} />
        </Routes>
    );
}
