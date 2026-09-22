'use client';

import { MapPin, Clock, Users, Trophy, Zap, Smile } from 'lucide-react';
import Link from 'next/link';

export default function ItineraryPage() {
  const schedule = [
    {
      time: "08:45 AM",
      title: "Arrival & Check-in",
      desc: "Arrive at the venue. Scan your digital ticket QR code at the admin desk to mark your attendance.",
      icon: MapPin,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      time: "09:00 AM",
      title: "Warm-up & Introductions",
      desc: "Brief community welcome followed by a guided group warm-up to get the muscles ready and prevent injuries.",
      icon: Users,
      color: "bg-amber-100 text-amber-600"
    },
    {
      time: "09:15 AM",
      title: "Matchmaking & Casual Play",
      desc: "Players are paired up based on their self-reported proficiency levels. Doubles matches commence across all premium courts.",
      icon: Zap,
      color: "bg-brand-pink/20 text-brand-pink"
    },
    {
      time: "10:00 AM",
      title: "Mini-Challenges (Optional)",
      desc: "Take a break from standard matches to participate in fun, rapid-fire challenges like 'King of the Court' or targeted serving drills.",
      icon: Trophy,
      color: "bg-purple-100 text-purple-600"
    },
    {
      time: "10:30 AM",
      title: "Free Play & Rotation",
      desc: "Mix up the teams! Play with new partners to network and test your skills against different play styles.",
      icon: Clock,
      color: "bg-blue-100 text-blue-600"
    },
    {
      time: "10:50 AM",
      title: "Cool Down & Group Photo",
      desc: "Gather for a quick stretching session, collect your belongings, and smile for the official weekend group photo!",
      icon: Smile,
      color: "bg-rose-100 text-rose-600"
    }
  ];

  return (
    <main className="flex-grow flex flex-col relative z-10 px-4 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-purple/10 text-brand-purple mb-6">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-purple mb-4">
            Event Itinerary
          </h1>
          <p className="text-lg text-brand-purple/70 font-medium max-w-2xl mx-auto">
            Here's what you can expect during a typical 2-hour RacketHeads Kochi session.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l-4 border-brand-purple/10 ml-6 md:ml-12 py-4 space-y-12">
          {schedule.map((item, index) => (
            <div key={index} className="relative pl-8 md:pl-12">
              {/* Timeline Marker */}
              <div className={`absolute -left-[22px] top-1 w-10 h-10 rounded-full border-4 border-brand-yellow-light flex items-center justify-center shadow-sm ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              
              {/* Content Box */}
              <div className="bg-white/80 backdrop-blur-md border border-brand-purple/5 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-brand-purple mb-3">
                  {item.title}
                </h3>
                <p className="text-brand-purple/70 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="mt-16 bg-brand-pink/10 border border-brand-pink/20 rounded-3xl p-6 md:p-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-brand-purple font-bold text-lg mb-2">Venue Details</h4>
            <p className="text-brand-purple/70 font-medium text-sm leading-relaxed">
              Timings may vary slightly depending on the specific event slot. Always arrive 15 minutes prior to the start time to ensure a smooth check-in process. Non-marking shoes are strictly required on all courts.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
