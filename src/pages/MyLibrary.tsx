import { ChevronDown, Grid2X2, List, Sparkles } from 'lucide-react';
import { AssetCard } from '../components/AssetCard';
import { assets } from '../data/assets';
import type { NavigateFn } from '../types';

type LibraryFilter = 'All' | 'Photos' | 'Illustrations' | 'Graphics' | 'Recent';

const filters: readonly LibraryFilter[] = [
  'All',
  'Photos',
  'Illustrations',
  'Graphics',
  'Recent',
] as const;

interface MyLibraryProps {
  navigate: NavigateFn;
}

export function MyLibrary({ navigate }: MyLibraryProps) {
  return (
    <div className="page library-page">
      <section className="library-hero">
        <div>
          <h1>My Library</h1>
          <p>
            <Sparkles size={18} />
            47 assets - Auto-tagged with AI
          </p>
        </div>
        <div className="stat-pair">
          <div className="stat-card">
            <span>Total Assets</span>
            <strong>1,204</strong>
          </div>
          <div className="stat-card blue-stat">
            <span>Tags Generated</span>
            <strong>8,432</strong>
          </div>
        </div>
      </section>

      <section className="library-toolbar">
        <div className="pill-row">
          {filters.map((filter) => (
            <button
              className={filter === 'All' ? 'active' : ''}
              key={filter}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="sort-row">
          <button className="secondary-button small" type="button">
            Sort by: Date Added
            <ChevronDown size={17} />
          </button>
          <div className="view-toggle framed">
            <button className="active" aria-label="Grid view" type="button">
              <Grid2X2 size={18} />
            </button>
            <button aria-label="List view" type="button">
              <List size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="library-grid">
        {assets.slice(4).map((asset) => (
          <AssetCard asset={asset} key={asset.id} onOpen={() => navigate('/asset')} />
        ))}
      </section>

      <button className="secondary-button load-more-centered" type="button">
        Load more assets
        <ChevronDown size={19} />
      </button>
    </div>
  );
}
