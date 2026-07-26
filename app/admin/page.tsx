"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, Users, CheckCircle, XCircle, RefreshCw, Loader2, Lock, LogOut, Trophy, Clock, Phone, Zap, Download, CalendarPlus, Database, Calendar, Trash2, Image as ImageIcon, ChevronDown, Edit2, Save, MessageSquare, Star, ChevronLeft, ChevronRight } from "lucide-react";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "0000";

type RosterItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  proficiency?: string;
  duration?: string;
  shoes?: string;
  checkInTime: string | null;
  status: "Checked In" | "Pending";
  registrationStatus?: "Confirmed" | "Waitlisted";
};

type EventItem = {
  id: string;
  name: string;
  date: string;
  participantLimit: number;
  time?: string;
  venue?: string;
  requiresPayment?: boolean;
  amount?: number;
  isActive: boolean;
  isFeedbackOpen?: boolean;
  createdAt: string;
};

type MasterDBItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstSeen: string;
  eventsAttended: number;
  totalRegistrations: number;
};

export default function WeekendBaddieApp() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "events" | "gallery" | "master" | "feedback">("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    document.title = "RacketHeads Kochi | Admin Portal";
  }, []);

  useEffect(() => {
    const authState = localStorage.getItem("wb_auth");
    if (authState === "true") {
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("wb_auth");
    setIsAuthenticated(false);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-brand-yellow-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-brand-yellow-light text-brand-purple font-sans selection:bg-brand-pink/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/badminton-bg.png')] bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none mix-blend-multiply" />

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
              <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden lg:block">
                RacketHeads Kochi
              </h1>
            </div>
            
            <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-1">
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50 min-w-max">
                <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "dashboard" ? "bg-white text-brand-purple shadow-sm border border-brand-purple/20" : "text-brand-purple/60 hover:text-brand-purple hover:bg-brand-purple/5"}`}>
                  <Users className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button onClick={() => setActiveTab("scanner")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "scanner" ? "bg-white text-brand-purple shadow-sm border border-brand-purple/20" : "text-brand-purple/60 hover:text-brand-purple hover:bg-brand-purple/5"}`}>
                  <Camera className="w-4 h-4" /> <span className="hidden sm:inline">Scanner</span>
                </button>
                <button onClick={() => setActiveTab("events")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "events" ? "bg-white text-brand-purple shadow-sm border border-brand-purple/20" : "text-brand-purple/60 hover:text-brand-purple hover:bg-brand-purple/5"}`}>
                  <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">Events</span>
                </button>
                <button onClick={() => setActiveTab("gallery")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "gallery" ? "bg-white text-brand-purple shadow-sm border border-brand-purple/20" : "text-brand-purple/60 hover:text-brand-purple hover:bg-brand-purple/5"}`}>
                  <ImageIcon className="w-4 h-4" /> <span className="hidden sm:inline">Gallery</span>
                </button>
                <button onClick={() => setActiveTab("master")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "master" ? "bg-white text-brand-purple shadow-sm border border-brand-purple/20" : "text-brand-purple/60 hover:text-brand-purple hover:bg-brand-purple/5"}`}>
                  <Database className="w-4 h-4" /> <span className="hidden sm:inline">Master DB</span>
                </button>
                <button onClick={() => setActiveTab("feedback")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "feedback" ? "bg-white text-brand-purple shadow-sm border border-brand-purple/20" : "text-brand-purple/60 hover:text-brand-purple hover:bg-brand-purple/5"}`}>
                  <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">Feedback</span>
                </button>
              </div>
              <button onClick={handleLogout} title="Lock App" className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                <LogOut className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "scanner" && <ScannerView />}
        {activeTab === "events" && <EventsView />}
        {activeTab === "gallery" && <GalleryView />}
        {activeTab === "master" && <MasterDBView />}
        {activeTab === "feedback" && <FeedbackView />}
      </main>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      localStorage.setItem("wb_auth", "true");
      onLogin();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-brand-yellow-light flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgba(58,26,93,0.04)] animate-in fade-in zoom-in-95 duration-300 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Lock className="w-7 h-7 text-brand-purple" />
        </div>
        <h1 className="text-2xl font-black text-center text-brand-purple mb-2 tracking-tight">Admin Access</h1>
        <p className="text-center text-brand-purple/70 mb-8 text-sm font-medium">
          Please enter your secure PIN to access the management portal.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              className={`w-full bg-white border ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : "border-brand-purple/20 focus:border-brand-purple focus:ring-brand-purple/10"} rounded-2xl px-4 py-4 text-center text-2xl font-mono text-brand-purple placeholder:text-brand-purple/30 focus:outline-none focus:ring-4 transition-all shadow-inner font-bold`}
              autoFocus
            />
            {error && (
              <p className="text-rose-500 text-sm font-semibold text-center mt-3 animate-in slide-in-from-top-1">
                Incorrect PIN. Please try again.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-brand-purple hover:bg-[#2A1244] text-brand-yellow-light font-bold py-4 px-4 rounded-2xl transition-all shadow-[0_8px_20px_rgba(58,26,93,0.25)] hover:shadow-[0_12px_25px_rgba(58,26,93,0.35)] hover:-translate-y-0.5"
          >
            Unlock App
          </button>
        </form>
      </div>
    </div>
  );
}

function ScannerView() {
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [playerInfo, setPlayerInfo] = useState<{phone?: string, proficiency?: string, duration?: string, shoes?: string} | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }

    const startScanner = async () => {
      try {
        await scannerRef.current?.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          onScanSuccess,
          onScanFailure
        );
      } catch (err: any) {
        if (err?.toString().includes("already under transition")) return;
        setScanStatus("error");
        setMessage("Camera access denied or unavailable.");
      }
    };

    startScanner();

    return () => {
      try {
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      } catch (e) {}
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (scanStatus === "scanning" || scanStatus === "success") return;
    
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.pause();
    }

    setScanStatus("scanning");
    setMessage("Processing ticket...");

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId: decodedText }), // eventId inferred by backend
      });

      const result = await response.json();

      if (result.success) {
        setScanStatus("success");
        setParticipantName(result.name || "Participant");
        setPlayerInfo({
          phone: result.phone,
          proficiency: result.proficiency,
          duration: result.duration,
          shoes: result.shoes
        });
        setMessage(result.message || "Check-in successful");
      } else {
        setScanStatus("error");
        setMessage(result.error || "Invalid ticket");
      }
    } catch (err) {
      setScanStatus("error");
      setMessage("Network error. Try again.");
    }
  };

  const onScanFailure = () => {};

  const resumeScanning = async () => {
    setScanStatus("idle");
    setMessage("");
    setParticipantName("");
    setPlayerInfo(null);
    if (scannerRef.current?.getState() === 3) {
      await scannerRef.current.resume();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">QR Scanner</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Point camera at participant's digital ticket
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative">
          <div id="reader" className="w-full min-h-[300px] bg-slate-900"></div>

          {scanStatus !== "idle" && (
            <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
              {scanStatus === "scanning" && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-purple mb-1">Verifying</h3>
                  <p className="text-brand-purple/70 font-medium">{message}</p>
                </div>
              )}

              {scanStatus === "success" && (
                <div className="flex flex-col items-center text-center w-full max-w-sm">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{participantName}</h3>
                  <p className="text-emerald-600 font-bold mb-6 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{message}</p>
                  
                  {playerInfo && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full mb-6 text-left grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Phone className="w-3.5 h-3.5"/> <span className="text-xs font-bold uppercase tracking-wider">Phone</span></div>
                        <span className="text-slate-800 font-semibold">{playerInfo.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Trophy className="w-3.5 h-3.5"/> <span className="text-xs font-bold uppercase tracking-wider">Skill</span></div>
                        <span className="text-slate-800 font-semibold">{playerInfo.proficiency || 'N/A'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Clock className="w-3.5 h-3.5"/> <span className="text-xs font-bold uppercase tracking-wider">Experience</span></div>
                        <span className="text-slate-800 font-semibold">{playerInfo.duration || 'N/A'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Zap className="w-3.5 h-3.5"/> <span className="text-xs font-bold uppercase tracking-wider">Shoes</span></div>
                        <span className="text-slate-800 font-semibold">{playerInfo.shoes || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  <button onClick={resumeScanning} className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-2xl py-4 font-bold transition-all shadow-md">
                    Scan Next Ticket
                  </button>
                </div>
              )}

              {scanStatus === "error" && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
                    <XCircle className="w-10 h-10 text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Invalid Ticket</h3>
                  <p className="text-rose-600 font-bold mb-8 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">{message}</p>
                  
                  <button onClick={resumeScanning} className="mt-4 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors shadow-sm">
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-5 bg-slate-50 border-t border-slate-100 text-center rounded-b-[2.5rem]">
          <p className="text-sm font-medium text-slate-500">Position the QR code within the frame</p>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: "", email: "", phone: "" });
  const [isAdding, setIsAdding] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.events.length > 0) {
        setEvents(data.events);
        const active = data.events.find((e: EventItem) => e.isActive);
        setSelectedEventId(active ? active.id : data.events[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load events.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchRoster = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/roster?eventId=${selectedEventId}&t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRoster(data);
    } catch (err) {
      console.error(err);
      setError("Could not load roster. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchRoster();
    }
  }, [selectedEventId]);

  const checkedInCount = roster.filter(r => r.status === "Checked In").length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 mb-2">
            Dashboard 👋
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Select an event to view its roster.
          </p>
        </div>
        
        {events.length > 0 && (
          <div className="w-full md:w-64">
            <label className="block text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Selected Event</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-white border border-brand-purple/20 focus:border-brand-purple focus:ring-brand-purple/10 rounded-xl px-4 py-3 font-semibold text-brand-purple focus:outline-none focus:ring-2 transition-all shadow-sm"
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name} {e.isActive ? '(Active)' : ''}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[2rem] p-6 border border-brand-purple/10 shadow-[0_8px_30px_rgba(58,26,93,0.04)] flex items-center gap-5">
          <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center border border-brand-purple/20">
            <Users className="w-6 h-6 text-brand-purple" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Registered</p>
            <p className="text-3xl font-black text-slate-800">{roster.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Checked In</p>
            <p className="text-3xl font-black text-slate-800">{checkedInCount}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center">
          <button
            onClick={fetchRoster}
            disabled={loading || !selectedEventId}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-brand-yellow-light disabled:opacity-50 text-brand-purple rounded-2xl font-bold transition-all border border-brand-purple/20 shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-brand-purple" : "text-brand-purple/60"}`} />
            Refresh Roster
          </button>

          <button
            onClick={() => {
              if (selectedEventId) {
                window.location.href = `/api/admin/export?pin=${ADMIN_PIN}&eventId=${selectedEventId}`;
              }
            }}
            disabled={!selectedEventId}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 rounded-2xl font-bold transition-all border border-emerald-100 shadow-sm"
          >
            <Download className="w-5 h-5" />
            Download CSV & QR Codes
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-[2rem] text-center shadow-sm">
          <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="text-rose-600 font-bold">{error}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">Live Roster</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Participant</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs hidden md:table-cell">Details</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs hidden sm:table-cell">Check-in / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && roster.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <Loader2 className="w-10 h-10 text-brand-purple animate-spin mx-auto mb-4" />
                      <p className="text-brand-purple/70 font-medium">Loading participants...</p>
                    </td>
                  </tr>
                ) : roster.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500 font-medium">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      No participants registered for this event yet.
                    </td>
                  </tr>
                ) : (
                  roster.map((person, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-base">{person.name}</div>
                        <div className="text-slate-500 text-xs font-medium mt-1">{person.email}</div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell text-xs text-slate-500 font-medium space-y-1.5">
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-indigo-400"/> <span className="text-slate-700">{person.phone || '-'}</span></div>
                        <div className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-400"/> <span className="text-slate-700">{person.proficiency || '-'}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-sky-400"/> <span className="text-slate-700">{person.duration || '-'}</span></div>
                        <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400"/> <span className="text-slate-700">{person.shoes || '-'}</span></div>
                      </td>
                      <td className="px-6 py-5">
                        {person.registrationStatus === "Waitlisted" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Waitlisted
                          </span>
                        ) : person.status === "Checked In" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            Confirmed (Pending)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 hidden sm:table-cell text-slate-600 font-medium text-sm">
                        {person.registrationStatus === "Waitlisted" ? (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/promote', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${ADMIN_PIN}`
                                  },
                                  body: JSON.stringify({ playerId: person.id, eventId: selectedEventId })
                                });
                                if (res.ok) {
                                  fetchRoster();
                                } else {
                                  const text = await res.text();
                                  alert(`Failed to promote player: ${text}`);
                                }
                              } catch (e: any) {
                                alert(`Failed to promote player: ${e.message}`);
                              }
                            }}
                            className="bg-brand-purple text-brand-yellow-light px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-purple/90 transition-colors"
                          >
                            Promote
                          </button>
                        ) : person.checkInTime ? new Date(person.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                        <button
                          onClick={async () => {
                            if (!confirm(`Are you sure you want to remove ${person.name} from this event?`)) return;
                            try {
                              const res = await fetch('/api/delete-participant', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${ADMIN_PIN}`
                                },
                                body: JSON.stringify({ playerId: person.id, eventId: selectedEventId })
                              });
                              if (res.ok) {
                                fetchRoster();
                              } else {
                                const text = await res.text();
                                alert(`Failed to remove player: ${text}`);
                              }
                            } catch (e: any) {
                              alert(`Failed to remove player: ${e.message}`);
                            }
                          }}
                          className="ml-3 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors inline-flex items-center justify-center"
                          title="Remove Participant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-black text-brand-purple mb-1">Add Player Manually</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">Force add a player to this event, bypassing limits.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsAdding(true);
              try {
                const res = await fetch('/api/admin/add-participant', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_PIN}` },
                  body: JSON.stringify({ ...addFormData, eventId: selectedEventId })
                });
                if (res.ok) {
                  setIsAddModalOpen(false);
                  setAddFormData({ name: "", email: "", phone: "" });
                  fetchRoster();
                } else {
                  const text = await res.text();
                  alert(`Failed to add player: ${text}`);
                }
              } catch (err: any) {
                alert(`Error: ${err.message}`);
              } finally {
                setIsAdding(false);
              }
            }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Full Name</label>
                <input required type="text" value={addFormData.name} onChange={e => setAddFormData({...addFormData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all font-medium text-slate-700" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Email</label>
                <input required type="email" value={addFormData.email} onChange={e => setAddFormData({...addFormData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all font-medium text-slate-700" placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Phone (Optional)</label>
                <input type="text" value={addFormData.phone} onChange={e => setAddFormData({...addFormData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all font-medium text-slate-700" placeholder="+91 9876543210" />
              </div>
              
              <button disabled={isAdding} type="submit" className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2">
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarPlus className="w-5 h-5" />}
                {isAdding ? "Adding..." : "Add to Event Roster"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsView() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [requiresPayment, setRequiresPayment] = useState(true);
  const [amount, setAmount] = useState(150);
  const [limit, setLimit] = useState(28);
  const [creating, setCreating] = useState(false);
  
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", date: "", time: "", venue: "", participantLimit: 0, requiresPayment: true, amount: 150 });

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PIN}`
        },
        body: JSON.stringify({ name, date, time, venue, requiresPayment, amount, participantLimit: limit, isActive: true })
      });
      if (res.ok) {
        setName("");
        setDate("");
        setTime("");
        setVenue("");
        setRequiresPayment(true);
        setAmount(150);
        setLimit(28);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (event: EventItem) => {
    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PIN}`
        },
        body: JSON.stringify({ id: event.id, isActive: !event.isActive })
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeedbackActive = async (event: EventItem) => {
    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PIN}`
        },
        body: JSON.stringify({ id: event.id, isFeedbackOpen: !event.isFeedbackOpen })
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async (event: EventItem) => {
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PIN}`
        },
        body: JSON.stringify({ 
          id: event.id, 
          name: editForm.name,
          date: editForm.date,
          time: editForm.time,
          venue: editForm.venue,
          requiresPayment: editForm.requiresPayment,
          amount: editForm.amount,
          participantLimit: editForm.participantLimit
        })
      });
      if (res.ok) {
        setEditingEventId(null);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (!window.confirm(`Are you sure you want to delete the event "${event.name}"?`)) return;
    try {
      await fetch(`/api/events?id=${event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ADMIN_PIN}`
        }
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      <div className="lg:col-span-1 min-w-0">
        <div className="bg-white rounded-[2rem] p-6 border border-brand-purple/10 shadow-[0_8px_30px_rgba(58,26,93,0.04)]">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <CalendarPlus className="text-brand-purple" /> Create Event
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Event Name</label>
              <input required type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sunday Morning Bash" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Date</label>
              <input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Time</label>
              <input type="text" value={time} onChange={e=>setTime(e.target.value)} placeholder="e.g. 9:00 AM - 11:00 AM" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Venue</label>
              <input type="text" value={venue} onChange={e=>setVenue(e.target.value)} placeholder="e.g. RacketHeads Arena" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1">Participant Limit</label>
              <input required type="number" value={limit || ''} onChange={e=>setLimit(e.target.value === '' ? 0 : parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-sm font-bold text-slate-500">Requires Payment</label>
              <button
                type="button"
                onClick={() => setRequiresPayment(!requiresPayment)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${requiresPayment ? 'bg-brand-purple' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${requiresPayment ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {requiresPayment && (
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Payment Amount (₹)</label>
                <input required type="number" value={amount || ''} onChange={e=>setAmount(e.target.value === '' ? 0 : parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" />
              </div>
            )}
            <button disabled={creating} type="submit" className="w-full bg-brand-purple hover:bg-[#2A1244] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-2">
              {creating ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 min-w-0">
        <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">Manage Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Event Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Date & Time</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Venue</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Limit</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Payment</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Registration</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Feedback</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center">No events found.</td></tr>
                ) : (
                  events.map(event => (
                    <tr key={event.id} className="hover:bg-slate-50/80">
                      {editingEventId === event.id ? (
                        <>
                          <td className="px-6 py-5">
                            <input type="text" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-brand-purple/20" />
                          </td>
                          <td className="px-6 py-5 space-y-2">
                            <input type="date" value={editForm.date} onChange={e=>setEditForm({...editForm, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-brand-purple/20" />
                            <input type="text" value={editForm.time} onChange={e=>setEditForm({...editForm, time: e.target.value})} placeholder="Time" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-brand-purple/20" />
                          </td>
                          <td className="px-6 py-5">
                            <input type="text" value={editForm.venue} onChange={e=>setEditForm({...editForm, venue: e.target.value})} placeholder="Venue" className="w-[120px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-brand-purple/20" />
                          </td>
                          <td className="px-6 py-5">
                            <input type="number" value={editForm.participantLimit || ''} onChange={e=>setEditForm({...editForm, participantLimit: e.target.value === '' ? 0 : parseInt(e.target.value)})} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-brand-purple/20" />
                          </td>
                          <td className="px-6 py-5 space-y-2">
                            <button
                              type="button"
                              onClick={() => setEditForm({...editForm, requiresPayment: !editForm.requiresPayment})}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.requiresPayment ? 'bg-brand-purple' : 'bg-slate-200'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.requiresPayment ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            {editForm.requiresPayment && (
                              <input type="number" value={editForm.amount || ''} onChange={e=>setEditForm({...editForm, amount: e.target.value === '' ? 0 : parseInt(e.target.value)})} placeholder="Amt" className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 font-semibold focus:ring-2 focus:ring-brand-purple/20 text-xs" />
                            )}
                          </td>
                          <td className="px-6 py-5"></td>
                          <td className="px-6 py-5"></td>
                          <td className="px-6 py-5 text-right">
                            <button onClick={() => handleEditSave(event)} className="text-emerald-600 font-bold hover:underline">Save</button>
                            <button onClick={() => setEditingEventId(null)} className="ml-3 text-slate-400 font-bold hover:underline">Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-5 font-bold text-slate-800">{event.name}</td>
                          <td className="px-6 py-5">
                            <div className="text-slate-600 font-medium">{event.date}</div>
                            {event.time && <div className="text-slate-400 text-xs mt-1">{event.time}</div>}
                          </td>
                          <td className="px-6 py-5 text-slate-600 font-medium">{event.venue || '-'}</td>
                          <td className="px-6 py-5 text-slate-600 font-medium">{event.participantLimit}</td>
                          <td className="px-6 py-5">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${event.requiresPayment ?? true ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                              {event.requiresPayment ?? true ? `₹${event.amount ?? 150}` : 'Free'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => toggleActive(event)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors w-full text-center ${
                                event.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-rose-100 hover:text-rose-700' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                              }`}
                            >
                              {event.isActive ? '🟢 Open' : '🔴 Closed'}
                            </button>
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => toggleFeedbackActive(event)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors w-full text-center ${
                                event.isFeedbackOpen ? 'bg-brand-purple/10 text-brand-purple hover:bg-rose-100 hover:text-rose-700' : 'bg-slate-100 text-slate-600 hover:bg-brand-purple/10 hover:text-brand-purple'
                              }`}
                            >
                              {event.isFeedbackOpen ? '🟢 Live' : '🔴 Closed'}
                            </button>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => {
                                setEditingEventId(event.id);
                                setEditForm({
                                  name: event.name, 
                                  date: event.date, 
                                  time: event.time || "",
                                  venue: event.venue || "",
                                  requiresPayment: event.requiresPayment ?? true,
                                  amount: event.amount ?? 150,
                                  participantLimit: event.participantLimit
                                });
                              }} className="p-2 text-slate-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-xl transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(event)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MasterDBView() {
  const [db, setDb] = useState<MasterDBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchDb = async () => {
    try {
      const res = await fetch('/api/master-db', {
        headers: { 'Authorization': `Bearer ${ADMIN_PIN}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDb(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const res = await fetch(`/api/events?t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.events.length > 0) {
        setEvents(data.events);
        setSelectedEventId(data.events[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || selectedIds.size === 0) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/admin/import-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PIN}`
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          playerIds: Array.from(selectedIds),
          sendEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setSelectedIds(new Set());
        setIsModalOpen(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === db.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(db.map(p => p.id)));
    }
  };

  const handleDeleteMaster = async (id: string, name: string) => {
    if (!window.confirm(`Are you SURE you want to completely remove ${name} from the Master Database? This will erase all their past event history.`)) return;
    
    try {
      const res = await fetch('/api/admin/delete-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_PIN}` },
        body: JSON.stringify({ playerId: id })
      });
      const data = await res.json();
      if (data.success) {
        fetchDb();
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 mb-2">
            Master Database
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Complete history of all {db.length} registered players.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs w-10 text-center">
                  <input
                    type="checkbox"
                    checked={db.length > 0 && selectedIds.size === db.length}
                    onChange={toggleAll}
                    className="w-4 h-4 text-brand-purple rounded border-slate-300 focus:ring-brand-purple"
                  />
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Player</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Contact</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">First Seen</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Events Registered</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Events Attended</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center">Loading...</td></tr>
              ) : (
                db.map(person => (
                  <tr key={person.id} className="hover:bg-slate-50/80 cursor-pointer" onClick={(e) => {
                    // Prevent double toggle if clicking the checkbox directly
                    if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
                      toggleSelection(person.id);
                    }
                  }}>
                    <td className="px-6 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(person.id)}
                        onChange={() => toggleSelection(person.id)}
                        className="w-4 h-4 text-brand-purple rounded border-slate-300 focus:ring-brand-purple"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-base">{person.name}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-slate-700 font-medium">{person.phone}</div>
                      <div className="text-slate-500 text-xs">{person.email}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-medium text-sm">
                      {new Date(person.firstSeen).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-slate-800 font-bold text-center">
                      {person.totalRegistrations}
                    </td>
                    <td className="px-6 py-5 text-emerald-600 font-bold text-center">
                      {person.eventsAttended}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMaster(person.id, person.name);
                        }}
                        title="Delete from Master DB"
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-black text-brand-purple mb-1">Import to Event</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">Select the destination event for {selectedIds.size} players.</p>
            
            <form onSubmit={handleImport} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Target Event</label>
                {events.length === 0 ? (
                  <p className="text-rose-500 text-sm font-medium px-1">No events found. Create one first.</p>
                ) : (
                  <div className="relative">
                    <select
                      required
                      value={selectedEventId}
                      onChange={e => setSelectedEventId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                    >
                      {events.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.name} ({ev.isActive ? "Active" : "Paused"})</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
              </div>
              
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-5 h-5 text-brand-purple rounded border-slate-300 focus:ring-brand-purple"
                />
                <div>
                  <div className="font-bold text-slate-800">Send Welcome Emails</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">They will receive their QR code tickets.</div>
                </div>
              </label>

              <button disabled={isImporting || events.length === 0} type="submit" className="w-full mt-2 bg-brand-purple hover:bg-[#2A1244] text-white font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                {isImporting ? "Importing..." : `Import ${selectedIds.size} Players`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryView() {
  const [items, setItems] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gallery?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !file) return;
    setAdding(true);
    try {
      let finalUrl = url;
      let finalType = "";

      if (file) {
        const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`
          },
          body: file
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Upload failed");
        }
        finalUrl = uploadData.url;
        finalType = file.type.startsWith('video/') ? 'video' : 'image';
      }

      await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`
        },
        body: JSON.stringify({ url: finalUrl, alt, type: finalType || undefined })
      });
      setUrl("");
      setAlt("");
      setFile(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Error adding media. Check console.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;
    try {
      await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`
        }
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const newItems = [...items];
    if (direction === 'left' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'right' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    } else {
      return;
    }
    
    setItems(newItems); // Optimistic UI update
    
    try {
      await fetch('/api/gallery/reorder', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PIN || "0000"}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderedIds: newItems.map(i => i.id) })
      });
    } catch (err) {
      console.error(err);
      fetchItems(); // Revert on failure
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-brand-pink" /> Add Media to Gallery
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end min-w-0">
          <div className="lg:col-span-2 min-w-0">
            <label className="block text-sm font-bold text-slate-500 mb-1">Local File (Overrides URL)</label>
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp, video/mp4, video/webm, video/quicktime, .mov, .heic"
              onChange={async (e) => {
                const selected = e.target.files ? e.target.files[0] : null;
                if (!selected) {
                  setFile(null);
                  return;
                }
                
                if (selected.name.toLowerCase().endsWith('.heic')) {
                  try {
                    setConverting(true);
                    const heic2any = (await import('heic2any')).default;
                    const convertedBlob = await heic2any({
                      blob: selected,
                      toType: "image/jpeg",
                      quality: 0.8
                    });
                    
                    const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    const newFile = new File([blobToUse], selected.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
                    setFile(newFile);
                  } catch (err) {
                    console.error("HEIC conversion error:", err);
                    alert("Failed to convert HEIC image. Please manually convert it to JPG.");
                    e.target.value = "";
                    setFile(null);
                  } finally {
                    setConverting(false);
                  }
                } else {
                  setFile(selected);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-[9px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" 
            />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <label className="block text-sm font-bold text-slate-500 mb-1">OR Media URL</label>
            <input 
              type="url" 
              value={url} 
              onChange={e=>setUrl(e.target.value)} 
              placeholder="https://..."
              disabled={!!file}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 disabled:opacity-50" 
            />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <label className="block text-sm font-bold text-slate-500 mb-1">Alt Text (Optional)</label>
            <input 
              type="text" 
              value={alt} 
              onChange={e=>setAlt(e.target.value)} 
              placeholder="e.g. Action shot"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple/20" 
            />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <button disabled={adding || converting} type="submit" className="w-full bg-brand-purple hover:bg-[#2A1244] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-50">
              {adding ? "Adding..." : converting ? "Converting..." : "Add Media"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Camera className="w-5 h-5 text-brand-purple" /> Current Gallery ({items.length})
        </h2>
        
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No media found in the gallery.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" muted loop playsInline />
                ) : (
                  <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleMove(index, 'left')}
                    disabled={index === 0}
                    className="bg-white text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-30"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="bg-white text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
                    title="Delete Media"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleMove(index, 'right')}
                    disabled={index === items.length - 1}
                    className="bg-white text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-30"
                    title="Move Right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackView() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [filterEventId, setFilterEventId] = useState<string>("ALL");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`/api/feedback?t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${ADMIN_PIN}` }
        });
        const data = await res.json();
        if (data.success) {
          setFeedbacks(data.feedbacks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const handleDeleteFeedback = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const res = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ADMIN_PIN}` }
      });
      if (res.ok) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        if (selectedFeedback?.id === id) {
          setSelectedFeedback(null);
        }
      } else {
        alert('Failed to delete feedback');
      }
    } catch (err) {
      alert('Error deleting feedback');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 mb-2">
            Player Feedback
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Insights and suggestions from {feedbacks.length} players.
          </p>
        </div>
        
        {!loading && feedbacks.length > 0 && (
          <select 
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            <option value="ALL">All Events</option>
            {Array.from(new Set(feedbacks.map(f => f.eventId).filter(Boolean))).map(id => {
              const name = feedbacks.find(f => f.eventId === id)?.eventName || id;
              return <option key={id as string} value={id as string}>{name}</option>
            })}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-bold">Loading feedbacks...</div>
        ) : feedbacks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-bold">No feedback received yet.</div>
        ) : (
          (filterEventId === "ALL" ? feedbacks : feedbacks.filter(f => f.eventId === filterEventId)).map(fb => (
            <div key={fb.id} onClick={() => setSelectedFeedback(fb)} className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-700" /> {fb.overallRating}/5
                </div>
                <div className="flex gap-2 text-right">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{fb.playerName || "Anonymous"}</div>
                    <div className="text-xs font-medium text-slate-400">
                      {new Date(fb.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteFeedback(e, fb.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors self-start"
                    title="Delete Feedback"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {fb.eventName && (
                <div className="inline-block bg-brand-purple/5 text-brand-purple text-xs font-bold px-2 py-1 rounded-md mb-3">
                  {fb.eventName}
                </div>
              )}
              
              <h3 className="font-bold text-slate-800 mb-1 truncate">"{fb.threeWords || 'No three words'}"</h3>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4">{fb.enjoyedMost || 'No comment provided.'}</p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>NPS: {fb.nps}/10</span>
                <span className="text-brand-purple group-hover:underline">Read Full Review &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedFeedback && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedFeedback(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 bg-white">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Detailed Review</h3>
            <div className="text-sm font-medium text-slate-500 mb-6 border-b border-slate-100 pb-4 flex flex-col gap-1">
              <span className="font-bold text-slate-700 text-base">Player: {selectedFeedback.playerName || "Anonymous"}</span>
              <span>Submitted on {new Date(selectedFeedback.submittedAt).toLocaleString()}</span>
              {selectedFeedback.eventName && (
                <span className="text-brand-purple font-bold">Event: {selectedFeedback.eventName}</span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Overall</div>
                  <div className="text-2xl font-black text-amber-500">{selectedFeedback.overallRating}/5</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Return</div>
                  <div className="text-2xl font-black text-emerald-500">{selectedFeedback.likelyToAttend}/10</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">NPS</div>
                  <div className="text-2xl font-black text-brand-purple">{selectedFeedback.nps}/10</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">3 Words to Describe</h4>
                <div className="bg-brand-purple/5 text-brand-purple px-4 py-3 rounded-xl font-bold text-lg">
                  "{selectedFeedback.threeWords}"
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Enjoyed Most</h4>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">{selectedFeedback.enjoyedMost || 'N/A'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Improvements</h4>
                <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">{selectedFeedback.improvements || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Issues Faced</h4>
                <p className="text-slate-600 bg-rose-50 p-4 rounded-xl">{selectedFeedback.issuesFaced || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Specific Ratings</h4>
                  <ul className="space-y-2 text-sm">
                    {Object.entries(selectedFeedback.ratings).map(([k, v]) => (
                      <li key={k} className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="capitalize text-slate-500">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-bold text-slate-800">{v as string || '-'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1 text-sm uppercase tracking-wider">Logistics</h4>
                    <ul className="text-sm space-y-1 text-slate-600">
                      <li>Matches fair: <strong className="text-slate-800">{selectedFeedback.matchesFair || '-'}</strong></li>
                      <li>Enough play: <strong className="text-slate-800">{selectedFeedback.enoughPlayTime || '-'}</strong></li>
                      <li>Duration: <strong className="text-slate-800">{selectedFeedback.durationAppropriate || '-'}</strong></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1 text-sm uppercase tracking-wider">Time Slots</h4>
                    <p className="text-sm font-bold text-slate-600">{(selectedFeedback.futureEventsWanted || []).join(', ') || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedFeedback.finalSuggestions && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Final Suggestions</h4>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">{selectedFeedback.finalSuggestions}</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
