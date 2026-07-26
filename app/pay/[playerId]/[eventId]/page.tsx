'use client';

import { useState, useEffect, use } from 'react';
import Script from 'next/script';
import { Loader2, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WaitlistCheckout({ params }: { params: Promise<{ playerId: string; eventId: string }> }) {
  const unwrappedParams = use(params);
  const { playerId, eventId } = unwrappedParams;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  
  const [player, setPlayer] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/pay-waitlist/info?playerId=${playerId}&eventId=${eventId}`);
        const data = await res.json();
        if (data.success) {
          setPlayer(data.player);
          setEventData(data.event);
          if (data.registrationStatus === 'Confirmed' || data.paymentStatus === 'Paid') {
            setSuccess(true);
            setTicketData({ name: data.player.name, qrId: data.player.qrId });
          }
        } else {
          setError(data.error || 'Failed to load details');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [playerId, eventId]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError('');
    try {
      const paymentAmount = (eventData.amount ?? 150) * 100;
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentAmount })
      });
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        setError(orderData.error || "Could not initialize payment.");
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RacketHeads Kochi",
        description: "Waitlist Confirmation Payment",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          // Confirm payment
          const confirmRes = await fetch('/api/pay-waitlist/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: playerId,
              eventId: eventId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          
          const confirmData = await confirmRes.json();
          if (confirmData.success) {
            setSuccess(true);
            setTicketData({ name: player.name, qrId: player.qrId });
          } else {
            setError(confirmData.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: player?.name,
          email: player?.email,
          contact: player?.phone
        },
        theme: {
          color: "#6b21a8"
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        setError("Payment failed. Please try again.");
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError("An unexpected error occurred.");
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-yellow-light">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (success && ticketData) {
    return (
      <div className="min-h-screen bg-brand-yellow-light flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 text-center shadow-sm">
          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-brand-purple">
            You're Confirmed, {ticketData.name}! 🎉
          </h1>
          <p className="text-brand-purple/70 text-sm font-medium mb-4">
            Your payment was successful and your spot is now secured. We've emailed you the digital ticket with your QR code.
          </p>
          <Link href="/">
            <button className="w-full mt-4 bg-brand-purple hover:bg-[#2A1244] text-white font-bold py-4 rounded-2xl transition-all shadow-sm">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center opacity-40 mix-blend-multiply" />
      
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm relative z-10 text-center border border-white/50">
        <h1 className="text-2xl font-black mb-2">Secure Your Spot</h1>
        <p className="text-sm font-medium text-brand-purple/70 mb-6">
          Hi {player?.name}! A court has unlocked for <strong>{eventData?.name}</strong>. Pay the fee to confirm your spot on the main roster.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {eventData && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm text-left">
            <p className="text-emerald-800 text-sm font-semibold mb-1">
              Amount Due: ₹{eventData.amount ?? 150}
            </p>
            <p className="text-emerald-700 text-xs font-medium">
              Includes court fee + 1 premium match-grade shuttle. RacketHeads takes zero markup.
            </p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={paymentLoading || !!error && !eventData}
          className="w-full py-4 bg-brand-purple hover:bg-[#2A1244] text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {paymentLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
          Pay Now
        </button>
      </div>
    </div>
  );
}
