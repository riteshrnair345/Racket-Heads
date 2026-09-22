import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | RacketHeads Kochi',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple flex flex-col selection:bg-brand-pink/20">
      <div className="max-w-4xl mx-auto px-4 py-20 flex-grow">
        <h1 className="text-4xl font-black mb-8 text-brand-purple">Privacy Policy</h1>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="font-medium text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">1. Information We Collect</h2>
          <p>
            When you register for a session, we collect personal information such as your name, email address, phone number, age, and skill level.
            All our community sessions are currently free to attend, so no payment information or credit card details are collected or stored.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. How We Use Your Information</h2>
          <p>We use your information exclusively to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process your booking and confirm your spot.</li>
            <li>Send you your entry pass (QR code) via email.</li>
            <li>Match you with players of similar skill levels.</li>
            <li>Communicate important updates regarding venue changes or cancellations.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. Data Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We may share necessary data with trusted service providers (e.g., email services) solely for the purpose of operating our service.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-8">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at the email provided in the footer.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
