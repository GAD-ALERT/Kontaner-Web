/**
 * Core domain types for Kontaner assets and collections.
 */

export type AssetType = 'PHOTO' | 'ILLUSTRATION';

export type AssetFormat = 'JPG' | 'PNG' | 'RAW' | 'SVG' | 'TIFF' | 'WEBP';

/**
 * CSS visual gradient class identifier used to render mock thumbnails
 * via the `visual-*` rules defined in `styles.css`.
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
  visual: VisualClass;
  tags: string[];
  likes?: number;
  downloads?: number;
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
  handle: string;
  assetCount: number;
  initials: string;
  accent: 'green' | 'blue' | 'gold' | 'red';
}

/** An AI-generated descriptive tag. */
export type AiTag = string;
