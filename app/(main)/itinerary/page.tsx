'use client';

import { MapPin, Clock, Users, Trophy, Zap, Smile, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ItineraryPage() {
  const schedule = [
    {
      time: "08:45 AM",
      phase: "Phase 01",
      title: "Arrival & Digital Check-in",
      desc: "Arrive at the venue desk. Present your digital ticket QR code to mark your attendance and receive your court allocation.",
      icon: MapPin,
      badge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
      accent: "border-l-emerald-500"
    },
    {
      time: "09:00 AM",
      phase: "Phase 02",
      title: "Dynamic Warm-up & Introductions",
      desc: "Brief community welcome followed by a guided group warm-up to activate reflexes, stretch key muscle groups, and prevent injuries.",
      icon: Users,
      badge: "bg-amber-500/15 text-amber-600 border-amber-500/25",
      accent: "border-l-amber-500"
    },
    {
      time: "09:15 AM",
      phase: "Phase 03",
      title: "Skill Matchmaking & Doubles Matches",
      desc: "Players are paired based on self-reported proficiency tiers. Doubles games commence across our reserved high-grade courts.",
      icon: Zap,
      badge: "bg-brand-pink/15 text-brand-pink border-brand-pink/30",
      accent: "border-l-brand-pink"
    },
    {
      time: "10:00 AM",
      phase: "Phase 04",
      title: "King of the Court & Mini-Challenges",
      desc: "Optional rapid-fire challenges like 'King of the Court' or targeted serving games for quick rallies and community bragging rights.",
      icon: Trophy,
      badge: "bg-brand-purple/15 text-brand-purple border-brand-purple/30",
      accent: "border-l-brand-purple"
    },
    {
      time: "10:30 AM",
      phase: "Phase 05",
      title: "Open Rotation & Network Play",
      desc: "Mix up the courts! Pair with new players, try different playing styles, network with fellow badminton fans, and push your limits.",
      icon: Clock,
      badge: "bg-blue-500/15 text-blue-600 border-blue-500/25",
      accent: "border-l-blue-500"
    },
    {
      time: "10:50 AM",
      phase: "Phase 06",
      title: "Cool Down & Official Group Photo",
      desc: "Wrap up with light cool-down stretches, hydrated catchups, and smile for our weekend community group photo!",
      icon: Smile,
      badge: "bg-rose-500/15 text-rose-600 border-rose-500/25",
      accent: "border-l-rose-500"
    }
  ];

  return (
    <main className="flex-grow flex flex-col relative z-10 px-4 py-12 sm:py-20 selection:bg-brand-pink/20">
      
      {/* Background ambient accents */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-pink/10 blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink px-3.5 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 inline-block mb-3.5">
            Typical Session Blueprint
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-brand-purple mb-4">
            Event Itinerary
          </h1>
          <p className="text-base sm:text-lg text-brand-purple/75 font-medium max-w-2xl mx-auto leading-relaxed">
            Here's how a 2-hour RacketHeads Kochi session unfolds — seamless, energetic, and perfectly paced.
          </p>
        </div>

        {/* Timeline container */}
        <div className="relative ml-4 sm:ml-8 md:ml-12 pl-6 sm:pl-10 space-y-10 sm:space-y-12">
          
          {/* Vertical connecting gradient beam */}
          <div className="absolute left-0 top-3 bottom-6 w-1 bg-gradient-to-b from-brand-purple via-brand-pink to-brand-yellow rounded-full opacity-30" />

          {schedule.map((item, index) => (
            <div key={index} className="relative group">
              
              {/* Timeline Indicator Node */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-4 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border-2 border-brand-purple/15 shadow-[0_4px_16px_rgba(58,26,93,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:border-brand-pink transition-all duration-300">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-purple group-hover:text-brand-pink transition-colors" />
              </div>
              
              {/* Content Card */}
              <div className="bg-white/90 backdrop-blur-xl border border-brand-purple/10 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(58,26,93,0.04)] hover:shadow-[0_16px_40px_rgba(58,26,93,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-brand-purple/[0.06] text-brand-purple">
                      {item.time}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple/50">
                      {item.phase}
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.badge}`}>
                    Confirmed
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-brand-purple tracking-tight mb-2.5">
                  {item.title}
                </h3>
                
                <p className="text-brand-purple/75 text-sm sm:text-base font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Venue & Court Rules Advisory Card */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-r from-brand-pink/[0.08] via-brand-purple/[0.06] to-transparent border border-brand-pink/20 rounded-[2rem] p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-pink/20 text-brand-pink flex items-center justify-center shrink-0 shadow-sm border border-brand-pink/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <h4 className="text-brand-purple font-extrabold text-lg mb-1 flex items-center gap-2">
              Important Court Policy
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70 text-brand-purple/70">Required</span>
            </h4>
            <p className="text-brand-purple/75 font-medium text-sm leading-relaxed">
              <strong>Non-marking badminton shoes are mandatory</strong> on all indoor courts. Please arrive 15 minutes before slot time for check-in and court warmup.
            </p>
          </div>
          <Link 
            href="/register" 
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-purple hover:bg-[#2A1244] text-brand-yellow-light font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>Book Next Slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}
