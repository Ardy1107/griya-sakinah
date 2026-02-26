import { Routes, Route, Navigate } from 'react-router-dom';
import KalenderPage from './pages/KalenderPage';
import EventDetail from './pages/EventDetail';
import EventForm from './pages/EventForm';

export default function KalenderApp() {
    return (
        <Routes>
            <Route index element={<KalenderPage />} />
            <Route path="buat" element={<EventForm />} />
            <Route path="edit/:id" element={<EventForm />} />
            <Route path=":id" element={<EventDetail />} />
            <Route path="*" element={<Navigate to="/kalender" replace />} />
        </Routes>
    );
}
