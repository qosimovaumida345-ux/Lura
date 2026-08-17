import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import './Login.css';

export default function Success() {
  const { user, logout } = useAuthStore();

  return (
    <div className="login-page">
      <div className="login-video-section">
        <div className="login-video-overlay">
          <img src="/logo.png" alt="Lura Logo" className="login-logo-large" />
          <h2>Lura Video Editor</h2>
          <p>Tizimga muvaffaqiyatli kirdingiz</p>
        </div>
      </div>
      <div className="login-form-section">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Muvaffaqiyatli!</h2>
          <p>Assalomu alaykum, {user?.display_name || user?.name || 'Foydalanuvchi'}.</p>
          <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6', borderRadius: '8px' }}>
            <strong>Eslatma:</strong> Lura muharririni ishlash uchun ilovani (Desktop/Mobile) oching. Sayt orqali tahrirlash imkoniyati cheklangan.
          </div>
          <button className="btn btn-secondary" onClick={() => logout()} style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            Hisobdan chiqish
          </button>
        </div>
      </div>
    </div>
  );
}
