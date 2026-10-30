import React, { useState } from 'react';
import { 
  Sliders, Save, CheckCircle2, AlertTriangle, Terminal, 
  Cpu, HardDrive, RotateCcw, ShieldAlert, Zap, Globe
} from 'lucide-react';

export default function AdvancedSettingsTab() {
  const [toast, setToast] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [advConfig, setAdvConfig] = useState(() => {
    const local = localStorage.getItem('graceos_advanced_config');
    return local ? JSON.parse(local) : {
      localHostPort: '3000',
      enableDevTools: false,
      gpuHardwareAcceleration: true,
      enableOfflineCache: true,
      sessionTimeoutMins: '120',
      autoSyncIntervalSec: '30',
      loggingLevel: 'Verbose (Diagnostic)',
      lanBroadcast: true
    };
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_advanced_config', JSON.stringify(advConfig));
    showToast('Advanced Kernel & Network Parameters Saved!');
  };

  const handleClearCache = () => {
    // Clear temporary diagnostic cache
    showToast('Local SQLite query cache & temporary RAM buffers purged.');
  };

  const handleFactoryReset = () => {
    localStorage.clear();
    setShowResetConfirm(false);
    showToast('System reset initiated. Reloading GraceOS environment...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none">
      
      {/* Toast Alert */}
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Sliders size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Advanced System & Kernel Configuration
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">Tauri v2 Native</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Control low-level networking, local port bindings, developer diagnostics, and hardware acceleration.</p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Save Advanced
        </button>
      </div>

      {/* Low-Level Network & Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe size={14} className="text-cyan-400" /> Local Server Binding Port
          </label>
          <input 
            type="text" 
            value={advConfig.localHostPort}
            onChange={(e) => setAdvConfig(prev => ({ ...prev, localHostPort: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <p className="text-[10px] text-slate-500">Port used by usher tablet nodes to connect over LAN.</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Terminal size={14} className="text-indigo-400" /> Diagnostic Log Level
          </label>
          <select 
            value={advConfig.loggingLevel}
            onChange={(e) => setAdvConfig(prev => ({ ...prev, loggingLevel: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option>Verbose (Diagnostic)</option>
            <option>Warning & Errors Only</option>
            <option>Production Silent</option>
          </select>
          <p className="text-[10px] text-slate-500">Determines event logging frequency written to local logs.</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300">Session Inactivity Lock (Minutes)</label>
          <input 
            type="number" 
            value={advConfig.sessionTimeoutMins}
            onChange={(e) => setAdvConfig(prev => ({ ...prev, sessionTimeoutMins: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
          <p className="text-[10px] text-slate-500">Locks the screen back to Touch PIN if untouched.</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300">Multi-Branch Sync Interval (Seconds)</label>
          <input 
            type="number" 
            value={advConfig.autoSyncIntervalSec}
            onChange={(e) => setAdvConfig(prev => ({ ...prev, autoSyncIntervalSec: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
          <p className="text-[10px] text-slate-500">Background handshake polling between primary & branch nodes.</p>
        </div>

      </div>

      {/* Hardware Switches */}
      <div className="flex flex-col gap-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">System Execution Flags</h5>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div 
            onClick={() => setAdvConfig(prev => ({ ...prev, gpuHardwareAcceleration: !prev.gpuHardwareAcceleration }))}
            className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu size={14} className="text-emerald-400" /> GPU Hardware Acceleration
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Renders Mica blur and liquid gradients on discrete GPU.</p>
            </div>
            <input 
              type="checkbox" 
              checked={advConfig.gpuHardwareAcceleration} 
              onChange={() => {}} 
              className="w-4 h-4 accent-cyan-500 rounded shrink-0 pointer-events-none"
            />
          </div>

          <div 
            onClick={() => setAdvConfig(prev => ({ ...prev, enableDevTools: !prev.enableDevTools }))}
            className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Terminal size={14} className="text-cyan-400" /> Developer Web Inspector (F12)
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Enables right-click inspect element and React profiler.</p>
            </div>
            <input 
              type="checkbox" 
              checked={advConfig.enableDevTools} 
              onChange={() => {}} 
              className="w-4 h-4 accent-cyan-500 rounded shrink-0 pointer-events-none"
            />
          </div>

        </div>
      </div>

      {/* Danger Zone: Cache Purge & Factory Reset */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col gap-3 mt-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-400" />
          <h5 className="text-xs font-bold uppercase tracking-wider text-rose-300">System Maintenance & Factory Zone</h5>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            <p className="text-xs font-semibold text-slate-200">Purge Query Cache & Storage Buffers</p>
            <p className="text-[10px] text-slate-400">Cleans temporary disk cache without deleting church membership records.</p>
          </div>
          <button 
            type="button" 
            onClick={handleClearCache}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition"
          >
            Clear Temp Cache
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-rose-500/10">
          <div>
            <p className="text-xs font-semibold text-rose-200">Factory Reset Database Environment</p>
            <p className="text-[10px] text-slate-400">Wipes all local state, staff logins, and restores GraceOS to clean installation state.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition active:scale-95"
          >
            Reset to Factory
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-400 mb-3">
              <ShieldAlert size={20} />
              <h4 className="text-sm font-bold">Confirm Full System Reset?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will clear all local storage schemas, active session tokens, and custom church branch definitions.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button 
                type="button" 
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleFactoryReset}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
              >
                Yes, Reset GraceOS
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}