'use client';

import { useState, useEffect } from 'react';
import { Camera, Loader2, Play, Sparkles, ArrowRight, Image as ImageIcon, Film, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import VideoPlayer, { getInstagramReelId, InstagramIcon } from '@/components/VideoPlayer';

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <main className="flex-grow flex flex-col relative z-10 px-4 py-12 sm:py-20 selection:bg-brand-pink/20">
      
      {/* Background ambient accents */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[20%] left-[-5%] w-[500px] h-[450px] rounded-full bg-yellow-400/[0.20] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-pink/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[20%] right-[10%] w-[450px] h-[350px] rounded-full bg-amber-300/[0.16] blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink px-3.5 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 inline-block mb-3.5">
            Community Archive
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-brand-purple mb-4">
            Moments on Court
          </h1>
          <p className="text-base sm:text-lg text-brand-purple/75 font-medium max-w-2xl mx-auto leading-relaxed">
            The sweat, the smashes, and the smiling community. A visual chronicle of our weekend sessions in Kochi.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-brand-purple text-brand-yellow-light shadow-md'
                  : 'bg-white/70 hover:bg-white text-brand-purple/70 border border-brand-purple/10'
              }`}
            >
              All Moments ({items.length})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                filter === 'image'
                  ? 'bg-brand-purple text-brand-yellow-light shadow-md'
                  : 'bg-white/70 hover:bg-white text-brand-purple/70 border border-brand-purple/10'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({items.filter(i => i.type !== 'video').length})</span>
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                filter === 'video'
                  ? 'bg-brand-purple text-brand-yellow-light shadow-md'
                  : 'bg-white/70 hover:bg-white text-brand-purple/70 border border-brand-purple/10'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Reels & Videos ({items.filter(i => i.type === 'video').length})</span>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-brand-purple/60">
            <Loader2 className="w-10 h-10 text-brand-purple animate-spin mb-4" />
            <span className="text-sm font-bold">Curating court moments...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-brand-purple/10 p-12 max-w-md mx-auto">
            <Camera className="w-10 h-10 text-brand-purple/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-brand-purple mb-1">No moments in this view</h3>
            <p className="text-brand-purple/60 text-sm font-medium">Check back after the upcoming weekend session!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item) => {
              const igId = getInstagramReelId(item.url);
              return (
                <div 
                  key={item.id} 
                  className="break-inside-avoid group relative rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(58,26,93,0.06)] hover:shadow-[0_20px_45px_rgba(58,26,93,0.12)] border border-white/80 bg-black/5 transition-all duration-300"
                >
                  {igId ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative aspect-[9/16] overflow-hidden bg-slate-950 group/reel cursor-pointer"
                    >
                      {/* Reel Cover Photo */}
                      <img 
                        src={`/api/gallery/ig-thumb?id=${igId}`}
                        alt={item.alt && item.alt !== 'Gallery Media' ? item.alt : "RacketHeads Kochi Instagram Reel"}
                        className="w-full h-full object-cover transform group-hover/reel:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />

                      {/* Ambient fallback gradient */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#833ab4]/30 via-slate-950 to-[#fcb045]/20 -z-10" />

                      {/* Top Pill Badge matching theme */}
                      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/10 shadow-lg">
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                        <span>Instagram Reel</span>
                      </div>

                      {/* Floating Glassmorphic Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-black/45 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl group-hover/reel:scale-110 group-hover/reel:bg-gradient-to-tr group-hover/reel:from-[#833ab4] group-hover/reel:to-[#fcb045] group-hover/reel:border-transparent transition-all duration-300">
                          <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Gradient with Caption & Action */}
                      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-1.5 text-white">
                        {item.alt && item.alt !== 'Gallery Media' && (
                          <p className="text-xs font-semibold line-clamp-2 text-white/95 drop-shadow-sm">
                            {item.alt}
                          </p>
                        )}
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 group-hover/reel:text-pink-200 transition-colors">
                          <span>Watch on Instagram</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </a>
                  ) : item.type === 'video' ? (
                    <div className="relative">
                      <VideoPlayer 
                        src={item.url}
                        className="w-full aspect-[9/16] object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5">
                        <Play className="w-3 h-3 fill-white" />
                        <span>Video</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden">
                      <img 
                        src={item.url} 
                        alt={item.alt || "RacketHeads Kochi moment"}
                        className="w-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-bold">
                        Court Photo
                      </div>
                    </div>
                  )}
                  
                  {/* Gradient vignette on hover for non-reels */}
                  {!igId && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Community Invite Card */}
        <div className="mt-20 sm:mt-28 relative bg-white rounded-[2.5rem] p-10 sm:p-14 border border-brand-purple/10 shadow-[0_16px_40px_rgba(58,26,93,0.06)] text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow" />
          
          <div className="max-w-xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink px-3 py-1 rounded-full bg-brand-pink/10 inline-block mb-3">
              Be Part of the Story
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-purple tracking-tight mb-3">
              Want to Feature in Our Next Gallery?
            </h2>
            <p className="text-brand-purple/70 text-base font-medium mb-8">
              Join us on the court this weekend. All experience levels are welcomed, from recreational first-timers to competitive pros.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-brand-purple to-[#4e237c] hover:opacity-95 text-brand-yellow-light font-bold text-base px-8 py-4 rounded-full transition-all shadow-[0_8px_24px_rgba(58,26,93,0.25)] hover:shadow-[0_12px_32px_rgba(58,26,93,0.35)] hover:-translate-y-0.5"
            >
              <span>Book Your Court Slot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
      </div>
    </main>
  );
}
