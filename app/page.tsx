'use client';

import Link from 'next/link';
import { ArrowRight, Trophy, Zap, Users, Check, MapPin, Search } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-brand-purple selection:bg-brand-pink/20 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white sticky top-0 z-50">
        <div className="flex items-center">
          <div className="bg-brand-yellow p-2 rounded-lg">
            <img src="/logo.jpg" alt="RacketHeads Kochi" className="h-8 object-contain mix-blend-multiply" />
          </div>
        </div>
        <Link 
          href="/register" 
          className="bg-brand-purple text-white font-heading font-bold px-6 py-3 rounded-full text-sm hover:scale-105 transition-transform"
        >
          BOOK YOUR SPOT
        </Link>
      </header>

      <main className="flex-grow w-full flex flex-col">
        
        {/* Hero Section */}
        <section className="relative w-full bg-brand-yellow py-20 px-4 md:px-12 flex justify-center border-b-4 border-white">
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{
            backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)',
            backgroundSize: '24px 24px'
          }} />
          
          <div className="relative z-10 w-full max-w-5xl bg-brand-cream rounded-[3rem] px-8 py-20 flex flex-col items-center text-center shadow-lg border-2 border-transparent">
            {/* Tag */}
            <div className="bg-brand-pink text-white font-heading text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-wide flex items-center gap-2">
              <span>🕒</span> NEXT SESSION: SAT 7AM
            </div>
            
            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-tight leading-none mb-12 max-w-4xl">
              <span className="text-brand-purple block mb-2">A Badminton</span>
              <span className="text-brand-purple block mb-2">Community</span>
              <span className="text-brand-pink block">— Play, Compete,</span>
              <span className="text-brand-pink block">Connect.</span>
            </h1>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Link 
                href="/register" 
                className="bg-brand-purple text-white font-heading font-bold text-lg px-8 py-4 rounded-full transition-transform hover:scale-105"
              >
                BOOK YOUR SPOT
              </Link>
              <Link 
                href="#schedule" 
                className="bg-transparent text-brand-purple border-2 border-brand-purple font-heading font-bold text-lg px-8 py-4 rounded-full transition-transform hover:scale-105 hover:bg-brand-purple/5"
              >
                VIEW SCHEDULE
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-white py-24 px-4 flex flex-col items-center text-center border-b-4 border-brand-purple">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-purple mb-16 uppercase tracking-tight">
            Why <span className="border-b-[6px] border-brand-pink pb-1">Join</span> Us
          </h2>
          
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {/* Card 1 */}
            <div className="bg-brand-yellow border-4 border-brand-purple p-10 rounded-2xl flex flex-col items-center text-center shadow-[4px_4px_0_#401878]">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mb-6 text-brand-yellow">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-brand-purple mb-4 uppercase">All Skill Levels</h3>
              <p className="text-brand-purple/80 font-medium">Whether you're a seasoned pro or just picking up a racket, find opponents that match your pace.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-brand-pink border-4 border-brand-purple p-10 rounded-2xl flex flex-col items-center text-center shadow-[4px_4px_0_#401878]">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mb-6 text-brand-pink">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-white mb-4 uppercase">Premium Courts</h3>
              <p className="text-white/90 font-medium">High-grade synthetic courts with professional lighting designed to minimize glare and maximize performance.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-brand-yellow border-4 border-brand-purple p-10 rounded-2xl flex flex-col items-center text-center shadow-[4px_4px_0_#401878]">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mb-6 text-brand-yellow">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-brand-purple mb-4 uppercase">Great Community</h3>
              <p className="text-brand-purple/80 font-medium">Connect with local players, track rankings, and join exclusive tournaments in a high-energy environment.</p>
            </div>
          </div>
        </section>

        {/* Pricing / Inclusions Section */}
        <section className="w-full bg-brand-purple py-24 px-4 flex justify-center">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side */}
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-heading font-bold uppercase leading-tight mb-6">
                <span className="text-white block">Everything You</span>
                <span className="text-white block">Get When You</span>
                <span className="text-brand-yellow block">Book A Slot</span>
              </h2>
              <p className="text-white/80 font-medium text-lg mb-12 max-w-md">
                We provide the arena, the shuttles, and the competition. You just bring the sweat.
              </p>
              <Link 
                href="/register" 
                className="inline-block bg-brand-yellow text-brand-purple font-heading font-bold text-lg px-8 py-4 rounded-full transition-transform hover:scale-105"
              >
                BOOK NOW
              </Link>
            </div>

            {/* Right Side Card */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl">
              <ul className="space-y-6">
                {[
                  "2hrs Court Time",
                  "Shuttles & Refreshments",
                  "Opponent Matchmaking",
                  "Community Access",
                  "Fun Games/Challenges"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </div>
                    <span className="text-xl font-heading font-bold text-brand-purple">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="w-full bg-white py-12 px-6 flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto gap-8">
        <div className="flex flex-col gap-4">
          <div className="bg-brand-yellow p-2 rounded-lg w-fit">
            <img src="/logo.jpg" alt="RacketHeads Kochi" className="h-10 object-contain mix-blend-multiply" />
          </div>
          <p className="text-brand-purple text-xs font-bold font-heading uppercase max-w-xs">
            © 2024 RACKETHEADS KOCHI. SMASH THE LIMITS.
          </p>
        </div>

        <div className="flex flex-row gap-20">
          <div className="flex flex-col gap-3">
            <h4 className="text-brand-pink text-xs font-bold font-heading uppercase mb-2">Legal</h4>
            <a href="#" className="text-brand-purple text-sm font-medium hover:underline">Terms</a>
            <a href="#" className="text-brand-purple text-sm font-medium hover:underline">Privacy</a>
            <a href="#" className="text-brand-purple text-sm font-medium hover:underline">Cancellation</a>
            <a href="#" className="text-brand-purple text-sm font-medium hover:underline">Service</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-brand-pink text-xs font-bold font-heading uppercase mb-2">Connect</h4>
            <a href="#" className="bg-brand-yellow text-brand-purple font-heading font-bold px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform flex items-center gap-2">
              Instagram
            </a>
            <a href="#" className="bg-brand-yellow text-brand-purple font-heading font-bold px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform flex items-center gap-2">
              WhatsApp Join Broadcast
            </a>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
