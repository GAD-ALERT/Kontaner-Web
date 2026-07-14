import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import type { Asset } from '../types';

interface Download { assetId: string; downloadedAt: number; title: string; src: string | null }
interface DownloadResult { ok: boolean; assetId: string; url: string | null; filename: string; size: string }

interface LibraryState {
  uploads: Asset[];
  downloads: Download[];
  loading: boolean;
  hydrate: () => Promise<void>;
  addUpload: (asset: Asset) => void;
  removeUpload: (id: string) => void;
  updateUpload: (id: string, patch: { displayTitle?: string; tags?: string[]; aiInsight?: string | null; premium?: boolean }) => Promise<Asset>;
  deleteUpload: (id: string) => Promise<void>;
  recordDownload: (assetId: string) => Promise<DownloadResult>;
  hasDownloaded: (assetId: string) => boolean;
  clear: () => void;
}

export const useLibrary = create<LibraryState>((set, get) => ({
  uploads: [], downloads: [], loading: false,
  hydrate: async () => {
    set({ loading: true });
    try {
      const [uploadResult, downloadResult] = await Promise.all([
        apiRequest<{ items: Asset[] }>('/uploads', { auth: true }),
        apiRequest<{ items: Download[] }>('/downloads', { auth: true }),
      ]);
      set({ uploads: uploadResult.items, downloads: downloadResult.items });
    } finally { set({ loading: false }); }
  },
  addUpload: (asset) => set((state) => ({ uploads: [asset, ...state.uploads.filter((item) => item.id !== asset.id)] })),
  removeUpload: (id) => set((state) => ({ uploads: state.uploads.filter((item) => item.id !== id) })),
  updateUpload: async (id, patch) => {
    const result = await apiRequest<{ asset: Asset }>(`/uploads/${encodeURIComponent(id)}`, { method: 'PATCH', auth: true, body: patch });
    set((state) => ({ uploads: state.uploads.map((item) => item.id === id ? result.asset : item) }));
    return result.asset;
  },
  deleteUpload: async (id) => {
    await apiRequest(`/uploads/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
    set((state) => ({ uploads: state.uploads.filter((item) => item.id !== id) }));
  },
  recordDownload: async (assetId) => {
    const result = await apiRequest<DownloadResult>(`/downloads/${encodeURIComponent(assetId)}`, { method: 'POST', auth: true });
    await get().hydrate();
    return result;
  },
  hasDownloaded: (assetId) => get().downloads.some((item) => item.assetId === assetId),
  clear: () => set({ uploads: [], downloads: [] }),
}));
