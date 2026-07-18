import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import type { Asset } from '../types';

interface FavoritesResponse { items: Asset[]; ids: string[] }
interface ToggleResponse { favorited: boolean; assetId: string }

export interface FavoritesState {
  ids: string[];
  items: Asset[];
  loading: boolean;
  hydrate: () => Promise<void>;
  has: (id: string) => boolean;
  toggle: (id: string) => Promise<boolean>;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: [], items: [], loading: false,
  hydrate: async () => {
    set({ loading: true });
    try {
      const result = await apiRequest<FavoritesResponse>('/favorites', { auth: true });
      set({ ids: result.ids, items: result.items });
    } finally { set({ loading: false }); }
  },
  has: (id) => get().ids.includes(id),
  toggle: async (id) => {
    const result = await apiRequest<ToggleResponse>(`/favorites/${encodeURIComponent(id)}`, {
      method: 'POST', auth: true,
    });
    set((state) => ({
      ids: result.favorited
        ? Array.from(new Set([...state.ids, id]))
        : state.ids.filter((itemId) => itemId !== id),
      items: result.favorited
        ? state.items
        : state.items.filter((item) => item.id !== id),
    }));
    if (result.favorited) void get().hydrate();
    return result.favorited;
  },
  clear: () => set({ ids: [], items: [] }),
}));

interface GateState { open: boolean; reason: string; show: (reason?: string) => void; hide: () => void }
export const useLoginGate = create<GateState>((set) => ({
  open: false, reason: '',
  show: (reason = 'Sign in to continue') => set({ open: true, reason }),
  hide: () => set({ open: false }),
}));
