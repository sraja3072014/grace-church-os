import React, { useState, useEffect, useMemo } from 'react';
import { 
  Maximize2, Minimize2, Church, Sparkles, Cake, 
  Megaphone, Heart, Clock, ChevronRight, ChevronLeft 
} from 'lucide-react';

export default function SanctuaryLiveScreen({ onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Church Details
  const churchData = JSON.parse(localStorage.getItem('graceos_main_church') || '{}');
  const churchName = churchData.churchName || 'Grace City Cathedral';
  const campusName = churchData.activeCampus || 'Main Sanctuary Hall';

  // Real-time Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's Birthday Celebrations
  const todayBirthdays = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      const families = raw ? JSON.parse(raw) : [];
      const todayMonthDay = new Date().toISOString().slice(5, 10);
      const bdays = [];

      families.forEach(fam => {
        if (fam.headMember?.dob?.endsWith(todayMonthDay)) {
          bdays.push({ name: fam.headMember.name, family: fam.familyName });
        }
        (fam.members || []).forEach(m => {
          if (m.dob?.endsWith(todayMonthDay)) {
            bdays.push({ name: m.name, family: fam.familyName });
          }
        });
      });

      return bdays.length > 0 ? bdays : [
        { name: 'Bro. Joshua Samuel', family: 'Samuel Household' },
        { name: 'Sis. Esther Rani', family: 'David Paulraj Household' }
      ];
    } catch {
      return [];
    }
  }, []);

  // Slides Deck
  const slides = [
    {
      id: 'welcome',
      type: 'WELCOME',
      title: 'Welcome in the Precious Name of Jesus Christ!',
      sub: `${churchName} • Sunday Worship Service`,
      tagline: '"God is spirit, and his worshipers must worship in the Spirit and in truth." — John 4:24'
    },
    {
      id: 'verse',
      type: 'VERSE',
      title: "Today's Promise Verse",
      verse: 'Isaiah 41:10',
      text: '"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."'
    },
    {
      id: 'birthdays',
      type: 'BIRTHDAY',
      title: 'Happy Birthday & Wedding Anniversary Wishes! 🎂',
      people: todayBirthdays
    },
    {
      id: 'announcements',
      type: 'ANNOUNCEMENT',
      title: 'Weekly Announcements & Ministry Updates',
      items: [
        'Special Fasting Prayer meeting will be held this Friday at 6:30 PM.',
        'Youth Fellowship gathering will commence this Saturday at 5:00 PM.',
        'Next Sunday worship service will feature Holy Communion.'
      ]
    }
  ];

  // Auto-Carousel (rotates every 8 seconds)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  // Fullscreen Mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activeSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col justify-between p-8 sm:p-12 select-none overflow-hidden font-sans">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar: Church Details & Live Clock */}
      <header className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xl">
            <Church size={30} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-amber-400 leading-tight">
              {churchName}
            </h1>
            <span className="text-xs sm:text-sm text-slate-300 font-mono tracking-wide">
              {campusName} • Live Worship Display
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right font-mono">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-amber-300/80 font-semibold">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Toggle Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 flex items-center justify-center py-8 relative z-10 max-w-5xl mx-auto w-full text-center">
        
        {/* 1. Welcome Slide */}
        {activeSlide.type === 'WELCOME' && (
          <div className="space-y-6 animate-in zoom-in-95 duration-700">
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
              <Sparkles size={32} />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              {activeSlide.title}
            </h2>
            <h3 className="text-xl sm:text-2xl text-amber-300 font-semibold">
              {activeSlide.sub}
            </h3>
            <p className="text-base sm:text-lg text-slate-300 italic max-w-3xl mx-auto pt-4 leading-relaxed">
              {activeSlide.tagline}
            </p>
          </div>
        )}

        {/* 2. Scripture Promise Verse */}
        {activeSlide.type === 'VERSE' && (
          <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl">
            <span className="text-sm sm:text-base font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activeSlide.title}
            </span>
            <p className="text-3xl sm:text-5xl font-bold text-white leading-relaxed italic drop-shadow-md">
              {activeSlide.text}
            </p>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              — {activeSlide.verse}
            </div>
          </div>
        )}

        {/* 3. Birthday & Anniversary Wishes */}
        {activeSlide.type === 'BIRTHDAY' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 w-full">
            <div className="flex items-center justify-center gap-3 text-amber-400">
              <Cake size={36} />
              <h2 className="text-3xl sm:text-5xl font-black text-white">
                {activeSlide.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
              {activeSlide.people.map((b, idx) => (
                <div 
                  key={idx} 
                  className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-amber-500/30 shadow-2xl space-y-2"
                >
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 truncate">
                    {b.name}
                  </div>
                  <div className="text-sm text-slate-300 font-medium font-mono">
                    {b.family}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-slate-400 text-sm sm:text-base italic pt-2">
              "The Lord bless you and keep you!" — Numbers 6:24
            </p>
          </div>
        )}

        {/* 4. Church Announcements */}
        {activeSlide.type === 'ANNOUNCEMENT' && (
          <div className="space-y-8 animate-in fade-in duration-700 w-full max-w-3xl">
            <div className="flex items-center justify-center gap-3 text-rose-400">
              <Megaphone size={32} />
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                {activeSlide.title}
              </h2>
            </div>

            <div className="space-y-4 text-left pt-2">
              {activeSlide.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-4 text-base sm:text-lg font-medium text-slate-200"
                >
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-sm">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer: Slide Indicators & Navigation */}
      <footer className="flex items-center justify-between border-t border-white/10 pt-6 relative z-10">
        <span className="text-xs text-slate-500 font-mono">
          GraceOS Sanctuary Display Engine • Fullscreen (F11)
        </span>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === idx 
                  ? 'w-8 bg-amber-400' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>

    </div>
  );
}