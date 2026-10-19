import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | RacketHeads Kochi',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple flex flex-col selection:bg-brand-pink/20 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-pink/10 blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 flex-grow w-full relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/85 hover:bg-white text-brand-purple rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm border border-brand-purple/10 backdrop-blur-md mb-8 hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-7 sm:p-12 shadow-[0_20px_50px_rgba(58,26,93,0.06)] border border-brand-purple/10">
          <span className="text-[11px] uppercase font-black tracking-widest text-brand-pink px-3 py-1 rounded-full bg-brand-pink/10 inline-block mb-3">
            Legal Document
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-4 text-brand-purple tracking-tight">Terms & Conditions</h1>
          <p className="font-semibold text-xs text-brand-purple/60 mb-8 pb-6 border-b border-brand-purple/10">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <div className="prose prose-slate max-w-none space-y-6 text-brand-purple/85 font-medium leading-relaxed text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">1. Introduction</h2>
            <p>
              Welcome to RacketHeads Kochi. By booking a session and participating in our events, you agree to abide by these Terms and Conditions. Please read them carefully.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to book a session independently. Minors must be accompanied by an adult or have explicit guardian consent.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">3. Booking & Registration</h2>
            <p>
              All bookings must be made through our official website. Registration is strictly required to secure your spot. Walk-ins without a registered digital QR ticket will not be permitted on court.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">4. Service Delivery Policy (Offline Service)</h2>
            <p>
              RacketHeads Kochi provides an <strong>offline, physical sports service</strong> (badminton court access, shuttles, and community matchmaking). 
              Upon successful registration, you will receive an entry pass (QR code) via email. No physical goods will be shipped to you. 
              The service is deemed "delivered" when you attend the scheduled session.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">5. Conduct & Liability</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Players must wear proper <strong>non-marking shoes</strong> on the courts at all times.</li>
              <li>Respectful and sportsmanship behavior towards organizers, court staff, and other players is mandatory.</li>
              <li>RacketHeads Kochi is not liable for any physical injuries, accidents, or loss of personal property that may occur during the sessions. Play at your own risk.</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued participation implies acceptance of the updated terms.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
