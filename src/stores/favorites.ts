import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoritesState {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((x) => x !== id)
            : [...state.ids, id],
        })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'kontaner.favorites' },
  ),
);

interface GateState {
  open: boolean;
  reason: string;
  show: (reason?: string) => void;
  hide: () => void;
}

export const useLoginGate = create<GateState>((set) => ({
  open: false,
  reason: '',
  show: (reason = 'Sign in to continue') => set({ open: true, reason }),
  hide: () => set({ open: false }),
}));
