import {
  Edit3,
  FolderOpen,
  Globe2,
  Grid2X2,
  ImagePlus,
  Lightbulb,
  Lock,
  MoreVertical,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useCollections } from '../stores/collections';
import { useFavorites } from '../stores/favorites';
import { useNotifications } from '../stores/notifications';
import { useLibrary } from '../stores/library';
import { toast } from '../stores/toast';
import { assets } from '../data/assets';
import type { CollectionVisualClass, VisualClass } from '../types';
import { modalSpring } from '../lib/motion';

const tileSets: ReadonlyArray<readonly [VisualClass, VisualClass, VisualClass, VisualClass]> = [
  ['visual-kente', 'visual-city', 'visual-baskets', 'visual-portrait'],
  ['visual-illustration', 'visual-gold', 'visual-textile', 'visual-village'],
  ['visual-palms', 'visual-architecture', 'visual-market', 'visual-city'],
];

const coverOptions: CollectionVisualClass[] = [
  'collection-kente',
  'collection-tourism',
  'collection-urban',
];

type WorkspaceTab = 'overview' | 'all-assets' | 'collections' | 'insights' | 'settings';

interface SidebarItem {
  id: WorkspaceTab;
  label: string;
  icon: typeof Grid2X2;
}

const sidebarItems: readonly SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: Grid2X2 },
  { id: 'all-assets', label: 'All Assets', icon: FolderOpen },
  { id: 'collections', label: 'Collections', icon: Tag },
  { id: 'insights', label: 'AI Insights', icon: Lightbulb },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function Collections() {
  const navigate = useNavigate();
  const collections = useCollections((s) => s.collections);
  const create = useCollections((s) => s.create);
  const remove = useCollections((s) => s.remove);
  const rename = useCollections((s) => s.rename);
  const favorites = useFavorites((s) => s.ids);
  const uploads = useLibrary((s) => s.uploads);
  const pushNotif = useNotifications((s) => s.push);

  const [tab, setTab] = useState<WorkspaceTab>('collections');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [cover, setCover] = useState<CollectionVisualClass>('collection-kente');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpenId) return;
    const onClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [menuOpenId]);

  const totals = useMemo(
    () => ({
      assets: assets.length + uploads.length,
      collections: collections.length,
      savedAssets: collections.reduce((sum, c) => sum + c.assetCount, 0),
      favorites: favorites.length,
    }),
    [collections, favorites.length, uploads.length],
  );

  const submitCreate = (): void => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.warn('Collection needs a name');
      return;
    }
    const created = create({
      name: trimmed,
      description,
      isPublic,
      visual: cover,
    });
    toast.success(`${created.name} created`);
    pushNotif({
      tone: 'collection',
      title: `New collection: ${created.name}`,
      body: 'Start filling it with assets from your library.',
      href: `/collection/${created.id}`,
    });
    setName('');
    setDescription('');
    setCover('collection-kente');
    setIsPublic(true);
    setModalOpen(false);
  };

  const handleDelete = (id: string, label: string): void => {
    remove(id);
    setMenuOpenId(null);
    toast.info(`${label} deleted`);
  };

  const handleRename = (id: string, current: string): void => {
    setMenuOpenId(null);
    const next = window.prompt('Rename collection', current);
    if (next && next.trim() && next.trim() !== current) {
      rename(id, next.trim());
      toast.success('Collection renamed');
    }
  };

  const handleSidebarClick = (id: WorkspaceTab): void => {
    setTab(id);
    if (id === 'all-assets') {
      navigate('/library');
    } else if (id === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <div className="page collections-page">
      <aside className="workspace-sidebar">
        {sidebarItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => handleSidebarClick(id)}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
        <div className="storage-chip">
          <strong>Storage Used</strong>
          <span>
            <i style={{ width: '62%' }} />
          </span>
          <p>12.4 GB of 20 GB</p>
        </div>
      </aside>

      <section className="collections-main">
        <motion.div
          key={tab}
          className="workspace-pane"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {tab === 'overview' && (
            <>
              <div className="collections-heading">
                <div>
                  <h1>Overview</h1>
                  <p>A quick snapshot of your creative workspace.</p>
                </div>
              </div>
              <div className="overview-grid">
                <div className="overview-tile">
                  <span>Total assets</span>
                  <strong>{totals.assets.toLocaleString()}</strong>
                </div>
                <div className="overview-tile">
                  <span>Collections</span>
                  <strong>{totals.collections}</strong>
                </div>
                <div className="overview-tile">
                  <span>Saved in collections</span>
                  <strong>{totals.savedAssets}</strong>
                </div>
                <div className="overview-tile">
                  <span>Favorites</span>
                  <strong>{totals.favorites}</strong>
                </div>
              </div>
              <div className="overview-recent">
                <h2>Recent collections</h2>
                <ul>
                  {collections.slice(0, 3).map((c) => (
                    <li key={c.id}>
                      <Link to={`/collection/${c.id}`}>
                        <span className={`overview-thumb ${c.visual}`} />
                        <div>
                          <strong>{c.name}</strong>
                          <span>{c.assetCount} assets · {c.updated}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {tab === 'collections' && (
            <>
              <div className="collections-heading">
                <div>
                  <h1>Collections</h1>
                  <p>Organize and curate your assets into themed sets for easy sharing.</p>
                </div>
                <button
                  className="primary-button compact"
                  type="button"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus size={19} />
                  New Collection
                </button>
              </div>
              {collections.length === 0 ? (
                <div className="collections-empty">
                  <FolderOpen size={36} />
                  <h2>No collections yet</h2>
                  <p>Group assets by theme, project, or campaign.</p>
                  <button
                    type="button"
                    className="primary-button compact"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus size={18} />
                    Create your first
                  </button>
                </div>
              ) : (
                <div className="collection-grid">
                  {collections.map((collection, i) => {
                    const tiles = tileSets[i % tileSets.length];
                    return (
                      <article
                        className="collection-card"
                        key={collection.id}
                        onClick={() => navigate(`/collection/${collection.id}`)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            navigate(`/collection/${collection.id}`);
                          }
                        }}
                      >
                        <div className="collection-cover">
                          {tiles.map((v, idx) => (
                            <div key={`${v}-${idx}`} className={`collection-cover-tile ${v}`} />
                          ))}
                          <span
                            className="collection-privacy"
                            title={collection.isPublic ? 'Public' : 'Private'}
                          >
                            {collection.isPublic ? <Globe2 size={14} /> : <Lock size={14} />}
                            {collection.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <div>
                          <h2>{collection.name}</h2>
                          <p>
                            {collection.assetCount} assets · {collection.updated}
                          </p>
                        </div>
                        <div
                          className="collection-menu"
                          ref={menuOpenId === collection.id ? menuRef : null}
                        >
                          <button
                            aria-label="Collection options"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId((cur) =>
                                cur === collection.id ? null : collection.id,
                              );
                            }}
                          >
                            <MoreVertical size={20} />
                          </button>
                          {menuOpenId === collection.id && (
                            <div
                              className="collection-menu-pop"
                              role="menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/collection/${collection.id}`);
                                  setMenuOpenId(null);
                                }}
                              >
                                <FolderOpen size={14} /> Open
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRename(collection.id, collection.name)}
                              >
                                <Edit3 size={14} /> Rename
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const url = `${window.location.origin}/collection/${collection.id}`;
                                  try {
                                    await navigator.clipboard.writeText(url);
                                    toast.success('Collection link copied');
                                  } catch {
                                    toast.warn('Could not access clipboard');
                                  }
                                  setMenuOpenId(null);
                                }}
                              >
                                <Globe2 size={14} /> Copy share link
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={() => handleDelete(collection.id, collection.name)}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'insights' && (
            <>
              <div className="collections-heading">
                <div>
                  <h1>
                    <Sparkles size={22} />
                    AI Insights
                  </h1>
                  <p>What our engine notices about your library this week.</p>
                </div>
              </div>
              <div className="insights-stack">
                <article className="insight-card">
                  <h3>Your dominant theme</h3>
                  <p>
                    Across your saved assets, <strong>Kente patterns</strong> and{' '}
                    <strong>Market scenes</strong> appear in{' '}
                    {Math.max(1, totals.favorites)} of the assets you've engaged with.
                    Consider grouping them into a single editorial set.
                  </p>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      const created = create({
                        name: 'Kente & Market — Editorial',
                        description: 'Suggested grouping based on your activity.',
                        isPublic: false,
                      });
                      toast.success('Collection drafted from your patterns');
                      navigate(`/collection/${created.id}`);
                    }}
                  >
                    <Plus size={14} /> Draft this collection
                  </button>
                </article>
                <article className="insight-card">
                  <h3>Colors you keep returning to</h3>
                  <p>
                    Warm gold and emerald run through {Math.max(60, totals.assets)}% of your
                    library. Try filtering Discover by Premium to find more in this tonal range.
                  </p>
                  <Link to="/" className="text-button">
                    Browse Discover
                  </Link>
                </article>
                <article className="insight-card">
                  <h3>Storage opportunity</h3>
                  <p>
                    You have 47 assets with no collection assigned. Tagging them speeds up
                    future searches and unlocks better recommendations.
                  </p>
                  <Link to="/library" className="text-button">
                    Open library
                  </Link>
                </article>
              </div>
            </>
          )}
        </motion.div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="modal-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } }}
              transition={modalSpring}
            >
              <header>
                <h2>Create New Collection</h2>
                <button
                  aria-label="Close dialog"
                  type="button"
                  onClick={() => setModalOpen(false)}
                >
                  <X size={25} />
                </button>
              </header>
              <div className="modal-body">
                <label>
                  Collection Name
                  <input
                    placeholder="e.g., Summer Campaign Assets"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </label>
                <label>
                  Description (optional)
                  <textarea
                    placeholder="Briefly describe the contents of this collection..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
                <div>
                  <span className="field-label">Select Cover Image</span>
                  <div className="cover-options">
                    {coverOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`${cover === opt ? 'selected' : ''} ${opt}`}
                        onClick={() => setCover(opt)}
                        aria-label={`Use ${opt.replace('collection-', '')} cover`}
                      >
                        <span />
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="Upload custom cover"
                      onClick={() => toast.info('Custom covers coming soon')}
                    >
                      <ImagePlus size={24} />
                    </button>
                  </div>
                </div>
                <div className="toggle-row">
                  <Globe2 size={24} />
                  <div>
                    <strong>Public Collection</strong>
                    <p>Anyone with the link can view this collection.</p>
                  </div>
                  <button
                    className={isPublic ? 'toggle on' : 'toggle'}
                    type="button"
                    aria-pressed={isPublic}
                    aria-label="Toggle public visibility"
                    onClick={() => setIsPublic((v) => !v)}
                  />
                </div>
              </div>
              <footer>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button compact"
                  type="button"
                  onClick={submitCreate}
                  disabled={!name.trim()}
                >
                  Create Collection
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
