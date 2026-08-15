import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import './Landing.css';

/* ---- SVG Icon Components ---- */
const IconTimeline = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="11" width="14" height="4" rx="1"/><rect x="2" y="19" width="18" height="4" rx="1"/></svg>
);
const IconSparkles = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
);
const IconBrain = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 1.5-.5 2.5-1.5 3.5"/><path d="M17 7a5 5 0 0 1-2 9.5"/><path d="M12 2a5 5 0 0 0-5 5c0 1.5.5 2.5 1.5 3.5"/><path d="M7 7a5 5 0 0 0 2 9.5"/><path d="M12 22v-6"/><path d="M9 19h6"/></svg>
);
const IconMusic = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
);
const IconSmile = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
);
const IconZap = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const IconDownload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const IconWindows = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.851"/></svg>
);
const IconAndroid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341a1 1 0 0 0 1-1V8.524a1 1 0 1 0-2 0v5.817a1 1 0 0 0 1 1zm-11.046 0a1 1 0 0 0 1-1V8.524a1 1 0 1 0-2 0v5.817a1 1 0 0 0 1 1zM15.5 3.62l1.147-1.776a.373.373 0 0 0-.116-.516.376.376 0 0 0-.517.116L14.825 3.34A6.332 6.332 0 0 0 12 2.74a6.332 6.332 0 0 0-2.825.6L7.986 1.444a.375.375 0 0 0-.633.4L8.5 3.62A5.903 5.903 0 0 0 5.5 8.6h13a5.903 5.903 0 0 0-3-4.98zM9.5 6.63a.625.625 0 1 1 .625-.625A.625.625 0 0 1 9.5 6.63zm5 0a.625.625 0 1 1 .625-.625.625.625 0 0 1-.625.625zM5.15 9.6a1.15 1.15 0 0 0-1.15 1.15v4.1a1.15 1.15 0 1 0 2.3 0v-4.1A1.15 1.15 0 0 0 5.15 9.6zm13.7 0a1.15 1.15 0 0 0-1.15 1.15v4.1a1.15 1.15 0 0 0 2.3 0v-4.1a1.15 1.15 0 0 0-1.15-1.15zM5.5 16.6a1.5 1.5 0 0 0 1.5 1.5h1v2.15a1.15 1.15 0 0 0 2.3 0V18.1h1.4v2.15a1.15 1.15 0 0 0 2.3 0V18.1h1a1.5 1.5 0 0 0 1.5-1.5V9.1h-11z"/></svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const features = [
  { icon: <IconTimeline />, title: 'Multi-Track Timeline', desc: 'Professional koʻp qatlamli timeline bilan video, audio, matn va effektlarni bir joyda tahrirlang. Drag & drop, kesish, birlashtirish — hamma narsa qoʻl ostingizda.' },
  { icon: <IconSparkles />, title: '100,000+ Effektlar', desc: 'Grayscale, Vintage, Neon, Glitch va boshqa 100,000 dan ortiq vizual filtr, oʻtish effektlari va animatsiyalar kutubxonasi.' },
  { icon: <IconBrain />, title: 'LuraEditorAI', desc: 'AI ga nima qilish kerakligini tabiiy tilda yozing — u videoni avtomatik montaj qiladi: kesish, effekt qoʻshish, subtitr yaratish.' },
  { icon: <IconMusic />, title: 'Audio Kutubxonasi', desc: 'Minglab tekin royalty-free musiqa va tovush effektlari. Pixabay kutubxonasidan toʻgʻridan-toʻgʻri qidiring va timelinega torting.' },
  { icon: <IconSmile />, title: 'Stikerlar va GIFlar', desc: 'Giphy kutubxonasidagi millionlab GIF stikerlar, emojilar va animatsiyali elementlarni videongizga qoʻshing.' },
  { icon: <IconZap />, title: 'Tez va Tekin', desc: 'Barcha ishlov berish kompyuteringizda amalga oshiriladi. Server kerak emas, internetga bogʻliq emas. Toʻliq bepul.' },
];

