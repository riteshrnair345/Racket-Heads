import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms & Conditions | RacketHeads Kochi',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple flex flex-col selection:bg-brand-pink/20">
      <div className="max-w-4xl mx-auto px-4 py-20 flex-grow">
        <h1 className="text-4xl font-black mb-8 text-brand-purple">Terms & Conditions</h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <p className="font-medium text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">1. Introduction</h2>
          <p>
            Welcome to RacketHeads Kochi. By booking a session and participating in our events, you agree to abide by these Terms and Conditions. Please read them carefully.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to book a session independently. Minors must be accompanied by an adult or have explicit guardian consent.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. Booking & Registration</h2>
          <p>
            All bookings must be made through our official website. Our community sessions are currently free to attend, but registration is strictly required to secure your spot. Walk-ins without a registered QR code will not be allowed on the court.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. Service Delivery Policy (Offline Service)</h2>
          <p>
            RacketHeads Kochi provides an <strong>offline, physical service</strong> (badminton court access and community matchmaking). 
            Upon successful registration, you will receive an entry pass (QR code) via email. No physical goods will be shipped to you. 
            The service is deemed "delivered" when you attend the scheduled session.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">5. Conduct & Liability</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Players must wear proper <strong>non-marking shoes</strong> on the courts.</li>
            <li>Respectful behavior towards organizers and other players is mandatory.</li>
            <li>RacketHeads Kochi is not liable for any physical injuries, accidents, or loss of personal property that may occur during the sessions. Play at your own risk.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued participation implies acceptance of the updated terms.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
