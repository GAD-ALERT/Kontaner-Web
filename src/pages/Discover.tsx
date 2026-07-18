import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AssetCard } from '../components/AssetCard';
import { Icon } from '../components/Icon';
import { SkeletonAssetGrid } from '../components/Skeleton';
import { gridContainer, gridItem, heroItem } from '../lib/motion';
import { apiRequest } from '../lib/api';
import type { Asset, AssetListResponse, AssetType, Creator, CreatorListResponse, LicenseTier, PublicCollection } from '../types';

interface CategoryCard {
  label: string;
  icon: string;
  filter: AssetType | 'ALL';
  accent: 'green' | 'blue' | 'gold' | 'red' | 'mint';
}

const categories: readonly CategoryCard[] = [
  { label: 'Photos', icon: 'photo_camera', filter: 'PHOTO', accent: 'green' },
  { label: 'Videos', icon: 'movie', filter: 'VIDEO', accent: 'blue' },
  { label: 'Illustrations', icon: 'palette', filter: 'GRAPHIC', accent: 'gold' },
  { label: '3D Models', icon: 'view_in_ar', filter: '3D', accent: 'red' },
] as const;

/* Rotating natural-language examples — each phrase is written so its
   keywords overlap real asset tags, so every example returns results. */
const examplePrompts: readonly string[] = [
  'Market women selling fresh produce in Accra',
  'Kente fabric close-up with gold and green tones',
  'Aerial view of the city skyline at twilight',
  'Studio portrait with traditional beads',
  'Palm-lined gardens on a bright afternoon',
  'Modern architecture against a clear sky',
] as const;

