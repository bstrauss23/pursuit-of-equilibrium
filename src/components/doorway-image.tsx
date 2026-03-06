"use client";

import Image from "next/image";
import { useState } from "react";

type DoorwayImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  reveal: boolean;
  onLoaded: () => void;
};

export function DoorwayImage({
  src,
  alt,
  priority = false,
  reveal,
  onLoaded,
}: DoorwayImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, 50vw"
      quality={70}
      onLoad={() => {
        setLoaded(true);
        onLoaded();
      }}
      className={`object-cover object-center transition-opacity duration-1000 ${
        loaded && reveal ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
