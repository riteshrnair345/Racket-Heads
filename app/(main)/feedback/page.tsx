'use client';

import { useState, useEffect } from 'react';
import { Loader2, Star, CheckCircle, Smile, MessageSquare, Target, Heart, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    eventId: '',
    eventName: '',
    playerName: '',
    overallRating: 0,
    likelyToAttend: -1,
    nps: -1,
    
    enjoyedMost: '',
    ratings: {
      organization: '',
      scheduling: '',
      venue: '',
      gameQuality: '',
      communityVibe: '',
      hosts: '',
      refreshments: ''
    },
    matchesFair: '',
    enoughPlayTime: '',
    durationAppropriate: '',
    
    improvements: '',
    issuesFaced: '',
    futureEventsWanted: [] as string[],
    preferredDays: [] as string[],
    
    heardFrom: '',
    addToCommunity: '',
    finalSuggestions: '',
    
    threeWords: ''
  });

  const handleRatingChange = (category: string, value: string) => {
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, [category]: value }
    });
  };

  const toggleArray = (field: 'futureEventsWanted' | 'preferredDays', value: string) => {
    const current = formData[field];
    const newArr = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    setFormData({ ...formData, [field]: newArr });
  };

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success) {
          const activeEvents = data.events.filter((e: any) => e.isFeedbackOpen);
          if (activeEvents.length > 0) {
            const activeEvent = activeEvents[0];
            setFormData(prev => ({...prev, eventId: activeEvent.id, eventName: activeEvent.name}));
          }
          setEvents(activeEvents); // Only show active events
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 4) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert("Something went wrong, please try again.");
      }
    } catch (err) {
      alert("Network error, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-[2rem] p-8 sm:p-12 text-center shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-emerald-500 fill-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Thank You!</h2>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            Thank you for being part of our very first badminton community event! 🏸 Your feedback means a lot to us and will directly shape our future events. We hope to see you back on court soon! 💙
          </p>
          <Link href="/" className="inline-block bg-brand-purple hover:bg-[#2A1244] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const renderStarRating = (value: number, onChange: (v: number) => void) => (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`p-2 transition-all ${value >= star ? 'scale-110' : 'opacity-40 hover:opacity-70 hover:scale-105'}`}
        >
          <Star className={`w-10 h-10 ${value >= star ? 'text-amber-400 fill-amber-400 drop-shadow-md' : 'text-slate-300 fill-slate-300'}`} />
        </button>
      ))}
    </div>
  );

  const renderLinearScale = (value: number, onChange: (v: number) => void) => (
    <div className="flex flex-wrap gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold transition-all ${
            value === num 
              ? 'bg-brand-purple text-white shadow-md scale-110' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  );

  const renderRadioGrid = (label: string, category: string) => (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="font-bold text-slate-700 mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">
        {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map(option => {
          const isSelected = (formData.ratings as any)[category] === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleRatingChange(category, option)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex-1 min-w-[80px] sm:flex-none ${
                isSelected
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSelectButtons = (options: string[], value: string, onChange: (v: string) => void) => (
    <div className="flex flex-wrap gap-3">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-5 py-3 rounded-xl font-bold transition-all ${
            value === option
              ? 'bg-brand-purple text-white shadow-md ring-2 ring-brand-purple ring-offset-2'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderCheckboxes = (options: string[], field: 'futureEventsWanted' | 'preferredDays') => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(option => {
        const isSelected = formData[field].includes(option);
        return (
          <label key={option} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
            isSelected ? 'border-brand-purple bg-brand-purple/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
          }`}>
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => toggleArray(field, option)}
              className="w-5 h-5 text-brand-purple rounded border-slate-300 focus:ring-brand-purple"
            />
            <span className={`font-bold ${isSelected ? 'text-brand-purple' : 'text-slate-600'}`}>{option}</span>
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-4 font-sans selection:bg-brand-purple/20">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <Link href="/" className="inline-block mb-6">
            <span className="bg-brand-yellow text-brand-purple font-black px-4 py-2 rounded-lg text-2xl transform -rotate-2 inline-block shadow-md">
              RacketHeads Kochi
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Event Feedback</h1>
          <p className="text-slate-500 mt-2 font-medium">Help us shape the future of our badminton community.</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-brand-purple' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {loadingEvents ? (
          <div className="text-center py-20 text-slate-500 font-bold flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] shadow-xl border border-slate-100 p-10">
            <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
            Loading Feedback Form...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] shadow-xl border border-slate-100 p-10">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Feedback Closed</h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              There are currently no active events accepting feedback. Please check back later!
            </p>
            <Link href="/" className="inline-block bg-brand-purple hover:bg-[#2A1244] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md">
              Return to Homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
          
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-slate-100 pb-4">
                <Smile className="w-6 h-6" />
                <h2 className="text-2xl font-black">Section 1: Overall Experience</h2>
              </div>
              
              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">Your Name (Optional)</label>
                <input 
                  type="text" 
                  value={formData.playerName}
                  onChange={(e) => setFormData({...formData, playerName: e.target.value})}
                  placeholder="Enter your name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">1. How would you rate your overall experience at today's event?</label>
                {renderStarRating(formData.overallRating, (v) => setFormData({...formData, overallRating: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">2. How likely are you to attend our next event?</label>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-2 uppercase tracking-wide">
                  <span>0 - Not likely</span>
                  <span>10 - Very likely</span>
                </div>
                {renderLinearScale(formData.likelyToAttend, (v) => setFormData({...formData, likelyToAttend: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">3. How likely are you to recommend our community to friends?</label>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-2 uppercase tracking-wide">
                  <span>0 - Not likely</span>
                  <span>10 - Very likely</span>
                </div>
                {renderLinearScale(formData.nps, (v) => setFormData({...formData, nps: v}))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-slate-100 pb-4">
                <Target className="w-6 h-6" />
                <h2 className="text-2xl font-black">Section 2: Event Experience</h2>
              </div>
              
              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">4. What did you enjoy the most about the event?</label>
                <textarea 
                  rows={3} 
                  value={formData.enjoyedMost}
                  onChange={e => setFormData({...formData, enjoyedMost: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none" 
                  placeholder="Tell us what you loved..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-slate-800 mb-2">5. How would you rate the following?</label>
                <div className="bg-slate-50/50 rounded-2xl p-4 sm:p-6 border border-slate-100">
                  {renderRadioGrid("Event organization", "organization")}
                  {renderRadioGrid("Match scheduling", "scheduling")}
                  {renderRadioGrid("Venue", "venue")}
                  {renderRadioGrid("Quality of games", "gameQuality")}
                  {renderRadioGrid("Community vibe", "communityVibe")}
                  {renderRadioGrid("Hosts/Organizers", "hosts")}
                  {renderRadioGrid("Refreshments (if applicable)", "refreshments")}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">6. Were the matches fair and balanced?</label>
                {renderSelectButtons(['Yes', 'Mostly', 'Somewhat', 'No'], formData.matchesFair, (v) => setFormData({...formData, matchesFair: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">7. Did you have enough opportunities to play?</label>
                {renderSelectButtons(['Yes', 'Mostly', 'Not really'], formData.enoughPlayTime, (v) => setFormData({...formData, enoughPlayTime: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">8. Was the duration of the event appropriate?</label>
                {renderSelectButtons(['Too Short', 'Just Right', 'Too Long'], formData.durationAppropriate, (v) => setFormData({...formData, durationAppropriate: v}))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-slate-100 pb-4">
                <RefreshCw className="w-6 h-6" />
                <h2 className="text-2xl font-black">Section 3: Improvement</h2>
              </div>
              
              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">9. What could we improve for the next event?</label>
                <textarea 
                  rows={3} 
                  value={formData.improvements}
                  onChange={e => setFormData({...formData, improvements: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none" 
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">10. Did you face any issues during the event?</label>
                <textarea 
                  rows={3} 
                  value={formData.issuesFaced}
                  onChange={e => setFormData({...formData, issuesFaced: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none" 
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">11. What kind of events would you like us to host next?</label>
                {renderCheckboxes([
                  'Social Mixers', 'Beginner Sessions', 'Intermediate Sessions', 
                  'Advanced Competitive Games', 'Tournaments', 'Coaching Sessions', 
                  'Fun Challenges', 'Corporate Events', 'Weekend League'
                ], 'futureEventsWanted')}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">12. Which days do you prefer for future events?</label>
                {renderCheckboxes([
                  'Saturday Morning', 'Saturday Evening', 'Sunday Morning', 
                  'Sunday Evening', 'Weekday Evenings'
                ], 'preferredDays')}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-slate-100 pb-4">
                <MessageSquare className="w-6 h-6" />
                <h2 className="text-2xl font-black">Section 4: Community</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">13. How did you hear about us?</label>
                {renderSelectButtons(['Instagram', 'Friend', 'WhatsApp', 'LinkedIn', 'Other'], formData.heardFrom, (v) => setFormData({...formData, heardFrom: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">14. Would you like to be added to our community for future events?</label>
                {renderSelectButtons(['Yes', 'Already a member', 'No'], formData.addToCommunity, (v) => setFormData({...formData, addToCommunity: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-800">15. Any final suggestions or message for our team?</label>
                <textarea 
                  rows={3} 
                  value={formData.finalSuggestions}
                  onChange={e => setFormData({...formData, finalSuggestions: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none" 
                />
              </div>

              <div className="space-y-4 pt-6 mt-6 border-t-2 border-dashed border-brand-yellow">
                <div className="inline-block bg-brand-yellow text-brand-purple text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">Bonus Question</div>
                <label className="block text-xl font-black text-slate-800">Describe today's event in just three words.</label>
                <input 
                  type="text"
                  value={formData.threeWords}
                  onChange={e => setFormData({...formData, threeWords: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 font-bold text-brand-purple text-center focus:outline-none focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/20 transition-all text-xl" 
                  placeholder="e.g. Fun, Energetic, Sweaty"
                />
              </div>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-slate-100 flex gap-4">
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }}
                className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
            )}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-brand-purple hover:bg-[#2A1244] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 group"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : step < 4 ? (
                <>Next Section <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Submit Feedback</>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
