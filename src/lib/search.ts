import type { Asset, AssetType } from '../types';

/**
 * Natural-language search engine.
 *
 * Given a query like "market scenes with bold colors", this tokenises,
 * expands each token through a synonym map, then scores every asset by
 * how many expanded tokens hit its tags / title / owner / type. The
 * result feels like semantic search without an embedding model.
 */

export interface SearchHit {
  asset: Asset;
  score: number;
  matched: string[];
}

const STOPWORDS = new Set<string>([
  'a', 'an', 'the', 'with', 'in', 'on', 'for', 'of', 'and', 'or', 'to',
  'from', 'by', 'at', 'is', 'are', 'be', 'this', 'that', 'these', 'those',
  'show', 'find', 'get', 'give', 'want', 'need', 'looking', 'search',
  'me', 'my', 'i', 'we', 'us', 'them',
]);

/** Word → expanded synonyms. All entries are lowercase. */
const SYNONYMS: Record<string, readonly string[]> = {
  // Cultural / regional
  kente: ['textile', 'pattern', 'weave', 'fabric', 'traditional', 'cloth'],
  textile: ['kente', 'fabric', 'cloth', 'weave'],
  fabric: ['kente', 'textile', 'cloth'],
  ghana: ['ghanaian', 'accra', 'kumasi', 'west', 'africa', 'african'],
  ghanaian: ['ghana', 'accra', 'west', 'africa'],
  accra: ['ghana', 'city', 'capital', 'urban'],
  kumasi: ['ghana', 'kejetia', 'market'],
  adinkra: ['symbol', 'traditional', 'pattern', 'heritage'],
  afrobeat: ['music', 'dance', 'rhythm', 'beat', 'cultural'],

  // Subjects
  market: ['commerce', 'bazaar', 'vendor', 'trade', 'stall', 'makola', 'kejetia'],
  vendor: ['market', 'commerce', 'trader', 'seller'],
  portrait: ['face', 'person', 'headshot', 'model', 'studio', 'people'],
  people: ['portrait', 'person', 'human', 'crowd'],
  woman: ['women', 'female', 'lady', 'mother', 'girl'],
  women: ['woman', 'female', 'lady', 'mother'],
  city: ['urban', 'metropolis', 'downtown', 'skyline', 'street'],
  urban: ['city', 'street', 'downtown', 'metropolitan'],
  skyline: ['city', 'urban', 'aerial', 'cityscape'],
  street: ['urban', 'city', 'jamestown', 'commerce'],
  food: ['cuisine', 'dish', 'meal', 'jollof', 'fufu'],
  jollof: ['food', 'cuisine', 'rice'],
  pattern: ['motif', 'design', 'ornament', 'geometric', 'kente', 'adinkra'],

  // Settings / atmosphere
  nature: ['landscape', 'outdoor', 'scenery', 'green', 'palms', 'tropical'],
  landscape: ['nature', 'outdoor', 'scenery', 'horizon'],
  beach: ['ocean', 'sea', 'shore', 'coastal', 'sand'],
  ocean: ['sea', 'beach', 'shore', 'water'],
  village: ['rural', 'community', 'countryside'],
  rural: ['village', 'countryside', 'community'],

  // Light / mood
  bold: ['vibrant', 'striking', 'vivid', 'colorful', 'dramatic', 'rich'],
  vibrant: ['bold', 'vivid', 'colorful', 'rich'],
  colorful: ['vibrant', 'bold', 'multicolor', 'rich'],
  colors: ['palette', 'hue', 'tone', 'color'],
  dark: ['moody', 'shadow', 'night', 'low-light', 'silhouette'],
  bright: ['light', 'sunny', 'lit', 'golden', 'illuminated'],
  warm: ['golden', 'sunset', 'amber', 'gold'],
  cool: ['blue', 'teal', 'cyan', 'cold'],
  golden: ['gold', 'warm', 'sunset', 'amber'],

  // Capture style
  aerial: ['drone', 'top-down', 'sky', 'birds-eye', 'overhead'],
  drone: ['aerial', 'sky', 'overhead'],
  closeup: ['close-up', 'macro', 'detail'],
  macro: ['closeup', 'detail', 'close-up'],
  vintage: ['retro', 'old', 'classic', 'aged', 'film'],
  modern: ['contemporary', 'new', 'fresh', 'minimal'],
  minimal: ['modern', 'clean', 'simple'],
  studio: ['portrait', 'professional', 'shoot'],

  // Asset types — used both for synonyms and direct type boosting
  photo: ['photograph', 'image', 'picture', 'shot'],
  photograph: ['photo', 'image', 'picture'],
  picture: ['photo', 'image'],
  video: ['footage', 'clip', 'film', 'motion'],
  footage: ['video', 'clip'],
  illustration: ['graphic', 'vector', 'drawing', 'art'],
  graphic: ['illustration', 'vector', 'art', 'design'],
  vector: ['illustration', 'graphic', 'svg'],
  '3d': ['model', 'mesh', 'render', 'sculpt'],
  model: ['3d', 'mesh', 'render'],
};

