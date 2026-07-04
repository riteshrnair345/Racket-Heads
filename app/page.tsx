'use client';

import Link from 'next/link';
import { ArrowRight, Trophy, Zap, Users, Info, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple selection:bg-brand-pink/20 flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none mix-blend-multiply" />
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-pink/10 blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <main className="flex-grow relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center">
          <img 
            src="/logo.jpg" 
            alt="RacketHeads Kochi Logo" 
            className="h-28 w-auto rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8 rotate-3 hover:rotate-6 transition-transform object-contain" 
          />
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-brand-purple mb-6 drop-shadow-sm">
            RacketHeads <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">Kochi</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-brand-purple/70 font-medium max-w-2xl mb-12 leading-relaxed">
            A Badminton Community — Play, Compete, Connect.
          </p>
          
          <Link 
            href="/register" 
            className="group relative inline-flex items-center justify-center gap-3 bg-brand-purple text-brand-yellow-light font-bold text-lg px-8 py-4 rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_20px_40px_rgba(58,26,93,0.2)] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book Your Spot <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </section>

        {/* About Section */}
        <section className="w-full bg-white/80 backdrop-blur-xl border-y border-white/50 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-purple mb-4">Why Join Us?</h2>
              <p className="text-brand-purple/70 font-medium">Everything you need for a perfect session.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Trophy, title: "All Skill Levels", desc: "Whether you're an amateur or a seasoned pro, we match you with the right players." },
                { icon: Zap, title: "Premium Courts", desc: "Play on high-quality synthetic mats with excellent lighting and ventilation." },
                { icon: Users, title: "Great Community", desc: "Meet like-minded individuals, network, and enjoy a healthy weekend activity." }
              ].map((feature, i) => (
                <div key={i} className="bg-white/60 border border-brand-purple/10 p-8 rounded-3xl text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-brand-pink/10 text-brand-pink rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-purple mb-3">{feature.title}</h3>
                  <p className="text-brand-purple/70 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full max-w-5xl mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-bold text-brand-purple mb-4">Session Details</h2>
          <p className="text-brand-purple/70 font-medium mb-12">Everything you get when you book a slot.</p>
          
          <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_40px_rgba(58,26,93,0.06)] border border-brand-purple/10 relative overflow-hidden">
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            
            <Link 
              href="/register" 
              className="block w-full bg-brand-yellow hover:opacity-90 text-brand-purple font-bold py-4 rounded-2xl transition-opacity"
            >
              Book Now
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
