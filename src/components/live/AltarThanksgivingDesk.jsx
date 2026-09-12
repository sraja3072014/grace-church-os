import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Printer, Calendar, Heart, 
  Utensils, Gift, MessageSquare, CheckCircle2, Share2 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function AltarThanksgivingDesk({ session }) {
  const [targetSunday, setTargetSunday] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // ஸ்பான்சர்ஷிப் மற்றும் ஸ்தோத்திரத் தரவுகள்
  const thanksgivingItems = useMemo(() => {
    try {
      const raw = localStorage.getItem('graceos_fellowship_sponsorships_db');
      const list = raw ? JSON.parse(raw) : [];
      // குறிப்பிட்ட ஞாயிறு அல்லது அதற்கு முந்தைய வாரத்தில் பதிவு செய்யப்பட்டவை
      return list.filter(item => item.targetDate === targetSunday || !targetSunday);
    } catch {
      return [];
    }
  }, [targetSunday]);

  // வாட்ஸ்அப் வழியாக போதகரின் அறிவிப்பு பட்டியலை அனுப்புதல்
  const handleShareToPastor = () => {
    soundFX?.playClickPop?.();
    let text = `🕊️ *GRACE CATHEDRAL - SUNDAY ALTAR THANKSGIVING LIST*\n`;
    text += `📅 *ஆராதனைத் தேதி:* ${targetSunday}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (thanksgivingItems.length === 0) {
      text += `இன்றைய தேதியில் சிறப்பு ஸ்தோத்திரப் பதிவுகள் ஏதுமில்லை.\n`;
    } else {
      thanksgivingItems.forEach((item, index) => {
        text += `${index + 1}. *${item.sponsorName}*\n`;
        text += `   • நோக்கம்: ${item.occasion || 'Thanksgiving Offering'}\n`;
        text += `   • பிரிவு: ${item.cause === 'FELLOWSHIP_MEALS' ? 'அன்பு விருந்து (Love Feast)' : item.cause === 'TRUST_KIDS' ? 'டிரஸ்ட் குழந்தைகள் உதவி' : 'பலிபீட மலர் அலங்காரம்'}\n`;
        text += `   • வகை: ${item.mode === 'IN_KIND' ? 'உணவாக / பொருளாக' : 'சபைக் காணிக்கை'}\n\n`;
      });
    }

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_போதகரின் மேடை விசேஷ ஆசீர்வாத ஜெபத்திற்காக சமர்ப்பிக்கப்படுகிறது._`;

    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Altar Thanksgiving & Sponsorship Podium Slip</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Podium Prompt
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ஞாயிறு ஆராதனையில் போதகர் மேடையில் வாசித்து ஆசீர்வதிப்பதற்கான ஸ்தோத்திர & அன்புவிருந்து விபரங்கள்.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="date"
            value={targetSunday}
            onChange={(e) => setTargetSunday(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none cursor-pointer"
          />

          <button
            type="button"
            onClick={handleShareToPastor}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95"
          >
            <Share2 size={13} />
            <span>Share to Pastor</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* 🌟 Printable Altar Podium Reading Slip */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl print:bg-white print:text-slate-950 print:border-none print:shadow-none">
        
        {/* Title Header */}
        <div className="border-b-2 border-amber-500/40 print:border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white print:text-slate-950 uppercase tracking-wide">
              Grace Cathedral - Altar Announcements
            </h2>
            <p className="text-xs text-amber-400 print:text-slate-700 font-semibold">
              விசேஷ ஸ்தோத்திரக் காணிக்கையாளர்கள் & அன்பு விருந்து ஸ்பான்சர்ஷிப் பட்டியல்
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 print:text-slate-800 bg-slate-950 print:bg-slate-100 px-3 py-1 rounded-xl border border-white/10">
            தேதி: {targetSunday}
          </span>
        </div>

        {/* Thanksgiving Family Cards */}
        {thanksgivingItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 print:text-slate-400 font-mono text-xs">
            தேர்வு செய்யப்பட்ட தேதியில் விசேஷ ஸ்தோத்திரப் பதிவுகள் எதுவும் இல்லை.
          </div>
        ) : (
          <div className="space-y-4">
            {thanksgivingItems.map((item, idx) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/70 print:bg-slate-50 border border-white/5 print:border-slate-300 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 print:bg-slate-200 print:text-slate-900 text-xs font-bold flex items-center justify-center font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white print:text-slate-950">{item.sponsorName}</h4>
                      <p className="text-xs font-semibold text-amber-400 print:text-amber-800 mt-0.5">
                        {item.occasion || 'குடும்ப ஸ்தோத்திரம்'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/10 print:border-slate-400 text-slate-300 print:text-slate-800 uppercase font-bold shrink-0">
                    {item.cause === 'FELLOWSHIP_MEALS' ? 'அன்பு விருந்து' : item.cause === 'TRUST_KIDS' ? 'டிரஸ்ட் உதவி' : 'பலிபீட அலங்காரம்'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 print:text-slate-600 pt-2 border-t border-white/5 print:border-slate-200">
                  <span>வழங்கும் முறை: <strong className="text-slate-200 print:text-slate-900">{item.mode === 'IN_KIND' ? 'உணவாக / பொருட்களாக வழங்கப்படுகிறது' : 'சபைக் கணக்கில் செலுத்தப்பட்டது'}</strong></span>
                  {item.phone && <span>தொடர்பு: {item.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blessing Footer for Pulpit */}
        <div className="pt-6 border-t border-white/10 print:border-slate-300 text-center space-y-1">
          <p className="text-xs font-bold text-slate-300 print:text-slate-800 italic">
            &ldquo;உற்சாகமாய்க் கொடுக்கிறவனிடத்தில் தேவன் பிரியமாயிருக்கிறார்.&rdquo; — 2 கொரிந்தியர் 9:7
          </p>
          <span className="text-[10px] text-slate-500 print:text-slate-600 font-mono block">
            Certified & Verified by Church Office
          </span>
        </div>

      </div>

    </div>
  );
}