const TYPE_KEYWORDS: Record<string, AssetType> = {
  photo: 'PHOTO',
  photograph: 'PHOTO',
  picture: 'PHOTO',
  image: 'PHOTO',
  video: 'VIDEO',
  footage: 'VIDEO',
  clip: 'VIDEO',
  illustration: 'GRAPHIC',
  graphic: 'GRAPHIC',
  vector: 'GRAPHIC',
  drawing: 'GRAPHIC',
  '3d': '3D',
  model: '3D',
  mesh: '3D',
};

function tokenise(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function expand(tokens: string[]): { keywords: Set<string>; type: AssetType | null } {
  const keywords = new Set<string>();
  let type: AssetType | null = null;
  for (const t of tokens) {
    keywords.add(t);
    const syns = SYNONYMS[t];
    if (syns) for (const s of syns) keywords.add(s);
    if (t in TYPE_KEYWORDS && type === null) {
      type = TYPE_KEYWORDS[t];
    }
  }
  return { keywords, type };
}

function scoreAsset(
  asset: Asset,
  keywords: Set<string>,
  type: AssetType | null,
): { score: number; matched: string[] } {
  const matched = new Set<string>();
  let score = 0;

  const tagText = asset.tags.map((t) => t.toLowerCase());
  const titleText = `${asset.title} ${asset.displayTitle}`.toLowerCase();
  const ownerText = asset.owner.toLowerCase();

  for (const kw of keywords) {
    for (const tag of tagText) {
      if (tag === kw) {
        score += 5;
        matched.add(kw);
      } else if (tag.includes(kw)) {
        score += 3;
        matched.add(kw);
      }
    }
    if (titleText.includes(kw)) {
      score += 2;
      matched.add(kw);
    }
    if (ownerText.includes(kw)) {
      score += 1;
      matched.add(kw);
    }
  }

  if (type !== null && asset.type === type) {
    score += 4;
  }

  // Tiny popularity nudge so ties resolve in favor of popular assets
  if (score > 0) {
    score += Math.min(1, (asset.likes ?? 0) / 10000);
  }

  return { score, matched: Array.from(matched) };
}

/**
 * Rank `assets` against `query`. Empty / blank query returns the full
 * catalogue in original order with zero scores.
 */
export function smartSearch(query: string, all: readonly Asset[]): SearchHit[] {
  const tokens = tokenise(query);
  if (tokens.length === 0) {
    return all.map((asset) => ({ asset, score: 0, matched: [] }));
  }

  const { keywords, type } = expand(tokens);
  const scored: SearchHit[] = [];

  for (const asset of all) {
    const { score, matched } = scoreAsset(asset, keywords, type);
    if (score > 0) {
      scored.push({ asset, score, matched });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/**
 * Mines the top matched-tags across the result set so the UI can offer
 * one-click refinements ("filter by: kente, market, women").
 */
export function relatedTags(hits: readonly SearchHit[], max = 6): string[] {
  const counts = new Map<string, number>();
  for (const hit of hits.slice(0, 12)) {
    for (const tag of hit.asset.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([tag]) => tag);
}
