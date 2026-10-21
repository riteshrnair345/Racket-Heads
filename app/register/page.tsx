'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Sparkles, Smile, Trophy, Clock, Zap, Phone, Mail, User, Users, Info, CreditCard, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import Script from 'next/script';
import Link from 'next/link';
import Footer from '@/components/Footer';

type EventStatus = {
  id: string;
  name: string;
  date: string;
  time?: string;
  venue?: string;
  requiresPayment?: boolean;
  amount?: number;
  eventType?: 'community' | 'doubles';
  count: number;
  maxSlots: number;
  isFull: boolean;
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    age: '',
    proficiency: '',
    duration: '',
    shoes: '',
    heardFrom: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<{ qrId: string; name: string; isWaitlisted: boolean; isDoubles?: boolean } | null>(null);
  
  // Registration limit states
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [activeEvents, setActiveEvents] = useState<EventStatus[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    localStorage.setItem('twb_register_draft', JSON.stringify(newFormData));
  };

  const handleSelect = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    localStorage.setItem('twb_register_draft', JSON.stringify(newFormData));
  };

  useEffect(() => {
    // 1. Fetch Draft Data
    const draft = localStorage.getItem('twb_register_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData({
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '+91 ',
          age: parsed.age || '',
          proficiency: parsed.proficiency || '',
          duration: parsed.duration || '',
          shoes: parsed.shoes || '',
          heardFrom: parsed.heardFrom || '',
        });
      } catch (e) {
        console.error('Failed to parse draft form data');
      }
    }

    // 2. Fetch Registration Status
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/registration-status');
        const data = await res.json();
        if (data.success && data.events) {
          setActiveEvents(data.events);
          if (data.events.length === 1) {
            setSelectedEventId(data.events[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to check registration status', err);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId) {
      setError("Please select an event to register for.");
      return;
    }

    const selectedEvent = activeEvents.find(event => event.id === selectedEventId);
    const isDoubles = selectedEvent?.eventType === 'doubles';

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.age) {
      setError("Please fill out all required fields before continuing.");
      return;
    }

    if (!isDoubles && (!formData.proficiency || !formData.duration || !formData.heardFrom)) {
      setError("Please fill out all required fields before continuing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Save draft so the user doesn't lose their data if they come back
    localStorage.setItem('twb_register_draft', JSON.stringify(formData));

    try {
      if (selectedEvent?.eventType === 'doubles' && selectedEvent?.isFull) {
        setError("This regular game session is full. Registrations are closed.");
        setIsLoading(false);
        return;
      }

      const isWaitlistExpected = selectedEvent?.eventType === 'doubles' ? false : selectedEvent?.isFull;
      const requiresPayment = selectedEvent?.requiresPayment ?? true;

      const completeRegistration = async (paymentData: any = {}) => {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            age: formData.age,
            proficiency: formData.proficiency,
            duration: formData.duration,
            shoes: 'Required',
            heardFrom: formData.heardFrom,
            eventId: selectedEventId,
            ...paymentData
          }),
        });

        const data = await res.json();

        if (data.success && data.qrId) {
          // Show success state instantly
          setTicketData({ qrId: data.qrId, name: data.name, isWaitlisted: data.isWaitlisted || false, isDoubles: selectedEvent?.eventType === 'doubles' });
          setIsLoading(false);
        } else {
          setError(data.error || "Failed to register. Please try again.");
          setIsLoading(false);
        }
      };

      if (isWaitlistExpected || !requiresPayment) {
        // Bypass payment and add to waitlist or register directly
        await completeRegistration({});
      } else {
        // 1. Create order
        const paymentAmount = (selectedEvent?.amount ?? 150) * 100; // INR to paise
        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: paymentAmount,
            eventId: selectedEventId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            age: formData.age,
            proficiency: formData.proficiency,
            duration: formData.duration,
            shoes: 'Required',
            heardFrom: formData.heardFrom,
          })
        });
        const orderData = await orderRes.json();
        
        if (!orderData.success) {
          setError(orderData.error || "Could not initialize payment.");
          setIsLoading(false);
          return;
        }

        // 2. Open Razorpay Modal
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "RacketHeads Kochi",
          description: "Session Registration",
          order_id: orderData.order.id,
          handler: async function (response: any) {
            // 3. Complete registration with payment details
            await completeRegistration({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#6b21a8" // brand-purple
          },
          modal: {
            ondismiss: function() {
              setIsLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setError("Payment failed. Please try again.");
          setIsLoading(false);
        });
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (ticketData) {
    return (
      <div className="min-h-screen bg-brand-yellow-light text-brand-purple flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-brand-pink/20 relative overflow-hidden">
        {/* Soft Background Glows */}
        <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-[0.22] pointer-events-none mix-blend-multiply" />
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
        <div className="fixed top-[20%] left-[-5%] w-[500px] h-[450px] rounded-full bg-yellow-400/[0.22] blur-[140px] pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-pink/15 blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-7 sm:p-9 text-center space-y-6 shadow-[0_20px_60px_rgba(58,26,93,0.08)] relative z-10 overflow-hidden">
          
          {/* Top accent gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow" />

          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-emerald-100/80">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div>
            <span className="text-[11px] uppercase font-black tracking-widest text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 inline-block mb-3">
              {ticketData.isWaitlisted ? 'Waitlist Confirmed' : 'Registration Complete'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-brand-purple">
              {ticketData.isWaitlisted ? `You're on the Waitlist, ${ticketData.name}!` : `You're In, ${ticketData.name}! 🎉`}
            </h1>
            <p className="text-brand-purple/70 text-sm font-medium mb-4">
              {ticketData.isWaitlisted ? "The event is currently full, but we've reserved your spot in line." : "We've locked in your spot for the upcoming session!"}
            </p>
            
            {/* Status Pass Box */}
            <div className={`border rounded-2xl p-4 text-left mb-4 ${ticketData.isWaitlisted ? 'bg-amber-50/80 border-amber-200/80' : 'bg-emerald-50/80 border-emerald-200/80'}`}>
              <h2 className={`${ticketData.isWaitlisted ? 'text-amber-800' : 'text-emerald-800'} text-xs font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5`}>
                <span>{ticketData.isWaitlisted ? '⏳ Waitlist Details' : (ticketData.isDoubles ? '✅ Confirmation Sent' : '🎟️ Digital Entry Pass')}</span>
              </h2>
              <p className={`${ticketData.isWaitlisted ? 'text-amber-900' : 'text-emerald-900'} text-xs sm:text-sm font-medium leading-relaxed`}>
                {ticketData.isWaitlisted 
                  ? "We've emailed your waitlist confirmation. If a slot opens up, we will contact you immediately to upgrade your ticket!"
                  : (ticketData.isDoubles ? "We've emailed your confirmation. Please check your inbox for more details!" : "We've emailed your digital pass with a QR code. Please have it ready on your phone at the check-in desk!")}
              </p>
            </div>

            {/* Spam Folder Notice */}
            <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-3.5 text-left mb-4">
              <p className="text-rose-600 text-[11px] font-extrabold uppercase tracking-wider mb-0.5">Inbox Check</p>
              <p className="text-rose-800 text-xs font-medium leading-snug">
                Please check your <strong className="font-extrabold">Spam or Junk folder</strong> if the email doesn't appear in your Primary inbox within a few minutes.
              </p>
            </div>
            
            {/* Policy & WhatsApp Card */}
            <div className="bg-brand-purple/[0.03] border border-brand-purple/10 rounded-2xl p-4 text-left text-xs font-medium space-y-2">
              <p className="text-brand-purple/80 leading-relaxed">
                <span className="font-bold text-brand-purple">Cancellation Policy:</span> Refunds are processed if cancelled at least <strong>24 hours</strong> before the scheduled session.
              </p>
              <div className="pt-2 border-t border-brand-purple/10 flex flex-col gap-1 text-emerald-700">
                <span className="font-bold text-brand-purple">Questions? WhatsApp our hosts:</span>
                <div className="flex gap-3 font-semibold">
                  <a href="https://wa.me/918590330421" className="hover:underline" target="_blank" rel="noopener noreferrer">+91 8590330421</a>
                  <span>•</span>
                  <a href="https://wa.me/917012264390" className="hover:underline" target="_blank" rel="noopener noreferrer">+91 7012264390</a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setTicketData(null);
                const blankForm = { name: '', email: '', phone: '+91 ', age: '', proficiency: '', duration: '', shoes: '', heardFrom: '' };
                setFormData(blankForm);
                localStorage.removeItem('twb_register_draft');
              }}
              className="w-full bg-brand-purple hover:bg-[#2A1244] text-brand-yellow-light font-bold py-3.5 rounded-full transition-all shadow-sm text-sm"
            >
              Register Another Player
            </button>
            <Link href="/" className="block text-center text-xs font-bold text-brand-purple/60 hover:text-brand-purple py-2">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-brand-yellow-light flex flex-col items-center justify-center p-4 text-brand-purple">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin mb-4" />
        <span className="text-sm font-bold">Checking event slots...</span>
      </div>
    );
  }

  if (activeEvents.length === 0) {
    return (
      <div className="min-h-screen bg-brand-yellow-light text-brand-purple p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-brand-pink/20 relative overflow-hidden">
        {/* Soft Background Image */}
        <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-[0.22] pointer-events-none mix-blend-multiply" />
        
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 sm:p-10 text-center space-y-6 shadow-[0_20px_50px_rgba(58,26,93,0.06)] relative z-10">
          
          <div className="mx-auto w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-amber-100">
            <Calendar className="w-10 h-10 text-amber-500" />
          </div>
          
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-amber-600 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 inline-block mb-3">
              Registration Paused
            </span>
            <h1 className="text-3xl font-black tracking-tight mb-2 text-brand-purple">
              No Active Events
            </h1>
            <p className="text-brand-purple/70 text-sm font-medium">
              There are currently no events open for registration right now.
            </p>
          </div>

          <div className="bg-brand-purple/[0.04] border border-brand-purple/10 rounded-2xl p-4 text-center">
            <p className="text-brand-purple text-sm font-medium leading-relaxed">
              New weekend slots open mid-week. Follow us on Instagram or join our WhatsApp broadcast to receive instant alerts!
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <a
              href="https://chat.whatsapp.com/FboiKzrHqxU2E07rWwstnz"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-full transition-all shadow-sm text-sm"
            >
              Join WhatsApp Broadcast
            </a>
            <Link href="/" className="block">
              <button className="w-full bg-white hover:bg-slate-50 text-brand-purple font-bold py-3.5 rounded-full border border-brand-purple/10 transition-all text-sm">
                Return to Homepage
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedEvent = activeEvents.find(e => e.id === selectedEventId);

  const getCourtDuration = (event?: EventStatus | null) => {
    if (!event || !event.time) return '1 hr';
    const regex = /(\d+)(?::(\d+))?\s*(am|pm)?\s*(?:-|to)\s*(\d+)(?::(\d+))?\s*(am|pm)/i;
    const match = event.time.match(regex);
    if (!match) return '1 hr';
    let [_, h1, m1 = 0, mer1, h2, m2 = 0, mer2] = match;
    mer2 = mer2.toUpperCase();
    mer1 = (mer1 || mer2).toUpperCase();
    let hour1 = parseInt(h1);
    let hour2 = parseInt(h2);
    let min1 = parseInt(String(m1));
    let min2 = parseInt(String(m2));
    if (mer1 === 'PM' && hour1 < 12) hour1 += 12;
    if (mer1 === 'AM' && hour1 === 12) hour1 = 0;
    if (mer2 === 'PM' && hour2 < 12) hour2 += 12;
    if (mer2 === 'AM' && hour2 === 12) hour2 = 0;
    let diffMin = (hour2 * 60 + min2) - (hour1 * 60 + min1);
    if (diffMin < 0) diffMin += 24 * 60;
    const hrs = diffMin / 60;
    return hrs === 1 ? '1 hr' : `${hrs} hrs`;
  };

  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-brand-pink/20 relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Soft Background Image & Glows */}
      <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-[0.22] pointer-events-none mix-blend-multiply" />
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[20%] left-[-5%] w-[500px] h-[450px] rounded-full bg-yellow-400/[0.22] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-pink/10 blur-[140px] pointer-events-none" />

      {/* Floating Back Pill */}
      <div className="absolute top-5 left-4 sm:left-8 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/85 hover:bg-white text-brand-purple rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm border border-brand-purple/10 backdrop-blur-md hover:shadow-md hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      <div className="max-w-2xl w-full relative z-10 pt-10 sm:pt-6">
        
        {/* Header */}
        <header className="mb-8 sm:mb-10 flex flex-col items-center justify-center text-center">
          <div className="relative mb-5 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple/20 to-brand-pink/20 rounded-3xl blur-xl opacity-70" />
            <img 
              src="/logo.jpg" 
              alt="RacketHeads Kochi Logo" 
              className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl shadow-[0_12px_32px_rgba(58,26,93,0.1)] border-2 border-white/80 object-cover rotate-2 group-hover:rotate-6 transition-transform" 
            />
          </div>
          <span className="text-[11px] uppercase font-black tracking-widest text-brand-pink px-3 py-1 rounded-full bg-brand-pink/10 border border-brand-pink/20 inline-block mb-2">
            Player Registration
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-purple mb-2">
            Secure Your Slot
          </h1>
          <p className="text-sm sm:text-base text-brand-purple/70 font-medium max-w-md">
            Join Kochi's friendliest badminton community this weekend.
          </p>
        </header>

        {/* Event Selection */}
        {activeEvents.length > 1 && !selectedEventId && (
          <div className="mb-10 w-full animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-black text-center text-brand-purple mb-6">Select a Session to Register</h2>
            
            {/* Doubles Match-up Sessions */}
            {activeEvents.filter(e => e.eventType === 'doubles').length > 0 && (
              <div className="mb-8">
                <h3 className="text-base sm:text-lg font-black text-brand-purple mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-brand-pink" /> 
                  <span>Doubles Match-up Sessions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeEvents.filter(e => e.eventType === 'doubles').map(event => (
                    <div 
                      key={event.id}
                      onClick={() => {
                        if (!event.isFull) setSelectedEventId(event.id);
                      }}
                      className={`bg-white/90 backdrop-blur-xl border border-brand-purple/10 rounded-[2rem] p-6 shadow-sm transition-all group relative overflow-hidden ${
                        event.isFull ? 'opacity-65 cursor-not-allowed bg-slate-50/80' : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-pink to-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="font-extrabold text-brand-purple text-lg mb-2">{event.name}</div>
                        <div className="flex items-center gap-2 text-brand-purple/80 text-sm mb-1.5 font-medium">
                          <Calendar className="w-4 h-4 text-brand-pink" /> {event.date}
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-brand-purple/80 text-sm mb-3 font-medium">
                            <Clock className="w-4 h-4 text-brand-pink" /> {event.time}
                          </div>
                        )}
                        <div className="mt-auto pt-3 border-t border-brand-purple/10 flex items-center justify-between">
                          <span className={`text-xs font-bold ${event.isFull ? 'text-rose-600' : 'text-brand-purple/60'}`}>
                            {event.isFull ? '🔴 Session Full' : 'Slots available'}
                          </span>
                          {!event.isFull ? (
                            <span className="text-brand-pink font-black text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Select Session &rarr;
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold text-xs">
                              Registrations Closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Events */}
            {activeEvents.filter(e => e.eventType !== 'doubles').length > 0 && (
              <div className="mb-8">
                <h3 className="text-base sm:text-lg font-black text-brand-purple mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-pink" /> 
                  <span>Community Events</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeEvents.filter(e => e.eventType !== 'doubles').map(event => (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className="bg-white/90 backdrop-blur-xl border border-brand-purple/10 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple to-brand-pink opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="font-extrabold text-brand-purple text-lg mb-2">{event.name}</div>
                        <div className="flex items-center gap-2 text-brand-purple/80 text-sm mb-1.5 font-medium">
                          <Calendar className="w-4 h-4 text-brand-pink" /> {event.date}
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-brand-purple/80 text-sm mb-3 font-medium">
                            <Clock className="w-4 h-4 text-brand-pink" /> {event.time}
                          </div>
                        )}
                        <div className="mt-auto pt-3 border-t border-brand-purple/10 flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-purple/60">
                            {event.isFull ? 'Waitlist open' : 'Slots available'}
                          </span>
                          <span className="text-brand-purple font-black text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Select Session &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Event Details Banner */}
        {selectedEvent && (
          <div className="bg-white/95 backdrop-blur-xl border border-brand-purple/10 rounded-[2rem] p-6 sm:p-7 mb-8 shadow-[0_8px_30px_rgba(58,26,93,0.04)] relative overflow-hidden flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-pink px-2.5 py-0.5 rounded-full bg-brand-pink/10 mb-2">
              Selected Session
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-brand-purple mb-4">{selectedEvent.name}</h2>
            
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-5">
              <div className="flex items-center gap-2 text-brand-purple bg-brand-purple/[0.04] border border-brand-purple/10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                <Calendar className="w-4 h-4 text-brand-pink" />
                <span>{selectedEvent.date}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center gap-2 text-brand-purple bg-brand-purple/[0.04] border border-brand-purple/10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                  <Clock className="w-4 h-4 text-brand-pink" />
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.venue && (
                <div className="flex items-center gap-2 text-brand-purple bg-brand-purple/[0.04] border border-brand-purple/10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                  <MapPin className="w-4 h-4 text-brand-pink shrink-0" />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-pink transition-colors hover:underline"
                  >
                    {selectedEvent.venue}
                  </a>
                </div>
              )}
            </div>

            {activeEvents.length > 1 && (
              <button 
                onClick={() => setSelectedEventId('')}
                className="text-xs font-bold text-brand-purple/70 hover:text-brand-purple px-4 py-1.5 rounded-full hover:bg-brand-purple/5 transition-colors border border-brand-purple/15"
              >
                Change Session
              </button>
            )}
          </div>
        )}

        {/* Form Container */}
        {selectedEventId && (
          <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(58,26,93,0.06)] relative animate-in fade-in slide-in-from-bottom-4">
            
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-1.5 flex items-center gap-2.5 text-brand-purple">
                <Smile className="w-6 h-6 text-brand-pink" /> 
                <span>Player Profile</span>
              </h2>
              <p className="text-brand-purple/70 text-sm font-medium">
                Provide your details so we can arrange balanced matchups and send your digital entry pass.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold flex items-center gap-3 shadow-sm">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {/* 1. Full Name */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs sm:text-sm font-bold text-brand-purple ml-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-pink" /> 
                    <span>Full Name</span> 
                    <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Nair"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all placeholder:text-slate-400 text-sm sm:text-base shadow-sm"
                  />
                </div>

                {/* 2. Email */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-brand-purple ml-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-pink" /> 
                    <span>Email Address</span> 
                    <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all placeholder:text-slate-400 text-sm sm:text-base shadow-sm"
                  />
                </div>

                {/* 3. Phone Number */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-brand-purple ml-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-pink" /> 
                    <span>Phone (WhatsApp)</span> 
                    <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all placeholder:text-slate-400 text-sm sm:text-base shadow-sm"
                  />
                </div>

                {/* 3b. Age */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs sm:text-sm font-bold text-brand-purple ml-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-pink" /> 
                    <span>Age</span> 
                    <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 26"
                    min="1"
                    max="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all placeholder:text-slate-400 text-sm sm:text-base shadow-sm"
                  />
                </div>

                {/* 4. Proficiency - Card Selection */}
                {selectedEvent?.eventType !== 'doubles' && (
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-xs sm:text-sm font-bold text-brand-purple ml-1 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-brand-pink" /> 
                      <span>Skill Level</span> 
                      <span className="text-brand-pink">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Beginner', 'Amateur', 'Advanced', 'Professional'].map((level) => {
                        const isSelected = formData.proficiency === level;
                        return (
                          <button
                            type="button"
                            key={level}
                            onClick={() => handleSelect('proficiency', level)}
                            className={`rounded-2xl p-3.5 text-center transition-all duration-200 font-extrabold text-sm border ${
                              isSelected 
                                ? 'bg-brand-purple text-white border-brand-purple shadow-md scale-[1.02]' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <span>{level}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Duration - Card Selection */}
                {selectedEvent?.eventType !== 'doubles' && (
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-xs sm:text-sm font-bold text-brand-purple ml-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-pink" /> 
                      <span>How long have you been playing?</span> 
                      <span className="text-brand-pink">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                      {['< 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map((time) => {
                        const isSelected = formData.duration === time;
                        return (
                          <button
                            type="button"
                            key={time}
                            onClick={() => handleSelect('duration', time)}
                            className={`rounded-2xl p-3 text-center transition-all duration-200 font-extrabold text-xs sm:text-sm border ${
                              isSelected 
                                ? 'bg-brand-purple text-white border-brand-purple shadow-md scale-[1.02]' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <span>{time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. Non-marking shoes - Disclaimer */}
                <div className="md:col-span-2">
                  <div className="bg-gradient-to-r from-brand-pink/[0.08] to-transparent border border-brand-pink/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-left shadow-sm">
                    <Zap className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-brand-purple font-black text-sm mb-0.5">
                        Compulsory Non-Marking Badminton Shoes <span className="text-brand-pink">*</span>
                      </h4>
                      <p className="text-brand-purple/75 text-xs sm:text-sm font-medium leading-relaxed">
                        To protect the indoor courts, strictly non-marking shoes are permitted. Regular outdoor running sneakers are not allowed by the venue.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7. Heard From */}
                {selectedEvent?.eventType !== 'doubles' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs sm:text-sm font-bold text-brand-purple ml-1">
                      How did you hear about RacketHeads? <span className="text-brand-pink">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="heardFrom"
                        value={formData.heardFrom}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all appearance-none cursor-pointer shadow-sm text-sm sm:text-base"
                      >
                        <option value="" disabled className="text-brand-purple/40">Select an option...</option>
                        <option value="Friend/Word of Mouth">Friend / Word of Mouth</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-brand-purple/50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Fee Breakdown & Submission Button */}
              <div className="pt-6 border-t border-brand-purple/10">
                {selectedEvent?.eventType === 'doubles' && selectedEvent?.isFull ? (
                  <div className="mb-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center">
                    <p className="text-rose-800 text-sm font-extrabold flex items-center justify-center gap-1.5">
                      <span>🔴 Session is Full</span>
                    </p>
                    <p className="text-rose-700/80 text-xs mt-1 font-medium">
                      All slots for this regular game session have been booked. Please choose another session.
                    </p>
                  </div>
                ) : selectedEvent?.requiresPayment !== false && !selectedEvent?.isFull ? (
                  <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                    <p className="text-emerald-800 text-sm font-extrabold flex items-center justify-center gap-1.5">
                      <span>Session Pass Fee:</span>
                      <span className="text-base font-black">₹{selectedEvent?.amount ?? 150}</span>
                    </p>
                    <p className="text-emerald-700/80 text-xs mt-1 font-medium">
                      Covers {getCourtDuration(selectedEvent)} of reserved court time + quality tournament shuttlecocks.
                    </p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading || (selectedEvent?.eventType === 'doubles' && selectedEvent?.isFull)}
                  className={`w-full py-4 sm:py-4.5 font-black text-base sm:text-lg rounded-2xl transition-all flex items-center justify-center gap-3 ${
                    selectedEvent?.eventType === 'doubles' && selectedEvent?.isFull
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-brand-purple via-[#3e1b64] to-[#4e237c] hover:opacity-95 text-brand-yellow-light shadow-[0_10px_30px_rgba(58,26,93,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_15px_40px_rgba(58,26,93,0.4)] hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Locking in your spot...</span>
                    </>
                  ) : selectedEvent?.eventType === 'doubles' && selectedEvent?.isFull ? (
                    <>
                      <User className="w-5 h-5" />
                      <span>Session Full (Registrations Closed)</span>
                    </>
                  ) : selectedEvent?.isFull ? (
                    <>
                      <User className="w-5 h-5" />
                      <span>Join Waiting List</span>
                    </>
                  ) : selectedEvent?.requiresPayment !== false ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Confirm & Pay ₹{selectedEvent?.amount ?? 150}</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>Register for Free</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="w-full mt-16 sm:mt-24">
        <Footer />
      </div>
    </div>
  );
}
