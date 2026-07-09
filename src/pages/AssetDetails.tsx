import { Link, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { MiniAsset } from '../components/AssetCard';
import { Icon } from '../components/Icon';
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
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
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

  const typeLabel = asset.type === 'PHOTO' ? 'Photo' : 'Illustration';

  const details: ReadonlyArray<readonly [string, string]> = [
    ['Format', `${asset.format} · ${typeLabel}`],
    ['Size', asset.size],
    ['Uploaded', asset.date],
    ['Author', asset.owner],
    ['License', 'Free · Editorial'],
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
      setCopiedHex(hex);
      window.setTimeout(() => setCopiedHex((cur) => (cur === hex ? null : cur)), 1100);
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
          {typeLabel}s
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
                <Icon name="zoom_in" size={24} />
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
                <Icon name="open_in_new" size={24} />
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
            <Icon name="download" size={20} />
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
            <Icon name="library_add" size={20} />
            Add to collection
          </button>

          <div className="action-grid">
            <button
              type="button"
              onClick={handleFavorite}
              className={isFavorite ? 'is-active' : ''}
            >
              <Icon name="bookmark" size={24} filled={isFavorite} />
              {isFavorite ? 'Saved' : 'Favorite'}
            </button>
            <button type="button" onClick={() => void handleShare()}>
              <Icon name="share" size={24} />
              Share
            </button>
            <button type="button" onClick={() => void handleCopyLink()}>
              <Icon name="link" size={24} />
              Copy Link
            </button>
            <div className="action-more" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
              >
                <Icon name="more_horiz" size={24} />
                More
              </button>
              {moreOpen && (
                <div className="action-more-menu" role="menu">
                  <button type="button" onClick={handleHide}>
                    <Icon name="visibility_off" size={16} /> Hide from feed
                  </button>
                  <button type="button" onClick={handleReport}>
                    <Icon name="flag" size={16} /> Report
                  </button>
                </div>
              )}
            </div>
          </div>

          <section className="tag-panel">
            <h2>
              <Icon name="auto_awesome" size={20} />
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
              <Icon name="auto_awesome" size={20} />
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
            <div className="palette-row">
              {palette === null
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="palette-chip">
                      <span className="palette-block tone-skeleton" />
                    </div>
                  ))
                : palette.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="palette-chip">
                        <span className="palette-block tone-empty" />
                      </div>
                    ))
                  : palette.map((hex) => {
                      const code = hex.toUpperCase();
                      const copied = copiedHex === code;
                      return (
                        <button
                          key={hex}
                          type="button"
                          className="palette-chip"
                          title={`Copy ${code}`}
                          onClick={() => void handleSwatchCopy(code)}
                        >
                          <span className="palette-block" style={{ background: hex }}>
                            <span className="palette-copy">
                              <Icon name={copied ? 'check' : 'content_copy'} size={16} />
                            </span>
                          </span>
                          <span className={copied ? 'palette-hex copied' : 'palette-hex'}>
                            {copied ? 'Copied' : code}
                          </span>
                        </button>
                      );
                    })}
            </div>
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
