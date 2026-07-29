import Footer from '@/components/Footer';

export const metadata = {
  title: 'Cancellation Policy | RacketHeads Kochi',
};

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple flex flex-col selection:bg-brand-pink/20">
      <div className="max-w-4xl mx-auto px-4 py-20 flex-grow">
        <h1 className="text-4xl font-black mb-8 text-brand-purple">Cancellation Policy</h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <p className="font-medium text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">1. General Policy</h2>
          <p>
            Due to the limited availability of courts and the required matchmaking process, all bookings are highly valued. 
            We process refunds <strong>only if a cancellation is made more than 24 hours before the scheduled session</strong>. We strictly monitor cancellations and no-shows to ensure fair access for everyone.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. Cancellation Window</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>More than 24 hours before the session:</strong> If you cancel your booking more than 24 hours before the scheduled start time, a refund will be provided and it allows us to open the spot for someone else on the waitlist.</li>
            <li><strong>Less than 24 hours before the session:</strong> Last-minute cancellations heavily disrupt the matchmaking process. <strong>No refunds</strong> will be provided for cancellations made within 24 hours of the event.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. No-Show Policy</h2>
          <p>
            If you book a slot and fail to attend the session without prior notice (a "no-show"), it may impact your ability to register for future community sessions.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. Event Cancellation by Organizers</h2>
          <p>
            In the rare event that RacketHeads Kochi cancels a session (due to venue unavailability, emergencies, etc.), all registered players will be notified immediately via email and WhatsApp, and a <strong>full refund will be provided</strong>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
