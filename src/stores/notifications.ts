import { create } from 'zustand';
import { apiRequest } from '../lib/api';

export type NotificationTone = 'system' | 'collection' | 'social' | 'security';
export interface Notification { id: string; tone: NotificationTone; title: string; body: string; href?: string; createdAt: number; read: boolean }

interface NotificationsState {
  items: Notification[];
  hydrate: () => Promise<void>;
  push: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  unreadCount: () => number;
  clear: () => void;
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  items: [],
  hydrate: async () => {
    const result = await apiRequest<{ items: Notification[] }>('/notifications', { auth: true });
    set({ items: result.items });
  },
  push: (notification) => {
    void apiRequest('/notifications', { method: 'POST', auth: true, body: notification })
      .then(() => get().hydrate());
  },
  markAllRead: () => {
    set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) }));
    void apiRequest('/notifications/mark-all-read', { method: 'POST', auth: true });
  },
  markRead: (id) => {
    set((state) => ({ items: state.items.map((item) => item.id === id ? { ...item, read: true } : item) }));
    void apiRequest(`/notifications/${encodeURIComponent(id)}`, { method: 'PATCH', auth: true, body: { read: true } });
  },
  remove: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    void apiRequest(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
  },
  unreadCount: () => get().items.filter((item) => !item.read).length,
  clear: () => set({ items: [] }),
}));

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  return `${Math.floor(day / 7)} wk ago`;
}
