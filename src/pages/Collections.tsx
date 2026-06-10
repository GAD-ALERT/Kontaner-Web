import {
  FolderOpen,
  Grid2X2,
  Lightbulb,
  MoreVertical,
  Plus,
  Settings,
  Tag,
  X,
  ImagePlus,
  Globe2,
} from 'lucide-react';
import { useState } from 'react';
import { collections } from '../data/assets';
import type { VisualClass } from '../types';

/** A fixed 4-element mosaic of `visual-*` classes used as a card cover. */
type TileSet = readonly [VisualClass, VisualClass, VisualClass, VisualClass];

const tileSets: readonly TileSet[] = [
  ['visual-kente', 'visual-city', 'visual-baskets', 'visual-portrait'],
  ['visual-illustration', 'visual-gold', 'visual-textile', 'visual-village'],
  ['visual-palms', 'visual-architecture', 'visual-market', 'visual-city'],
] as const;

export function Collections() {
  const [modalOpen, setModalOpen] = useState<boolean>(true);

  const closeModal = (): void => setModalOpen(false);
  const openModal = (): void => setModalOpen(true);

  return (
    <div className="page collections-page">
      <aside className="workspace-sidebar">
        <button type="button">
          <Grid2X2 size={22} />
          Overview
        </button>
        <button type="button">
          <FolderOpen size={22} />
          All Assets
        </button>
        <button className="active" type="button">
          <Tag size={22} />
          Collections
        </button>
        <button type="button">
          <Lightbulb size={22} />
          AI Insights
        </button>
        <button type="button">
          <Settings size={22} />
          Settings
        </button>
        <div className="storage-chip">
          <strong>Storage Used</strong>
          <span>
            <i />
          </span>
          <p>12.4 GB of 20 GB</p>
        </div>
      </aside>

      <section className="collections-main">
        <div className="collections-heading">
          <div>
            <h1>Collections</h1>
            <p>Organize and curate your assets into themed sets for easy sharing.</p>
          </div>
          <button className="primary-button compact" type="button" onClick={openModal}>
            <Plus size={19} />
            New Collection
          </button>
        </div>
        <div className="collection-grid">
          {collections.map((collection, i) => {
            const tiles = tileSets[i % tileSets.length];
            return (
              <article className="collection-card" key={collection.id}>
                <div className="collection-cover">
                  {tiles.map((v) => (
                    <div key={v} className={`collection-cover-tile ${v}`} />
                  ))}
                </div>
                <div>
                  <h2>{collection.name}</h2>
                  <p>
                    {collection.assetCount} assets · {collection.updated}
                  </p>
                </div>
                <button aria-label="Collection options" type="button">
                  <MoreVertical size={20} />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {modalOpen ? (
        <div className="modal-layer">
          <div className="modal-card">
            <header>
              <h2>Create New Collection</h2>
              <button aria-label="Close dialog" type="button" onClick={closeModal}>
                <X size={25} />
              </button>
            </header>
            <div className="modal-body">
              <label>
                Collection Name
                <input placeholder="e.g., Summer Campaign Assets" />
              </label>
              <label>
                Description (optional)
                <textarea placeholder="Briefly describe the contents of this collection..." />
              </label>
              <div>
                <span className="field-label">Select Cover Image</span>
                <div className="cover-options">
                  <button className="selected collection-kente" type="button">
                    <span />
                  </button>
                  <button type="button">
                    <ImagePlus size={24} />
                  </button>
                  <button type="button" />
                  <button type="button" />
                </div>
              </div>
              <div className="toggle-row">
                <Globe2 size={24} />
                <div>
                  <strong>Public Collection</strong>
                  <p>Anyone with the link can view this collection.</p>
                </div>
                <button
                  className="toggle on"
                  type="button"
                  aria-label="Public collection enabled"
                />
              </div>
            </div>
            <footer>
              <button className="text-button" type="button" onClick={closeModal}>
                Cancel
              </button>
              <button className="primary-button compact" type="button" onClick={closeModal}>
                Create Collection
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
