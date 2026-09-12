import React, { useState, useMemo } from 'react';
import { 
  Building2, MapPin, Users, DollarSign, 
  TrendingUp, CheckCircle2, ChevronRight, Activity, Globe, Shield 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function MultiCampusHQDesk({ session }) {
  const [selectedCampusId, setSelectedCampusId] = useState('ALL');

  // 1. சபைகளின் கிளைப் பட்டியல் (Main & Branch Campuses)
  const campuses = [
    {
      id: 'CAMPUS-HQ',
      name: 'Grace Central Cathedral (Headquarters)',
      type: 'MAIN_CAMPUS',
      city: 'City Center Campus',
      pastor: 'Rev. Senior Pastor',
      phone: '+91 98765 43210',
      status: 'ACTIVE'
    },
    {
      id: 'CAMPUS-EAST',
      name: 'Grace City Youth & Revival Center',
      type: 'BRANCH_CAMPUS',
      city: 'East Wing / Tambaram',
      pastor: 'Pastor David Paul',
      phone: '+91 98401 22334',
      status: 'ACTIVE'
    },
    {
      id: 'CAMPUS-SOUTH',
      name: 'Grace Outreach Fellowship Chapel',
      type: 'MISSION_PLANT',
      city: 'South Suburb / Koduvai',
      pastor: 'Pastor Joshua Stephen',
      phone: '+91 98401 55667',
      status: 'GROWING'
    }
  ];

  // 2. உள்ளூர் தரவுகளிலிருந்து கேம்பஸ் வாரியான புள்ளிவிவரங்களை எடுத்தல்
  const campusAnalytics = useMemo(() => {
    try {
      const rawMembers = localStorage.getItem('app_members_family_database');
      const rawFinance = localStorage.getItem('app_finance_transactions_ledger');
      const families = rawMembers ? JSON.parse(rawMembers) : [];
      const finances = rawFinance ? JSON.parse(rawFinance) : [];

      // குடும்பங்களின் கேம்பஸ் வாரியான பிரிப்பு
      const totalMembers = families.reduce((acc, f) => acc + 1 + (f.members?.length || 0), 0);
      const totalOffering = finances.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      return {
        totalCampuses: campuses.length,
        totalSouls: totalMembers,
        totalFinance: totalOffering,
        activePlants: campuses.filter(c => c.type === 'BRANCH_CAMPUS' || c.type === 'MISSION_PLANT').length
      };
    } catch {
      return { totalCampuses: 3, totalSouls: 0, totalFinance: 0, activePlants: 2 };
    }
  }, [campuses]);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Globe className="text-cyan-400" size={24} />
            <span>Multi-Campus Network Executive HQ Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Synod Level
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            தலைமைச் சபை மற்றும் கிளைச் சபைகளின் ஒட்டுமொத்த ஆவிக்குரிய வளர்ச்சி மற்றும் நிதி மேற்பார்வை.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl">
            {campusAnalytics.totalCampuses} கேம்பஸ்கள் இணைக்கப்பட்டுள்ளன
          </span>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[10px] text-slate-400 block uppercase">மொத்த விசுவாசிகள்</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">{campusAnalytics.totalSouls} Souls</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <span className="text-[10px] block uppercase">ஒருங்கிணைந்த நிதி வரவு</span>
          <div className="text-2xl font-black mt-1 font-sans">₹ {campusAnalytics.totalFinance.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
          <span className="text-[10px] block uppercase">கிளை ஆலயங்கள்</span>
          <div className="text-2xl font-black mt-1 font-sans">{campusAnalytics.activePlants} Branches</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          <span className="text-[10px] block uppercase">நெட்வொர்க் நிலை</span>
          <div className="text-base font-black mt-1 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Synced</span>
          </div>
        </div>
      </div>

      {/* கேம்பஸ்கள் விரிவான அட்டைப் பட்டியல் */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
          <span className="font-bold text-white uppercase tracking-wider">
            அனைத்து கேம்பஸ் மையங்கள் ({campuses.length})
          </span>
          <span className="text-slate-400">Headquarters Control Node</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campuses.map((camp) => {
            const isHQ = camp.type === 'MAIN_CAMPUS';

            return (
              <div
                key={camp.id}
                className={`p-5 rounded-3xl border transition space-y-4 ${
                  isHQ
                    ? 'bg-slate-900 border-cyan-500/40 shadow-xl shadow-cyan-500/5'
                    : 'bg-slate-900 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-cyan-400">
                    <Building2 size={20} />
                  </div>

                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isHQ 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {camp.type === 'MAIN_CAMPUS' ? 'HEADQUARTERS' : 'BRANCH CHURCH'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white leading-tight">{camp.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono">
                    <MapPin size={12} className="text-rose-400 shrink-0" />
                    <span>{camp.city}</span>
                  </p>
                </div>

                <div className="space-y-1.5 text-xs font-mono bg-slate-950/80 p-3 rounded-2xl border border-white/5">
                  <div className="text-slate-300">
                    போதகர்: <strong className="text-amber-300">{camp.pastor}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    தொடர்பு: {camp.phone}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Cloud Node Live</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX?.playClickPop?.();
                      alert(`${camp.name} கிளைச் சபையின் நேரலை கட்டுப்பாட்டுக்குள் நுழைகிறீர்கள்.`);
                    }}
                    className="text-cyan-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer transition"
                  >
                    <span>Inspect Desk</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}