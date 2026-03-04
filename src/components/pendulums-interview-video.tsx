"use client";

import { useEffect, useRef, useState } from "react";

type PendulumsInterviewVideoProps = {
  src: string;
  className?: string;
};

export function PendulumsInterviewVideo({
  src,
  className,
}: PendulumsInterviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNinetyPercentVisible, setIsNinetyPercentVisible] = useState(false);
  const [hasUserMutedOverride, setHasUserMutedOverride] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNinetyPercentVisible(entry.intersectionRatio >= 0.9);
      },
      {
        threshold: [0, 0.9, 1],
      }
    );

    observer.observe(videoElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    if (!isNinetyPercentVisible) {
      videoElement.muted = true;
      return;
    }

    if (!hasUserMutedOverride) {
      videoElement.muted = false;
    }
  }, [hasUserMutedOverride, isNinetyPercentVisible]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      autoPlay
      playsInline
      controls
      onVolumeChange={() => {
        const videoElement = videoRef.current;
        if (!videoElement) {
          return;
        }

        if (videoElement.muted && isNinetyPercentVisible) {
          setHasUserMutedOverride(true);
        }
      }}
      className={className}
    />
  );
}
