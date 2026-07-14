import { MapPin, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AssetCard } from '../components/AssetCard';
import { apiRequest } from '../lib/api';
import type { CreatorDetailResponse } from '../types';

export function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CreatorDetailResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    void apiRequest<CreatorDetailResponse>(`/creators/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(setData).catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Creator unavailable');
      });
    return () => controller.abort();
  }, [id]);

  if (!data) return <div className="page browse-empty" role={error ? 'alert' : 'status'}><h1>{error || 'Loading creator…'}</h1></div>;
  const { creator, items } = data;
  return <div className="page library-page">
    <section className="library-hero">
      <div className="creator-card">
        <span className="creator-avatar green">{creator.avatarUrl ? <img src={creator.avatarUrl} alt="" /> : creator.avatarInitials}</span>
        <div><h1>{creator.name}</h1><p><UserRound size={16} /> {creator.role}</p>{creator.location && <p><MapPin size={16} /> {creator.location}</p>}</div>
      </div>
      <div className="stat-card"><span>Published assets</span><strong>{creator.assetCount}</strong></div>
    </section>
    {creator.bio && <section className="settings-card"><p>{creator.bio}</p></section>}
    <section className="library-grid">{items.map((asset) => <AssetCard key={asset.id} asset={asset} />)}</section>
  </div>;
}
