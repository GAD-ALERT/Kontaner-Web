import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Icon } from '../components/Icon';
import { SkeletonAssetGrid } from '../components/Skeleton';
import { useFavorites } from '../stores/favorites';
import { relatedTags, type SearchHit } from '../lib/search';
import { gridContainer, gridItem } from '../lib/motion';
import { apiRequest } from '../lib/api';
import type { AssetListResponse, AssetType, SearchResponse } from '../types';

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
  const query = params.get('q') ?? '';
  const normalized = query.trim();
  const type = (params.get('type') ?? '') as AssetType | '';
  const tier = params.get('tier') ?? 'all';
  const sort = params.get('sort') ?? 'relevance';
  const page = Math.max(1, Number(params.get('page') ?? 1));
  const favoriteIds = useFavorites((s) => s.ids);

  const clearQuery = (): void => {
    const next = new URLSearchParams(params);
    next.delete('q');
    setParams(next, { replace: true });
  };

  const [tab, setTab] = useState<ResultTab>('discover');
  const [loading, setLoading] = useState<boolean>(true);
  const [allHits, setAllHits] = useState<SearchHit[]>([]);
  const [searchMode, setSearchMode] = useState<'semantic' | 'text' | 'browse'>('browse');
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const setFilter = (key: string, value: string): void => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'sort' && value === 'relevance')) next.delete(key);
    else next.set(key, value);
    next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    const run = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        if (normalized) {
          const searchParams = new URLSearchParams({ q: normalized, page: String(page), pageSize: '24', tier, sort });
          if (type) searchParams.set('type', type);
          const result = await apiRequest<SearchResponse>(`/assets/search?${searchParams}`, { signal: controller.signal });
          const terms = normalized.toLowerCase().split(/\s+/).filter(Boolean);
          const nextHits = result.items.map((asset) => ({
            asset, score: (asset.relevance ?? 0) * 100,
            matched: terms.filter((term) => asset.tags.some((tag) => tag.toLowerCase().includes(term))),
          }));
          setAllHits((current) => page === 1 ? nextHits : [...current, ...nextHits]);
          setTotal(result.total);
          setSearchMode(result.mode);
        } else {
          const browseParams = new URLSearchParams({ page: String(page), pageSize: '24', tier, sort: sort === 'relevance' ? 'popular' : sort });
          if (type) browseParams.set('type', type);
          const result = await apiRequest<AssetListResponse>(`/assets?${browseParams}`, { signal: controller.signal });
          const nextHits = result.items.map((asset) => ({ asset, score: 0, matched: [] }));
          setAllHits((current) => page === 1 ? nextHits : [...current, ...nextHits]);
          setTotal(result.total);
          setSearchMode('browse');
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void run();
    return () => controller.abort();
  }, [normalized, page, sort, tier, type]);

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
              ? `${tab === 'discover' ? total : hits.length} results for '${query}'`
              : `No results for '${query}'`}
        </h1>
        <p className="search-intro-line">
          <Icon name="auto_awesome" size={16} />
          {normalized
            ? `Ranked by ${searchMode === 'semantic' ? 'semantic' : 'text'} relevance · top match scored ${Math.round(topScore * 10) / 10}`
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
        <select aria-label="Asset type" value={type} onChange={(event) => setFilter('type', event.target.value)}>
          <option value="">All types</option><option value="PHOTO">Photos</option><option value="VIDEO">Videos</option><option value="GRAPHIC">Graphics</option><option value="3D">3D</option>
        </select>
        <select aria-label="License tier" value={tier} onChange={(event) => setFilter('tier', event.target.value)}>
          <option value="all">All licenses</option><option value="free">Free</option><option value="premium">Premium</option>
        </select>
        <select aria-label="Sort results" value={sort} onChange={(event) => setFilter('sort', event.target.value)}>
          <option value="relevance">Relevance</option><option value="popular">Most liked</option><option value="trending">Most downloaded</option><option value="new">Newest</option>
        </select>
        {normalized && (
          <button
            className="filter-token"
            type="button"
            onClick={clearQuery}
            aria-label={`Remove filter: ${query}`}
          >
            Query: {query} <Icon name="close" size={16} />
          </button>
        )}
        {(normalized || tab !== 'discover') && (
          <button
            className="clear-button"
            type="button"
            onClick={() => {
              setTab('discover');
              setParams({}, { replace: true });
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {loading ? (
        <section className="search-loading">
          <div className="ai-pulse">
            <Icon name="auto_awesome" size={20} />
            Understanding your query…
          </div>
          <section className="masonry-results loading">
            <SkeletonAssetGrid count={6} />
          </section>
        </section>
      ) : error ? (
        <section className="empty-state" role="alert">
          <h2>Search unavailable</h2>
          <p>{error}</p>
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
                      <Icon name="auto_awesome" size={16} />
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
            <Icon name="search_off" size={56} />
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
                <Icon name="search" size={16} />
                {q}
              </Link>
            ))}
          </div>
        </section>
      )}
      {!loading && allHits.length < total && (
        <div className="browse-pagination">
          <button className="secondary-button" type="button" onClick={() => {
            const next = new URLSearchParams(params); next.set('page', String(page + 1)); setParams(next);
          }}>Load more results</button>
          <span>Showing {allHits.length} of {total}</span>
        </div>
      )}
    </div>
  );
}
