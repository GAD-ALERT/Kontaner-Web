import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: CSSProperties;
}

export function Skeleton({ width, height, radius = 10, style }: SkeletonProps) {
  return (
    <span
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonAssetGrid({ count = 8 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <Skeleton height={180} radius={12} />
          <div className="skeleton-card-body">
            <Skeleton width="70%" height={16} />
            <Skeleton width="40%" height={12} />
            <div className="skeleton-tags">
              <Skeleton width={56} height={20} radius={999} />
              <Skeleton width={70} height={20} radius={999} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
