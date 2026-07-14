import { ChevronDown, Grid2X2, List, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AssetCard } from '../components/AssetCard';
import { SkeletonAssetGrid } from '../components/Skeleton';
import { useFavorites } from '../stores/favorites';
import { useLibrary } from '../stores/library';
import { gridContainer, gridItem } from '../lib/motion';
import type { Asset, AssetType } from '../types';
import { toast } from '../stores/toast';

type LibraryFilter = 'All' | 'Photos' | 'Videos' | 'Illustrations' | '3D' | 'Recent';
type SortKey = 'date' | 'name' | 'popular';
type ViewMode = 'grid' | 'list';

const filters: readonly LibraryFilter[] = [
  'All',
  'Photos',
  'Videos',
  'Illustrations',
  '3D',
  'Recent',
] as const;

const filterToType: Partial<Record<LibraryFilter, AssetType>> = {
  Photos: 'PHOTO',
  Videos: 'VIDEO',
  Illustrations: 'GRAPHIC',
  '3D': '3D',
};

const sortLabels: Record<SortKey, string> = {
  date: 'Sort by: Date Added',
  name: 'Sort by: Name',
  popular: 'Sort by: Most Popular',
};

export function MyLibrary() {
  const favoriteIds = useFavorites((s) => s.ids);
  const favoriteAssets = useFavorites((s) => s.items);
  const [filter, setFilter] = useState<LibraryFilter>('All');
  const [sort, setSort] = useState<SortKey>('date');
  const [sortOpen, setSortOpen] = useState<boolean>(false);
  const [view, setView] = useState<ViewMode>('grid');

  const uploads = useLibrary((s) => s.uploads);
  const loading = useLibrary((s) => s.loading);
  const updateUpload = useLibrary((s) => s.updateUpload);
  const deleteUpload = useLibrary((s) => s.deleteUpload);
  const uploadIds = useMemo(() => new Set(uploads.map((asset) => asset.id)), [uploads]);

  const renameUpload = async (asset: Asset): Promise<void> => {
    const next = window.prompt('Asset title', asset.displayTitle)?.trim();
    if (!next || next === asset.displayTitle) return;
    try {
      await updateUpload(asset.id, { displayTitle: next });
      toast.success('Asset updated');
    } catch (err) { toast.error('Update failed', err instanceof Error ? err.message : undefined); }
  };

  const removeOwnedUpload = async (asset: Asset): Promise<void> => {
    if (!window.confirm(`Permanently delete "${asset.displayTitle}"?`)) return;
    try {
      await deleteUpload(asset.id);
      toast.success('Asset deleted');
    } catch (err) { toast.error('Delete failed', err instanceof Error ? err.message : undefined); }
  };

  const library: Asset[] = useMemo(() => {
    const baseline = [...uploads, ...favoriteAssets.filter((a) => favoriteIds.includes(a.id))]
      .filter((asset, index, list) => list.findIndex((item) => item.id === asset.id) === index);

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
  }, [favoriteAssets, favoriteIds, filter, sort, uploads]);

  return (
    <div className="page library-page">
      <section className="library-hero">
        <div>
          <h1>My Library</h1>
          <p>
            <Sparkles size={18} />
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
              <ChevronDown size={17} />
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
              <Grid2X2 size={18} />
            </button>
            <button
              className={view === 'list' ? 'active' : ''}
              aria-label="List view"
              type="button"
              onClick={() => setView('list')}
            >
              <List size={18} />
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
              {uploadIds.has(asset.id) && (
                <div className="settings-actions">
                  <button type="button" className="text-button" onClick={() => void renameUpload(asset)}>Rename</button>
                  <button type="button" className="text-button danger" onClick={() => void removeOwnedUpload(asset)}>Delete</button>
                </div>
              )}
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
              {uploadIds.has(asset.id) && (
                <button className="text-button" type="button" onClick={() => void renameUpload(asset)}>Rename</button>
              )}
            </article>
          ))}
        </section>
      )}

      {!loading && library.length > 0 && (
        <button className="secondary-button load-more-centered" type="button">
          Load more assets
          <ChevronDown size={19} />
        </button>
      )}
    </div>
  );
}
