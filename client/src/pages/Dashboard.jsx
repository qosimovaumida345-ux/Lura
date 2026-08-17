import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import './Dashboard.css';

/* ---- SVG Icons ---- */
const I = {
  scissors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  chevronDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  templates: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  more: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  computer: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  drive: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6l6 11-3 5H6l-3-5z"/></svg>,
  dropbox: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 9 7 13 12 9 17 13 22 9 12 2"/><polygon points="2 15 7 19 12 15 17 19 22 15 17 11 12 15 7 11 2 15"/><polygon points="12 16 7 20 12 24 17 20 12 16"/></svg>,
  film: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    projects, exportedVideos, materials,
    loadProjects, createProject, deleteProject, duplicateProject, updateProject,
    addMaterial, deleteMaterial, deleteExportedVideo,
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState('projects'); // 'all', 'projects', 'exported', 'materials'
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('Sarlavhasiz loyiha');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [renameModal, setRenameModal] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateNewProject = () => {
    const project = createProject(projectName.trim() || 'Sarlavhasiz loyiha', selectedRatio);
    setShowNewProjectModal(false);
    navigate(`/editor/${project.id}`);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((f) => {
      addMaterial({
        name: f.name,
        type: f.type,
        size: f.size,
        url: URL.createObjectURL(f),
      });
    });
    setShowUploadDropdown(false);
    showToast(`${files.length} ta material yuklandi!`);
    setActiveTab('materials');
  };

  const handleDuplicate = (e, id) => {
    e.stopPropagation();
    duplicateProject(id);
    setActiveMenuId(null);
    showToast('Loyiha nusxasi yaratildi');
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Haqiqatdan ham ushbu loyihani oʻchirmoqchimisiz?')) {
      deleteProject(id);
      setActiveMenuId(null);
    }
  };

  const handleRename = (e, project) => {
    e.stopPropagation();
    setRenameName(project.name);
    setRenameModal(project.id);
    setActiveMenuId(null);
  };

  const submitRename = () => {
    if (renameName.trim()) {
      updateProject(renameModal, { name: renameName.trim() });
    }
    setRenameModal(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="capcut-dashboard">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="capcut-toast animate-scale-in">{toastMessage}</div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="capcut-top-nav">
        <div className="top-nav-left">
          <div className="capcut-logo-brand" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Lura" />
            <span className="brand-title">Lura</span>
          </div>
          <nav className="top-nav-menu">
            <button className="nav-item active">Bosh sahifa</button>
            <div className="nav-item-dropdown">
              <button className="nav-item">Asboblar {I.chevronDown}</button>
            </div>
            <div className="nav-item-dropdown">
              <button className="nav-item">Yaratish {I.chevronDown}</button>
            </div>
            <div className="nav-item-dropdown">
              <button className="nav-item">Resurslar {I.chevronDown}</button>
            </div>
            <div className="nav-item-dropdown">
              <button className="nav-item">Yuklab olish {I.chevronDown}</button>
            </div>
          </nav>
        </div>

        <div className="top-nav-right">
          <div className="user-profile-badge">
            <div className="avatar-circle">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" />
              ) : (
                <span>{(user?.display_name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="user-name">{user?.display_name || 'Foydalanuvchi'}</span>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }} title="Chiqish">
            {I.logout}
          </button>
        </div>
      </header>

      {/* BODY LAYOUT */}
      <div className="capcut-body-layout">
        {/* LEFT SIDEBAR */}
        <aside className="capcut-sidebar">
          <div className="sidebar-group">
            <button className="sidebar-item active">
              <span className="sidebar-icon">{I.home}</span>
              <span>Boshlash</span>
            </button>
            <button className="sidebar-item" onClick={() => showToast('Shablonlar tez kunda qoʻshiladi')}>
              <span className="sidebar-icon">{I.templates}</span>
              <span>Shablonlar</span>
              <span className="badge-new">New</span>
            </button>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-group">
            <div className="sidebar-section-title">Ish maydoni</div>
            <button className="sidebar-item active-workspace">
              <div className="workspace-avatar m-avatar">M</div>
              <span>Myspace</span>
            </button>
            <button className="sidebar-item" onClick={() => showToast('Capcut space tez kunda')}>
              <div className="workspace-avatar c-avatar">C</div>
              <span>Capcut space</span>
            </button>
            <button className="sidebar-item" onClick={() => showToast('Editor space tez kunda')}>
              <div className="workspace-avatar e-avatar">E</div>
              <span>Editor</span>
            </button>
            <button className="sidebar-item create-space-btn" onClick={() => showToast('Yangi maydon yaratish tez kunda')}>
              <span className="sidebar-icon">{I.plus}</span>
              <span>Yangi maydon yaratish</span>
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="capcut-main-content">
          {/* HEADER ROW */}
          <div className="workspace-header">
            <div className="workspace-title-row">
              <h2>Myspace</h2>
              <span className="storage-indicator">314.49MB / 1GB</span>
            </div>

            <div className="workspace-action-buttons">
              <button className="btn-new-project" onClick={() => setShowNewProjectModal(true)}>
                <span className="btn-icon">{I.scissors}</span>
                <span>Yangi loyiha</span>
                <span className="plus-sign">{I.plus}</span>
              </button>

              <div className="upload-materials-wrapper">
                <button className="btn-upload-materials" onClick={() => setShowUploadDropdown(!showUploadDropdown)}>
                  <span className="btn-icon">{I.upload}</span>
                  <span>Materiallarni yuklash</span>
                  <span className="chevron-icon">{I.chevronDown}</span>
                </button>

                {/* UPLOAD MATERIALS DROPDOWN */}
                {showUploadDropdown && (
                  <div className="upload-dropdown-menu animate-scale-in">
                    <button className="dropdown-item" onClick={() => fileInputRef.current?.click()}>
                      <span className="dropdown-icon">{I.computer}</span>
                      <span>Kompyuterdan</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowUploadDropdown(false); showToast('Telefondan yuklash tez kunda'); }}>
                      <span className="dropdown-icon">{I.phone}</span>
                      <span>Telefondan</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={() => { setShowUploadDropdown(false); showToast('Google Drive integratsiyasi tez kunda'); }}>
                      <span className="dropdown-icon">{I.drive}</span>
                      <span>Google Drive</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowUploadDropdown(false); showToast('Dropbox integratsiyasi tez kunda'); }}>
                      <span className="dropdown-icon">{I.dropbox}</span>
                      <span>Dropbox</span>
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="video/*,image/*,audio/*" multiple hidden onChange={handleFileUpload} />
              </div>
            </div>
          </div>

          {/* TABS ROW */}
          <div className="workspace-tabs-row">
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              Barchasi ({projects.length + exportedVideos.length + materials.length})
            </button>
            <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
              Loyihalar ({projects.length})
            </button>
            <button className={`tab-btn ${activeTab === 'exported' ? 'active' : ''}`} onClick={() => setActiveTab('exported')}>
              Eksport qilingan videolar ({exportedVideos.length})
            </button>
            <button className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
              Materiallar ({materials.length})
            </button>
          </div>

          {/* CONTENT GRIDS */}
          <div className="workspace-grid-container">
            {/* 1. PROJECTS TAB */}
            {(activeTab === 'projects' || activeTab === 'all') && (
              <div className="section-block">
                {activeTab === 'all' && <h3 className="section-subtitle">Loyihalar</h3>}
                {projects.length > 0 ? (
                  <div className="projects-grid">
                    {projects.map((p) => (
                      <div key={p.id} className="capcut-project-card" onClick={() => navigate(`/editor/${p.id}`)}>
                        <div className="project-thumb-box">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.name} className="thumb-img" />
                          ) : (
                            <div className="thumb-placeholder">
                              {I.film}
                              <span className="ratio-tag">{p.settings?.aspectRatio || '16:9'}</span>
                            </div>
                          )}
                          <div className="card-hover-overlay">
                            <div className="play-badge">{I.play}</div>
                          </div>
                        </div>

                        <div className="project-card-footer">
                          <div className="footer-info">
                            <h4 className="project-card-title">{p.name}</h4>
                            <span className="project-card-date">{formatDate(p.updatedAt || p.createdAt)}</span>
                          </div>

                          <div className="card-actions-wrapper" onClick={(e) => e.stopPropagation()}>
                            <button className="action-dots-btn" onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}>
                              {I.more}
                            </button>

                            {activeMenuId === p.id && (
                              <div className="card-context-menu animate-scale-in">
                                <button onClick={(e) => handleRename(e, p)}>
                                  {I.edit} Nomini oʻzgartirish
                                </button>
                                <button onClick={(e) => handleDuplicate(e, p.id)}>
                                  {I.copy} Nusxasini yaratish
                                </button>
                                <div className="menu-divider" />
                                <button className="menu-delete" onClick={(e) => handleDelete(e, p.id)}>
                                  {I.trash} Oʻchirish
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  activeTab === 'projects' && (
                    <div className="empty-state-card">
                      <div className="empty-icon">{I.film}</div>
                      <h3>Hali loyihalar yoʻq</h3>
                      <p>Birinchi professional videongizni yaratish uchun "Yangi loyiha" tugmasini bosing</p>
                      <button className="btn-new-project" onClick={() => setShowNewProjectModal(true)}>
                        <span className="btn-icon">{I.scissors}</span>
                        <span>Birinchi loyihani yaratish</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* 2. EXPORTED VIDEOS TAB */}
            {(activeTab === 'exported' || activeTab === 'all') && (
              <div className="section-block">
                {activeTab === 'all' && <h3 className="section-subtitle">Eksport qilingan videolar</h3>}
                {exportedVideos.length > 0 ? (
                  <div className="projects-grid">
                    {exportedVideos.map((v) => (
                      <div key={v.id} className="capcut-project-card">
                        <div className="project-thumb-box">
                          <video src={v.url} className="thumb-video" preload="metadata" />
                          <div className="card-hover-overlay">
                            <a href={v.url} download={`${v.name}.mp4`} className="play-badge" title="Yuklab olish" onClick={(e) => e.stopPropagation()}>
                              {I.download}
                            </a>
                          </div>
                        </div>
                        <div className="project-card-footer">
                          <div className="footer-info">
                            <h4 className="project-card-title">{v.name}</h4>
                            <span className="project-card-date">{formatDate(v.createdAt)} • {formatFileSize(v.size)}</span>
                          </div>
                          <button className="action-dots-btn" onClick={() => deleteExportedVideo(v.id)} title="Oʻchirish">
                            {I.trash}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  activeTab === 'exported' && (
                    <div className="empty-state-card">
                      <div className="empty-icon">{I.upload}</div>
                      <h3>Hali eksport qilingan videolar yoʻq</h3>
                      <p>Editor orqali video montaj qilib, uni MP4 formatida eksport qiling</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* 3. MATERIALS TAB */}
            {(activeTab === 'materials' || activeTab === 'all') && (
              <div className="section-block">
                {activeTab === 'all' && <h3 className="section-subtitle">Materiallar</h3>}
                {materials.length > 0 ? (
                  <div className="projects-grid">
                    {materials.map((m) => (
                      <div key={m.id} className="capcut-project-card">
                        <div className="project-thumb-box">
                          {m.type === 'image' ? (
                            <img src={m.url} alt={m.name} className="thumb-img" />
                          ) : m.type === 'video' ? (
                            <video src={m.url} className="thumb-video" preload="metadata" />
                          ) : (
                            <div className="thumb-placeholder">{I.upload}</div>
                          )}
                        </div>
                        <div className="project-card-footer">
                          <div className="footer-info">
                            <h4 className="project-card-title">{m.name}</h4>
                            <span className="project-card-date">{formatDate(m.createdAt)} • {formatFileSize(m.size)}</span>
                          </div>
                          <button className="action-dots-btn" onClick={() => deleteMaterial(m.id)} title="Oʻchirish">
                            {I.trash}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  activeTab === 'materials' && (
                    <div className="empty-state-card">
                      <div className="empty-icon">{I.upload}</div>
                      <h3>Hali yuklangan materiallar yoʻq</h3>
                      <p>"Materiallarni yuklash" tugmasi orqali video, rasm yoki audio fayllaringizni yuklang</p>
                      <button className="btn-upload-materials" onClick={() => fileInputRef.current?.click()}>
                        <span className="btn-icon">{I.upload}</span>
                        <span>Fayl tanlash</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div className="modal-overlay" onClick={() => setShowNewProjectModal(false)}>
          <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3>Yangi Loyiha Yaratish</h3>

            <div className="form-group">
              <label>Loyiha nomi</label>
              <input
                type="text"
                className="input-field"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Loyiha nomini kiriting..."
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Aspekt nisbati (Aspect Ratio)</label>
              <div className="ratio-selection-grid">
                <div
                  className={`ratio-card ${selectedRatio === '16:9' ? 'selected' : ''}`}
                  onClick={() => setSelectedRatio('16:9')}
                >
                  <div className="ratio-preview-box r-16-9" />
                  <span className="ratio-title">16:9</span>
                  <span className="ratio-desc">YouTube, Desktop</span>
                </div>

                <div
                  className={`ratio-card ${selectedRatio === '9:16' ? 'selected' : ''}`}
                  onClick={() => setSelectedRatio('9:16')}
                >
                  <div className="ratio-preview-box r-9-16" />
                  <span className="ratio-title">9:16</span>
                  <span className="ratio-desc">TikTok, Reels, Shorts</span>
                </div>

                <div
                  className={`ratio-card ${selectedRatio === '1:1' ? 'selected' : ''}`}
                  onClick={() => setSelectedRatio('1:1')}
                >
                  <div className="ratio-preview-box r-1-1" />
                  <span className="ratio-title">1:1</span>
                  <span className="ratio-desc">Instagram Post</span>
                </div>

                <div
                  className={`ratio-card ${selectedRatio === '4:3' ? 'selected' : ''}`}
                  onClick={() => setSelectedRatio('4:3')}
                >
                  <div className="ratio-preview-box r-4-3" />
                  <span className="ratio-title">4:3</span>
                  <span className="ratio-desc">Standart Video</span>
                </div>
              </div>
            </div>

            <div className="modal-buttons-row">
              <button className="btn-cancel" onClick={() => setShowNewProjectModal(false)}>
                Bekor qilish
              </button>
              <button className="btn-confirm" onClick={handleCreateNewProject}>
                Yaratish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameModal && (
        <div className="modal-overlay" onClick={() => setRenameModal(null)}>
          <div className="modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3>Loyiha nomini oʻzgartirish</h3>
            <div className="form-group">
              <input
                type="text"
                className="input-field"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                autoFocus
              />
            </div>
            <div className="modal-buttons-row">
              <button className="btn-cancel" onClick={() => setRenameModal(null)}>
                Bekor qilish
              </button>
              <button className="btn-confirm" onClick={submitRename}>
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
