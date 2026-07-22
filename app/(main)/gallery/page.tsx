'use client';

import { useState, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (data.success) {
          setImages(data.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <main className="flex-grow flex flex-col relative z-10 px-4 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-pink/10 text-brand-pink mb-6">
            <Camera className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-purple mb-4">
            Event Gallery
          </h1>
          <p className="text-lg text-brand-purple/70 font-medium max-w-2xl mx-auto">
            A glimpse into the energy, community, and fun from our past sessions.
          </p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-brand-purple/50 font-medium">
            Gallery is currently empty. Stay tuned for updates!
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((image) => (
              <div key={image.id} className="break-inside-avoid group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                {image.type === 'video' ? (
                  <video 
                    ref={el => { 
                      if (el) { 
                        el.defaultMuted = true; 
                        el.muted = true; 
                        el.play().catch(() => {}); 
                      } 
                    }}
                    src={image.url} 
                    className="w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    muted loop playsInline autoPlay
                  />
                ) : (
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-purple/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 text-center bg-white/60 backdrop-blur-md border border-brand-purple/10 rounded-[2.5rem] p-10 sm:p-16">
          <h2 className="text-3xl font-bold text-brand-purple mb-4">Want to be in our next gallery?</h2>
          <p className="text-brand-purple/70 font-medium mb-8">Join the community and book your spot for the upcoming weekend.</p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center bg-brand-purple text-brand-yellow-light font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-lg"
          >
            Register Now
          </Link>
        </div>
        
      </div>
    </main>
  );
}
