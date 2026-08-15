import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import './Dashboard.css';

const IconPlus = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconFilm = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { projects, loadProjects, createProject, deleteProject, updateProject } = useProjectStore();
  const [renameModal, setRenameModal] = useState(null);
  const [renameName, setRenameName] = useState('');

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleNewProject = () => {
    const project = createProject();
    navigate(`/editor/${project.id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Bu loyihani oʻchirishni xohlaysizmi?')) deleteProject(id);
  };

  const handleRename = (e, project) => {
    e.stopPropagation();
    setRenameName(project.name);
    setRenameModal(project.id);
  };

  const submitRename = () => {
    if (renameName.trim()) updateProject(renameModal, { name: renameName.trim() });
    setRenameModal(null);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const formatDate = (d) => new Date(d).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'L';

  return (
    <div className="dashboard">
      <nav className="dash-nav">
        <div className="dash-nav-left">
          <img src="/logo.png" alt="Lura" />
          <h1>Lura</h1>
        </div>
        <div className="dash-nav-right">
          <div className="dash-user-info">
            <div className="dash-user-avatar">{getInitials(user?.display_name)}</div>
            <span className="dash-user-name">{user?.display_name || 'User'}</span>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout} title="Chiqish"><IconLogout /></button>
        </div>
      </nav>

      <div className="dash-content">
        <div className="dash-header">
          <h2>Loyihalarim <span>{projects.length} ta loyiha</span></h2>
          <button className="btn btn-primary" onClick={handleNewProject}><IconPlus /> Yangi Loyiha</button>
        </div>

        <div className="projects-grid">
          <button className="new-project-card" onClick={handleNewProject}>
            <div className="new-project-card-icon"><IconPlus /></div>
            <span>Yangi loyiha yaratish</span>
          </button>
          {projects.map((project) => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/editor/${project.id}`)}>
              <div className="project-card-thumbnail">
                <IconFilm />
                <div className="play-overlay"><div className="play-overlay-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
                </div></div>
              </div>
              <div className="project-card-info">
                <h3>{project.name}</h3>
                <div className="project-card-meta">
                  <span className="project-card-date">{formatDate(project.updatedAt || project.createdAt)}</span>
                  <div className="project-card-actions">
                    <button onClick={(e) => handleRename(e, project)} title="Nomini oʻzgartirish"><IconEdit /></button>
                    <button className="delete" onClick={(e) => handleDelete(e, project.id)} title="Oʻchirish"><IconTrash /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="dash-empty">
            <div className="dash-empty-icon"><IconFilm /></div>
            <h3>Hali loyihalar yoʻq</h3>
            <p>Birinchi professional videongizni yaratish uchun boshlang!</p>
            <button className="btn btn-primary btn-lg" onClick={handleNewProject}><IconPlus /> Birinchi loyihani yaratish</button>
          </div>
        )}
      </div>

      {renameModal && (
        <div className="modal-overlay" onClick={() => setRenameModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Loyiha nomini oʻzgartirish</h3>
            <input className="rename-input" type="text" value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitRename()} autoFocus />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setRenameModal(null)}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={submitRename}>Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
