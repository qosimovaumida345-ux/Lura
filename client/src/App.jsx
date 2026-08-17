import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Login from './pages/Login';
import Success from './pages/Success';

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

function NativeOnlyRoute({ children }) {
  const isNativeApp = typeof window !== 'undefined' && (window.__TAURI__ || window.Capacitor?.isNativePlatform());
  if (!isNativeApp) {
    return <Navigate to="/success" replace />;
  }
  return children;
}

function PublicHomeRoute() {
  const { isAuthenticated } = useAuthStore();
  const isNativeApp = typeof window !== 'undefined' && (window.__TAURI__ || window.Capacitor?.isNativePlatform());

  if (isNativeApp) {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
  }

  return isAuthenticated ? <Navigate to="/success" replace /> : <Landing />;
}

export default function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      <Route path="/" element={<PublicHomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
      
      {/* Protected Routes - Native Only */}
      <Route path="/dashboard" element={<ProtectedRoute><NativeOnlyRoute><Dashboard /></NativeOnlyRoute></ProtectedRoute>} />
      <Route path="/editor/:projectId" element={<ProtectedRoute><NativeOnlyRoute><Editor /></NativeOnlyRoute></ProtectedRoute>} />
      
      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
