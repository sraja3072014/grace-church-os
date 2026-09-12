import React, { useState, useMemo } from 'react';
import { 
  Heart, Utensils, Gift, Sparkles, Calendar, 
  CheckCircle2, DollarSign, ArrowRight, ShieldCheck, History 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function MemberSponsorshipPledge({ userSession }) {
  const memberName = userSession?.username || userSession?.name || 'Believer Family';
  const memberPhone = userSession?.phone || '';

  const [form, setForm] = useState({
    cause: 'FELLOWSHIP_MEALS', // 'FELLOWSHIP_MEALS' | 'TRUST_KIDS' | 'ALTAR_FLOWERS' | 'BENEVOLENCE'
    mode: 'IN_KIND', // 'IN_KIND' | 'DIRECT_FUND'
    frequency: 'ONE_TIME', // 'ONE_TIME' | 'MONTHLY_RECURRING'
    targetDate: '',
    amountEstimate: '',
    occasion: ''
  });

  const [submitted, setSubmitted] = useState(false);

  // இந்த விசுவாசி ஏற்கெனவே செய்துள்ள ஸ்பான்சர்ஷிப்கள்
  const myPledges = useMemo(() => {
    try {
      const raw = localStorage.getItem('graceos_fellowship_sponsorships_db');
      const list = raw ? JSON.parse(raw) : [];
      return list.filter(item => 
        item.sponsorName?.toLowerCase().includes(memberName.toLowerCase()) ||
        (memberPhone && item.phone === memberPhone)
      );
    } catch {
      return [];
    }
  }, [memberName, memberPhone, submitted]);

  const handlePledgeSubmit = (e) => {
    e.preventDefault();
    if (!form.targetDate) return;
    soundFX?.playSuccessChime?.();

    const newPledge = {
      id: `FSP-${Date.now().toString().slice(-3)}`,
      cause: form.cause,
      sponsorName: memberName,
      phone: memberPhone,
      frequency: form.frequency,
      mode: form.mode,
      targetDate: form.targetDate,
      amountEstimate: Number(form.amountEstimate) || 0,
      occasion: form.occasion || 'Thanksgiving',
      status: 'CONFIRMED'
    };

    // 1. முதன்மை ஸ்பான்சர்ஷிப் லெட்ஜரில் சேமித்தல்
    try {
      const raw = localStorage.getItem('graceos_fellowship_sponsorships_db');
      const list = raw ? JSON.parse(raw) : [];
      localStorage.setItem('graceos_fellowship_sponsorships_db', JSON.stringify([newPledge, ...list]));
    } catch (err) {
      console.error(err);
    }

    // 2. Direct Fund ஆக இருந்தால் சபை நிதி லெட்ஜரிலும் வரவு வைத்தல்
    if (form.mode === 'DIRECT_FUND' && Number(form.amountEstimate) > 0) {
      try {
        const rawFinance = localStorage.getItem('app_finance_transactions_ledger');
        const ledger = rawFinance ? JSON.parse(rawFinance) : [];
        const newReceipt = {
          id: `REC-MBR-${Date.now().toString().slice(-4)}`,
          date: form.targetDate,
          category: `ஸ்பான்சர்ஷிப் (${form.cause === 'FELLOWSHIP_MEALS' ? 'அன்பு விருந்து' : 'டிரஸ்ட் உதவி'})`,
          amount: Number(form.amountEstimate),
          donor: `${memberName} (${form.occasion || 'Thanksgiving'})`
        };
        localStorage.setItem('app_finance_transactions_ledger', JSON.stringify([newReceipt, ...ledger]));
      } catch (err) {
        console.error(err);
      }
    }

    setSubmitted(true);
    setForm({
      cause: 'FELLOWSHIP_MEALS',
      mode: 'IN_KIND',
      frequency: 'ONE_TIME',
      targetDate: '',
      amountEstimate: '',
      occasion: ''
    });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const causeOptions = [
    { id: 'FELLOWSHIP_MEALS', label: 'ஞாயிறு அன்பு விருந்து (Love Feast)', icon: Utensils, desc: 'ஆராதனை முடிந்ததும் சபை விசுவாசிகளுக்கு மதிய உணவு' },
    { id: 'TRUST_KIDS', label: 'டிரஸ்ட் குழந்தைகள் உதவி (Kids Gifts)', icon: Gift, desc: 'ஆதரவற்ற குழந்தைகள் கல்வி, உடை மற்றும் உணவு உதவி' },
    { id: 'ALTAR_FLOWERS', label: 'பலிபீட மலர் அலங்காரம் (Altar Flowers)', icon: Sparkles, desc: 'ஞாயிறு ஆராதனை பலிபீட மலர் சேவை' },
    { id: 'BENEVOLENCE', label: 'ஏழைகள் நற்பணி உதவி (Poor Aid)', icon: Heart, desc: 'மருத்துவ மற்றும் விசேஷ ஏழை எளியோர் ஆதரவு' }
  ];

  return (
    <div className="space-y-6 max-w-4xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span>Fellowship & Thanksgiving Sponsorship</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
            Member Desk
          </span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          உங்கள் பிறந்தநாள், திருமண நாள் மற்றும் குடும்ப நன்மைகளுக்காக அன்பு விருந்து அல்லது டிரஸ்ட் உதவிகளை இங்கு முன்பதிவு செய்யலாம்.
        </p>
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in zoom-in-95">
          <CheckCircle2 size={18} />
          <span>உங்கள் ஸ்தோத்திர பங்களிப்பு வெற்றிகரமாகப் பதிவு செய்யப்பட்டது! ஞாயிறு ஆராதனையில் விசேஷ ஜெபம் செய்யப்படும்.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: முன்பதிவு படிவம் */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Heart size={15} className="text-rose-400" />
            <span>புதிய பங்களிப்பைத் தேர்வு செய்க</span>
          </h4>

          <form onSubmit={handlePledgeSubmit} className="space-y-4">
            
            {/* Cause Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {causeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.cause === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, cause: opt.id })}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-lg shadow-rose-500/10'
                        : 'bg-slate-950/70 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon size={16} className={isSelected ? 'text-rose-400' : 'text-slate-500'} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-200">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mode & Frequency Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">வழங்கும் முறை (Mode)</label>
                <select
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="IN_KIND">நாங்களே சமைத்து/வாங்கித் தருகிறோம் (In-Kind)</option>
                  <option value="DIRECT_FUND">சபைக் கணக்கிற்கு நிதியுதவி (Direct Fund)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">அதிர்வெண் (Frequency)</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="ONE_TIME">ஒருமுறை மட்டும் (One-Time)</option>
                  <option value="MONTHLY_RECURRING">மாதந்தோறும் (Monthly)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">விருப்பத் தேதி (Date)</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">தோராய மதிப்பு (₹ Estimate)</label>
                <input
                  type="number"
                  value={form.amountEstimate}
                  onChange={(e) => setForm({ ...form, amountEstimate: e.target.value })}
                  placeholder="₹ 5000"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">காரணம் / நிகழ்வு (Occasion)</label>
              <input
                type="text"
                value={form.occasion}
                onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                placeholder="எ.கா: 10-வது திருமண நாள் ஸ்தோத்திரம் / குழந்தையின் பிறந்தநாள்"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-rose-500/20 active:scale-95"
            >
              <span>பங்களிப்பை உறுதிசெய்க (Pledge Offering)</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* வலதுபுறம்: விசுவாசியின் முந்தைய பங்களிப்புகள் */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <History size={15} className="text-amber-400" />
            <span>உங்கள் பங்களிப்புகள் ({myPledges.length})</span>
          </h4>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {myPledges.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs font-mono">
                தாங்கள் இன்னும் எந்தப் பங்களிப்பையும் முன்பதிவு செய்யவில்லை.
              </div>
            ) : (
              myPledges.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white block">{item.occasion || 'Thanksgiving'}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                    <span>{item.targetDate}</span>
                    <span className="text-amber-400 font-bold">
                      {item.amountEstimate ? `₹ ${item.amountEstimate.toLocaleString()}` : 'In-Kind'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}