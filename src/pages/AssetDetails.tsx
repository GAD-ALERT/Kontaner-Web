import {
  Bookmark,
  Download,
  Ellipsis,
  Expand,
  Link,
  PlusSquare,
  Share2,
  Sparkles,
  ZoomIn,
} from 'lucide-react';
import { MiniAsset } from '../components/AssetCard';
import { aiTags, assets } from '../data/assets';
import type { NavigateFn } from '../types';

type DetailRow = readonly [label: string, value: string];

const details: readonly DetailRow[] = [
  ['Format', 'JPEG Image'],
  ['Dimensions', '5472 x 3648 px'],
  ['Size', '4.2 MB'],
  ['Color Profile', 'sRGB IEC61966-2.1'],
  ['DPI', '300 DPI'],
] as const;

interface AssetDetailsProps {
  navigate: NavigateFn;
}

export function AssetDetails({ navigate }: AssetDetailsProps) {
  const asset = assets[0];

  return (
    <div className="page detail-page">
      <div className="breadcrumb">
        <button type="button" onClick={() => navigate('/library')}>
          My Library
        </button>
        <span>/</span>
        <button type="button">Photography</button>
        <span>/</span>
        <strong>{asset.title}</strong>
      </div>

      <section className="detail-layout">
        <div>
          <div className="preview-frame">
            <div className={`asset-preview ${asset.visual}`}>
              <button
                className="floating-tool first"
                aria-label="Zoom image"
                type="button"
              >
                <ZoomIn size={22} />
              </button>
              <button
                className="floating-tool second"
                aria-label="Expand image"
                type="button"
              >
                <Expand size={22} />
              </button>
            </div>
          </div>
          <h2 className="similar-heading">Similar Assets</h2>
          <div className="similar-grid">
            {assets.slice(4, 8).map((item) => (
              <MiniAsset asset={item} key={item.id} />
            ))}
          </div>
        </div>

        <aside className="detail-sidebar">
          <h1>{asset.title}</h1>
          <p className="upload-meta">Uploaded by you - 2 days ago</p>
          <button className="primary-button wide" type="button">
            <Download size={21} />
            Download (4.2MB)
          </button>
          <button className="outline-button wide" type="button">
            <PlusSquare size={21} />
            Add to collection
          </button>

          <div className="action-grid">
            <button type="button">
              <Bookmark size={25} />
              Favorite
            </button>
            <button type="button">
              <Share2 size={25} />
              Share
            </button>
            <button type="button">
              <Link size={25} />
              Copy Link
            </button>
            <button type="button">
              <Ellipsis size={25} />
              More
            </button>
          </div>

          <section className="tag-panel">
            <h2>
              <Sparkles
                size={18}
                style={{ marginRight: 8, verticalAlign: 'middle' }}
              />
              AI-Generated Tags
            </h2>
            <div className="detail-tag-cloud">
              {aiTags.map((tag, index) => (
                <span className={index < 7 ? 'tag primary' : 'tag soft'} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="file-details">
            <h2>File Details</h2>
            <dl>
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="dominant-colors">
            <h2>Dominant Colors</h2>
            <div>
              <span className="tone teal" />
              <span className="tone blue" />
              <span className="tone yellow" />
              <span className="tone charcoal" />
              <span className="tone pale" />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
