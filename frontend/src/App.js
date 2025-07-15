import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout'; // Import the new layout component

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation Bar */}
        <nav className="bg-indigo-600 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-white text-2xl font-bold">AI Chat App</Link>
            <div>
              {token ? (
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md transition"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md mr-2 transition">
                    Login
                  </Link>
                  <Link to="/signup" className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md transition">
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={token ? <ChatLayout /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;