export function Discover() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<AssetType | 'ALL'>('ALL');
  const [licenseTier, setLicenseTier] = useState<LicenseTier>('all');
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<Creator[]>([]);
  const [stats, setStats] = useState<{ total: number; downloads: number; creators: number; byType: Array<{ type: string; count: number }> }>({ total: 0, downloads: 0, creators: 0, byType: [] });
  const [promptIndex, setPromptIndex] = useState<number>(0);
  const [promptPaused, setPromptPaused] = useState<boolean>(false);

  useEffect(() => {
    if (promptPaused) return;
    const id = window.setInterval(
      () => setPromptIndex((i) => (i + 1) % examplePrompts.length),
      4500,
    );
    return () => window.clearInterval(id);
  }, [promptPaused]);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const trending = useMemo(
    () => [...assets].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 8),
    [assets],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      apiRequest<{ items: PublicCollection[] }>('/collections/public', { signal: controller.signal }),
      apiRequest<CreatorListResponse>('/creators', { signal: controller.signal }),
      apiRequest<typeof stats>('/assets/stats', { signal: controller.signal }),
    ]).then(([collectionResult, creatorResult, statsResult]) => {
      setCollections(collectionResult.items);
      setFeaturedCreators(creatorResult.items);
      setStats(statsResult);
    }).catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async (): Promise<void> => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: String(page), pageSize: '12', tier: licenseTier, sort: 'new',
      });
      if (activeCategory !== 'ALL') params.set('type', activeCategory);
      try {
        const result = await apiRequest<AssetListResponse>(`/assets?${params}`, {
          signal: controller.signal,
        });
        setAssets((current) => page === 1 ? result.items : [...current, ...result.items]);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load assets.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [activeCategory, licenseTier, page]);

  const selectCategory = (filter: AssetType | 'ALL'): void => {
    setAssets([]);
    setPage(1);
    setActiveCategory(filter);
  };

  const selectTier = (tier: LicenseTier): void => {
    setAssets([]);
    setPage(1);
    setLicenseTier(tier);
  };

  return (
    <div className="discover-v2">
      {/* HERO */}
      <section className="hero-v2">
        <div className="hero-v2-bg" aria-hidden="true" />
        <motion.div
          className="hero-v2-inner"
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={heroItem} custom={1}>
            Search the way you think.
          </motion.h1>
          <motion.form
            className="hero-v2-search"
            onSubmit={submit}
            variants={heroItem}
            custom={2}
          >
            <Icon name="search" size={24} />
            <input
              aria-label="Search assets"
              placeholder="Describe the image you need…"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
            />
            <button className="hero-v2-search-btn" type="submit">
              Search
            </button>
          </motion.form>
          <motion.div
            className="hero-v2-example"
            variants={heroItem}
            custom={3}
            onMouseEnter={() => setPromptPaused(true)}
            onMouseLeave={() => setPromptPaused(false)}
          >
            <span>Try</span>
            <AnimatePresence mode="wait">
              <motion.button
                key={promptIndex}
                type="button"
                onClick={() =>
                  navigate(
                    `/search?q=${encodeURIComponent(examplePrompts[promptIndex])}`,
                  )
                }
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                “{examplePrompts[promptIndex]}”
              </motion.button>
            </AnimatePresence>
          </motion.div>
          <motion.div className="hero-v2-stats" variants={heroItem} custom={4}>
            <div>
              <strong>{stats.total.toLocaleString()}</strong>
              <span>Creative assets</span>
            </div>
            <div>
              <strong>{stats.creators.toLocaleString()}</strong>
              <span>Ghanaian creators</span>
            </div>
            <div>
              <strong>{stats.downloads.toLocaleString()}</strong>
              <span>Total downloads</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CATEGORY MEGA-STRIP */}
      <section className="category-mega">
        {categories.map(({ label, icon, filter, accent }) => (
          <button
            key={label}
            type="button"
            className={`category-mega-card ${accent} ${
              activeCategory === filter ? 'active' : ''
            }`}
            onClick={() => selectCategory(filter)}
          >
            <span className="category-mega-icon">
              <Icon name={icon} size={24} />
            </span>
            <span className="category-mega-label">{label}</span>
            <span className="category-mega-count">{(stats.byType.find((item) => item.type === filter)?.count ?? 0).toLocaleString()}</span>
          </button>
        ))}
      </section>

      {/* TRENDING ROW */}
      <section className="discover-section">
        <div className="discover-section-head">
          <div>
            <h2>
              <Icon name="trending_up" size={24} />
              Trending this week
            </h2>
            <p>What Ghanaian creatives are downloading right now.</p>
          </div>
          <Link to="/search?q=trending" className="text-button">
            View all
            <Icon name="chevron_right" size={16} />
          </Link>
        </div>
        <div className="trending-row">
          {trending.map((asset) => (
            <Link
              key={asset.id}
              to={`/asset/${asset.id}`}
              className={`trending-card ${asset.visual}`}
              aria-label={asset.displayTitle}
            >
              {asset.src && (
                <img
                  className="trending-card-img"
                  src={asset.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="trending-card-meta">
                <strong>{asset.displayTitle}</strong>
                <span>
                  {asset.format} · {asset.size}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COLLECTIONS STRIP */}
      <section className="discover-section">
        <div className="discover-section-head">
          <div>
            <h2>Public collections</h2>
            <p>Recently updated sets shared by Kontaner creators.</p>
          </div>
          <Link to="/search" className="text-button">
            All collections
            <Icon name="chevron_right" size={16} />
          </Link>
        </div>
        <div className="collection-strip">
          {collections.map((c) => (
            <Link
              key={c.id}
              to={`/public-collection/${c.id}`}
              className={`collection-strip-card ${c.visual}`}
            >
              <div className="collection-strip-meta">
                <h3>{c.name}</h3>
                <span>{c.assetCount} assets</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BROWSE ALL */}
      <section className="discover-section">
        <div className="discover-section-head">
          <div>
            <h2>Browse the library</h2>
            <p>
              {total} assets
              {activeCategory !== 'ALL' && ` in ${activeCategory.toLowerCase()}`}
            </p>
          </div>
          <div className="license-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={licenseTier === 'all'}
              className={licenseTier === 'all' ? 'active' : ''}
              onClick={() => selectTier('all')}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={licenseTier === 'free'}
              className={licenseTier === 'free' ? 'active' : ''}
              onClick={() => selectTier('free')}
            >
              Free
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={licenseTier === 'premium'}
              className={licenseTier === 'premium' ? 'active' : ''}
              onClick={() => selectTier('premium')}
            >
              Premium
            </button>
          </div>
        </div>
        <motion.div
          className="browse-grid"
          variants={gridContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
          key={activeCategory}
        >
          {loading && assets.length === 0 ? (
            <SkeletonAssetGrid count={8} />
          ) : error && assets.length === 0 ? (
            <div className="browse-empty" role="alert">
              <Icon name="broken_image" size={40} />
              <h3>We couldn't load the library</h3>
              <p>{error}</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="browse-empty">
              <Icon name="image" size={40} />
              <h3>Nothing matches those filters yet</h3>
              <p>Try a different category.</p>
            </div>
          ) : (
            assets.map((asset) => (
              <motion.div key={asset.id} variants={gridItem}>
                <AssetCard asset={asset} />
              </motion.div>
            ))
          )}
        </motion.div>

        {hasMore && (
          <div className="browse-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => current + 1)}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load more assets'}
            </button>
            <span className="browse-pagination-count">
              Showing {assets.length} of {total}
            </span>
          </div>
        )}
      </section>

      {/* CREATORS STRIP */}
      <section className="discover-section">
        <div className="discover-section-head">
          <div>
            <h2>
              <Icon name="group" size={24} />
              Featured creators
            </h2>
            <p>Creators currently publishing assets on Kontaner.</p>
          </div>
        </div>
        <div className="creator-strip">
          {featuredCreators.map((c) => (
            <Link
              key={c.id}
              to={`/creator/${c.id}`}
              className="creator-card"
            >
              <span className="creator-avatar green">{c.avatarUrl ? <img src={c.avatarUrl} alt="" /> : c.avatarInitials}</span>
              <div>
                <strong>{c.name}</strong>
                <span>{c.role}</span>
                <p>{c.assetCount} assets</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-banner">
        <div>
          <h2>Ready to grow your own library?</h2>
          <p>
            Sign up free, upload your first asset, and let our AI tag it in
            seconds.
          </p>
        </div>
        <Link className="primary-button wide" to="/signup">
          Get started free
          <Icon name="arrow_forward" size={20} />
        </Link>
      </section>
    </div>
  );
}
