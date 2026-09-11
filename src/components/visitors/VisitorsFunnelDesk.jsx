import React, { useState, useMemo } from 'react';
import { 
  UserPlus, MessageSquare, PhoneCall, CheckCircle2, 
  Clock, Heart, UserCheck, ArrowRight, Sparkles 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function VisitorsFunnelDesk() {
  const [visitors, setVisitors] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_visitors_database');
      return raw ? JSON.parse(raw) : [
        {
          id: 'VIS-2601',
          name: 'Bro. Daniel Raj',
          phone: '+91 98401 66778',
          area: 'Tambaram',
          invitedBy: 'Bro. David Paul',
          stage: 'FIRST_VISIT', // 'FIRST_VISIT' | 'CONTACTED' | 'PRAYER_MEET' | 'COMMITTED'
          visitDate: '2026-09-06',
          notes: 'Looking for youth fellowship'
        },
        {
          id: 'VIS-2602',
          name: 'Sis. Mercy Priya',
          phone: '+91 98401 99887',
          area: 'Velachery',
          invitedBy: 'Sister Hepzibah',
          stage: 'CONTACTED',
          visitDate: '2026-08-30',
          notes: 'Requested prayer for family peace'
        }
      ];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    invitedBy: '',
    notes: ''
  });

  const saveVisitors = (updatedList) => {
    setVisitors(updatedList);
    localStorage.setItem('graceos_visitors_database', JSON.stringify(updatedList));
  };

  const handleAddVisitor = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    soundFX?.playSuccessChime?.();
    const newVisitor = {
      id: `VIS-${Date.now().toString().slice(-4)}`,
      name: form.name,
      phone: form.phone,
      area: form.area || 'City',
      invitedBy: form.invitedBy || 'Self Walk-in',
      stage: 'FIRST_VISIT',
      visitDate: new Date().toISOString().slice(0, 10),
      notes: form.notes
    };

    saveVisitors([newVisitor, ...visitors]);
    setForm({ name: '', phone: '', area: '', invitedBy: '', notes: '' });
  };

  const handleAdvanceStage = (visitorId) => {
    soundFX?.playClickPop?.();
    const stages = ['FIRST_VISIT', 'CONTACTED', 'PRAYER_MEET', 'COMMITTED'];
    const updated = visitors.map(v => {
      if (v.id === visitorId) {
        const currIdx = stages.indexOf(v.stage);
        const nextStage = currIdx < stages.length - 1 ? stages[currIdx + 1] : v.stage;
        return { ...v, stage: nextStage };
      }
      return v;
    });
    saveVisitors(updated);
  };

  const handleSendWelcome = (visitor) => {
    soundFX?.playClickPop?.();
    const cleanPhone = visitor.phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = 
`🕊️ *சபைக்கு உங்களை அன்போடு வரவேற்கிறோம்!* 🕊️\nஅன்பான ${visitor.name},\nஇன்றைய ஆராதனையில் எங்களோடு இணைந்து தேவனைத் துதித்தமைக்கு மிக்க நன்றி!\n\n_"கர்த்தர் உங்களை ஆசீர்வதிப்பாராக."_\n\nஎங்கள் ஐக்கியத்தில் தொடர்ந்திருங்கள். ஏதேனும் ஜெபத் தேவைகள் இருப்பின் தயங்காமல் தெரியப்படுத்துங்கள்.\n\nஅன்புடன்,\n*போதகர் & சபை ஊழியர்கள்*`;

    window.open(`https://web.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const stageLabels = {
    FIRST_VISIT: { label: 'முதல் வருகை (1st Visit)', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    CONTACTED: { label: 'தொடர்பு கொள்ளப்பட்டது (Called)', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    PRAYER_MEET: { label: 'வீட்டு ஜெப கூடுகை (Cottage Prayer)', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    COMMITTED: { label: 'சபை உறுப்பினர் நிலை (Committed)', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Visitors Follow-up & Assimilation Funnel</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Active Registry
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            புதிய விசிட்டர்களை பதிவு செய்து, அவர்களை சபையின் நிரந்தர அங்கத்துவ நிலைக்கு உயர்த்தும் தளம்.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
          Total Visitors: <strong className="text-emerald-400">{visitors.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: புதிய விசிட்டர் சேர்க்கும் படிவம் */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <UserPlus size={15} className="text-amber-400" />
            <span>புதிய விசிட்டர் சேர்க்கை (Quick Onboarding)</span>
          </h4>

          <form onSubmit={handleAddVisitor} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">முழு பெயர்</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="எ.கா: Bro. Samuel"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">மொபைல் எண்</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98401 00000"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பகுதி (Area)</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="Tambaram"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">அழைத்தவர்</label>
                <input
                  type="text"
                  value={form.invitedBy}
                  onChange={(e) => setForm({ ...form, invitedBy: e.target.value })}
                  placeholder="David"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஜெபக் குறிப்பு / குறிப்புகள்</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="குடும்ப சமாதானத்திற்காக..."
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              விசிட்டரைப் பதிவு செய்
            </button>
          </form>
        </div>

        {/* வலதுபுறம்: கவனிப்பு நிலைப் பட்டியல் (Follow-up Cards) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Clock size={15} className="text-cyan-400" />
              <span>விசிட்டர் கவனிப்பு முன்னேற்றம் (Assimilation Status)</span>
            </h4>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3 hover:border-white/10 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white">{visitor.name}</h5>
                      <span className="text-[9px] font-mono text-slate-400">({visitor.id})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {visitor.phone} • {visitor.area} (அழைத்தவர்: {visitor.invitedBy})
                    </p>
                    {visitor.notes && (
                      <p className="text-[10px] text-amber-300/80 italic mt-1">
                        "{visitor.notes}"
                      </p>
                    )}
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${stageLabels[visitor.stage]?.color}`}>
                    {stageLabels[visitor.stage]?.label}
                  </span>
                </div>

                {/* Actions & Next Stage */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendWelcome(visitor)}
                      className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      <span>Welcome WA</span>
                    </button>

                    <a
                      href={`tel:${visitor.phone}`}
                      className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl transition cursor-pointer"
                    >
                      <PhoneCall size={12} />
                    </a>
                  </div>

                  {visitor.stage !== 'COMMITTED' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStage(visitor.id)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>அடுத்த நிலை</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}