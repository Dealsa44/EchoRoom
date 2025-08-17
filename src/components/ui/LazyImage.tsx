import React, { useMemo, useState } from 'react';

export type LazyImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string;
  alt: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholder?: 'blur' | 'empty';
  blurClassName?: string;
};

function buildPicsumSrcSet(originalSrc: string): string | undefined {
  try {
    const url = new URL(originalSrc);
    if (!url.hostname.includes('picsum.photos')) return undefined;
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) return undefined;
    const width = Number(pathParts[pathParts.length - 2]);
    const height = Number(pathParts[pathParts.length - 1]);
    if (!Number.isFinite(width) || !Number.isFinite(height)) return undefined;
    const sizes = [200, 300, 400, 600, 800];
    const srcSet = sizes
      .filter((w) => w > 0)
      .map((w) => {
        const h = Math.round((height / width) * w) || w;
        const u = new URL(originalSrc);
        u.pathname = `/${w}/${h}`;
        return `${u.toString()} ${w}w`;
      })
      .join(', ');
    return srcSet.length > 0 ? srcSet : undefined;
  } catch {
    return undefined;
  }
}

export default function LazyImage({
  src,
  alt,
  className,
  sizes,
  fetchPriority = 'auto',
  placeholder = 'blur',
  blurClassName,
  onLoad,
  style,
  ...imgProps
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  const computedSrcSet = useMemo(() => buildPicsumSrcSet(src), [src]);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      srcSet={computedSrcSet}
      className={className}
      style={{
        transition: 'filter 200ms ease, opacity 200ms ease',
        filter: placeholder === 'blur' && !loaded ? 'blur(12px)' : undefined,
        opacity: loaded ? 1 : 0.9,
        ...style,
      }}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      {...imgProps}
    />
  );
}


