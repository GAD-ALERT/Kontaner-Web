import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationTone = 'system' | 'collection' | 'social' | 'security';

export interface Notification {
  id: string;
  tone: NotificationTone;
  title: string;
  body: string;
  href?: string;
  createdAt: number;
  read: boolean;
}

interface NotificationsState {
  items: Notification[];
  push: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  unreadCount: () => number;
}

const seed: Notification[] = [
  {
    id: 'n-seed-1',
    tone: 'system',
    title: 'Welcome to Kontaner',
    body: 'Your library is ready. Upload your first asset to get auto-tagging.',
    href: '/upload',
    createdAt: Date.now() - 1000 * 60 * 7,
    read: false,
  },
  {
    id: 'n-seed-2',
    tone: 'collection',
    title: '“Kente Patterns” updated',
    body: '3 new assets matched your saved collection criteria.',
    href: '/collections',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    read: false,
  },
  {
    id: 'n-seed-3',
    tone: 'social',
    title: 'Studio Accra followed you',
    body: 'They’ve published 12 portraits this month.',
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
    read: true,
  },
];

let counter = 0;
const nextId = (): string => `n-${++counter}-${Date.now().toString(36)}`;

export const useNotifications = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: seed,
      push: (n) =>
        set((s) => ({
          items: [
            { ...n, id: nextId(), createdAt: Date.now(), read: false },
            ...s.items,
          ].slice(0, 40),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
      unreadCount: () => get().items.filter((n) => !n.read).length,
    }),
    { name: 'kontaner.notifications', version: 1 },
  ),
);

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  const wk = Math.floor(day / 7);
  return `${wk} wk ago`;
}
