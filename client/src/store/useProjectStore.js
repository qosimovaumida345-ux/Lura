import { create } from 'zustand';

const generateId = () => `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,

  loadProjects: () => {
    const saved = localStorage.getItem('lura_projects');
    if (saved) {
      try {
        set({ projects: JSON.parse(saved) });
      } catch {
        set({ projects: [] });
      }
    }
  },

  createProject: (name = 'Untitled Project') => {
    const project = {
      id: generateId(),
      name,
      thumbnail: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { width: 1920, height: 1080, fps: 30, aspectRatio: '16:9' },
      timelineData: { tracks: [], duration: 0 },
    };
    const projects = [project, ...get().projects];
    localStorage.setItem('lura_projects', JSON.stringify(projects));
    set({ projects });
    return project;
  },

  updateProject: (id, updates) => {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    localStorage.setItem('lura_projects', JSON.stringify(projects));
    set({ projects });
    if (get().currentProject?.id === id) {
      set({ currentProject: projects.find((p) => p.id === id) });
    }
  },

  deleteProject: (id) => {
    const projects = get().projects.filter((p) => p.id !== id);
    localStorage.setItem('lura_projects', JSON.stringify(projects));
    set({ projects });
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
