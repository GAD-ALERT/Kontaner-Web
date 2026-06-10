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
}

/** A user-curated set of assets. */
export interface Collection {
  id: string;
  name: string;
  assetCount: number;
  updated: string;
  visual: CollectionVisualClass;
}

/** An AI-generated descriptive tag. */
export type AiTag = string;
