'use client';

import Link from 'next/link';
import { ArrowRight, Trophy, Zap, Users, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import VideoPlayer, { getInstagramReelId, InstagramIcon } from '@/components/VideoPlayer';

export default function LandingPage() {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.items) {
          setGalleryItems(data.items);
        }
      })
      .catch(console.error);
  }, []);

  const row1 = galleryItems.filter((_, idx) => idx % 2 === 0);
  const row2 = galleryItems.filter((_, idx) => idx % 2 !== 0);

  const prepareRow = (items: any[]) => {
    if (items.length === 0) return [];
    let list = [...items];
    while (list.length < 6) {
      list = [...list, ...items];
    }
    return list;
  };

  const row1Items = prepareRow(row1.length ? row1 : galleryItems);
  const row2Items = prepareRow(row2.length ? row2 : galleryItems);

  const renderCard = (item: any, key: string) => {
    const isInstagram = getInstagramReelId(item.url);
    return (
      <div
        key={key}
        className="relative w-[230px] h-[160px] sm:w-[290px] sm:h-[195px] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-200/80 bg-slate-900/5 group/card transition-transform duration-500 hover:scale-[1.03]"
      >
        {isInstagram ? (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="absolute inset-0 w-full h-full overflow-hidden group/ig cursor-pointer bg-slate-950 flex flex-col justify-between text-white"
          >
            <img
              src={`/api/gallery/ig-thumb?id=${isInstagram}`}
              alt={item.alt || "Instagram Reel"}
              className="absolute inset-0 w-full h-full object-cover group-hover/ig:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 group-hover/ig:via-black/10 transition-colors" />
            <div className="relative z-10 p-3.5 sm:p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold shadow-sm border border-white/10">
                  <InstagramIcon className="w-3 h-3 text-pink-400" />
                  <span>Reel</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover/ig:scale-110 group-hover/ig:bg-gradient-to-tr group-hover/ig:from-[#833ab4] group-hover/ig:to-[#fcb045] transition-all shadow-md">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
              </div>
              <div>
                <p className="text-white font-extrabold text-xs sm:text-sm line-clamp-1 drop-shadow-sm mb-0.5">
                  {item.alt || "Watch on Instagram"}
                </p>
                <span className="text-[10px] font-semibold text-pink-300 group-hover/ig:text-pink-200 underline decoration-pink-300/50 underline-offset-2">
                  Open Reel ↗
                </span>
              </div>
            </div>
          </a>
        ) : item.type === 'video' ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <VideoPlayer 
              src={item.url} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
            />
            {item.alt && (
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none">
                <p className="text-white text-xs font-semibold drop-shadow-sm line-clamp-1">{item.alt}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img 
              src={item.url} 
              alt={item.alt || "RacketHeads court moment"} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
              loading="lazy"
            />
            {item.alt && (
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs font-semibold drop-shadow-sm line-clamp-1">{item.alt}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Ambient background glows & subtle court lines */}
      <div className="fixed inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-[0.05] pointer-events-none mix-blend-multiply" />
      <div className="fixed top-[-6%] left-[12%] w-[550px] h-[450px] rounded-full bg-yellow-400/[0.22] blur-[140px] pointer-events-none" />
      <div className="fixed top-[18%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-300/[0.18] blur-[150px] pointer-events-none" />
      <div className="fixed top-[-8%] right-[-6%] w-[550px] h-[550px] rounded-full bg-brand-purple/[0.06] blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-6%] w-[650px] h-[650px] rounded-full bg-brand-pink/[0.06] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[15%] right-[15%] w-[500px] h-[400px] rounded-full bg-yellow-300/[0.18] blur-[140px] pointer-events-none" />

      {/* Main Content */}
      <main className="flex-grow relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-4 py-20 sm:py-28 flex flex-col items-center text-center">
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-full scale-110 pointer-events-none group-hover:bg-yellow-400/40 transition-all" />
            <img 
              src="/logo.jpg" 
              alt="RacketHeads Kochi Logo" 
              className="relative h-28 w-auto rounded-3xl shadow-[0_12px_36px_rgba(250,204,21,0.25)] rotate-3 hover:rotate-6 transition-transform object-contain border border-amber-200/90" 
            />
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-brand-purple mb-6 drop-shadow-sm">
            RacketHeads <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-pink to-amber-500">Kochi</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-brand-purple/70 font-medium max-w-2xl mb-12 leading-relaxed">
            A Badminton Community — Play, Compete, Connect.
          </p>
          
          <Link 
            href="/register" 
            className="group relative inline-flex items-center justify-center gap-3 bg-brand-purple text-white font-bold text-lg px-8 py-4 rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_20px_40px_rgba(46,16,101,0.2)] active:scale-95 shadow-sm"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book Your Spot <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </section>

        {/* Why Join Us Section */}
        <section className="w-full bg-white/80 backdrop-blur-xl border-y border-slate-200/80 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-purple mb-4">Why Join Us?</h2>
              <p className="text-brand-purple/70 font-medium">Everything you need for a perfect session.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Trophy, title: "All Skill Levels", desc: "Whether you're an amateur or a seasoned pro, we match you with the right players." },
                { icon: Zap, title: "Premium Courts", desc: "Play on high-quality courts with excellent lighting and ventilation." },
                { icon: Users, title: "Great Community", desc: "Meet like-minded individuals, network, and enjoy a healthy weekend activity." }
              ].map((feature, i) => (
                <div key={i} className="bg-white/70 border border-slate-200/80 p-8 rounded-3xl text-center hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-brand-pink/10 text-brand-pink rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-pink/20">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-purple mb-3">{feature.title}</h3>
                  <p className="text-brand-purple/70 font-medium leading-relaxed text-sm sm:text-base">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Moments from the Court (Dual-Row Gallery Marquee) */}
        {galleryItems.length > 0 && (
          <section className="w-full py-16 overflow-hidden">
            <div className="text-center mb-10 px-4">
              <h2 className="text-3xl font-bold text-brand-purple mb-4">Moments from the Court</h2>
              <p className="text-brand-purple/70 font-medium">Join the action this weekend.</p>
            </div>
            
            {/* Dual-Row Smooth Marquee with Edge Fades */}
            <div className="relative w-full flex flex-col gap-3 sm:gap-4 overflow-hidden marquee-fade py-2">
              {/* Row 1: Leftward Continuous Scroll */}
              <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
                <div className="flex gap-3 sm:gap-4 pr-3 sm:pr-4 shrink-0">
                  {row1Items.map((item, i) => renderCard(item, `r1-a-${i}`))}
                </div>
                <div className="flex gap-3 sm:gap-4 pr-3 sm:pr-4 shrink-0">
                  {row1Items.map((item, i) => renderCard(item, `r1-b-${i}`))}
                </div>
              </div>

              {/* Row 2: Rightward Reverse Continuous Scroll */}
              <div className="flex w-max animate-scroll-reverse hover:[animation-play-state:paused]">
                <div className="flex gap-3 sm:gap-4 pr-3 sm:pr-4 shrink-0">
                  {row2Items.map((item, i) => renderCard(item, `r2-a-${i}`))}
                </div>
                <div className="flex gap-3 sm:gap-4 pr-3 sm:pr-4 shrink-0">
                  {row2Items.map((item, i) => renderCard(item, `r2-b-${i}`))}
                </div>
              </div>
            </div>
            
            <div className="text-center mt-10">
              <Link href="/gallery" className="inline-flex items-center gap-2 text-brand-pink font-bold hover:text-brand-purple transition-colors">
                <span>View Full Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Pricing / Session Details Section */}
        <section className="w-full max-w-5xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-brand-purple mb-4">Session Details</h2>
          <p className="text-brand-purple/70 font-medium mb-12">Everything you get when you book a slot.</p>
          
          <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_40px_rgba(46,16,101,0.06)] border border-slate-200/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-purple to-brand-pink" />
            
            <h3 className="text-2xl font-bold text-brand-purple mb-8">Session Inclusions</h3>
            <ul className="text-left space-y-4 mb-10">
              {[
                "2hrs court time",
                "Shuttles and refreshments included.",
                "Opponent matchmaking.",
                "Access to community.",
                "Fun games and challenges."
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-brand-purple/80 font-medium">
                  <div className="w-6 h-6 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href="/register" 
              className="block w-full bg-brand-purple hover:bg-brand-purple-deep text-white font-bold py-4 rounded-2xl transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Book Now
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
