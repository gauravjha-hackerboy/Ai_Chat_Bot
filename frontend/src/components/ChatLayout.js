import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import axios from 'axios';

const ChatLayout = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  const handleSelectSession = async (sessionId) => {
    setSelectedSession(sessionId);
  };

  const handleNewSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'https://chat-backend-vy78.onrender.com/api/chat/sessions',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedSession(res.data.sessionId);
    } catch (err) {
      console.error('Failed to create new session', err);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        selectedSession={selectedSession}
      />
      <div className="flex-1">
        <Chat sessionId={selectedSession} />
      </div>
    </div>
  );
};

export default ChatLayout;
