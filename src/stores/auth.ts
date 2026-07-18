import { create } from 'zustand';
import { apiRequest, sessionToken } from '../lib/api';
import type { ApiUser, AuthResponse, NotificationPreferences, UserResponse } from '../types';

export type AuthUser = ApiUser;
type SessionStatus = 'restoring' | 'ready';

export interface AuthState {
  user: AuthUser | null;
  status: SessionStatus;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { name: string; email: string; password: string; role: string }) => Promise<void>;
  restore: () => Promise<void>;
  expire: () => void;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<AuthUser, 'name' | 'role' | 'bio' | 'location' | 'avatarUrl'>>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<AuthUser>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: sessionToken.get() ? 'restoring' : 'ready',
  login: async (email, password) => {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST', body: { email, password },
    });
    sessionToken.set(result.token);
    set({ user: result.user, status: 'ready' });
  },
  signup: async (input) => {
    const result = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST', body: input,
    });
    sessionToken.set(result.token);
    set({ user: result.user, status: 'ready' });
  },
  restore: async () => {
    if (!sessionToken.get()) return set({ user: null, status: 'ready' });
    try {
      const result = await apiRequest<UserResponse>('/auth/me', { auth: true });
      set({ user: result.user, status: 'ready' });
    } catch {
      sessionToken.clear();
      set({ user: null, status: 'ready' });
    }
  },
  expire: () => {
    sessionToken.clear();
    set({ user: null, status: 'ready' });
  },
  logout: async () => {
    try {
      if (sessionToken.get()) await apiRequest('/auth/logout', { method: 'POST', auth: true });
    } finally {
      sessionToken.clear();
      set({ user: null, status: 'ready' });
    }
  },
  updateProfile: async (patch) => {
    const result = await apiRequest<UserResponse>('/auth/me', { method: 'PATCH', auth: true, body: patch });
    set({ user: result.user });
  },
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    const result = await apiRequest<UserResponse>('/auth/me/avatar', { method: 'POST', auth: true, body: form });
    set({ user: result.user });
    return result.user;
  },
  updatePreferences: async (preferences) => {
    const result = await apiRequest<{ preferences: NotificationPreferences }>('/auth/me/preferences', {
      method: 'PUT', auth: true, body: preferences,
    });
    set((state) => ({ user: state.user ? { ...state.user, notificationPreferences: result.preferences } : null }));
  },
}));

export const useIsAuthenticated = (): boolean => useAuth((s) => s.user !== null);
