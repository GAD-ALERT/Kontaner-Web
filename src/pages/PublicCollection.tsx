import { FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AssetCard } from '../components/AssetCard';
import { apiRequest } from '../lib/api';
import type { Asset, PublicCollection as PublicCollectionType } from '../types';

export function PublicCollection() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<PublicCollectionType | null>(null);
  const [items, setItems] = useState<Asset[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    void apiRequest<{ collection: PublicCollectionType; items: Asset[] }>(`/collections/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((result) => { setCollection(result.collection); setItems(result.items); })
      .catch((err: unknown) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Collection unavailable'); });
    return () => controller.abort();
  }, [id]);

  if (!collection) return <div className="page collection-detail-empty"><FolderOpen size={42} /><h1>{error || 'Loading collection…'}</h1></div>;
  return <div className="page collection-detail-page">
    <section className={`collection-detail-hero ${collection.visual}`}>
      <div><p className="eyebrow">Public collection</p><h1>{collection.name}</h1><p>{collection.description}</p><Link to={`/creator/${collection.creator.id}`}>Curated by {collection.creator.name}</Link></div>
    </section>
    {items.length > 0 ? <section className="library-grid">{items.map((asset) => <AssetCard key={asset.id} asset={asset} />)}</section>
      : <section className="collection-detail-empty"><FolderOpen size={42} /><h2>No assets in this collection yet</h2></section>}
  </div>;
}
