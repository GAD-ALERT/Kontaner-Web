import {
  Camera,
  Grid2X2,
  Image,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  Palette,
  Rows3,
  Bookmark,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AssetCard } from '../components/AssetCard';
import { assets } from '../data/assets';
import type { NavigateFn } from '../types';

interface CategoryButton {
  label: string;
  icon: LucideIcon;
}

const categoryButtons: readonly CategoryButton[] = [
  { label: 'Photos', icon: Camera },
  { label: 'Illustrations', icon: Sparkles },
  { label: 'Vectors', icon: Grid2X2 },
  { label: 'Textures', icon: Palette },
] as const;

const trendingTags: readonly string[] = [
  'Kente patterns',
  'Market scenes',
  'Afrobeat',
  'Adinkra symbols',
] as const;

interface DiscoverProps {
  navigate: NavigateFn;
}

export function Discover({ navigate }: DiscoverProps) {
  const [query, setQuery] = useState<string>('');
  const browseAssets = assets.slice(0, 6);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    navigate(`/search?query=${encodeURIComponent(query || 'market woman')}`);
  };

  return (
    <div className="page discover-page">
      <section className="discover-hero">
        <div className="hero-copy">
          <h1>Discover creative assets, tagged by AI</h1>
          <p>
            High-quality visuals from across Ghana, curated for global standards and local
            resonance.
          </p>
        </div>
        <form className="hero-search" onSubmit={submit}>
          <Search size={24} />
          <input
            aria-label="Search discover assets"
            placeholder="Search patterns, architecture, life..."
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          />
          <button className="primary-button" type="submit">
            Search
          </button>
        </form>
        <div className="trending-tags">
          <span>Trending:</span>
          {trendingTags.map((tag) => (
            <button type="button" key={tag}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="category-strip">
        {categoryButtons.map(({ label, icon: Icon }) => (
          <button type="button" key={label}>
            <Icon size={20} />
            {label}
          </button>
        ))}
      </section>

      <section className="catalog-layout">
        <aside className="filters-panel">
          <h2>Filters</h2>
          <h3>Asset Type</h3>
          <label>
            <input type="checkbox" /> Premium Only
          </label>
          <label>
            <input type="checkbox" /> Free License
          </label>
          <h3>Orientation</h3>
          <div className="orientation-grid">
            <button type="button">
              <Square size={18} />
              Landscape
            </button>
            <button type="button">
              <Image size={18} />
              Portrait
            </button>
          </div>
          <h3>Color Grid</h3>
          <div className="color-row">
            <span className="swatch emerald" />
            <span className="swatch blue" />
            <span className="swatch gold" />
            <span className="swatch red" />
            <span className="swatch white" />
          </div>
          <h3>License</h3>
          <select aria-label="License">
            <option>Standard Editorial</option>
            <option>Commercial</option>
            <option>Creative Commons</option>
          </select>
        </aside>

        <div className="catalog-content">
          <div className="section-heading">
            <h2>Trending Now</h2>
            <button className="text-button" type="button">
              View All
            </button>
          </div>
          <div className="trending-grid">
            {assets.slice(4, 6).map((asset) => (
              <div className={`trending-tile ${asset.visual}`} key={asset.id}>
                <button className="bookmark-button" aria-label="Save asset" type="button">
                  <Bookmark size={20} />
                </button>
              </div>
            ))}
            <div className="skeleton-tile" />
            <div className="skeleton-tile short" />
          </div>

          <div className="section-heading browse-heading">
            <h2>Browse All Assets</h2>
            <div className="view-toggle">
              <button className="active" aria-label="Grid view" type="button">
                <Grid2X2 size={19} />
              </button>
              <button aria-label="List view" type="button">
                <Rows3 size={19} />
              </button>
            </div>
          </div>
          <div className="asset-grid">
            {browseAssets.map((asset) => (
              <AssetCard
                asset={asset}
                key={asset.id}
                onOpen={() => navigate('/asset')}
              />
            ))}
          </div>
          <div className="pagination">
            <button className="active" type="button">
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <span>...</span>
            <button type="button">12</button>
          </div>
          <button className="secondary-button load-button" type="button">
            <SlidersHorizontal size={18} />
            Load more assets
          </button>
        </div>
      </section>
    </div>
  );
}
