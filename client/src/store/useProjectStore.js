import { create } from 'zustand';

const generateId = () => `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useProjectStore = create((set, get) => ({
  projects: [],
  exportedVideos: [],
  materials: [],
  currentProject: null,

  loadProjects: () => {
    try {
      const savedProjects = localStorage.getItem('lura_projects');
      const savedExports = localStorage.getItem('lura_exports');
      const savedMaterials = localStorage.getItem('lura_materials');

      set({
        projects: savedProjects ? JSON.parse(savedProjects) : [],
        exportedVideos: savedExports ? JSON.parse(savedExports) : [],
        materials: savedMaterials ? JSON.parse(savedMaterials) : [],
      });
    } catch {
      set({ projects: [], exportedVideos: [], materials: [] });
    }
  },

  createProject: (name = 'Sarlavhasiz loyiha', aspectRatio = '16:9') => {
    const aspectMap = {
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '1:1': { width: 1080, height: 1080 },
      '4:3': { width: 1440, height: 1080 },
    };

    const res = aspectMap[aspectRatio] || aspectMap['16:9'];

    const project = {
      id: generateId(),
      name,
      thumbnail: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: { width: res.width, height: res.height, fps: 30, aspectRatio },
      timelineData: { tracks: [], duration: 0 },
    };

    const projects = [project, ...get().projects];
    localStorage.setItem('lura_projects', JSON.stringify(projects));
    set({ projects });
    return project;
  },

  duplicateProject: (id) => {
    const target = get().projects.find((p) => p.id === id);
    if (!target) return null;

    const copy = {
      ...JSON.parse(JSON.stringify(target)),
      id: generateId(),
      name: `${target.name} (Nusxa)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projects = [copy, ...get().projects];
    localStorage.setItem('lura_projects', JSON.stringify(projects));
    set({ projects });
    return copy;
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

  addExportedVideo: (video) => {
    const item = {
      id: `export_${Date.now()}`,
      name: video.name || 'Eksport qilingan video',
      url: video.url,
      size: video.size || 0,
      duration: video.duration || 0,
      createdAt: new Date().toISOString(),
      projectId: video.projectId || null,
    };
    const exportedVideos = [item, ...get().exportedVideos];
    localStorage.setItem('lura_exports', JSON.stringify(exportedVideos));
    set({ exportedVideos });
    return item;
  },

  deleteExportedVideo: (id) => {
    const exportedVideos = get().exportedVideos.filter((v) => v.id !== id);
    localStorage.setItem('lura_exports', JSON.stringify(exportedVideos));
    set({ exportedVideos });
  },

  addMaterial: (file) => {
    const item = {
      id: `mat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
      size: file.size,
      url: file.url,
      createdAt: new Date().toISOString(),
    };
    const materials = [item, ...get().materials];
    localStorage.setItem('lura_materials', JSON.stringify(materials));
    set({ materials });
    return item;
  },

  deleteMaterial: (id) => {
    const materials = get().materials.filter((m) => m.id !== id);
    localStorage.setItem('lura_materials', JSON.stringify(materials));
    set({ materials });
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
