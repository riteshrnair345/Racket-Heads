'use client';

import { useEffect, useRef } from 'react';

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return ytMatch ? ytMatch[1] : null;
}

export function getInstagramReelId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:instagram\.com|instagr\.am)\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

export function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function VideoPlayer({ src, className = "" }: { src: string, className?: string }) {
  const ytId = getYouTubeId(src);
  const igId = getInstagramReelId(src);

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

  if (igId) {
    return (
      <div className={`relative overflow-hidden bg-slate-950 flex items-center justify-center ${className}`}>
        <img
          src={`/api/gallery/ig-thumb?id=${igId}`}
          alt="Instagram Reel"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl">
            <svg className="w-5 h-5 fill-white text-white ml-0.5" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
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
