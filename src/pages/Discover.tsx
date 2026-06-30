import {
  ArrowRight,
  Box,
  Camera,
  ChevronRight,
  Film,
  Grid2X2,
  Image as ImageIcon,
  Palette,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AssetCard } from '../components/AssetCard';
import { SkeletonAssetGrid } from '../components/Skeleton';
import { assets, collections, featuredCreators } from '../data/assets';
import { useFakeLoad } from '../hooks/useFakeLoad';
import { gridContainer, gridItem, heroItem } from '../lib/motion';
import type { AssetType } from '../types';

interface CategoryCard {
  label: string;
  icon: LucideIcon;
  count: string;
  filter: AssetType | 'ALL';
  accent: 'green' | 'blue' | 'gold' | 'red' | 'mint';
}

const categories: readonly CategoryCard[] = [
  { label: 'Photos', icon: Camera, count: '32,408', filter: 'PHOTO', accent: 'green' },
  { label: 'Videos', icon: Film, count: '3,108', filter: 'VIDEO', accent: 'blue' },
  { label: 'Illustrations', icon: Palette, count: '8,742', filter: 'GRAPHIC', accent: 'gold' },
  { label: '3D Models', icon: Box, count: '1,204', filter: '3D', accent: 'red' },
  { label: 'Patterns', icon: Grid2X2, count: '5,318', filter: 'ALL', accent: 'mint' },
] as const;

const trendingTags: readonly string[] = [
  'Kente patterns',
  'Market scenes',
  'Afrobeat',
  'Adinkra symbols',
  'Accra skyline',
  'Cocoa harvest',
] as const;

type LicenseTier = 'all' | 'free' | 'premium';

export function Discover() {
  const navigate = useNavigate();
  const loading = useFakeLoad(550);
  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<AssetType | 'ALL'>('ALL');
  const [licenseTier, setLicenseTier] = useState<LicenseTier>('all');
  const [visibleCount, setVisibleCount] = useState<number>(12);

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
    return assets.filter((a) => {
      if (activeCategory !== 'ALL' && a.type !== activeCategory) return false;
      if (licenseTier === 'free' && a.premium) return false;
      if (licenseTier === 'premium' && !a.premium) return false;
      return true;
    });
  }, [activeCategory, licenseTier]);

  const browseAssets = useMemo(
    () => filteredAssets.slice(0, visibleCount),
    [filteredAssets, visibleCount],
  );

  const hasMore = browseAssets.length < filteredAssets.length;

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, licenseTier]);

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
          <motion.p className="hero-eyebrow" variants={heroItem} custom={0}>
            <Sparkles size={14} />
            AI-tagged creative library · Made in Ghana
          </motion.p>
          <motion.h1 variants={heroItem} custom={1}>
            All the assets your <em>creative work</em> needs.
            <br />
            Search the way you think.
          </motion.h1>
          <motion.form
            className="hero-v2-search"
            onSubmit={submit}
            variants={heroItem}
            custom={2}
          >
            <Search size={22} />
            <input
              aria-label="Search assets"
              placeholder="Try 'market scenes with bold colors' or 'kente patterns'"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
            />
            <button className="hero-v2-search-btn" type="submit">
              Search
              <ArrowRight size={18} />
            </button>
          </motion.form>
          <motion.div
            className="hero-v2-trending"
            variants={heroItem}
            custom={3}
          >
            <span>Popular:</span>
            {trendingTags.map((tag) => (
              <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
                {tag}
              </Link>
            ))}
          </motion.div>
          <motion.div className="hero-v2-stats" variants={heroItem} custom={4}>
            <div>
              <strong>50K+</strong>
              <span>Creative assets</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Ghanaian creators</span>
            </div>
            <div>
              <strong>120K+</strong>
              <span>Downloads / month</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CATEGORY MEGA-STRIP */}
      <section className="category-mega">
        {categories.map(({ label, icon: Icon, count, filter, accent }) => (
          <button
            key={label}
            type="button"
            className={`category-mega-card ${accent} ${
              activeCategory === filter ? 'active' : ''
            }`}
            onClick={() => setActiveCategory(filter)}
          >
            <span className="category-mega-icon">
              <Icon size={26} />
            </span>
            <span className="category-mega-label">{label}</span>
            <span className="category-mega-count">{count}</span>
          </button>
        ))}
      </section>

      {/* TRENDING ROW */}
      <section className="discover-section">
        <div className="discover-section-head">
          <div>
            <h2>
              <TrendingUp size={22} />
              Trending this week
            </h2>
            <p>What Ghanaian creatives are downloading right now.</p>
          </div>
          <Link to="/search?q=trending" className="text-button">
            View all
            <ChevronRight size={16} />
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
                  {asset.type} · {asset.size}
                </span>
              </div>
              {asset.premium && (
                <span className="trending-premium">Premium</span>
              )}
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
            <ChevronRight size={16} />
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
              {activeCategory !== 'ALL' && ` in ${activeCategory.toLowerCase()}`}
            </p>
          </div>
          <div className="license-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={licenseTier === 'all'}
              className={licenseTier === 'all' ? 'active' : ''}
              onClick={() => setLicenseTier('all')}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={licenseTier === 'free'}
              className={licenseTier === 'free' ? 'active' : ''}
              onClick={() => setLicenseTier('free')}
            >
              Free
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={licenseTier === 'premium'}
              className={licenseTier === 'premium' ? 'active' : ''}
              onClick={() => setLicenseTier('premium')}
            >
              <span className="license-toggle-crown">★</span>
              Premium
            </button>
          </div>
        </div>
        <motion.div
          className="browse-grid"
          variants={gridContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
          key={`${activeCategory}-${licenseTier}`}
        >
          {loading ? (
            <SkeletonAssetGrid count={8} />
          ) : browseAssets.length === 0 ? (
            <div className="browse-empty">
              <ImageIcon size={42} />
              <h3>Nothing matches those filters yet</h3>
              <p>Try a different category or license tier.</p>
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
              <Users size={22} />
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
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
