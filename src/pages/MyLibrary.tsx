import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AssetCard } from '../components/AssetCard';
import { Icon } from '../components/Icon';
import { SkeletonAssetGrid } from '../components/Skeleton';
import { assets } from '../data/assets';
import { useFavorites } from '../stores/favorites';
import { useLibrary } from '../stores/library';
import { useFakeLoad } from '../hooks/useFakeLoad';
import { gridContainer, gridItem } from '../lib/motion';
import type { Asset, AssetType } from '../types';

type LibraryFilter = 'All' | 'Photos' | 'Illustrations' | 'Recent';
type SortKey = 'date' | 'name' | 'popular';
type ViewMode = 'grid' | 'list';

const filters: readonly LibraryFilter[] = [
  'All',
  'Photos',
  'Illustrations',
  'Recent',
] as const;

const filterToType: Partial<Record<LibraryFilter, AssetType>> = {
  Photos: 'PHOTO',
  Illustrations: 'ILLUSTRATION',
};

const sortLabels: Record<SortKey, string> = {
  date: 'Sort by: Date Added',
  name: 'Sort by: Name',
  popular: 'Sort by: Most Popular',
};

export function MyLibrary() {
  const favoriteIds = useFavorites((s) => s.ids);
  const loading = useFakeLoad(500);
  const [filter, setFilter] = useState<LibraryFilter>('All');
  const [sort, setSort] = useState<SortKey>('date');
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [view, setView] = useState<ViewMode>('grid');

  const uploads = useLibrary((s) => s.uploads);

  const library: Asset[] = useMemo(() => {
    const seeded = assets.slice(4, 22);
    const baseline =
      favoriteIds.length > 0
        ? [...uploads, ...assets.filter((a) => favoriteIds.includes(a.id))]
        : [...uploads, ...seeded];

    const filtered =
      filter === 'All' || filter === 'Recent'
        ? baseline
        : baseline.filter((a) => a.type === filterToType[filter]);

    const sorted = [...filtered];
    if (sort === 'popular') {
      sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    } else if (sort === 'name') {
      sorted.sort((a, b) => a.displayTitle.localeCompare(b.displayTitle));
    }
    if (filter === 'Recent') {
      return sorted.slice(0, 6);
    }
    return sorted;
  }, [favoriteIds, filter, sort, uploads]);

  return (
    <div className="page library-page">
      <section className="library-hero">
        <div>
          <h1>My Library</h1>
          <p>
            <Icon name="auto_awesome" size={20} />
            {library.length} assets · Auto-tagged with AI
          </p>
        </div>
        <div className="stat-pair">
          <div className="stat-card">
            <span>Total Assets</span>
            <strong>{library.length}</strong>
          </div>
          <div className="stat-card blue-stat">
            <span>Tags Generated</span>
            <strong>
              {library.reduce((sum, a) => sum + a.tags.length, 0)}
            </strong>
          </div>
        </div>
      </section>

      <section className="library-toolbar">
        <div className="pill-row">
          {filters.map((f) => (
            <button
              className={filter === f ? 'active' : ''}
              key={f}
              type="button"
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="sort-row">
          <div className="sort-menu">
            <button
              className="secondary-button small"
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              aria-expanded={sortOpen}
            >
              {sortLabels[sort]}
              <Icon name="expand_more" size={20} />
            </button>
            {sortOpen && (
              <div className="sort-menu-pop" role="menu">
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={sort === k ? 'active' : ''}
                    onClick={() => {
                      setSort(k);
                      setSortOpen(false);
                    }}
                  >
                    {sortLabels[k]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="view-toggle framed">
            <button
              className={view === 'grid' ? 'active' : ''}
              aria-label="Grid view"
              type="button"
              onClick={() => setView('grid')}
            >
              <Icon name="grid_view" size={20} filled={view === 'grid'} />
            </button>
            <button
              className={view === 'list' ? 'active' : ''}
              aria-label="List view"
              type="button"
              onClick={() => setView('list')}
            >
              <Icon name="view_list" size={20} filled={view === 'list'} />
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="library-grid">
          <SkeletonAssetGrid count={view === 'list' ? 4 : 8} />
        </section>
      ) : library.length === 0 ? (
        <section className="library-empty">
          <h2>Nothing here yet</h2>
          <p>Try a different filter, or save assets from Discover to build your library.</p>
        </section>
      ) : view === 'grid' ? (
        <motion.section
          className="library-grid"
          variants={gridContainer}
          initial="hidden"
          animate="visible"
          key={`grid-${filter}-${sort}`}
        >
          {library.map((asset) => (
            <motion.div key={asset.id} variants={gridItem}>
              <AssetCard asset={asset} />
            </motion.div>
          ))}
        </motion.section>
      ) : (
        <section className="library-list">
          {library.map((asset) => (
            <article key={asset.id} className="library-list-row">
              <div className={`library-list-thumb ${asset.visual}`} />
              <div className="library-list-meta">
                <strong>{asset.displayTitle}</strong>
                <span>
                  {asset.type} · {asset.format} · {asset.size} · {asset.date}
                </span>
              </div>
              <div className="library-list-tags">
                {asset.tags.slice(0, 3).map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <Link className="library-list-open" to={`/asset/${asset.id}`}>
                Open
              </Link>
            </article>
          ))}
        </section>
      )}

      {!loading && library.length > 0 && (
        <button className="secondary-button load-more-centered" type="button">
          Load more assets
          <Icon name="expand_more" size={20} />
        </button>
      )}
    </div>
  );
}
