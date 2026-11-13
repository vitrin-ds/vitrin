"use client";

import NextImage from "next/image";
import { useCallback, useState, type ReactNode } from "react";

// A brand mark that a project may not have: payment network, social network and flag files live in
// the project's public/ folder, and a fresh install has none of them (they aren't licensed with the
// code). When the file doesn't load, the fallback draws instead of a broken image. An image that
// failed before hydration never fires onError in React, so the ref also checks it once attached:
// complete, nothing drawn, and a source the browser tried (an image still loading has no width
// either, but isn't complete).

export interface BrandImageProps {
  src: string;
  /** Empty for a decorative mark. */
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** What draws when the file is missing: the brand's name, or a neutral placeholder. */
  fallback: ReactNode;
}

export function BrandImage({ src, alt, width, height, className, fallback }: BrandImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const checkLoaded = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth === 0 && image.currentSrc) setFailedSrc(src);
    },
    [src],
  );
  if (failedSrc === src) return fallback;
  return (
    <NextImage
      ref={checkLoaded}
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}
