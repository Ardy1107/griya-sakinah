import { Routes, Route, Navigate } from 'react-router-dom';
import VotingList from './pages/VotingList';
import VotingDetail from './pages/VotingDetail';
import VotingForm from './pages/VotingForm';

export default function VotingApp() {
    return (
        <Routes>
            <Route index element={<VotingList />} />
            <Route path="buat" element={<VotingForm />} />
            <Route path=":id" element={<VotingDetail />} />
            <Route path="*" element={<Navigate to="/voting" replace />} />
        </Routes>
    );
}
