import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  // Demo login (no real OAuth needed for MVP)
  loginDemo: () => {
    const demoUser = {
      id: 1,
      display_name: 'Lura User',
      email: 'user@lura.app',
      avatar_url: null,
    };
    localStorage.setItem('lura_token', 'demo_token');
    localStorage.setItem('lura_user', JSON.stringify(demoUser));
    set({ user: demoUser, isAuthenticated: true, isLoading: false });
  },

  // Load from localStorage
  loadUser: () => {
    const saved = localStorage.getItem('lura_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('lura_token');
    localStorage.removeItem('lura_user');
    set({ user: null, isAuthenticated: false });
  },
}));
