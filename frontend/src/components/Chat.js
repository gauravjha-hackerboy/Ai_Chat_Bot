import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const Chat = ({ sessionId }) => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const token = localStorage.getItem('token');
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const url = sessionId
          ? `https://chat-backend-vy78.onrender.com/api/chat/history/${sessionId}`
          : 'https://chat-backend-vy78.onrender.com/api/chat/history';
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatLog(res.data.history || []);
      } catch (err) {
        console.error('Failed to fetch history', err);
        setChatLog([]);
      }
    };
    fetchHistory();
  }, [token, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMsg = { prompt: message, response: '...' };
    setChatLog(prev => [...prev, newMsg]);
    setMessage('');

    try {
      const res = await axios.post(
        'https://chat-backend-vy78.onrender.com/api/chat',
        { message, sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedMsg = { ...newMsg, response: res.data.reply };
      setChatLog(prev => [...prev.slice(0, -1), updatedMsg]);
    } catch (err) {
      console.error('Send failed', err);
      setChatLog(prev => [
        ...prev.slice(0, -1),
        { ...newMsg, response: 'Error: Failed to get response' },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-100">
        {chatLog.length === 0 ? (
          <p className="text-gray-500 text-center">Start chatting!</p>
        ) : (
          chatLog.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-right">
                <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xl text-left">
                  <strong>You:</strong> {msg.prompt}
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block bg-white border border-gray-300 px-4 py-2 rounded-lg max-w-xl">
                  <strong>Bot:</strong>{' '}
                  <div className="prose max-w-none">
                    <ReactMarkdown
                      children={msg.response}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="bg-white border-t border-gray-300 p-4 sticky bottom-0">
        <div className="flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
