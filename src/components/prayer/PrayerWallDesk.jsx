import React, { useState } from 'react';
import { 
  HeartHandshake, Sparkles, CheckCircle2, 
  Clock, ShieldAlert, Share2, Plus, MessageSquare 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function PrayerWallDesk() {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ANSWERED'
  const [prayers, setPrayers] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_prayer_wall_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'PR-2601',
          requester: 'Sis. Mary Stella',
          category: 'HEALING', // 'HEALING' | 'JOB' | 'FAMILY' | 'SPIRITUAL'
          request: 'மருத்துவப் பரிசோதனை முடிவுகள் சாதகமாக வரவும், பூரண சுகத்திற்காகவும் ஜெபிக்கவும்.',
          isPrivate: false,
          date: '2026-09-08',
          status: 'PENDING', // 'PENDING' | 'ANSWERED'
          praiseReport: ''
        },
        {
          id: 'PR-2602',
          requester: 'Bro. Joshua Raj',
          category: 'JOB',
          request: 'புதிய வேலைக்கான நேர்முகத் தேர்வில் கர்த்தருடைய கிருபை கிடைக்க ஜெபிக்கவும்.',
          isPrivate: false,
          date: '2026-09-02',
          status: 'ANSWERED',
          praiseReport: 'கர்த்தர் நல்ல MNC நிறுவனத்தில் வேலை தந்து ஆசீர்வதித்தார்! ஸ்தோத்திரம்.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [newPrayer, setNewPrayer] = useState({
    requester: '',
    category: 'HEALING',
    request: '',
    isPrivate: false
  });

  const savePrayers = (list) => {
    setPrayers(list);
    localStorage.setItem('graceos_prayer_wall_db', JSON.stringify(list));
  };

  const handleAddPrayer = (e) => {
    e.preventDefault();
    if (!newPrayer.request || !newPrayer.requester) return;

    soundFX?.playSuccessChime?.();
    const item = {
      id: `PR-${Date.now().toString().slice(-4)}`,
      requester: newPrayer.requester,
      category: newPrayer.category,
      request: newPrayer.request,
      isPrivate: newPrayer.isPrivate,
      date: new Date().toISOString().slice(0, 10),
      status: 'PENDING',
      praiseReport: ''
    };

    savePrayers([item, ...prayers]);
    setNewPrayer({ requester: '', category: 'HEALING', request: '', isPrivate: false });
  };

  const markAsAnswered = (id) => {
    soundFX?.playSuccessChime?.();
    const testimony = prompt('பதில் கிடைத்ததற்கான சாட்சி / ஸ்தோத்திரக் குறிப்பை உள்ளிடவும்:');
    if (testimony === null) return;

    const updated = prayers.map((p) =>
      p.id === id ? { ...p, status: 'ANSWERED', praiseReport: testimony || 'ஜெபம் கேட்கப்பட்டது!' } : p
    );
    savePrayers(updated);
  };

  const filteredPrayers = prayers.filter((p) => {
    if (filter === 'PENDING') return p.status === 'PENDING';
    if (filter === 'ANSWERED') return p.status === 'ANSWERED';
    return true;
  });

  const categoryColors = {
    HEALING: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    JOB: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    FAMILY: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    SPIRITUAL: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Intercessory Prayer Wall & Testimonies</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Prayer Desk
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            விசுவாசிகளின் ஜெபத் தேவைகளைத் தொகுத்து மன்றாடும் மற்றும் தேவனுடைய பதில்களைப் பதிவு செய்யும் பலகை.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filter === 'ALL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            அனைத்தும் ({prayers.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filter === 'PENDING' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ஜெபத்தில் (Pending)
          </button>
          <button
            onClick={() => setFilter('ANSWERED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filter === 'ANSWERED' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            சாட்சிகள் (Answered)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* புதிய ஜெபக் குறிப்பு படிவம் */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Plus size={15} className="text-rose-400" />
            <span>புதிய ஜெபக் குறிப்பு சேர்த்தல்</span>
          </h4>

          <form onSubmit={handleAddPrayer} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">விசுவாசி பெயர்</label>
              <input
                type="text"
                value={newPrayer.requester}
                onChange={(e) => setNewPrayer({ ...newPrayer, requester: e.target.value })}
                placeholder="எ.கா: Bro. Samuel"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பிரிவு (Category)</label>
              <select
                value={newPrayer.category}
                onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
              >
                <option value="HEALING">சுகம் / சுகவீனம் (Healing)</option>
                <option value="JOB">வேலை / தொழில் (Job & Business)</option>
                <option value="FAMILY">குடும்ப சமாதானம் (Family Peace)</option>
                <option value="SPIRITUAL">ஆவிக்குரிய வளர்ச்சி (Spiritual)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஜெப விண்ணப்பம்</label>
              <textarea
                value={newPrayer.request}
                onChange={(e) => setNewPrayer({ ...newPrayer, request: e.target.value })}
                placeholder="ஜெபத் தேவையை இங்கே உள்ளிடவும்..."
                rows={3}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400 resize-none"
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={newPrayer.isPrivate}
                onChange={(e) => setNewPrayer({ ...newPrayer, isPrivate: e.target.checked })}
                className="rounded border-white/20 bg-slate-950 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <span>போதகருக்கு மட்டும் (Confidential / Private)</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
            >
              விண்ணப்பத்தைப் பதிவு செய்
            </button>
          </form>
        </div>

        {/* ஜெப அட்டைகள் பட்டியல் */}
        <div className="lg:col-span-2 space-y-3">
          {filteredPrayers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-white/5 space-y-1">
              <HeartHandshake size={32} className="mx-auto opacity-30" />
              <p className="text-xs">இந்த பிரிவில் ஜெபக் குறிப்புகள் எதுவும் இல்லை.</p>
            </div>
          ) : (
            filteredPrayers.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-3xl border transition space-y-3 ${
                  item.status === 'ANSWERED'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-900 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{item.requester}</h4>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                      {item.isPrivate && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Private
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{item.date}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    item.status === 'ANSWERED' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-amber-500/15 text-amber-300'
                  }`}>
                    {item.status === 'ANSWERED' ? '✓ ஜெபம் கேட்கப்பட்டது' : '⏳ மன்றாட்டில்'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.request}
                </p>

                {/* சாட்சிப் பகுதி (Testimony Box) */}
                {item.praiseReport && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                      <Sparkles size={12} /> சாட்சி / ஸ்தோத்திரம்:
                    </span>
                    <p className="text-[11px] leading-relaxed italic">{item.praiseReport}</p>
                  </div>
                )}

                {/* Bottom Action */}
                {item.status === 'PENDING' && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => markAsAnswered(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>பதில் கிடைத்தது என மாற்று</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}