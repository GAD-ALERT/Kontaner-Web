import { Search, Sparkles, SlidersHorizontal, X, ZoomOut } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { SkeletonAssetGrid } from '../components/Skeleton';
import { assets } from '../data/assets';
import { useFavorites } from '../stores/favorites';
import { smartSearch, relatedTags, type SearchHit } from '../lib/search';
import { gridContainer, gridItem } from '../lib/motion';

type ResultTab = 'library' | 'discover';

const popularQueries: readonly string[] = [
  'Kente patterns',
  'Market scenes with bold colors',
  'Aerial Ghana',
  'Studio portrait',
  'Adinkra symbols',
  'Modern Accra architecture',
] as const;

export function SearchResults() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get('q') ?? '';
  const normalized = query.trim();
  const favoriteIds = useFavorites((s) => s.ids);

  const clearQuery = (): void => {
    const next = new URLSearchParams(params);
    next.delete('q');
    setParams(next, { replace: true });
  };

  const [tab, setTab] = useState<ResultTab>('discover');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Pretend the AI is thinking — feels more credible at demo time.
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, [normalized]);

  const allHits: SearchHit[] = useMemo(
    () => (normalized ? smartSearch(normalized, assets) : assets.map((a) => ({ asset: a, score: 0, matched: [] }))),
    [normalized],
  );

  const libraryHits = useMemo(
    () => allHits.filter((h) => favoriteIds.includes(h.asset.id)),
    [allHits, favoriteIds],
  );

  const hits = tab === 'library' ? libraryHits : allHits;
  const hasResults = hits.length > 0;
  const refinements = useMemo(() => relatedTags(allHits), [allHits]);
  const topScore = hits[0]?.score ?? 0;

  return (
    <div className="page search-page">
      <section className="search-intro">
        <h1>
          {!normalized
            ? 'Browse the entire library'
            : hasResults
              ? `${hits.length} results for '${query}'`
              : `No results for '${query}'`}
        </h1>
        <p className="search-intro-line">
          <Sparkles size={15} />
          {normalized
            ? `Ranked by semantic relevance · top match scored ${Math.round(topScore * 10) / 10}`
            : 'Found in your personal library and creative collections.'}
        </p>
      </section>

      {refinements.length > 0 && normalized && (
        <div className="refine-row">
          <span className="refine-label">Refine:</span>
          {refinements.map((tag) => (
            <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="search-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'library'}
          className={tab === 'library' ? 'active' : ''}
          type="button"
          onClick={() => setTab('library')}
        >
          My Library ({libraryHits.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'discover'}
          className={tab === 'discover' ? 'active' : ''}
          type="button"
          onClick={() => setTab('discover')}
        >
          Discover ({allHits.length})
        </button>
      </div>

      <div className="result-filter-row">
        <button
          className="secondary-button small"
          type="button"
          onClick={() => navigate('/')}
        >
          <SlidersHorizontal size={16} />
          All Filters
        </button>
        {normalized && (
          <button
            className="filter-token"
            type="button"
            onClick={clearQuery}
            aria-label={`Remove filter: ${query}`}
          >
            Query: {query} <X size={15} />
          </button>
        )}
        {(normalized || tab !== 'discover') && (
          <button
            className="clear-button"
            type="button"
            onClick={() => {
              setTab('discover');
              clearQuery();
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {loading ? (
        <section className="search-loading">
          <div className="ai-pulse">
            <Sparkles size={18} />
            Understanding your query…
          </div>
          <section className="masonry-results loading">
            <SkeletonAssetGrid count={6} />
          </section>
        </section>
      ) : hasResults ? (
        <motion.section
          className="masonry-results"
          variants={gridContainer}
          initial="hidden"
          animate="visible"
          key={`results-${tab}-${normalized}`}
        >
          {hits.map(({ asset, matched, score }) => (
            <motion.div key={asset.id} variants={gridItem}>
              <Link className="result-card" to={`/asset/${asset.id}`}>
                <div className={`result-visual ${asset.visual}`}>
                  {asset.src && (
                    <img
                      src={asset.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  {normalized && score > 0 && (
                    <span className="match-badge" title={`Matched: ${matched.join(', ')}`}>
                      <Sparkles size={11} />
                      {Math.round(score * 10) / 10}
                    </span>
                  )}
                </div>
                <div className="result-card-body">
                  <div>
                    <h2>{asset.displayTitle}</h2>
                    <span>
                      {asset.format} · {asset.size}
                    </span>
                  </div>
                  <div className="tag-row">
                    {asset.tags.slice(0, 3).map((tag: string) => (
                      <span
                        className={
                          matched.some((m) => tag.toLowerCase().includes(m))
                            ? 'tag matched'
                            : 'tag'
                        }
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.section>
      ) : (
        <section className="empty-state">
          <span>
            <ZoomOut size={56} />
          </span>
          <h2>No matches for '{query}'</h2>
          <p>
            We couldn't find anything matching that search. Try a broader term
            or one of these popular searches.
          </p>
          <h3>Popular searches</h3>
          <div className="suggestion-row">
            {popularQueries.map((q) => (
              <Link key={q} to={`/search?q=${encodeURIComponent(q)}`}>
                <Search size={16} />
                {q}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
