import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner-lg spinner" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/" />;
}

export default function App() {
  const { loadUser, loginDemo, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser();
    // Agar dastur Tauri (.exe) yoki Capacitor (.apk) bo'lsa, to'g'ridan-to'g'ri dasturga kiritamiz
    const isNativeApp = window.__TAURI__ || window.Capacitor;
    if (isNativeApp && !isAuthenticated) {
      loginDemo();
    }
  }, [loadUser, loginDemo, isAuthenticated]);

  const isNativeApp = window.__TAURI__ || window.Capacitor;

  return (
    <Routes>
      <Route path="/" element={isNativeApp ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/editor/:projectId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
