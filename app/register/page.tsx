'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Smile, Trophy, Clock, Zap, Phone, Mail, User, ArrowLeft } from 'lucide-react';
import Script from 'next/script';
import Link from 'next/link';

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
      <div className="min-h-screen bg-brand-yellow text-brand-purple flex flex-col items-center justify-center p-4 selection:bg-brand-pink/20 relative overflow-hidden">
        <div className="max-w-md w-full bg-[#202020] border-2 border-[#333] rounded-3xl p-8 text-center space-y-6 shadow-[12px_12px_0_#131313] relative z-10">
          
          <div className="mx-auto w-20 h-20 bg-[#131313] rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-brand-yellow" />
          </div>
          
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2 text-white">
              You're In, {ticketData.name}! 🎉
            </h1>
            <p className="text-white/70 text-sm font-sans font-medium mb-3">
              We've successfully registered you for the session!
            </p>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 inline-block mb-4">
              <h2 className="text-brand-yellow text-sm font-heading font-bold uppercase tracking-wider mb-2">🎟️ Ticket Sent to Email</h2>
              <p className="text-white/90 text-sm font-sans font-medium">
                We've emailed your digital ticket with the QR code. Please check your email and have it ready at the venue!
              </p>
            </div>
            <div className="bg-[#3a1a1a] border border-red-500/30 rounded-xl p-3 inline-block">
              <p className="text-red-400 text-xs font-heading font-bold uppercase tracking-wider mb-1">Important</p>
              <p className="text-white/80 text-sm font-sans font-medium">
                Please check your <strong className="font-heading font-bold text-white">Spam or Junk folder</strong> if you don't see the email in your main inbox!
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
            className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-heading font-bold py-4 rounded-xl transition-all shadow-sm"
          >
            Register another player
          </button>
        </div>
      </div>
    );
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-brand-yellow flex items-center justify-center p-4">
        <Loader2 className="w-16 h-16 text-black animate-spin" />
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="min-h-screen bg-brand-yellow text-brand-purple p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-brand-pink/20 relative overflow-hidden">
        <div className="max-w-md w-full bg-[#202020] border-2 border-[#333] rounded-3xl p-8 text-center space-y-6 shadow-[12px_12px_0_#131313] relative z-10">
          
          <div className="mx-auto w-20 h-20 bg-[#131313] rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-red-500" />
          </div>
          
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2 text-white">
              We are full! 😔
            </h1>
            <p className="text-white/70 text-sm font-sans font-medium">
              We have already reached our maximum capacity for this event. 
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-center">
            <p className="text-white text-sm font-sans font-medium leading-relaxed">
              Stay tuned to our Instagram page for announcements regarding the next event!
            </p>
          </div>

          <Link href="/">
            <button className="w-full mt-4 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-heading font-bold py-4 rounded-xl transition-all shadow-sm">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-yellow p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-black/20 relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Back Button */}
      <div className="absolute top-6 left-4 sm:left-8 z-20">
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] hover:bg-black text-brand-yellow rounded-md font-heading font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          GO BACK
        </Link>
      </div>

      <div className="max-w-3xl w-full relative z-10 pt-12 pb-12">
        
        {/* Header */}
        <header className="mb-8 flex flex-col items-center justify-center">
          <img 
            src="/logo.jpg" 
            alt="RacketHeads Kochi Logo" 
            className="h-28 w-auto mb-4 object-contain mix-blend-multiply" 
          />
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-black mb-3 text-center uppercase">
            RacketHeads Kochi
          </h1>
        </header>

        {/* Form Container */}
        <div className="bg-[#202020] rounded-[1.5rem] p-8 md:p-12 shadow-[12px_12px_0_#131313] relative">
          
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-heading font-bold mb-2 flex items-center justify-center gap-3 text-brand-yellow">
              <Smile className="w-6 h-6" /> Let's get to know you
            </h2>
            <p className="text-white/70 text-sm font-sans font-medium">
              We just need a few details to customize your experience.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-sm font-sans font-medium flex items-center gap-3 shadow-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              
              {/* 1. Full Name */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                  <User className="w-3 h-3" /> WHAT'S YOUR FULL NAME? <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#2a2a2a] border border-[#444] rounded-md px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all placeholder:text-white/30 font-sans font-medium"
                />
              </div>

              {/* 2. Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                  <Mail className="w-3 h-3" /> EMAIL ADDRESS <span className="text-white">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                  className="w-full bg-[#2a2a2a] border border-[#444] rounded-md px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all placeholder:text-white/30 font-sans font-medium"
                />
              </div>

              {/* 3. Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                  <Phone className="w-3 h-3" /> PHONE NUMBER <span className="text-white">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  className="w-full bg-[#2a2a2a] border border-[#444] rounded-md px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all placeholder:text-white/30 font-sans font-medium"
                />
              </div>

              {/* 3b. Age */}
              <div className="space-y-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                  <User className="w-3 h-3" /> AGE <span className="text-white">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 24"
                  min="1"
                  max="100"
                  className="w-full bg-[#2a2a2a] border border-[#444] rounded-md px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all placeholder:text-white/30 font-sans font-medium"
                />
              </div>

              {/* 4. Proficiency - Card Selection */}
              <div className="space-y-3 md:col-span-2 mt-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                  <Trophy className="w-3 h-3" /> HOW WOULD YOU RATE YOUR SKILLS? <span className="text-white">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['BEGINNER', 'AMATEUR', 'ADVANCED', 'PROFESSIONAL'].map((level) => (
                    <div
                      key={level}
                      onClick={() => handleSelect('proficiency', level)}
                      className={`cursor-pointer rounded-sm p-4 text-center border transition-all duration-200 font-heading font-bold text-[11px] uppercase tracking-wider ${
                        formData.proficiency === level 
                        ? 'border-brand-yellow bg-brand-yellow text-black' 
                        : 'border-[#444] bg-[#2a2a2a] text-white/70 hover:bg-[#333] hover:text-white'
                      }`}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Duration - Card Selection */}
              <div className="space-y-3 md:col-span-2 mt-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                  <Clock className="w-3 h-3" /> HOW LONG HAVE YOU BEEN PLAYING? <span className="text-white">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['< 1 YEAR', '1-3 YEARS', '3-5 YEARS', '5-10 YEARS'].map((time) => (
                    <div
                      key={time}
                      onClick={() => handleSelect('duration', time)}
                      className={`cursor-pointer rounded-sm p-3 text-center border transition-all duration-200 flex items-center justify-center font-heading font-bold text-[11px] uppercase tracking-wider ${
                        formData.duration === time 
                        ? 'border-brand-yellow bg-brand-yellow text-black' 
                        : 'border-[#444] bg-[#2a2a2a] text-white/70 hover:bg-[#333] hover:text-white'
                      }`}
                    >
                      {time}
                    </div>
                  ))}
                  <div
                    onClick={() => handleSelect('duration', '10+ YEARS')}
                    className={`col-span-2 md:col-span-4 cursor-pointer rounded-sm p-3 text-center border transition-all duration-200 flex items-center justify-center font-heading font-bold text-[11px] uppercase tracking-wider ${
                      formData.duration === '10+ YEARS' 
                      ? 'border-brand-yellow bg-brand-yellow text-black' 
                      : 'border-[#444] bg-[#2a2a2a] text-white/70 hover:bg-[#333] hover:text-white'
                    }`}
                  >
                    10+ YEARS
                  </div>
                </div>
              </div>

              {/* 6. Non-marking shoes - Disclaimer */}
              <div className="space-y-3 md:col-span-2 mt-2">
                <div className="bg-[#2a1313] border border-red-900/50 rounded-sm p-5 flex items-start gap-4 text-left">
                  <Zap className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-red-500 font-heading font-bold text-xs uppercase tracking-widest mb-1">
                      COMPULSORY NON-MARKING SHOES REQUIRED <span className="text-white">*</span>
                    </h3>
                    <p className="text-white/80 text-xs font-sans font-medium">
                      To protect the courts, all players must bring non-marking shoes to participate. 
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Heard From */}
              <div className="space-y-3 md:col-span-2 mt-2">
                <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-yellow">
                  HOW DID YOU FIND US? <span className="text-white">*</span>
                </label>
                <div className="relative">
                  <select
                    name="heardFrom"
                    value={formData.heardFrom}
                    onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-[#444] rounded-sm px-5 py-4 text-white font-sans font-medium focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-white/30">Select an option...</option>
                    <option value="Friend/Word of Mouth">Friend / Word of Mouth</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-6 mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-heading font-bold text-base tracking-widest uppercase rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Securing your spot...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    REGISTER NOW
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer Section */}
      <footer className="w-full bg-[#131313] py-12 px-6 flex flex-col md:flex-row justify-between items-start md:items-center max-w-none mt-20 gap-8 absolute bottom-0">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full md:flex-row justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-brand-yellow text-3xl font-bold font-heading uppercase italic leading-tight max-w-[200px]">
              RACKETHEADS KOCHI
            </h1>
            <p className="text-white/60 text-[10px] font-bold font-heading uppercase max-w-xs mt-2 tracking-wider">
              © 2024 RACKETHEADS KOCHI. SMASH THE LIMITS.
            </p>
          </div>

          <div className="flex flex-row gap-16">
            <div className="flex flex-col gap-3">
              <h4 className="text-brand-pink text-[10px] font-bold font-heading uppercase mb-2 tracking-widest">LEGAL</h4>
              <a href="#" className="text-white/80 text-xs font-sans hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-white/80 text-xs font-sans hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-white/80 text-xs font-sans hover:text-white transition-colors">Cancellation</a>
              <a href="#" className="text-white/80 text-xs font-sans hover:text-white transition-colors">Service</a>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-brand-pink text-[10px] font-bold font-heading uppercase mb-2 tracking-widest">CONNECT</h4>
              <a href="#" className="bg-brand-yellow text-black font-heading font-bold px-4 py-1.5 rounded-full text-xs hover:scale-105 transition-transform flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-black flex items-center justify-center shrink-0">📷</span> Instagram
              </a>
              <a href="#" className="bg-brand-yellow text-black font-heading font-bold px-4 py-1.5 rounded-full text-xs hover:scale-105 transition-transform flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-black flex items-center justify-center shrink-0">💬</span> WhatsApp Join Broadcast
              </a>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
