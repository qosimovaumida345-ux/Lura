import { API_URL } from './constants';

const getToken = () => localStorage.getItem('lura_token');

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('lura_token');
      localStorage.removeItem('lura_user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Sessiya muddati tugadi. Iltimos qaytadan kiring.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.error || err.message || 'Soʻrov muvaffaqiyatsiz tugadi');
    }
    return res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  getMe: () => request('/auth/me'),

  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // AI
  chat: (messages) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) }),

  // Assets
  searchStickers: (q) => request(`/assets/stickers?q=${encodeURIComponent(q)}`),
  searchMusic: (q) => request(`/assets/music?q=${encodeURIComponent(q)}`),
};
