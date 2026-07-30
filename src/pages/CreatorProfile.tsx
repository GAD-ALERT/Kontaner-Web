import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AssetCard } from '../components/AssetCard';
import { Icon } from '../components/Icon';
import { SkeletonAssetGrid } from '../components/Skeleton';
import { gridContainer, gridItem } from '../lib/motion';
import { apiRequest } from '../lib/api';
import type { Asset, AssetType, CreatorDetailResponse } from '../types';

type SortKey = 'new' | 'popular' | 'downloads';

const AVATAR_TONES = ['green', 'blue', 'gold', 'red'] as const;

/** Deterministic avatar tint so a creator always gets the same colour. */
function toneFor(id: string): (typeof AVATAR_TONES)[number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length]!;
}

function formatMemberSince(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CreatorDetailResponse | null>(null);
  const [error, setError] = useState('');

  // In-page controls — the creator's assets arrive in one payload, so we
  // filter, sort and search them client-side for instant feedback.
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('new');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setData(null);
    setError('');
    const controller = new AbortController();
    void apiRequest<CreatorDetailResponse>(
      `/creators/${encodeURIComponent(id)}`,
      { signal: controller.signal },
    )
      .then(setData)
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Creator unavailable');
        }
      });
    return () => controller.abort();
  }, [id]);

  const items = data?.items ?? [];

  const totals = useMemo(() => {
    return items.reduce(
      (acc, asset) => {
        acc.downloads += asset.downloads ?? 0;
        acc.likes += asset.likes ?? 0;
        return acc;
      },
      { downloads: 0, likes: 0 },
    );
  }, [items]);

  const availableTypes = useMemo(
    () => Array.from(new Set(items.map((a) => a.type))),
    [items],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = items.filter((asset) => {
      if (typeFilter !== 'all' && asset.type !== typeFilter) return false;
      if (!term) return true;
      return (
        asset.displayTitle.toLowerCase().includes(term) ||
        asset.tags.some((t) => t.toLowerCase().includes(term)) ||
        (asset.aiInsight ?? '').toLowerCase().includes(term)
      );
    });
    if (sort === 'popular') {
      list = [...list].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    } else if (sort === 'downloads') {
      list = [...list].sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
    }
    return list;
  }, [items, search, typeFilter, sort]);

  const copyLink = (): void => {
    void navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  if (error) {
    return (
      <div className="page creator-profile">
        <div className="browse-empty" role="alert">
          <Icon name="person_off" size={40} />
          <h3>Creator unavailable</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page creator-profile">
        <div className="creator-banner creator-banner-loading" aria-hidden="true">
          <span className="creator-avatar xl skeleton-block" />
        </div>
        <section className="browse-grid" role="status" aria-label="Loading creator">
          <SkeletonAssetGrid count={6} />
        </section>
      </div>
    );
  }

  const { creator } = data;
  const tone = toneFor(creator.id);
  const memberSince = formatMemberSince(creator.memberSince);

  return (
    <div className="page creator-profile">
      {/* HERO */}
      <section className={`creator-banner tone-${tone}`}>
        <div className="creator-banner-bg" aria-hidden="true" />
        <div className="creator-banner-inner">
          <span className={`creator-avatar xl ${tone}`}>
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt="" />
            ) : (
              creator.avatarInitials
            )}
          </span>
          <div className="creator-identity">
            <h1>{creator.name}</h1>
            <div className="creator-meta-row">
              <span>
                <Icon name="person" size={16} /> {creator.role}
              </span>
              {creator.location && (
                <span>
                  <Icon name="location_on" size={16} /> {creator.location}
                </span>
              )}
              {memberSince && (
                <span>
                  <Icon name="calendar_month" size={16} /> Joined {memberSince}
                </span>
              )}
            </div>
            {creator.bio && <p className="creator-bio">{creator.bio}</p>}
          </div>
          <button
            type="button"
            className="secondary-button creator-share"
            onClick={copyLink}
          >
            <Icon name={copied ? 'check' : 'link'} size={18} />
            {copied ? 'Link copied' : 'Share profile'}
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="creator-stats">
        <div className="creator-stat">
          <Icon name="image" size={20} />
          <strong>{creator.assetCount.toLocaleString()}</strong>
          <span>Published assets</span>
        </div>
        <div className="creator-stat">
          <Icon name="download" size={20} />
          <strong>{totals.downloads.toLocaleString()}</strong>
          <span>Total downloads</span>
        </div>
        <div className="creator-stat">
          <Icon name="favorite" size={20} />
          <strong>{totals.likes.toLocaleString()}</strong>
          <span>Total likes</span>
        </div>
      </section>

      {/* ASSETS */}
      <section className="discover-section">
        <div className="discover-section-head">
          <div>
            <h2>Assets by {creator.name.split(' ')[0]}</h2>
            <p>
              {visible.length === items.length
                ? `${items.length} assets`
                : `${visible.length} of ${items.length} assets`}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="creator-toolbar">
            <div className="creator-search">
              <Icon name="search" size={18} />
              <input
                aria-label="Search this creator's assets"
                placeholder="Filter assets by title or tag…"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
              {search && (
                <button
                  type="button"
                  className="creator-search-clear"
                  aria-label="Clear filter"
                  onClick={() => setSearch('')}
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            {availableTypes.length > 1 && (
              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as AssetType | 'all')}
              >
                <option value="all">All types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label="Sort assets"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="new">Newest</option>
              <option value="popular">Most liked</option>
              <option value="downloads">Most downloaded</option>
            </select>
          </div>
        )}

        {items.length === 0 ? (
          <div className="browse-empty">
            <Icon name="image" size={40} />
            <h3>No assets published yet</h3>
            <p>
              {creator.name.split(' ')[0]} hasn't shared anything to the library
              so far. Check back soon.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="browse-empty">
            <Icon name="search_off" size={40} />
            <h3>No assets match your filter</h3>
            <p>Try a different term or clear the filters above.</p>
          </div>
        ) : (
          <motion.div
            className="browse-grid"
            variants={gridContainer}
            initial="hidden"
            animate="visible"
            key={`${typeFilter}-${sort}-${search}`}
          >
            {visible.map((asset: Asset) => (
              <motion.div key={asset.id} variants={gridItem}>
                <AssetCard asset={asset} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
