import { Link } from 'react-router-dom';
import { useState, type MouseEvent } from 'react';
import type { Asset } from '../types';
import { useFavorites, useLoginGate } from '../stores/favorites';
import { useAuth } from '../stores/auth';
import { Icon } from './Icon';

export type AssetCardSize = 'normal' | 'large' | 'small';

interface AssetCardProps {
  asset: Asset;
  size?: AssetCardSize;
}

function formatCount(n: number | undefined): string {
  if (!n) return '0';
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}

export function AssetCard({ asset, size = 'normal' }: AssetCardProps) {
  const isAuthed = useAuth((s) => s.user !== null);
  const isFavorite = useFavorites((s) => s.ids.includes(asset.id));
  const toggle = useFavorites((s) => s.toggle);
  const showGate = useLoginGate((s) => s.show);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  const handleBookmark = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthed) {
      showGate('Sign in to save assets');
      return;
    }
    void toggle(asset.id);
  };

  return (
    <Link
      className={`asset-card ${size}`}
      to={`/asset/${asset.id}`}
      aria-label={asset.displayTitle}
    >
      <div className={`asset-visual ${asset.visual}`}>
        {asset.src && (
          <img
            className={imgLoaded ? 'asset-img loaded' : 'asset-img'}
            src={asset.src}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
          />
        )}
        <button
          className={isFavorite ? 'bookmark-button active' : 'bookmark-button'}
          type="button"
          aria-label={isFavorite ? 'Remove from saved' : 'Save asset'}
          onClick={handleBookmark}
        >
          <Icon name="bookmark" size={20} filled={isFavorite} />
        </button>
      </div>
      <div className="asset-card-body">
        <div className="asset-title-row">
          <h3>{asset.displayTitle}</h3>
        </div>
        <p>
          {asset.date} · {asset.size}
        </p>
        <div className="tag-row">
          {asset.tags.slice(0, 3).map((tag: string) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
          {asset.tags.length > 3 ? (
            <span className="tag muted">+{asset.tags.length - 3}</span>
          ) : null}
        </div>
        {(asset.likes ?? asset.downloads) !== undefined && (
          <div className="asset-stats">
            <span title="Likes">
              <Icon name="favorite" size={16} />
              {formatCount(asset.likes)}
            </span>
            <span title="Downloads">
              <Icon name="download" size={16} />
              {formatCount(asset.downloads)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

interface MiniAssetProps {
  asset: Asset;
}

export function MiniAsset({ asset }: MiniAssetProps) {
  return (
    <Link
      to={`/asset/${asset.id}`}
      className={`mini-asset ${asset.visual}`}
      aria-label={asset.displayTitle}
    >
      {asset.src && (
        <img src={asset.src} alt="" loading="lazy" decoding="async" />
      )}
    </Link>
  );
}
