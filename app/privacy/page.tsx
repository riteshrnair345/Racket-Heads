import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | RacketHeads Kochi',
};

export default function PrivacyPage() {
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
            Privacy & Trust
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-4 text-brand-purple tracking-tight">Privacy Policy</h1>
          <p className="font-semibold text-xs text-brand-purple/60 mb-8 pb-6 border-b border-brand-purple/10">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="prose prose-slate max-w-none space-y-6 text-brand-purple/85 font-medium leading-relaxed text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">1. Information We Collect</h2>
            <p>
              When you register for a session, we collect necessary personal details such as your name, email address, phone number (WhatsApp), age, and skill level to curate balanced matchmaking.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">2. How We Use Your Information</h2>
            <p>We use your information exclusively to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process your booking and confirm your court slot.</li>
              <li>Send you your digital entry pass (QR code) via email.</li>
              <li>Group you with players of suitable skill levels.</li>
              <li>Communicate critical slot updates regarding venue logistics or weather.</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">3. Data Protection & Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information. Data is only shared with verified infrastructure providers (e.g., transactional email and payment processors) strictly required to execute the booking service.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to modify your stored details, feel free to contact us at racketheadskochi@gmail.com.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
