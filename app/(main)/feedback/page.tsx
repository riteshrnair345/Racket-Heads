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
    preferredAreas: [] as string[],
    
    heardFrom: '',
    addToCommunity: '',
    finalSuggestions: '',
    
    threeWords: '', // legacy
    dynamicQuestion: '',
    dynamicAnswer: '',
    otherAreaText: ''
  });

  const handleRatingChange = (category: string, value: string) => {
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, [category]: value }
    });
  };

  const toggleArray = (field: 'futureEventsWanted' | 'preferredDays' | 'preferredAreas', value: string) => {
    const current = formData[field];
    const newArr = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    setFormData({ ...formData, [field]: newArr });
  };

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  const [customQuestionText, setCustomQuestionText] = useState('WHICH AREA IN THE CITY WOULD YOU PREFER FOR OUR FUTURE EVENTS?');
  const [customQuestionOptions, setCustomQuestionOptions] = useState(['KAKKANAD/TRIKKAKARA', 'THAMMANAM', 'KALOOR / KADAVANTHRA / KATHRIKADAVU', 'TRIPUNITHURA']);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const [evRes, settingsRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/feedback/settings')
        ]);
        
        const data = await evRes.json();
        if (data.success) {
          const activeEvents = data.events.filter((e: any) => e.isFeedbackOpen);
          if (activeEvents.length > 0) {
            const activeEvent = activeEvents[0];
            setFormData(prev => ({...prev, eventId: activeEvent.id, eventName: activeEvent.name}));
          }
          setEvents(activeEvents);
        }

        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setCustomQuestionText(settingsData.settings.customQuestionText);
          setCustomQuestionOptions(settingsData.settings.customQuestionOptions);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchData();
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
      const finalPreferredAreas = formData.preferredAreas.map(area => 
        area === 'Other' && formData.otherAreaText.trim() !== '' ? formData.otherAreaText.trim() : area
      );

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preferredAreas: finalPreferredAreas
        })
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
      <div className="flex-grow flex items-center justify-center p-4 py-16 selection:bg-brand-pink/20">
        <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(58,26,93,0.08)] border border-brand-purple/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow" />
          <div className="w-20 h-20 bg-brand-pink/15 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-pink/30">
            <Heart className="w-10 h-10 text-brand-pink fill-brand-pink" />
          </div>
          <span className="text-[11px] uppercase font-black tracking-widest text-brand-pink px-3 py-1 rounded-full bg-brand-pink/10 inline-block mb-3">
            Feedback Received
          </span>
          <h2 className="text-3xl font-black text-brand-purple mb-3 tracking-tight">Thank You!</h2>
          <p className="text-brand-purple/75 text-sm sm:text-base mb-8 leading-relaxed font-medium">
            Thank you for being part of {formData.eventName ? `our ${formData.eventName} session` : 'our badminton community session'}! 🏸 Your insights directly help us curate better matchups, timings, and court experiences.
          </p>
          <Link href="/" className="inline-flex items-center justify-center bg-brand-purple hover:bg-[#2A1244] text-brand-yellow-light font-bold py-4 px-8 rounded-full transition-all shadow-md hover:shadow-lg text-sm sm:text-base">
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
          className={`p-2 transition-all ${value >= star ? 'scale-110' : 'opacity-35 hover:opacity-75 hover:scale-105'}`}
        >
          <Star className={`w-9 h-9 sm:w-10 sm:h-10 ${value >= star ? 'text-amber-400 fill-amber-400 drop-shadow-md' : 'text-slate-300 fill-slate-300'}`} />
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
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full font-bold text-xs sm:text-sm transition-all ${
            value === num 
              ? 'bg-brand-purple text-brand-yellow-light shadow-md scale-110 ring-2 ring-brand-purple/30' 
              : 'bg-brand-purple/[0.04] text-brand-purple/70 hover:bg-brand-purple/10 border border-brand-purple/10'
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  );

  const renderRadioGrid = (label: string, category: string) => (
    <div className="py-3.5 border-b border-brand-purple/5 last:border-0">
      <div className="font-extrabold text-sm sm:text-base text-brand-purple mb-2.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map(option => {
          const isSelected = (formData.ratings as any)[category] === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleRatingChange(category, option)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex-1 min-w-[70px] sm:flex-none ${
                isSelected
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-white border border-slate-200'
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
    <div className="flex flex-wrap gap-2.5">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
            value === option
              ? 'bg-brand-purple text-white shadow-md ring-2 ring-brand-purple/20 ring-offset-2'
              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderCheckboxes = (options: string[], field: 'futureEventsWanted' | 'preferredDays' | 'preferredAreas') => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {options.map(option => {
        const isSelected = formData[field].includes(option);
        return (
          <label key={option} className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${
            isSelected ? 'border-brand-purple bg-brand-purple/[0.06] shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-white'
          }`}>
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => toggleArray(field, option)}
              className="w-4 h-4 text-brand-purple rounded border-brand-purple/30 focus:ring-brand-purple"
            />
            <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-brand-purple' : 'text-slate-700'}`}>{option}</span>
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="flex-grow flex flex-col relative z-10 py-10 sm:py-16 px-4 selection:bg-brand-pink/20">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="text-[11px] uppercase font-black tracking-widest text-brand-pink px-3.5 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 inline-block mb-3.5">
            Player Survey
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-purple tracking-tight mb-2">Event Feedback</h1>
          <p className="text-brand-purple/70 font-medium text-sm sm:text-base">Help us shape the future of our badminton community in Kochi.</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2.5 mt-8 max-w-md mx-auto">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  step >= i 
                    ? 'bg-gradient-to-r from-brand-purple to-brand-pink' 
                    : 'bg-brand-purple/10'
                }`} 
              />
            ))}
          </div>
        </div>

        {loadingEvents ? (
          <div className="text-center py-20 text-brand-purple/70 font-bold flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-brand-purple/10 p-10">
            <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
            <span>Loading Feedback Form...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-brand-purple/10 p-8 sm:p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-brand-purple/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-purple/10">
              <CheckCircle className="w-8 h-8 text-brand-purple/40" />
            </div>
            <h2 className="text-2xl font-black text-brand-purple mb-2 tracking-tight">Feedback Closed</h2>
            <p className="text-brand-purple/70 text-sm mb-6 leading-relaxed font-medium">
              There are currently no active events accepting feedback. Please check back after the upcoming weekend session!
            </p>
            <Link href="/" className="inline-block bg-brand-purple hover:bg-[#2A1244] text-brand-yellow-light font-bold py-3.5 px-7 rounded-full transition-all text-sm shadow-sm">
              Return to Homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(58,26,93,0.06)] border border-brand-purple/10 animate-in fade-in zoom-in-95 duration-300">
          
          {step === 1 && (
            <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-brand-purple/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/15 text-brand-pink flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Section 1: Overall Experience</h2>
                  <span className="text-xs text-brand-purple/60 font-medium">Your general feel for the event</span>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">Your Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.playerName}
                  onChange={(e) => setFormData({...formData, playerName: e.target.value})}
                  placeholder="Enter your name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all text-sm sm:text-base shadow-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">1. How would you rate your overall experience at {formData.eventName ? formData.eventName : 'our event'}?</label>
                {renderStarRating(formData.overallRating, (v) => setFormData({...formData, overallRating: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">2. How likely are you to attend our next event?</label>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-2 uppercase tracking-wide">
                  <span>0 - Not likely</span>
                  <span>10 - Very likely</span>
                </div>
                {renderLinearScale(formData.likelyToAttend, (v) => setFormData({...formData, likelyToAttend: v}))}
              </div>

              <div className="space-y-4">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">3. How likely are you to recommend our community to friends?</label>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-2 uppercase tracking-wide">
                  <span>0 - Not likely</span>
                  <span>10 - Very likely</span>
                </div>
                {renderLinearScale(formData.nps, (v) => setFormData({...formData, nps: v}))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/15 text-brand-pink flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Section 2: Event Experience</h2>
                  <span className="text-xs text-slate-500 font-medium">Ratings and match opportunities</span>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">4. What did you enjoy the most about the event?</label>
                <textarea 
                  rows={3} 
                  value={formData.enjoyedMost}
                  onChange={e => setFormData({...formData, enjoyedMost: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all resize-none text-sm sm:text-base shadow-sm" 
                  placeholder="Tell us what you loved..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">5. How would you rate the following?</label>
                <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200">
                  {renderRadioGrid("Event organization", "organization")}
                  {renderRadioGrid("Match scheduling", "scheduling")}
                  {renderRadioGrid("Venue", "venue")}
                  {renderRadioGrid("Quality of games", "gameQuality")}
                  {renderRadioGrid("Community vibe", "communityVibe")}
                  {renderRadioGrid("Hosts/Organizers", "hosts")}
                  {renderRadioGrid("Refreshments", "refreshments")}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">6. Were the matches fair and balanced?</label>
                {renderSelectButtons(['Yes', 'Mostly', 'Somewhat', 'No'], formData.matchesFair, (v) => setFormData({...formData, matchesFair: v}))}
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">7. Did you have enough opportunities to play?</label>
                {renderSelectButtons(['Yes', 'Mostly', 'Not really'], formData.enoughPlayTime, (v) => setFormData({...formData, enoughPlayTime: v}))}
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">8. Was the duration of the event appropriate?</label>
                {renderSelectButtons(['Too Short', 'Just Right', 'Too Long'], formData.durationAppropriate, (v) => setFormData({...formData, durationAppropriate: v}))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/15 text-brand-pink flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Section 3: Improvement</h2>
                  <span className="text-xs text-slate-500 font-medium">Suggestions and preferred timings</span>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">9. What could we improve for the next event?</label>
                <textarea 
                  rows={3} 
                  value={formData.improvements}
                  onChange={e => setFormData({...formData, improvements: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all resize-none text-sm sm:text-base shadow-sm" 
                  placeholder="Tell us where we can do better..."
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">10. Did you face any issues during the event?</label>
                <textarea 
                  rows={3} 
                  value={formData.issuesFaced}
                  onChange={e => setFormData({...formData, issuesFaced: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all resize-none text-sm sm:text-base shadow-sm" 
                  placeholder="Any hiccups, court issues, or confusion?"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">11. What time slot would be most convenient for you?</label>
                {renderCheckboxes([
                  '9-11am', '10am-12pm', '4-6pm', '5-7pm', '6-8pm'
                ], 'futureEventsWanted')}
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">12. Which days do you prefer for future events?</label>
                {renderCheckboxes([
                  'Saturday Morning', 'Saturday Evening', 'Sunday Morning', 
                  'Sunday Evening', 'Weekday Evenings'
                ], 'preferredDays')}
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">13. {customQuestionText}</label>
                {renderCheckboxes([...customQuestionOptions, 'Other'], 'preferredAreas')}
                {formData.preferredAreas.includes('Other') && (
                  <input 
                    type="text"
                    placeholder="Please specify"
                    value={formData.otherAreaText}
                    onChange={e => setFormData({...formData, otherAreaText: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all text-sm mt-2 shadow-sm"
                  />
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center gap-3 text-brand-purple mb-2 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/15 text-brand-pink flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Section 4: Community</h2>
                  <span className="text-xs text-slate-500 font-medium">Outreach & final notes</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">14. How did you hear about us?</label>
                {renderSelectButtons(['Instagram', 'Friend', 'WhatsApp', 'LinkedIn', 'Other'], formData.heardFrom, (v) => setFormData({...formData, heardFrom: v}))}
              </div>

              <div className="space-y-2.5">
                <label className="block text-sm sm:text-base font-extrabold text-brand-purple">15. Any final suggestions or message for our team?</label>
                <textarea 
                  rows={3} 
                  value={formData.finalSuggestions}
                  onChange={e => setFormData({...formData, finalSuggestions: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple focus:bg-white transition-all resize-none text-sm sm:text-base shadow-sm" 
                  placeholder="Drop a note for the organizers..."
                />
              </div>

            </div>
          )}

          <div className="mt-10 pt-6 border-t border-brand-purple/10 flex gap-4">
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-extrabold text-brand-purple bg-brand-purple/[0.06] hover:bg-brand-purple/10 border border-brand-purple/10 transition-all text-sm sm:text-base"
              >
                Back
              </button>
            )}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-brand-purple hover:bg-[#2A1244] text-brand-yellow-light font-extrabold py-3.5 sm:py-4 px-6 rounded-2xl transition-all shadow-[0_10px_25px_-5px_rgba(58,26,93,0.3)] hover:shadow-lg flex justify-center items-center gap-2 group text-sm sm:text-base"
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
