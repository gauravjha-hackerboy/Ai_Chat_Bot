import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Sidebar = ({ onSelectSession, onNewSession, selectedSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // Track which session's menu is open
  const token = localStorage.getItem('token');
  const menuRef = useRef(null); // Ref to handle clicks outside the menu

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/chat/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error('Failed to load chat sessions', err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [token, selectedSession]);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewSession = async () => {
    setCreatingSession(true);
    try {
      await onNewSession();
    } finally {
      setCreatingSession(false);
    }
  };

  const handleShare = (sessionId) => {
    // Generate a shareable link (for now, a simple URL)
    const shareLink = `${window.location.origin}/chat?session=${sessionId}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('Share link copied to clipboard!');
    });
    setOpenMenu(null);
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/chat/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(sessions.filter((s) => s._id !== sessionId));
      if (selectedSession === sessionId) {
        onSelectSession(null); // Deselect the session if it's the one being deleted
      }
      setOpenMenu(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Failed to delete session. Please try again.');
    }
  };

  const handleRename = async (sessionId, currentTitle) => {
    const newTitle = prompt('Enter new session name:', currentTitle);
    if (newTitle === null || newTitle.trim() === '') return; // Cancelled or empty
    try {
      await axios.put(
        `http://localhost:5000/api/chat/sessions/${sessionId}/rename`,
        { newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(
        sessions.map((s) =>
          s._id === sessionId ? { ...s, chatTitle: newTitle.trim() } : s
        )
      );
      setOpenMenu(null);
    } catch (err) {
      console.error('Failed to rename session:', err);
      alert('Failed to rename session. Please try again.');
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-4 h-screen overflow-y-auto">
      <button
        onClick={handleNewSession}
        disabled={creatingSession}
        className={`w-full py-2 px-4 rounded mb-4 text-left transition ${
          creatingSession
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {creatingSession ? 'Creating...' : '+ New Chat'}
      </button>
      {loading ? (
        <p className="text-gray-400">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-400">No sessions available</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li
              key={s._id}
              className={`flex items-center justify-between p-2 rounded ${
                selectedSession === s._id ? 'bg-gray-800' : 'hover:bg-gray-700'
              }`}
            >
              <span
                onClick={() => onSelectSession(s._id)}
                className="cursor-pointer flex-1 truncate"
              >
                {s.chatTitle || `Chat ${s._id.slice(0, 8)}`}
              </span>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenu(openMenu === s._id ? null : s._id)}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v.01M12 12v.01M12 18v.01"
                    />
                  </svg>
                </button>
                {openMenu === s._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-10">
                    <button
                      onClick={() => handleShare(s._id)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleRename(s._id, s.chatTitle)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Rename
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;