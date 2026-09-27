// src/components/dashboard/CellLeaderSyncWidget.jsx
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, RefreshCw, Send, ShieldCheck, MapPin } from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function CellLeaderSyncWidget({ session }) {
  const [leaderGroup, setLeaderGroup] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const todayDate = new Date().toISOString().split('T')[0];

  // 🌟 Simulated Cell Group Families under this Leader (e.g. Bro. Ramesh - Tiruppur Group)
  const sampleGroupMembers = [
    { id: 'FAM-101', familyName: 'Bro. David Raj & Family', totalCount: 4, arrived: true, time: '08:45 AM', mode: 'Auto-GPS Sync' },
    { id: 'FAM-102', familyName: 'Sis. Mary Stella & Household', totalCount: 2, arrived: true, time: '09:02 AM', mode: 'Aura Kiosk' },
    { id: 'FAM-103', familyName: 'Bro. John Wesley & Family', totalCount: 5, arrived: false, time: '-', mode: 'Pending' },
    { id: 'FAM-104', familyName: 'Bro. Samuel & Household', totalCount: 3, arrived: true, time: '09:15 AM', mode: 'Manual Mark' },
    { id: 'FAM-105', familyName: 'Bro. Paul & Family', totalCount: 4, arrived: false, time: '-', mode: 'Pending' }
  ];

  useEffect(() => {
    async function loadGroupAttendance() {
      const stored = await getVaultData('cell_leader_sync', sampleGroupMembers);
      setLeaderGroup(Array.isArray(stored) ? stored : sampleGroupMembers);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
    loadGroupAttendance();
  }, []);

  const handleManualToggle = async (id) => {
    soundFX?.playClickPop?.();
    const updated = leaderGroup.map(item => {
      if (item.id === id) {
        const nextState = !item.arrived;
        return {
          ...item,
          arrived: nextState,
          time: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          mode: nextState ? 'Manual Leader Override' : 'Pending'
        };
      }
      return item;
    });
    setLeaderGroup(updated);
    await setVaultData('cell_leader_sync', updated, true);
  };

  const handleLiveCloudSync = () => {
    setIsSyncing(true);
    soundFX?.playClickPop?.();
    setTimeout(async () => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      // Auto-fallback logic simulation
    }, 1200);
  };

  const arrivedCount = leaderGroup.filter(m => m.arrived).length;
  const totalFamilies = leaderGroup.length;

  return (
    <div className="p-5 win11-card rounded-2xl border border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
            <Users size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cell Leader Live Sync Panel</h4>
            <p className="text-[10px] text-slate-400">Group Leader: <strong className="text-amber-400">Bro. Ramesh (Tiruppur Cluster)</strong></p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLiveCloudSync}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition"
        >
          <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
          <span>{isSyncing ? 'Syncing...' : `Synced @ ${lastSyncTime}`}</span>
        </button>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300 uppercase font-mono block">Arrived Families</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{arrivedCount} / {totalFamilies}</span>
          </div>
          <CheckCircle className="text-emerald-400" size={20} />
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-300 uppercase font-mono block">Auto-Sync Status</span>
            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active P2P Cloud
            </span>
          </div>
          <ShieldCheck className="text-amber-400" size={20} />
        </div>
      </div>

      {/* Group Members List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {leaderGroup.map((family) => (
          <div 
            key={family.id}
            className={`p-3 rounded-xl border flex items-center justify-between transition ${
              family.arrived 
                ? 'bg-emerald-500/5 border-emerald-500/30' 
                : 'bg-black/30 border-white/5 opacity-75'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{family.familyName}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                  family.arrived ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {family.mode}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Souls: {family.totalCount} • Arrival Time: <strong className="text-slate-200">{family.time}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleManualToggle(family.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                family.arrived 
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
              }`}
            >
              {family.arrived ? 'Present ✓' : 'Mark Arrived'}
            </button>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-500 text-center border-t border-white/5 pt-2 flex items-center justify-center gap-1">
        <MapPin size={11} />
        <span>Background auto-fallback marks unconfirmed arrivals post 12:00 PM service closure.</span>
      </div>
    </div>
  );
}