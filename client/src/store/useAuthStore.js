import { create } from 'zustand';
import { api } from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  loginWithToken: (token, user) => {
    localStorage.setItem('lura_token', token);
    localStorage.setItem('lura_user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  // Load and verify with server
  loadUser: async () => {
    const token = localStorage.getItem('lura_token');
    const savedUser = localStorage.getItem('lura_user');

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        set({ user: parsed, isAuthenticated: true });
      } catch {
        // ignore
      }
    }

    // Verify token with backend
    try {
      const data = await api.getMe();
      if (data && data.user) {
        localStorage.setItem('lura_user', JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      // If 401, api.js automatically cleans localStorage
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('lura_token');
    localStorage.removeItem('lura_user');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
