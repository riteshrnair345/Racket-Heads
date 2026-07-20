import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple flex flex-col">
      <Navbar />
      <div className="pt-20 flex-grow flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}
