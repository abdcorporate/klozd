"use client";

import { useState } from "react";
import Image from "next/image";

interface MockupImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function MockupImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
}: MockupImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`bg-klozd-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-klozd-gray-400 text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
