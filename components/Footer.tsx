import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Mail, Phone, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0612] text-slate-300 py-16 px-4 sm:px-8 relative z-10 border-t border-white/5 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-[20%] w-[400px] h-[300px] bg-brand-pink/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[10%] w-[500px] h-[300px] bg-brand-purple/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">

        {/* Brand Column (5 cols) */}
        <div className="md:col-span-5 space-y-5">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="RacketHeads Kochi Logo" 
              className="h-12 w-12 rounded-2xl shadow-md border border-white/10 object-cover" 
            />
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                RacketHeads
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-pink/20 text-brand-pink border border-brand-pink/30">
                  Kochi
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">The Weekend Badminton Community</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-medium">
            A badminton collective born in Kochi to bring passionate players together for fair play, weekend fitness, and lifelong community bonds.
          </p>

          <div className="pt-2">
            <a
              href="https://chat.whatsapp.com/FboiKzrHqxU2E07rWwstnz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Join WhatsApp Broadcast</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Quick Links Column (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">Pages & Legal</h4>
          <ul className="space-y-2.5 text-sm font-medium">
            <li>
              <Link href="/" className="hover:text-brand-pink transition-colors inline-flex items-center gap-1.5">
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-brand-pink transition-colors inline-flex items-center gap-1.5">
                <span>Court Gallery</span>
              </Link>
            </li>
            <li>
              <Link href="/itinerary" className="hover:text-brand-pink transition-colors inline-flex items-center gap-1.5">
                <span>Event Itinerary</span>
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:text-brand-pink transition-colors inline-flex items-center gap-1.5">
                <span>Player Feedback</span>
              </Link>
            </li>
            <li className="pt-2 border-t border-white/5">
              <Link href="/terms" className="text-slate-400 hover:text-brand-pink transition-colors text-xs">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-slate-400 hover:text-brand-pink transition-colors text-xs">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refunds" className="text-slate-400 hover:text-brand-pink transition-colors text-xs">
                Cancellation & Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Column (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">Connect & Support</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li>
              <a
                href="https://www.instagram.com/racketheadskochi__?igsh=MTZjNDRyamN3eGp1Mg=="
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all text-white/90 hover:text-white"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-pink/20 text-brand-pink flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Follow on Instagram</span>
                  <span className="text-sm font-bold text-white group-hover:text-brand-pink transition-colors">@racketheadskochi__</span>
                </div>
              </a>
            </li>

            <li>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Organizers</span>
                </div>
                <div className="flex flex-col gap-1 text-xs pl-5 font-mono">
                  <a href="https://wa.me/919037498391" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">
                    +91 90374 98391
                  </a>
                  <a href="https://wa.me/919745477798" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">
                    +91 97454 77798
                  </a>
                </div>
              </div>
            </li>

            <li>
              <a
                href="mailto:racketheadskochi@gmail.com"
                className="flex items-center gap-2.5 text-xs text-slate-400 hover:text-blue-300 transition-colors px-2 py-1"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>racketheadskochi@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
        <div>
          © {currentYear} RacketHeads Kochi. All rights reserved.
        </div>
        <div className="flex items-center gap-1.5">
          <span>Crafted for Kochi's Badminton Lovers</span>
          <span className="text-brand-pink">🏸</span>
        </div>
      </div>
    </footer>
  );
}
