import { AnimatePresence, motion } from 'motion/react';
import { Check, FolderPlus, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useCollections } from '../stores/collections';
import { useNotifications } from '../stores/notifications';
import { toast } from '../stores/toast';
import { modalSpring } from '../lib/motion';

interface Props {
  open: boolean;
  assetId: string | null;
  assetTitle?: string;
  onClose: () => void;
}

export function AddToCollectionModal({ open, assetId, assetTitle, onClose }: Props) {
  const collections = useCollections((s) => s.collections);
  const toggleAsset = useCollections((s) => s.toggleAsset);
  const create = useCollections((s) => s.create);
  const pushNotification = useNotifications((s) => s.push);

  const [creating, setCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');

  const handleToggle = (collectionId: string, collectionName: string): void => {
    if (!assetId) return;
    const action = toggleAsset(collectionId, assetId);
    if (action === 'added') {
      toast.success(
        `Added to ${collectionName}`,
        assetTitle ? `“${assetTitle}” saved.` : undefined,
      );
      pushNotification({
        tone: 'collection',
        title: `Asset added to ${collectionName}`,
        body: assetTitle ? `“${assetTitle}” is now in this collection.` : '',
        href: `/collection/${collectionId}`,
      });
    } else if (action === 'removed') {
      toast.info(`Removed from ${collectionName}`);
    }
  };

  const handleCreate = (): void => {
    const name = newName.trim();
    if (!name) return;
    const created = create({ name });
    if (assetId) {
      toggleAsset(created.id, assetId);
    }
    toast.success(
      'Collection created',
      assetTitle ? `“${assetTitle}” saved to ${created.name}.` : `${created.name} is ready.`,
    );
    pushNotification({
      tone: 'collection',
      title: `New collection: ${created.name}`,
      body: 'Start filling it with assets from your library.',
      href: `/collection/${created.id}`,
    });
    setNewName('');
    setCreating(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="gate-layer add-collection-layer"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="add-collection-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } }}
            transition={modalSpring}
          >
            <header>
              <div>
                <h2>Add to collection</h2>
                <p>{assetTitle ?? 'Pick a collection or create a new one.'}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </header>

            <ul className="add-collection-list">
              {collections.map((c) => {
                const included = assetId ? c.assetIds.includes(assetId) : false;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={included ? 'included' : ''}
                      onClick={() => handleToggle(c.id, c.name)}
                    >
                      <span className={`add-collection-thumb ${c.visual}`} />
                      <span className="add-collection-meta">
                        <strong>{c.name}</strong>
                        <span>{c.assetCount} assets · {c.updated}</span>
                      </span>
                      <span className="add-collection-check" aria-hidden="true">
                        {included ? <Check size={16} /> : <Plus size={16} />}
                      </span>
                    </button>
                  </li>
                );
              })}
              {collections.length === 0 && (
                <li className="add-collection-empty">
                  No collections yet. Create your first below.
                </li>
              )}
            </ul>

            {creating ? (
              <div className="add-collection-create">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Collection name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') setCreating(false);
                  }}
                />
                <button
                  type="button"
                  className="primary-button compact"
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                >
                  Create
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setCreating(false);
                    setNewName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="add-collection-new"
                onClick={() => setCreating(true)}
              >
                <FolderPlus size={18} />
                New collection
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
