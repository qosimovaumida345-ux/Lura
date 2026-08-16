import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#08080d' }}>
        <img src="/logo.png" alt="Lura Logo" style={{ width: '120px', borderRadius: '20px', marginBottom: '20px', animation: 'pulse 2s infinite' }} />
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { loadUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    
    // Native app redirection (Tauri/Capacitor)
    const isNativeApp = window.__TAURI__ || window.Capacitor?.isNativePlatform();
    if (isNativeApp && window.location.pathname === '/') {
      navigate('/login', { replace: true });
    }
  }, [loadUser, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/editor/:projectId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
      
      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
