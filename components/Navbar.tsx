'use client';

import Link from 'next/link';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/itinerary', label: 'Itinerary' },
    { href: '/feedback', label: 'Feedback' },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 w-full max-w-5xl mx-auto transition-all duration-300">
      <div 
        className={`rounded-full transition-all duration-300 px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between border ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-2xl border-brand-purple/10 shadow-[0_12px_36px_rgba(58,26,93,0.08)]' 
            : 'bg-white/80 backdrop-blur-xl border-white/70 shadow-[0_8px_30px_rgba(58,26,93,0.04)]'
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none shrink-0">
          <img 
            src="/logo.jpg" 
            alt="RacketHeads Kochi" 
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl shadow-sm group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 object-cover border border-slate-200 shrink-0" 
          />
          <span className="font-extrabold text-base sm:text-xl tracking-tight text-brand-purple">
            RacketHeads <span className="text-brand-pink">Kochi</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center p-1 rounded-full bg-slate-100/80 border border-slate-200/60">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'text-brand-purple font-bold bg-white shadow-sm' 
                    : 'text-slate-600 hover:text-brand-purple hover:bg-white/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link 
            href="/register" 
            className="group relative inline-flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-deep text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-full text-brand-purple hover:bg-brand-purple/5 transition-colors focus:outline-none"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden mt-2 p-3 rounded-3xl bg-white/95 backdrop-blur-2xl border border-brand-purple/10 shadow-[0_16px_40px_rgba(58,26,93,0.12)] space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'text-brand-purple bg-brand-pink/10 border border-brand-pink/20' 
                    : 'text-brand-purple/75 hover:bg-brand-purple/5'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-brand-pink" />}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link 
              href="/register" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-brand-purple text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-sm active:scale-[0.98] transition-transform"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
