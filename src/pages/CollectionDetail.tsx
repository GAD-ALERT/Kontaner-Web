import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AssetCard } from '../components/AssetCard';
import { Icon } from '../components/Icon';
import { useCollections } from '../stores/collections';
import { useLibrary } from '../stores/library';
import { assets as catalog } from '../data/assets';
import { toast } from '../stores/toast';
import { gridContainer, gridItem } from '../lib/motion';

export function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const collection = useCollections((s) =>
    id ? s.collections.find((c) => c.id === id) : undefined,
  );
  const rename = useCollections((s) => s.rename);
  const remove = useCollections((s) => s.remove);
  const toggleAsset = useCollections((s) => s.toggleAsset);
  const uploads = useLibrary((s) => s.uploads);

  const allAssets = useMemo(() => [...uploads, ...catalog], [uploads]);
  const items = useMemo(
    () =>
      collection
        ? collection.assetIds
            .map((aid) => allAssets.find((a) => a.id === aid))
            .filter((a): a is NonNullable<typeof a> => Boolean(a))
        : [],
    [collection, allAssets],
  );

  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

  if (!collection) {
    return (
      <div className="page collection-detail-empty">
        <Icon name="folder_open" size={40} />
        <h2>This collection no longer exists</h2>
        <p>It may have been deleted from another device.</p>
        <Link to="/collections" className="primary-button compact">
          Back to collections
        </Link>
      </div>
    );
  }

  const handleRename = (): void => {
    const next = window.prompt('Rename collection', collection.name);
    if (next && next.trim() && next.trim() !== collection.name) {
      rename(collection.id, next.trim());
      toast.success('Collection renamed');
    }
  };

  const handleShare = async (): Promise<void> => {
    const url = `${window.location.origin}/collection/${collection.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied');
    } catch {
      toast.warn('Could not access clipboard');
    }
  };

  const handleDelete = (): void => {
    if (!window.confirm(`Delete "${collection.name}"? This can't be undone.`)) return;
    remove(collection.id);
    toast.info(`${collection.name} deleted`);
    navigate('/collections');
  };

  const handleRemoveItem = (assetId: string, title: string): void => {
    toggleAsset(collection.id, assetId);
    toast.info(`Removed "${title}"`);
  };

  return (
    <div className="page collection-detail-page">
      <Link to="/collections" className="collection-detail-back">
        <Icon name="arrow_back" size={16} /> All collections
      </Link>

      <header className="collection-detail-hero">
        <div className={`collection-detail-cover ${collection.visual}`}>
          <span
            className="collection-privacy"
            title={collection.isPublic ? 'Public' : 'Private'}
          >
            <Icon name={collection.isPublic ? 'public' : 'lock'} size={16} />
            {collection.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        <div className="collection-detail-meta">
          <h1>{collection.name}</h1>
          <p>
            {collection.assetCount} assets · Updated {collection.updated}
          </p>
          {collection.description && (
            <p className="collection-detail-desc">{collection.description}</p>
          )}
          <div className="collection-detail-actions">
            <button
              type="button"
              className="primary-button compact"
              onClick={() => setPickerOpen((v) => !v)}
            >
              {pickerOpen ? 'Done adding' : 'Add assets'}
            </button>
            <button
              type="button"
              className="outline-button compact"
              onClick={() => void handleShare()}
            >
              <Icon name="share" size={16} /> Share
            </button>
            <button
              type="button"
              className="outline-button compact"
              onClick={handleRename}
            >
              <Icon name="edit" size={16} /> Rename
            </button>
            <button
              type="button"
              className="text-button danger"
              onClick={handleDelete}
            >
              <Icon name="delete" size={16} /> Delete
            </button>
          </div>
        </div>
      </header>

      {pickerOpen && (
        <section className="collection-picker">
          <h2>Add from library</h2>
          <div className="collection-picker-grid">
            {allAssets.slice(0, 24).map((a) => {
              const inside = collection.assetIds.includes(a.id);
              return (
                <button
                  type="button"
                  key={a.id}
                  className={`collection-picker-tile ${a.visual} ${inside ? 'inside' : ''}`}
                  onClick={() => {
                    const action = toggleAsset(collection.id, a.id);
                    toast[action === 'added' ? 'success' : 'info'](
                      action === 'added'
                        ? `Added "${a.displayTitle}"`
                        : `Removed "${a.displayTitle}"`,
                    );
                  }}
                  aria-pressed={inside}
                >
                  {a.src && <img src={a.src} alt="" loading="lazy" />}
                  <span className="collection-picker-state">
                    {inside ? 'Remove' : 'Add'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {items.length === 0 ? (
        <section className="collection-empty">
          <Icon name="folder_open" size={32} />
          <h2>This collection is empty</h2>
          <p>
            Add assets from your library, or browse Discover and tap “Add to
            collection” on anything you like.
          </p>
          <button
            type="button"
            className="primary-button compact"
            onClick={() => setPickerOpen(true)}
          >
            Add assets
          </button>
        </section>
      ) : (
        <motion.section
          className="library-grid"
          variants={gridContainer}
          initial="hidden"
          animate="visible"
        >
          {items.map((asset) => (
            <motion.div key={asset.id} variants={gridItem} className="collection-item-wrap">
              <AssetCard asset={asset} />
              <button
                type="button"
                className="collection-item-remove"
                onClick={() => handleRemoveItem(asset.id, asset.displayTitle)}
                aria-label={`Remove ${asset.displayTitle} from collection`}
              >
                <Icon name="delete" size={16} />
                Remove
              </button>
            </motion.div>
          ))}
        </motion.section>
      )}
    </div>
  );
}
