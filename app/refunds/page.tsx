import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Cancellation & Refund Policy | RacketHeads Kochi',
};

export default function CancellationPage() {
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
            Fair Play & Attendance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-4 text-brand-purple tracking-tight">Cancellation Policy</h1>
          <p className="font-semibold text-xs text-brand-purple/60 mb-8 pb-6 border-b border-brand-purple/10">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <div className="prose prose-slate max-w-none space-y-6 text-brand-purple/85 font-medium leading-relaxed text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">1. General Policy</h2>
            <p>
              Due to the limited availability of courts and the matchmaking curation required for each slot, every booking is valued. 
              We process refunds <strong>only if a cancellation is made more than 24 hours before the scheduled session</strong>. This allows us to offer the slot to fellow players waiting on the waitlist.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">2. Cancellation Window</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>More than 24 hours before the session:</strong> If you cancel your booking more than 24 hours before the scheduled start time, a full refund will be processed and your spot opened for someone on the waitlist.</li>
              <li><strong>Less than 24 hours before the session:</strong> Last-minute cancellations heavily disrupt team matchmaking. <strong>No refunds</strong> can be provided for cancellations made within 24 hours of the event.</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">3. No-Show Policy</h2>
            <p>
              If you book a slot and fail to attend the session without prior notice (a "no-show"), it impacts our doubles pairings and may temporarily restrict your ability to book future sessions.
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mt-8">4. Organizer Cancellations</h2>
            <p>
              In the rare event that RacketHeads Kochi cancels a session (e.g. due to severe weather or venue logistics), all registered players will be notified promptly via email and WhatsApp, and a <strong>100% full refund</strong> will be returned to your original payment method.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
