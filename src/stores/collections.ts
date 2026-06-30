import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Collection, CollectionVisualClass } from '../types';
import { collections as seedCollections } from '../data/assets';

export interface StoredCollection extends Collection {
  description: string;
  isPublic: boolean;
  assetIds: string[];
  createdAt: number;
}

interface CollectionsState {
  collections: StoredCollection[];
  hasHydrated: boolean;
  setHydrated: () => void;
  create: (input: {
    name: string;
    description?: string;
    isPublic?: boolean;
    visual?: CollectionVisualClass;
  }) => StoredCollection;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  toggleAsset: (collectionId: string, assetId: string) => 'added' | 'removed' | null;
  contains: (collectionId: string, assetId: string) => boolean;
  getById: (id: string) => StoredCollection | undefined;
}

const visualPool: CollectionVisualClass[] = [
  'collection-kente',
  'collection-tourism',
  'collection-urban',
];

const seedHydrated: StoredCollection[] = seedCollections.map((c, i) => ({
  ...c,
  description:
    i === 0
      ? 'Handwoven kente patterns and adinkra symbol references for editorial layouts.'
      : i === 1
        ? 'Ghana Tourism Board campaign assets — locations, talent, lifestyle.'
        : 'Modern Accra architecture, from the AU centre to indie galleries.',
  isPublic: i !== 2,
  assetIds: [],
  createdAt: Date.now() - (i + 1) * 86_400_000,
}));

export const useCollections = create<CollectionsState>()(
  persist(
    (set, get) => ({
      collections: seedHydrated,
      hasHydrated: false,
      setHydrated: () => set({ hasHydrated: true }),

      create: ({ name, description = '', isPublic = false, visual }) => {
        const id = `col-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        const visualChoice =
          visual ?? visualPool[get().collections.length % visualPool.length];
        const next: StoredCollection = {
          id,
          name: name.trim() || 'Untitled collection',
          description: description.trim(),
          isPublic,
          assetCount: 0,
          assetIds: [],
          updated: 'Just now',
          visual: visualChoice,
          createdAt: Date.now(),
        };
        set((s) => ({ collections: [next, ...s.collections] }));
        return next;
      },

      remove: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

      rename: (id, name) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, name, updated: 'Just now' } : c,
          ),
        })),

      toggleAsset: (collectionId, assetId) => {
        const col = get().collections.find((c) => c.id === collectionId);
        if (!col) return null;
        const already = col.assetIds.includes(assetId);
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c;
            const ids = already
              ? c.assetIds.filter((id) => id !== assetId)
              : [...c.assetIds, assetId];
            return {
              ...c,
              assetIds: ids,
              assetCount: ids.length,
              updated: 'Just now',
            };
          }),
        }));
        return already ? 'removed' : 'added';
      },

      contains: (collectionId, assetId) => {
        const col = get().collections.find((c) => c.id === collectionId);
        return col ? col.assetIds.includes(assetId) : false;
      },

      getById: (id) => get().collections.find((c) => c.id === id),
    }),
    {
      name: 'kontaner.collections',
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
