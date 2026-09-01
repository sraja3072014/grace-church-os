import React, { useState } from 'react';
import { Smartphone, QrCode, RefreshCw, Wifi, ShieldCheck, CheckCircle2, Copy, Key } from 'lucide-react';

export default function MobileSyncTab() {
  const [toast, setToast] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [syncConfig, setSyncConfig] = useState(() => {
    const local = localStorage.getItem('graceos_mobile_sync');
    return local ? JSON.parse(local) : {
      localIp: '192.168.1.105',
      port: '3000',
      connectedDevices: 4,
      lastSync: 'Just now',
      encryptionKey: 'GRACE-NODE-AES-2026-X948'
    };
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const updated = { ...syncConfig, lastSync: new Date().toLocaleTimeString() };
      setSyncConfig(updated);
      localStorage.setItem('graceos_mobile_sync', JSON.stringify(updated));
      showToast('Handshake complete! All usher tablets synchronized.');
    }, 1200);
  };

  const handleGenerateNewKey = () => {
    const newKey = `GRACE-NODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;
    const updated = { ...syncConfig, encryptionKey: newKey };
    setSyncConfig(updated);
    localStorage.setItem('graceos_mobile_sync', JSON.stringify(updated));
    showToast('New Security Encryption Token Generated!');
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`http://${syncConfig.localIp}:${syncConfig.port}`);
    showToast('LAN Server Endpoint copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl relative select-none">
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              GraceOS Mobile Companion Node
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">LAN Online</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Wirelessly connect usher scan tablets and pastor mobile handsets over local Wi-Fi.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleGenerateNewKey}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition"
          >
            <Key size={13} /> New Token
          </button>
          
          <button 
            type="button"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All Tablets'}</span>
          </button>
        </div>
      </div>

      {/* Pairing Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center justify-center gap-3">
          <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
            <QrCode size={110} className="text-slate-900" />
          </div>
          <span className="text-[11px] text-cyan-300 font-mono font-bold">Scan to Pair Usher App</span>
        </div>

        <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between gap-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Local Network Configuration</h5>
          
          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Server Endpoint:</span>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold">http://{syncConfig.localIp}:{syncConfig.port}</span>
                <button onClick={handleCopyEndpoint} className="text-slate-400 hover:text-white"><Copy size={13} /></button>
              </div>
            </div>
            
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Security Handshake:</span>
              <span className="text-emerald-400 font-bold">{syncConfig.encryptionKey}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
            <span>Connected Devices: <strong className="text-white">{syncConfig.connectedDevices} Active Nodes</strong></span>
            <span>Last Sync: <strong className="text-slate-300">{syncConfig.lastSync}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}