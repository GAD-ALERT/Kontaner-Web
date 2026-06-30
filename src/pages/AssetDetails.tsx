import {
  Bookmark,
  Download,
  Ellipsis,
  Expand,
  Flag,
  Link as LinkIcon,
  PlusSquare,
  Share2,
  Sparkles,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { MiniAsset } from '../components/AssetCard';
import { Lightbox } from '../components/Lightbox';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { aiTags, assets } from '../data/assets';
import { useAuth } from '../stores/auth';
import { useFavorites, useLoginGate } from '../stores/favorites';
import { useLibrary } from '../stores/library';
import { useDominantColors } from '../hooks/useDominantColors';
import { planTagsFor } from '../lib/fakeAI';
import { toast } from '../stores/toast';

export function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const isAuthed = useAuth((s) => s.user !== null);
  const isFavorite = useFavorites((s) => (id ? s.ids.includes(id) : false));
  const toggle = useFavorites((s) => s.toggle);
  const showGate = useLoginGate((s) => s.show);
  const recordDownload = useLibrary((s) => s.recordDownload);
  const hasDownloaded = useLibrary((s) =>
    id ? s.downloads.some((d) => d.assetId === id) : false,
  );

  const asset = assets.find((a) => a.id === id) ?? assets[0];
  const similar = assets
    .filter((a) => a.id !== asset.id && a.type === asset.type)
    .slice(0, 4);
  const palette = useDominantColors(asset.src, 5);
  const insight = planTagsFor(asset.title).insight;

  const [zoomOpen, setZoomOpen] = useState<boolean>(false);
  const [collectionOpen, setCollectionOpen] = useState<boolean>(false);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent): void => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [moreOpen]);

  const details: ReadonlyArray<readonly [string, string]> = [
    ['Format', `${asset.format} (${asset.type})`],
    ['Size', asset.size],
    ['Uploaded', asset.date],
    ['Author', asset.owner],
    ['License', asset.premium ? 'Premium · Commercial' : 'Free · Editorial'],
  ];

  const handleDownload = async (): Promise<void> => {
    if (!isAuthed) {
      showGate('Sign in to download');
      return;
    }
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    // Fake progress so the button feels alive
    for (let p = 6; p <= 100; p += 8) {
      await new Promise((r) => setTimeout(r, 70));
      setDownloadProgress(p);
    }
    // Trigger an actual browser download of the source image
    if (asset.src) {
      try {
        const res = await fetch(asset.src);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${asset.id}.${asset.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch {
        // Network may be offline — still mark success in the UI
      }
    }
    recordDownload(asset.id);
    toast.success(
      'Downloaded',
      `${asset.displayTitle} saved to your downloads.`,
    );
    setTimeout(() => setDownloadProgress(null), 700);
  };

  const handleFavorite = (): void => {
    if (!isAuthed) {
      showGate('Sign in to save this asset');
      return;
    }
    toggle(asset.id);
    toast[isFavorite ? 'info' : 'success'](
      isFavorite ? 'Removed from favorites' : 'Saved to favorites',
    );
  };

  const handleAddCollection = (): void => {
    if (!isAuthed) {
      showGate('Sign in to add to a collection');
      return;
    }
    setCollectionOpen(true);
  };

  const handleShare = async (): Promise<void> => {
    const shareUrl = `${window.location.origin}/asset/${asset.id}`;
    const sharePayload = {
      title: asset.displayTitle,
      text: `Check out "${asset.displayTitle}" on Kontaner`,
      url: shareUrl,
    };
    if (
      typeof navigator.share === 'function' &&
      navigator.canShare?.(sharePayload) !== false
    ) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied', 'Share it anywhere.');
    } catch {
      toast.warn('Could not access clipboard');
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    const url = `${window.location.origin}/asset/${asset.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.warn('Could not access clipboard');
    }
  };

  const handleSwatchCopy = async (hex: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(hex);
      toast.info(`Copied ${hex}`);
    } catch {
      toast.warn('Could not access clipboard');
    }
  };

  const handleReport = (): void => {
    setMoreOpen(false);
    toast.info('Report submitted', "We'll review this asset shortly.");
  };

  const handleHide = (): void => {
    setMoreOpen(false);
    toast.info('Hidden from your feed');
  };

  return (
    <div className="page detail-page">
      <div className="breadcrumb">
        <Link to="/">Discover</Link>
        <span>/</span>
        <Link to={`/search?q=${encodeURIComponent(asset.type.toLowerCase())}`}>
          {asset.type}
        </Link>
        <span>/</span>
        <strong>{asset.displayTitle}</strong>
      </div>

      <section className="detail-layout">
        <div>
          <div className="preview-frame">
            <div
              className={`asset-preview ${asset.visual}`}
              onClick={() => setZoomOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setZoomOpen(true);
              }}
            >
              {asset.src && (
                <img
                  className="asset-preview-img"
                  src={asset.src}
                  alt={asset.displayTitle}
                  decoding="async"
                />
              )}
              <button
                className="floating-tool first"
                aria-label="Zoom image"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomOpen(true);
                }}
              >
                <ZoomIn size={22} />
              </button>
              <button
                className="floating-tool second"
                aria-label="Open in new tab"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (asset.src) window.open(asset.src, '_blank', 'noopener,noreferrer');
                }}
              >
                <Expand size={22} />
              </button>
            </div>
          </div>
          <h2 className="similar-heading">Similar Assets</h2>
          <div className="similar-grid">
            {similar.map((item) => (
              <MiniAsset asset={item} key={item.id} />
            ))}
          </div>
        </div>

        <aside className="detail-sidebar">
          <h1>{asset.displayTitle}</h1>
          <p className="upload-meta">
            Uploaded by {asset.owner} · {asset.date}
          </p>
          <button
            className="primary-button wide"
            type="button"
            onClick={() => void handleDownload()}
            disabled={downloadProgress !== null}
          >
            <Download size={21} />
            {downloadProgress === null
              ? hasDownloaded
                ? `Download again (${asset.size})`
                : `Download (${asset.size})`
              : `${downloadProgress}%`}
            {downloadProgress !== null && (
              <span
                className="download-bar"
                style={{ width: `${downloadProgress}%` }}
                aria-hidden="true"
              />
            )}
          </button>
          <button
            className="outline-button wide"
            type="button"
            onClick={handleAddCollection}
          >
            <PlusSquare size={21} />
            Add to collection
          </button>

          <div className="action-grid">
            <button
              type="button"
              onClick={handleFavorite}
              className={isFavorite ? 'is-active' : ''}
            >
              <Bookmark
                size={25}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
              {isFavorite ? 'Saved' : 'Favorite'}
            </button>
            <button type="button" onClick={() => void handleShare()}>
              <Share2 size={25} />
              Share
            </button>
            <button type="button" onClick={() => void handleCopyLink()}>
              <LinkIcon size={25} />
              Copy Link
            </button>
            <div className="action-more" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
              >
                <Ellipsis size={25} />
                More
              </button>
              {moreOpen && (
                <div className="action-more-menu" role="menu">
                  <button type="button" onClick={handleHide}>
                    <Trash2 size={15} /> Hide from feed
                  </button>
                  <button type="button" onClick={handleReport}>
                    <Flag size={15} /> Report
                  </button>
                </div>
              )}
            </div>
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
              {[...asset.tags, ...aiTags.slice(0, 6)].map((tag, index) => (
                <Link
                  key={`${tag}-${index}`}
                  to={`/search?q=${encodeURIComponent(tag)}`}
                  className={index < asset.tags.length ? 'tag primary' : 'tag soft'}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          <section className="ai-insight">
            <h2>
              <Sparkles
                size={18}
                style={{ marginRight: 8, verticalAlign: 'middle' }}
              />
              AI Insight
            </h2>
            <p>{insight}</p>
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
            <h2>
              Dominant Colors
              {palette === null && (
                <span className="dominant-loading">extracting…</span>
              )}
            </h2>
            <div className="dominant-row">
              {palette === null
                ? Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="tone tone-skeleton" />
                  ))
                : palette.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="tone tone-empty" />
                    ))
                  : palette.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className="tone"
                        style={{ background: hex }}
                        title={hex.toUpperCase()}
                        onClick={() => void handleSwatchCopy(hex.toUpperCase())}
                      >
                        <span className="tone-label">{hex.toUpperCase()}</span>
                      </button>
                    ))}
            </div>
            {palette && palette.length > 0 && (
              <p className="dominant-hint">Click a swatch to copy the hex code.</p>
            )}
          </section>
        </aside>
      </section>

      <Lightbox
        open={zoomOpen}
        src={asset.src ?? ''}
        alt={asset.displayTitle}
        onClose={() => setZoomOpen(false)}
      />
      <AddToCollectionModal
        open={collectionOpen}
        assetId={asset.id}
        assetTitle={asset.displayTitle}
        onClose={() => setCollectionOpen(false)}
      />
    </div>
  );
}
