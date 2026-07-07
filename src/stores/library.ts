import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asset } from '../types';

interface LibraryState {
  uploads: Asset[];
  downloads: { assetId: string; downloadedAt: number }[];
  addUpload: (asset: Asset) => void;
  removeUpload: (id: string) => void;
  recordDownload: (assetId: string) => void;
  hasDownloaded: (assetId: string) => boolean;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      uploads: [],
      downloads: [],

      addUpload: (asset) =>
        set((s) => {
          if (s.uploads.some((u) => u.id === asset.id)) return s;
          return { uploads: [asset, ...s.uploads] };
        }),

      removeUpload: (id) =>
        set((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) })),

      recordDownload: (assetId) =>
        set((s) => {
          const without = s.downloads.filter((d) => d.assetId !== assetId);
          return {
            downloads: [
              { assetId, downloadedAt: Date.now() },
              ...without,
            ].slice(0, 50),
          };
        }),

      hasDownloaded: (assetId) =>
        get().downloads.some((d) => d.assetId === assetId),
    }),
    { name: 'kontaner.library', version: 1 },
  ),
);
