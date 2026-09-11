import React, { useState, useEffect, useMemo } from 'react';
import { 
  Maximize2, Minimize2, Church, Sparkles, Cake, 
  Megaphone, Heart, Clock, ChevronRight, ChevronLeft 
} from 'lucide-react';

export default function SanctuaryLiveScreen({ onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // சபை விவரங்கள்
  const churchData = JSON.parse(localStorage.getItem('graceos_main_church') || '{}');
  const churchName = churchData.churchName || 'Grace City Cathedral';
  const campusName = churchData.activeCampus || 'Main Sanctuary Hall';

  // நேரத்தை உடனுக்குடன் புதுப்பித்தல்
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // இன்றைய பிறந்தநாள் விசுவாசிகள்
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

  // ஸ்லைடுகள் தொகுப்பு (Slides Deck)
  const slides = [
    {
      id: 'welcome',
      type: 'WELCOME',
      title: 'கர்த்தராகிய இயேசு கிறிஸ்துவின் நாமத்தில் நல்வரவு!',
      sub: `${churchName} • ஞாயிறு ஆராதனை`,
      tagline: '"தேவன் ஆவியாயிருக்கிறார், அவரைத் தொழுதுகொள்ளுகிறவர்கள் ஆவியோடும் உண்மையோடும் அவரைத் தொழுதுகொள்ளவேண்டும்."'
    },
    {
      id: 'verse',
      type: 'VERSE',
      title: 'இன்றைய வாக்குத்தத்த வசனம்',
      verse: 'ஏசாயா 41:10',
      text: '"நீ பயப்படாதே, நான் உன்னுடனே இருக்கிறேன்; திகையாதே, நான் உன் தேவன்; நான் உன்னைப் பலப்படுத்தி உனக்குச் சகாயம் பண்ணுவேன்; என் நீதியின் வலதுகரத்தினால் உன்னைத் தாங்குவேன்."'
    },
    {
      id: 'birthdays',
      type: 'BIRTHDAY',
      title: 'இனிய பிறந்தநாள் & திருமண நாள் வாழ்த்துகள்! 🎂',
      people: todayBirthdays
    },
    {
      id: 'announcements',
      type: 'ANNOUNCEMENT',
      title: 'சபையின் முக்கிய அறிவிப்புகள்',
      items: [
        'வரும் வெள்ளிக்கிழமை மாலை 6:30 மணிக்கு உபவாசக் கூட்டம் நடைபெறும்.',
        'இளைஞர் ஐக்கிய கூடுகை வரும் சனிக்கிழமை மாலை 5:00 மணிக்கு தொடங்கும்.',
        'அடுத்த வாரம் ஞாயிறு ஆராதனையில் விசேஷித்த திருவிருந்து ஆராதனை நடைபெறும்.'
      ]
    }
  ];

  // தானியங்கி ஸ்லைடு சுழற்சி (Auto-Carousel: ஒவ்வொரு 8 வினாடிக்கும் மாறும்)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  // F11 / Fullscreen முறை
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
      
      {/* பின்னணி ஒளி அலங்காரம் (Ambient Background Glow) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* மேல் பட்டை: சபை விபரம் & நேரடி கடிகாரம் */}
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
              {currentTime.toLocaleDateString('ta-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
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

      {/* பிரதான ஸ்லைடு காட்சிப் பகுதி (Main Canvas Area) */}
      <main className="flex-1 flex items-center justify-center py-8 relative z-10 max-w-5xl mx-auto w-full text-center">
        
        {/* 1. வரவேற்பு ஸ்லைடு */}
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

        {/* 2. இன்றைய வாக்குத்தத்த வசனம் */}
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

        {/* 3. பிறந்தநாள் & திருமண நாள் வாழ்த்துகள் */}
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
              "கர்த்தர் உன்னை ஆசீர்வதித்து, உன்னைக் காக்கக்கடவர்!" — எண்ணாகமம் 6:24
            </p>
          </div>
        )}

        {/* 4. சபை முக்கிய அறிவிப்புகள் */}
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

      {/* கீழ் பட்டை: ஸ்லைடு சுட்டிகள் & வழிகாட்டுதல் */}
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