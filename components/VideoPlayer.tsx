'use client';

import { useEffect, useRef } from 'react';

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return ytMatch ? ytMatch[1] : null;
}

export default function VideoPlayer({ src, className = "" }: { src: string, className?: string }) {
  const ytId = getYouTubeId(src);

  if (ytId) {
    // Autoplay, loop, mute, hide controls
    const ytSrc = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1`;
    return (
      <iframe
        src={ytSrc}
        className={`pointer-events-none scale-[1.35] ${className}`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ border: 'none' }}
      />
    );
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, [src]);

  return (
    <video 
      ref={videoRef}
      src={src} 
      autoPlay 
      loop 
      muted 
      playsInline 
      className={className} 
    />
  );
}
