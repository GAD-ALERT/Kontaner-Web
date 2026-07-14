/**
 * Request/response payloads exchanged with the Kontaner backend.
 */

import type { Asset } from './asset.types';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  bio: string;
  location: string;
  avatarUrl: string;
  createdAt: string;
  notificationPreferences: NotificationPreferences;
}

export interface NotificationPreferences {
  digest: boolean;
  activity: boolean;
  promotions: boolean;
  security: boolean;
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  remainingBytes: number;
  assetCount: number;
  breakdown: Array<{ type: string; bytes: number; count: number }>;
}

export interface AuthResponse { token: string; user: ApiUser }
export interface UserResponse { user: ApiUser }
export interface AssetResponse { asset: Asset }
export interface AssetListResponse {
  items: Asset[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
export interface SearchAsset extends Asset { relevance?: number }
export interface SearchResponse {
  items: SearchAsset[];
  query: string;
  page: number;
  pageSize: number;
  total: number;
  mode: 'semantic' | 'text';
}

/** Successful response from `POST /api/assets`. */
export interface UploadResponse {
  asset: Asset;
}

/** Standard error body returned by the API. */
export interface ApiErrorPayload {
  error?: string;
  code?: string;
}