const stats = [
  { value: '100K+', label: 'Effektlar va Filtrlar' },
  { value: '50K+', label: 'Audio Treklar' },
  { value: '1M+', label: 'GIF Stikerlar' },
  { value: '500+', label: 'Shriftlar' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, loginDemo } = useAuthStore();
  const [showDownload, setShowDownload] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="landing-bg-orb" />
        <div className="landing-bg-orb" />
        <div className="landing-bg-orb" />
        <div className="landing-bg-grid" />
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <img src="/logo.png" alt="Lura Editor" />
          <span>Lura</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Imkoniyatlar</a>
          <a href="#ai">LuraAI</a>
          <a href="#download">Yuklab olish</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span className="dot" />
          AI-Powered Video Editor — Tekin va Open Source
        </div>

        <h1>
          Videolarni <span className="accent">sun'iy intellekt</span> bilan tahrirlashning yangi davri
        </h1>

        <p className="landing-hero-subtitle">
          Lura — professional darajadagi video muharriri. 100,000+ effekt, AI-montaj, 
          multi-track timeline va barchasi tekin. Kompyuteringizda yoki telefoningizda ishlaydi.
        </p>

        <div className="landing-hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setShowDownload(!showDownload)}>
            <IconDownload /> Yuklab olish
          </button>
        </div>

        {/* Download Dropdown */}
        {showDownload && (
          <div className="download-dropdown animate-scale-in">
            <a href="https://github.com/qosimovaumida345-ux/Lura/releases/latest" className="download-option" target="_blank" rel="noreferrer">
              <IconWindows />
              <div>
                <strong>Windows</strong>
                <span>Windows 10/11 — .exe (64-bit)</span>
              </div>
            </a>
            <a href="https://github.com/qosimovaumida345-ux/Lura/releases/latest" className="download-option" target="_blank" rel="noreferrer">
              <IconAndroid />
              <div>
                <strong>Android</strong>
                <span>Android 8+ — .apk</span>
              </div>
            </a>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="landing-stats">
        {stats.map((s, i) => (
          <div key={i} className="stat-item">
            <div className="stat-value text-gradient">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Editor Preview */}
      <section className="landing-preview" id="editor">
        <div className="preview-image-wrapper">
          <img src="/editor-preview.jpg" alt="Lura Editor Interface" />
          <div className="preview-glow" />
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <h2 className="landing-features-title">
          Professional montaj uchun <span className="text-gradient">barcha vositalar</span>
        </h2>
        <p className="landing-features-subtitle">
          Lura sizga CapCut va Premiere Pro darajasidagi vositalarni to'liq bepul taqdim etadi
        </p>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Section */}
      <section className="landing-ai-section" id="ai">
        <div className="ai-section-content">
          <div className="ai-section-text">
            <div className="ai-section-badge">LuraEditorAI</div>
            <h2>AI bilan montaj — <span className="text-gradient">kelajak bugun</span></h2>
            <p>
              LuraEditorAI — bu Lura'ning eng kuchli xususiyati. Siz shunchaki tabiiy tilda nima qilish kerakligini yozasiz, 
              AI esa videoni avtomatik montaj qiladi.
            </p>
            <ul className="ai-feature-list">
              <li><IconCheck /> <span>Avtomatik subtitrlar (Speech-to-Text)</span></li>
              <li><IconCheck /> <span>Musiqaga mos kesish (Beat Sync)</span></li>
              <li><IconCheck /> <span>Fonni olib tashlash (Background Remove)</span></li>
              <li><IconCheck /> <span>Prompt orqali toʻliq montaj</span></li>
              <li><IconCheck /> <span>Rang sozlamalari va effekt tanlash</span></li>
            </ul>
          </div>
          <div className="ai-section-image">
            <img src="/ai-feature.jpg" alt="LuraEditorAI" />
          </div>
        </div>
      </section>

      {/* Effects Section */}
      <section className="landing-effects-section">
        <div className="effects-section-content">
          <div className="effects-section-image">
            <img src="/effects-showcase.jpg" alt="100,000+ Effektlar" />
          </div>
          <div className="effects-section-text">
            <h2><span className="text-gradient">100,000+</span> effektlar kutubxonasi</h2>
            <p>
              Vintage, Noir, Neon, Glitch, Cinematic, VHS va boshqa yuzlab kategoriyalardagi 
              professional effektlar to'plami. Har bir effekt real vaqtda preview bilan ishlaydi.
            </p>
            <div className="effects-categories">
              {['Filtrlar', 'Oʻtishlar', 'Animatsiyalar', 'Rang Grading', 'Blur', 'Glow', 'Glitch', 'Cinematic'].map((c, i) => (
                <span key={i} className="effect-category-tag">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="landing-download" id="download">
        <div className="download-card glass-card">
          <img src="/logo.png" alt="Lura" className="download-logo" />
          <h2>Lura'ni hoziroq yuklab oling</h2>
          <p>Windows, Android va brauzer uchun mavjud. To'liq bepul, reklama va limitlarsiz.</p>
          <div className="download-buttons">
            <a href="https://github.com/qosimovaumida345-ux/Lura/releases/latest" className="btn btn-primary btn-lg download-btn" target="_blank" rel="noreferrer">
              <IconWindows /> Windows uchun (.exe)
            </a>
            <a href="https://github.com/qosimovaumida345-ux/Lura/releases/latest" className="btn btn-secondary btn-lg download-btn" target="_blank" rel="noreferrer">
              <IconAndroid /> Android uchun (.apk)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/logo.png" alt="Lura" />
            <span>Lura Video Editor</span>
          </div>
          <p>Open-source AI-powered video editor. Made with passion.</p>
          <p>&copy; 2026 Lura. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
