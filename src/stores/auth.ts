import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  login: (email: string) => void;
  signup: (input: { name: string; email: string; role: string }) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'KT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const nameFromEmail = (email: string): string => {
  const handle = email.split('@')[0] ?? 'creative';
  return handle
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email: string) => {
        const name = nameFromEmail(email) || 'Kontaner Creative';
        set({
          user: {
            name,
            email,
            role: 'Visual Designer',
            avatarInitials: initialsFromName(name),
          },
        });
      },
      signup: ({ name, email, role }) => {
        set({
          user: {
            name: name || nameFromEmail(email),
            email,
            role,
            avatarInitials: initialsFromName(name || nameFromEmail(email)),
          },
        });
      },
      loginAsGuest: () => {
        set({
          user: {
            name: 'Ama Serwaa',
            email: 'guest@kontaner.studio',
            role: 'Visual Designer',
            avatarInitials: 'AM',
          },
        });
      },
      logout: () => set({ user: null }),
      updateProfile: (patch) =>
        set((s) => {
          if (!s.user) return s;
          const nextName = patch.name ?? s.user.name;
          return {
            user: {
              ...s.user,
              ...patch,
              avatarInitials: patch.name
                ? initialsFromName(nextName)
                : s.user.avatarInitials,
            },
          };
        }),
    }),
    { name: 'kontaner.auth' },
  ),
);

export const useIsAuthenticated = (): boolean =>
  useAuth((s) => s.user !== null);
