import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand-pink/20 selection:text-foreground">
      <Navbar />
      <div className="flex-grow flex flex-col pt-2 sm:pt-4">
        {children}
      </div>
      <Footer />
    </div>
  );
}
