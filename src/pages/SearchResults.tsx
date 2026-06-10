import { Search, SlidersHorizontal, X, ZoomOut } from 'lucide-react';
import { assets } from '../data/assets';
import type { Asset, NavigateFn } from '../types';

interface SearchResultsProps {
  query: string;
  navigate: NavigateFn;
}

export function SearchResults({ query, navigate }: SearchResultsProps) {
  const results: Asset[] = assets
    .filter(
      (asset) =>
        asset.tags.join(' ').toLowerCase().includes('market') ||
        asset.title.toLowerCase().includes('market'),
    )
    .slice(0, 4);

  return (
    <div className="page search-page">
      <section className="search-intro">
        <h1>Showing 12 results for '{query}'</h1>
        <p>Found in your personal library and creative collections.</p>
      </section>

      <div className="search-tabs">
        <button className="active" type="button">
          My Library (12)
        </button>
        <button type="button">Discover (248)</button>
      </div>

      <div className="result-filter-row">
        <button className="secondary-button small" type="button">
          <SlidersHorizontal size={16} />
          All Filters
        </button>
        <button className="filter-token" type="button">
          Type: Photography <X size={15} />
        </button>
        <button className="filter-token" type="button">
          Orientation: Portrait <X size={15} />
        </button>
        <button className="clear-button" type="button">
          Clear all
        </button>
      </div>

      <section className="masonry-results">
        {results.map((asset) => (
          <article
            className="result-card"
            key={asset.id}
            onClick={() => navigate('/asset')}
          >
            <div className={`result-visual ${asset.visual}`} />
            <div className="result-card-body">
              <div>
                <h2>{asset.displayTitle}</h2>
                <span>
                  {asset.format} - {asset.size}
                </span>
              </div>
              <div className="tag-row">
                {asset.tags.slice(0, 3).map((tag: string) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="empty-state">
        <span>
          <ZoomOut size={56} />
        </span>
        <h2>No matches for 'modern skyscraper'</h2>
        <p>
          We couldn't find any assets matching that search in your library. Try exploring the
          global hub.
        </p>
        <h3>Suggested Searches</h3>
        <div className="suggestion-row">
          <button type="button">
            <Search size={16} />
            Accra Architecture
          </button>
          <button type="button">Brutalism Ghana</button>
          <button type="button">Urban Development</button>
        </div>
      </section>
    </div>
  );
}
