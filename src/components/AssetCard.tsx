import { Bookmark } from 'lucide-react';
import type { Asset } from '../types';

export type AssetCardSize = 'normal' | 'large' | 'small';

interface AssetCardProps {
  asset: Asset;
  size?: AssetCardSize;
  onOpen?: (asset: Asset) => void;
}

export function AssetCard({ asset, size = 'normal', onOpen }: AssetCardProps) {
  return (
    <article
      className={`asset-card ${size}`}
      onClick={() => onOpen?.(asset)}
      tabIndex={0}
    >
      <div className={`asset-visual ${asset.visual}`}>
        <span className="asset-type">{asset.type}</span>
        <button className="bookmark-button" type="button" aria-label="Save asset">
          <Bookmark size={20} />
        </button>
      </div>
      <div className="asset-card-body">
        <div className="asset-title-row">
          <h3>{asset.title}</h3>
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
      </div>
    </article>
  );
}

interface MiniAssetProps {
  asset: Asset;
}

export function MiniAsset({ asset }: MiniAssetProps) {
  return <div className={`mini-asset ${asset.visual}`} aria-label={asset.displayTitle} />;
}
