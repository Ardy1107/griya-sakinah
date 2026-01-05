import { Routes, Route, Navigate } from 'react-router-dom';
import { CommunityProvider } from './contexts/CommunityContext';
import CommunityHub from './pages/CommunityHub';
import ArisanPage from './pages/ArisanPage';
import ArisanAdmin from './pages/ArisanAdmin';
import PeduliPage from './pages/PeduliPage';
import PeduliAdmin from './pages/PeduliAdmin';
import TakjilAdmin from './pages/TakjilAdmin';
import TakjilPage from './pages/TakjilPage';
import PengumumanPage from './pages/PengumumanPage';
import KerjaBaktiPage from './pages/KerjaBaktiPage';
import DirektoriWarga from './pages/DirektoriWarga';

function CommunityApp() {
    return (
        <CommunityProvider>
            <Routes>
                {/* Main Hub */}
                <Route index element={<CommunityHub />} />

                {/* Feature Pages */}
                <Route path="pengumuman" element={<PengumumanPage />} />
                <Route path="kerja-bakti" element={<KerjaBaktiPage />} />

                {/* Arisan */}
                <Route path="arisan" element={<ArisanPage />} />
                <Route path="arisan/admin" element={<ArisanAdmin />} />

                {/* Peduli */}
                <Route path="peduli" element={<PeduliPage />} />
                <Route path="peduli/admin" element={<PeduliAdmin />} />

                {/* Takjil */}
                <Route path="takjil" element={<TakjilPage />} />
                <Route path="takjil/admin" element={<TakjilAdmin />} />

                {/* Direktori Warga */}
                <Route path="direktori" element={<DirektoriWarga />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/komunitas" replace />} />
            </Routes>
        </CommunityProvider>
    );
}

export default CommunityApp;


