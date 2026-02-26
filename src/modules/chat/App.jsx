import { Routes, Route, Navigate } from 'react-router-dom';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import NewChat from './pages/NewChat';

export default function ChatApp() {
    return (
        <Routes>
            <Route index element={<ChatList />} />
            <Route path="baru" element={<NewChat />} />
            <Route path=":id" element={<ChatRoom />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
    );
}
