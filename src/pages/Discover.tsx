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
import { assets, collections, featuredCreators } from '../data/assets';
import { useFakeLoad } from '../hooks/useFakeLoad';
import { gridContainer, gridItem, heroItem } from '../lib/motion';
import type { AssetType } from '../types';

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
  const loading = useFakeLoad(550);
  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<AssetType | 'ALL'>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(12);
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
    [],
  );

  const filteredAssets = useMemo(() => {
    return assets.filter(
      (a) => activeCategory === 'ALL' || a.type === activeCategory,
    );
  }, [activeCategory]);

  const browseAssets = useMemo(
    () => filteredAssets.slice(0, visibleCount),
    [filteredAssets, visibleCount],
  );

  const hasMore = browseAssets.length < filteredAssets.length;

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory]);

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
        </motion.div>
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
            <h2>Featured collections</h2>
            <p>Curated sets to start your project from.</p>
          </div>
          <Link to="/collections" className="text-button">
            All collections
            <Icon name="chevron_right" size={16} />
          </Link>
        </div>
        <div className="collection-strip">
          {collections.map((c) => (
            <Link
              key={c.id}
              to={`/search?q=${encodeURIComponent(c.name)}`}
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
              {browseAssets.length} assets
              {activeCategory === 'PHOTO' && ' in photos'}
              {activeCategory === 'ILLUSTRATION' && ' in illustrations'}
            </p>
          </div>
          <div className="license-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'ALL'}
              className={activeCategory === 'ALL' ? 'active' : ''}
              onClick={() => setActiveCategory('ALL')}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'PHOTO'}
              className={activeCategory === 'PHOTO' ? 'active' : ''}
              onClick={() => setActiveCategory('PHOTO')}
            >
              Photos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'ILLUSTRATION'}
              className={activeCategory === 'ILLUSTRATION' ? 'active' : ''}
              onClick={() => setActiveCategory('ILLUSTRATION')}
            >
              Illustrations
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
          {loading ? (
            <SkeletonAssetGrid count={8} />
          ) : browseAssets.length === 0 ? (
            <div className="browse-empty">
              <Icon name="image" size={40} />
              <h3>Nothing matches those filters yet</h3>
              <p>Try a different category.</p>
            </div>
          ) : (
            browseAssets.map((asset) => (
              <motion.div key={asset.id} variants={gridItem}>
                <AssetCard asset={asset} />
              </motion.div>
            ))
          )}
        </motion.div>

        {!loading && hasMore && (
          <div className="browse-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setVisibleCount((c) => c + 12)}
            >
              Load more assets
            </button>
            <span className="browse-pagination-count">
              Showing {browseAssets.length} of {filteredAssets.length}
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
            <p>Hand-picked studios and photographers from across Ghana.</p>
          </div>
        </div>
        <div className="creator-strip">
          {featuredCreators.map((c) => (
            <Link
              key={c.id}
              to={`/search?q=${encodeURIComponent(c.name)}`}
              className="creator-card"
            >
              <span className={`creator-avatar ${c.accent}`}>{c.initials}</span>
              <div>
                <strong>{c.name}</strong>
                <span>{c.handle}</span>
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
