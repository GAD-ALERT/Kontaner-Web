import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { Lightbox } from '../components/Lightbox';
import { MiniAsset } from '../components/AssetCard';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { useAuth } from '../stores/auth';
import { useFavorites, useLoginGate } from '../stores/favorites';
import { useLibrary } from '../stores/library';
import { useDominantColors } from '../hooks/useDominantColors';
import { toast } from '../stores/toast';
import { apiRequest } from '../lib/api';
import type { Asset, AssetResponse } from '../types';

// Mirror the backend's PATCH /uploads/:id limits (updateUploadSchema)
// so edits never round-trip into a 400.
const MAX_TAGS = 40;
const MAX_TAG_LEN = 80;

export function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const isAuthed = useAuth((s) => s.user !== null);
  const isFavorite = useFavorites((s) => (id ? s.ids.includes(id) : false));
  const toggle = useFavorites((s) => s.toggle);
  const showGate = useLoginGate((s) => s.show);
  const recordDownload = useLibrary((s) => s.recordDownload);
  const uploads = useLibrary((s) => s.uploads);
  const updateUpload = useLibrary((s) => s.updateUpload);
  const hasDownloaded = useLibrary((s) =>
    id ? s.downloads.some((d) => d.assetId === id) : false,
  );
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loadError, setLoadError] = useState('');
  const [similar, setSimilar] = useState<Asset[]>([]);

  const palette = useDominantColors(asset?.src, 5);
  const insight = asset?.aiInsight ?? 'No AI insight is available for this asset.';

  const [zoomOpen, setZoomOpen] = useState<boolean>(false);
  const [collectionOpen, setCollectionOpen] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<boolean>(false);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [savingTags, setSavingTags] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setLoadError('');
        setAsset(null);
        setSimilar([]);
      }
    });
    void apiRequest<AssetResponse>(`/assets/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    }).then((result) => setAsset(result.asset)).catch((err: unknown) => {
      if (!controller.signal.aborted) {
        setLoadError(err instanceof Error ? err.message : 'Unable to load this asset.');
      }
    });
    void apiRequest<{ items: Asset[] }>(`/assets/${encodeURIComponent(id)}/similar?limit=4`, {
      signal: controller.signal,
    }).then((result) => setSimilar(result.items)).catch(() => {
      if (!controller.signal.aborted) setSimilar([]);
    });
    return () => controller.abort();
  }, [id]);

  if (!asset) {
    return (
      <div className="page browse-empty" role={loadError ? 'alert' : 'status'}>
        <h1>{loadError ? 'Asset unavailable' : 'Loading asset…'}</h1>
        {loadError && <p>{loadError}</p>}
      </div>
    );
  }

  const typeLabel = 'Photo';

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
    setDownloadProgress(10);
    try {
      const download = await recordDownload(asset.id);
      setDownloadProgress(70);
      if (download.url) {
        try {
        const res = await fetch(download.url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = download.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
          window.open(download.url, '_blank', 'noopener,noreferrer');
        }
      }
      setDownloadProgress(100);
      toast.success('Downloaded', `${asset.displayTitle} saved to your downloads.`);
    } catch (err) {
      toast.error('Download failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDownloadProgress(null);
    }
  };

  const handleFavorite = (): void => {
    if (!isAuthed) {
      showGate('Sign in to save this asset');
      return;
    }
    void toggle(asset.id);
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

  // Tag edits persist through /uploads/:id, so only the asset's own
  // uploader can refine its AI-generated tags.
  const canEditTags = isAuthed && uploads.some((u) => u.id === asset.id);

  const startEditTags = (): void => {
    setDraftTags(asset.tags);
    setNewTag('');
    setEditingTags(true);
  };

  const cancelEditTags = (): void => {
    setEditingTags(false);
    setNewTag('');
  };

  const removeDraftTag = (index: number): void => {
    setDraftTags((tags) => tags.filter((_, i) => i !== index));
  };

  const commitNewTag = (): void => {
    const value = newTag.trim().slice(0, MAX_TAG_LEN);
    if (!value) return;
    if (draftTags.length >= MAX_TAGS) {
      toast.warn(`You can add up to ${MAX_TAGS} tags`);
      return;
    }
    setDraftTags((tags) =>
      tags.some((t) => t.toLowerCase() === value.toLowerCase()) ? tags : [...tags, value],
    );
    setNewTag('');
  };

  const saveTags = async (): Promise<void> => {
    // Fold in any tag typed but not yet committed with Enter.
    const pending = newTag.trim().slice(0, MAX_TAG_LEN);
    const finalTags =
      pending &&
      draftTags.length < MAX_TAGS &&
      !draftTags.some((t) => t.toLowerCase() === pending.toLowerCase())
        ? [...draftTags, pending]
        : draftTags;
    setSavingTags(true);
    try {
      const updated = await updateUpload(asset.id, { tags: finalTags });
      setAsset(updated);
      setEditingTags(false);
      setNewTag('');
      toast.success('Tags updated');
    } catch (err) {
      toast.error('Could not save tags', err instanceof Error ? err.message : undefined);
    } finally {
      setSavingTags(false);
    }
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
          {similar.length > 0 && (
            <>
              <h2 className="similar-heading">Similar Assets</h2>
              <div className="similar-grid">
                {similar.map((item) => <MiniAsset asset={item} key={item.id} />)}
              </div>
            </>
          )}
        </div>

        <aside className="detail-sidebar">
          <h1>{asset.displayTitle}</h1>
          <p className="upload-meta">
            Uploaded by {asset.creatorId
              ? <Link to={`/creator/${asset.creatorId}`}>{asset.owner}</Link>
              : asset.owner} · {asset.date}
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
          </div>

          <section className="tag-panel">
            <div className="tag-panel-head">
              <h2>
                <Icon name="auto_awesome" size={20} />
                AI-Generated Tags
              </h2>
              {canEditTags && !editingTags && (
                <button
                  type="button"
                  className="tag-edit-btn"
                  onClick={startEditTags}
                >
                  <Icon name="edit" size={16} />
                  Edit
                </button>
              )}
              {editingTags && (
                <div className="tag-edit-actions">
                  <button
                    type="button"
                    className="tag-cancel-btn"
                    onClick={cancelEditTags}
                    disabled={savingTags}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="tag-save-btn"
                    onClick={() => void saveTags()}
                    disabled={savingTags}
                  >
                    {savingTags ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editingTags ? (
              <div className="detail-tag-cloud editing">
                {draftTags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="tag primary editable">
                    {tag}
                    <button
                      type="button"
                      className="tag-remove"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeDraftTag(index)}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </span>
                ))}
                <input
                  className="tag-add-input"
                  value={newTag}
                  maxLength={MAX_TAG_LEN}
                  disabled={draftTags.length >= MAX_TAGS}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      commitNewTag();
                    } else if (
                      e.key === 'Backspace' &&
                      newTag === '' &&
                      draftTags.length > 0
                    ) {
                      removeDraftTag(draftTags.length - 1);
                    }
                  }}
                  placeholder={
                    draftTags.length >= MAX_TAGS
                      ? `Max ${MAX_TAGS} tags`
                      : 'Add a tag'
                  }
                  aria-label="Add a tag"
                />
              </div>
            ) : (
              <div className="detail-tag-cloud">
                {asset.tags.length === 0 ? (
                  <span className="tag soft">No tags yet</span>
                ) : (
                  asset.tags.map((tag, index) => (
                    <Link
                      key={`${tag}-${index}`}
                      to={`/search?q=${encodeURIComponent(tag)}`}
                      className="tag primary"
                    >
                      {tag}
                    </Link>
                  ))
                )}
              </div>
            )}
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
