import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, MapPin, Users, DollarSign, 
  TrendingUp, CheckCircle2, ChevronRight, Activity, Globe, Shield, Phone 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';

export default function MultiCampusHQDesk({ session }) {
  const [selectedCampusId, setSelectedCampusId] = useState('ALL');
  const [activeInspectCampus, setActiveInspectCampus] = useState(null);
  const [campuses, setCampuses] = useState([
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
  ]);

  const [membersCount, setMembersCount] = useState(0);
  const [financeTotal, setFinanceTotal] = useState(0);

  useEffect(() => {
    async function loadHQData() {
      const [dbBranches, dbMembers, dbFinance] = await Promise.all([
        getVaultData('branches', []),
        getVaultData('members', []),
        getVaultData('finance', [])
      ]);

      if (Array.isArray(dbBranches) && dbBranches.length > 0) {
        const formatted = dbBranches.map(b => ({
          id: b.code || `CAMPUS-${b.id}`,
          name: b.name,
          type: (b.code === 'GCC-MAIN' || b.id === 1) ? 'MAIN_CAMPUS' : 'BRANCH_CAMPUS',
          city: b.location || 'Branch Locality',
          pastor: b.pastor || 'Campus Pastor',
          phone: b.phone || '+91 98400 00000',
          status: 'ACTIVE'
        }));
        setCampuses(formatted);
      }

      const totalSouls = (dbMembers || []).reduce((acc, f) => acc + 1 + (f.members?.length || 0), 0);
      const totalGiving = (dbFinance || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      setMembersCount(totalSouls);
      setFinanceTotal(totalGiving);
    }
    loadHQData();
  }, []);

  const activePlantsCount = useMemo(() => {
    return campuses.filter(c => c.type === 'BRANCH_CAMPUS' || c.type === 'MISSION_PLANT').length;
  }, [campuses]);

  const handleInspect = (camp) => {
    soundFX?.playClickPop?.();
    setActiveInspectCampus(camp);
  };

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
            Consolidated spiritual analytics, pastoral oversight, and unified treasury telemetry across all church plants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl">
            {campuses.length} Campuses Synchronized
          </span>
        </div>
      </div>

      {/* Network Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Congregation</span>
          <div className="text-2xl font-black text-white mt-1 font-sans">{membersCount.toLocaleString()} Souls</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <span className="text-[10px] block uppercase font-bold">Consolidated Giving</span>
          <div className="text-2xl font-black mt-1 font-sans">₹ {financeTotal.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
          <span className="text-[10px] block uppercase font-bold">Branch Campuses</span>
          <div className="text-2xl font-black mt-1 font-sans">{activePlantsCount} Active Plants</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          <span className="text-[10px] block uppercase font-bold">Network Standing</span>
          <div className="text-base font-black mt-1 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Synced</span>
          </div>
        </div>
      </div>

      {/* Campuses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
          <span className="font-bold text-white uppercase tracking-wider">
            All Church Campus Centers ({campuses.length})
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
                    {camp.type === 'MAIN_CAMPUS' ? 'HEADQUARTERS' : 'BRANCH CAMPUS'}
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
                    Pastor in Charge: <strong className="text-amber-300">{camp.pastor}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Direct Contact: {camp.phone}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Vault Node Live</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleInspect(camp)}
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

      {/* Campus Inspection Modal */}
      {activeInspectCampus && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-cyan-400" />
                <h4 className="text-sm font-bold text-white">{activeInspectCampus.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveInspectCampus(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Campus Identifier</span>
                <span className="text-cyan-300 font-bold">{activeInspectCampus.id} ({activeInspectCampus.type})</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Assigned Minister</span>
                <span className="text-white font-bold">{activeInspectCampus.pastor}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Physical Location</span>
                <span className="text-slate-200">{activeInspectCampus.city}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Telemetry Status</span>
                <span className="text-emerald-400 font-bold">✓ Direct Physical Disk Vault Mirror Active</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveInspectCampus(null)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}