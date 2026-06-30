import { create } from 'zustand';

export type ToastTone = 'info' | 'success' | 'warn' | 'error';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
  action?: { label: string; href: string };
  durationMs: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id' | 'durationMs'> & { durationMs?: number }) => string;
  dismiss: (id: string) => void;
}

let counter = 0;
const nextId = (): string => `t-${++counter}-${Date.now().toString(36)}`;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = nextId();
    const duration = t.durationMs ?? 3200;
    set((s) => ({ toasts: [...s.toasts, { ...t, id, durationMs: duration }] }));
    if (duration > 0) {
      window.setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helpers so callsites don't pass a literal `{ tone }` every time. */
export const toast = {
  info: (title: string, body?: string): string =>
    useToast.getState().push({ tone: 'info', title, body }),
  success: (title: string, body?: string): string =>
    useToast.getState().push({ tone: 'success', title, body }),
  warn: (title: string, body?: string): string =>
    useToast.getState().push({ tone: 'warn', title, body }),
  error: (title: string, body?: string): string =>
    useToast.getState().push({ tone: 'error', title, body }),
};
