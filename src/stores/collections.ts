import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import type { Collection, CollectionVisualClass } from '../types';

export interface StoredCollection extends Collection {
  description: string; isPublic: boolean; assetIds: string[]; createdAt: number;
  /** Up to four asset image URLs for the cover mosaic (newest first). */
  coverImages?: string[];
}

interface CollectionsState {
  collections: StoredCollection[];
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  create: (input: { name: string; description?: string; isPublic?: boolean; visual?: CollectionVisualClass }) => Promise<StoredCollection>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  toggleAsset: (collectionId: string, assetId: string) => Promise<'added' | 'removed'>;
  contains: (collectionId: string, assetId: string) => boolean;
  getById: (id: string) => StoredCollection | undefined;
  clear: () => void;
}

export const useCollections = create<CollectionsState>((set, get) => ({
  collections: [], hasHydrated: false,
  hydrate: async () => {
    const result = await apiRequest<{ items: StoredCollection[] }>('/collections', { auth: true });
    set({ collections: result.items, hasHydrated: true });
  },
  create: async (input) => {
    const result = await apiRequest<{ collection: StoredCollection }>('/collections', { method: 'POST', auth: true, body: input });
    set((state) => ({ collections: [result.collection, ...state.collections] }));
    return result.collection;
  },
  remove: async (id) => {
    await apiRequest(`/collections/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
    set((state) => ({ collections: state.collections.filter((item) => item.id !== id) }));
  },
  rename: async (id, name) => {
    const result = await apiRequest<{ collection: StoredCollection }>(`/collections/${encodeURIComponent(id)}`, { method: 'PATCH', auth: true, body: { name } });
    set((state) => ({ collections: state.collections.map((item) => item.id === id ? result.collection : item) }));
  },
  toggleAsset: async (collectionId, assetId) => {
    const result = await apiRequest<{ action: 'added' | 'removed'; assetCount: number }>(`/collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(assetId)}`, { method: 'POST', auth: true });
    set((state) => ({ collections: state.collections.map((item) => {
      if (item.id !== collectionId) return item;
      const assetIds = result.action === 'added'
        ? Array.from(new Set([...item.assetIds, assetId]))
        : item.assetIds.filter((id) => id !== assetId);
      return { ...item, assetIds, assetCount: result.assetCount, updated: 'Modified just now' };
    }) }));
    return result.action;
  },
  contains: (collectionId, assetId) => get().collections.find((item) => item.id === collectionId)?.assetIds.includes(assetId) ?? false,
  getById: (id) => get().collections.find((item) => item.id === id),
  clear: () => set({ collections: [], hasHydrated: false }),
}));
