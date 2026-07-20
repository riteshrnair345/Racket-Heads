import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand-purple text-brand-yellow-light/80 py-12 px-4 sm:px-8 relative z-10 border-t border-[#4A2A6D]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="RacketHeads Kochi Logo" className="h-12 w-auto rounded-xl shadow-lg object-contain" />
            <h3 className="text-xl font-bold text-white tracking-tight">RacketHeads Kochi</h3>
          </div>
          <p className="text-sm text-brand-yellow-light/60 leading-relaxed max-w-sm">
            A Badminton Community — Play, Compete, Connect.
          </p>
        </div>

        {/* Quick Links */}

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link href="/feedback" className="hover:text-brand-pink transition-colors font-bold text-brand-yellow">Submit Event Feedback</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-brand-pink transition-colors">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-brand-pink transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/refunds" className="hover:text-brand-pink transition-colors">Cancellation Policy</Link>
            </li>
            <li>
              <Link href="/terms#delivery" className="hover:text-brand-pink transition-colors">Service Delivery Policy</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white">Contact Us</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-pink">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <a
                href="https://www.instagram.com/racketheadskochi__?igsh=MTZjNDRyamN3eGp1Mg=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-pink transition-colors"
              >
                Instagram
              </a>
            </li>
            <li className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a
                href="https://chat.whatsapp.com/FboiKzrHqxU2E07rWwstnz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors"
              >
                Join WhatsApp Broadcast
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#4A2A6D] text-center text-sm font-medium text-brand-yellow-light/50">
        © {currentYear} RacketHeads Kochi. All rights reserved.
      </div>
    </footer>
  );
}
