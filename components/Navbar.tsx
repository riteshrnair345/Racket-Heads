'use client';

import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/itinerary', label: 'Itinerary' },
    { href: '/feedback', label: 'Feedback' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="h-10 w-10 rounded-xl shadow-sm group-hover:rotate-6 transition-transform object-cover" 
              />
              <span className="font-black text-xl tracking-tight text-brand-purple">
                RacketHeads
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'text-brand-pink bg-brand-pink/10' 
                      : 'text-brand-purple/70 hover:text-brand-purple hover:bg-brand-purple/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Link 
              href="/register" 
              className="group flex items-center gap-2 bg-brand-purple hover:bg-[#2A1244] text-brand-yellow-light font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-brand-purple hover:bg-brand-purple/5 transition-colors focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2 bg-white/95 backdrop-blur-xl border-t border-brand-purple/5 shadow-xl rounded-b-3xl">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  isActive 
                    ? 'text-brand-pink bg-brand-pink/10' 
                    : 'text-brand-purple hover:bg-brand-purple/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link 
              href="/register" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-brand-purple text-brand-yellow-light font-bold text-base px-6 py-4 rounded-xl shadow-sm"
            >
              Book Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
