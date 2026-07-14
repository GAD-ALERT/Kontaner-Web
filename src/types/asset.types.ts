/**
 * Core domain types for Kontaner assets and collections.
 */

export type AssetType = 'PHOTO' | 'VIDEO' | 'GRAPHIC' | '3D';

export type AssetFormat =
  | 'JPG'
  | 'PNG'
  | 'RAW'
  | 'MP4'
  | 'AI'
  | 'OBJ'
  | 'TIFF'
  | 'WEBP';

/**
 * CSS visual class returned by the asset service.
 */
export type VisualClass =
  | 'visual-kente'
  | 'visual-market'
  | 'visual-portrait'
  | 'visual-village'
  | 'visual-textile'
  | 'visual-city'
  | 'visual-palms'
  | 'visual-illustration'
  | 'visual-baskets'
  | 'visual-gold'
  | 'visual-studio'
  | 'visual-architecture';

export type CollectionVisualClass =
  | 'collection-kente'
  | 'collection-tourism'
  | 'collection-urban';

export type AspectRatio = 'portrait' | 'landscape' | 'square';

/** A single uploaded creative asset. */
export interface Asset {
  id: string;
  title: string;
  displayTitle: string;
  type: AssetType;
  format: AssetFormat;
  size: string;
  date: string;
  owner: string;
  creatorId?: string | null;
  visual: VisualClass;
  tags: string[];
  premium?: boolean;
  likes?: number;
  downloads?: number;
  aiInsight?: string | null;
  aspectRatio?: AspectRatio;
  /** Public-relative path to the bundled image. Populated in Day 3. */
  src?: string;
}

/** A user-curated set of assets. */
export interface Collection {
  id: string;
  name: string;
  assetCount: number;
  updated: string;
  visual: CollectionVisualClass;
}

/** A featured creator on the discover page. */
export interface Creator {
  id: string;
  name: string;
  role: string;
  bio: string;
  location: string;
  avatarUrl: string;
  avatarInitials: string;
  memberSince: string;
  assetCount: number;
}

/** An AI-generated descriptive tag. */
export type AiTag = string;
