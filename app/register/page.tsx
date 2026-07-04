'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Sparkles, Smile, Trophy, Clock, Zap, Phone, Mail, User, Info, CreditCard, ArrowLeft } from 'lucide-react';
import Script from 'next/script';
import Link from 'next/link';
import Footer from '@/components/Footer';

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
  const [ticketData, setTicketData] = useState<{ qrId: string; name: string } | null>(null);
  
  // Registration limit states
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

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
        if (data.success) {
          setIsFull(data.isFull);
          setSpotsLeft(data.maxSlots - data.count);
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
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.age || !formData.proficiency || !formData.duration || !formData.heardFrom) {
      setError("Please fill out all fields before continuing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Save draft so the user doesn't lose their data if they come back
    localStorage.setItem('twb_register_draft', JSON.stringify(formData));

    try {
      // Direct Registration without payment
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
          heardFrom: formData.heardFrom
        }),
      });

      const data = await res.json();

      if (data.success && data.qrId) {
        // Show success state instantly
        setTicketData({ qrId: data.qrId, name: data.name });
        setIsLoading(false);
      } else {
        setError(data.error || "Failed to register. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (ticketData) {
    return (
      <div className="min-h-screen bg-brand-dark text-brand-light flex flex-col items-center justify-center p-4 selection:bg-brand-yellow/20 relative overflow-hidden">
        {/* Soft Background Image */}
        <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none mix-blend-multiply" />

        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 text-center space-y-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] relative z-10">
          
          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2 text-brand-light">
              You're In, {ticketData.name}! 🎉
            </h1>
            <p className="text-brand-light/70 text-sm font-sans font-medium mb-3">
              We've successfully registered you for the session!
            </p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 inline-block mb-4">
              <h2 className="text-emerald-700 text-sm font-heading font-bold uppercase tracking-wider mb-2">🎟️ Ticket Sent to Email</h2>
              <p className="text-emerald-800 text-sm font-sans font-medium">
                We've emailed your digital ticket with the QR code. Please check your email and have it ready at the venue!
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 inline-block">
              <p className="text-rose-600 text-xs font-heading font-bold uppercase tracking-wider mb-1">Important</p>
              <p className="text-rose-700 text-sm font-sans font-medium">
                Please check your <strong className="font-heading font-bold">Spam or Junk folder</strong> if you don't see the email in your main inbox!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setTicketData(null);
              const blankForm = { name: '', email: '', phone: '+91 ', age: '', proficiency: '', duration: '', shoes: '', heardFrom: '' };
              setFormData(blankForm);
              localStorage.removeItem('twb_register_draft');
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold py-4 rounded-2xl transition-all shadow-sm"
          >
            Register another player
          </button>
        </div>
      </div>
    );
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <Loader2 className="w-16 h-16 text-brand-light animate-spin" />
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="min-h-screen bg-brand-dark text-brand-light p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-brand-yellow/20 relative overflow-hidden">
        {/* Soft Background Image */}
        <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none mix-blend-multiply" />
        
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 text-center space-y-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] relative z-10">
          
          <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-rose-100">
            <User className="w-10 h-10 text-rose-500" />
          </div>
          
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2 text-brand-light">
              We are full! 😔
            </h1>
            <p className="text-brand-light/70 text-sm font-sans font-medium">
              We have already reached our maximum capacity of 28 players for this event. 
            </p>
          </div>

          <div className="bg-brand-yellow/10 border border-brand-pink/20 rounded-2xl p-4 text-center">
            <p className="text-brand-light text-sm font-sans font-medium leading-relaxed">
              Stay tuned to our Instagram page for announcements regarding the next event!
            </p>
          </div>

          <Link href="/">
            <button className="w-full mt-4 bg-brand-yellow hover:bg-[#2A1244] text-brand-dark font-heading font-bold py-4 rounded-2xl transition-all shadow-sm">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-brand-yellow/20 relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Soft Background Image */}
      <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none mix-blend-multiply" />

      {/* Back Button */}
      <div className="absolute top-6 left-4 sm:left-8 z-20">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-brand-light rounded-xl font-heading font-bold text-sm transition-all shadow-sm border border-brand-light/10 backdrop-blur-sm hover:shadow-md hover:-translate-x-1">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Link>
      </div>

      <div className="max-w-2xl w-full relative z-10 pt-4">
        
        {/* Header */}
        <header className="mb-10 flex flex-col items-center justify-center">
          <img 
            src="/logo.jpg" 
            alt="RacketHeads Kochi Logo" 
            className="h-24 w-auto rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-6 rotate-3 hover:rotate-6 transition-transform object-contain" 
          />
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-brand-light mb-3 text-center">
            RacketHeads Kochi
          </h1>

        </header>

        {/* Form Container */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] relative">
          
          <div className="mb-10">
            <h2 className="text-2xl font-heading font-bold mb-2 flex items-center gap-2 text-brand-light">
              <Smile className="w-6 h-6 text-brand-yellow" /> Let's get to know you
            </h2>
            <p className="text-brand-light/70 text-sm font-sans font-medium">
              We just need a few details to customize your experience.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-sans font-medium flex items-center gap-3 shadow-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              
              {/* 1. Full Name */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-heading font-bold text-brand-light ml-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-yellow" /> What's your full name? <span className="text-brand-yellow">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-white border border-brand-light/20 rounded-2xl px-5 py-4 text-brand-light focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-light transition-all placeholder:text-brand-light/40 shadow-sm font-sans font-medium"
                />
              </div>

              {/* 2. Email */}
              <div className="space-y-3">
                <label className="text-sm font-heading font-bold text-brand-light ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-yellow" /> Email address <span className="text-brand-yellow">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                  className="w-full bg-white border border-brand-light/20 rounded-2xl px-5 py-4 text-brand-light focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-light transition-all placeholder:text-brand-light/40 shadow-sm font-sans font-medium"
                />
              </div>

              {/* 3. Phone Number */}
              <div className="space-y-3">
                <label className="text-sm font-heading font-bold text-brand-light ml-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-yellow" /> Phone number <span className="text-brand-yellow">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 99999 99999"
                  className="w-full bg-white border border-brand-light/20 rounded-2xl px-5 py-4 text-brand-light focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-light transition-all placeholder:text-brand-light/40 shadow-sm font-sans font-medium"
                />
              </div>

              {/* 3b. Age */}
              <div className="space-y-3">
                <label className="text-sm font-heading font-bold text-brand-light ml-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-yellow" /> Age <span className="text-brand-yellow">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 24"
                  min="1"
                  max="100"
                  className="w-full bg-white border border-brand-light/20 rounded-2xl px-5 py-4 text-brand-light focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-light transition-all placeholder:text-brand-light/40 shadow-sm font-sans font-medium"
                />
              </div>

              {/* 4. Proficiency - Card Selection */}
              <div className="space-y-4 md:col-span-2">
                <label className="text-sm font-heading font-bold text-brand-light ml-1 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-brand-yellow" /> How would you rate your skills? <span className="text-brand-yellow">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Beginner', 'Amateur', 'Advanced', 'Professional'].map((level) => (
                    <div
                      key={level}
                      onClick={() => handleSelect('proficiency', level)}
                      className={`cursor-pointer rounded-2xl p-4 text-center border-2 transition-all duration-200 font-heading font-bold ${
                        formData.proficiency === level 
                        ? 'border-brand-light bg-brand-yellow text-brand-light shadow-sm' 
                        : 'border-transparent bg-white border-brand-light/10 text-brand-light/70 hover:bg-brand-yellow/5 hover:text-brand-light shadow-sm'
                      }`}
                    >
                      <span className="text-sm">{level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Duration - Card Selection */}
              <div className="space-y-4 md:col-span-2">
                <label className="text-sm font-heading font-bold text-brand-light ml-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-yellow" /> How long have you been playing? <span className="text-brand-yellow">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['< 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map((time) => (
                    <div
                      key={time}
                      onClick={() => handleSelect('duration', time)}
                      className={`cursor-pointer rounded-2xl p-3 text-center border-2 transition-all duration-200 flex items-center justify-center font-heading font-bold ${
                        formData.duration === time 
                        ? 'border-brand-light bg-brand-yellow text-brand-light shadow-sm' 
                        : 'border-transparent bg-white border-brand-light/10 text-brand-light/70 hover:bg-brand-yellow/5 hover:text-brand-light shadow-sm'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Non-marking shoes - Disclaimer */}
              <div className="space-y-4 md:col-span-2">
                <div className="bg-brand-yellow/10 border border-brand-pink/20 rounded-2xl p-5 flex items-start gap-4 text-left shadow-sm">
                  <Zap className="w-6 h-6 text-brand-yellow shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-brand-light font-heading font-bold text-base mb-1">
                      Compulsory non-marking shoes required <span className="text-brand-yellow">*</span>
                    </h3>
                    <p className="text-brand-light/70 text-sm font-sans font-medium leading-relaxed">
                      To protect the courts, all players must bring non-marking shoes to participate. 
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Heard From */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-heading font-bold text-brand-light ml-1">
                  How did you find us? <span className="text-brand-yellow">*</span>
                </label>
                <div className="relative">
                  <select
                    name="heardFrom"
                    value={formData.heardFrom}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-light/20 rounded-2xl px-5 py-4 text-brand-light font-sans font-medium focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-light transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="" disabled className="text-brand-light/40">Select an option...</option>
                    <option value="Friend/Word of Mouth">Friend / Word of Mouth</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-brand-light/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-8 mt-10 border-t border-brand-light/10">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-brand-yellow hover:bg-[#2A1244] text-brand-dark font-heading font-bold text-lg rounded-2xl transition-all shadow-[0_8px_20px_rgba(58,26,93,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_12px_25px_rgba(58,26,93,0.4)] hover:-translate-y-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Securing your spot...
                  </>
                ) : (
                  <>
                    <User className="w-6 h-6" />
                    Register
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="w-full mt-20">
        <Footer />
      </div>
    </div>
  );
}
