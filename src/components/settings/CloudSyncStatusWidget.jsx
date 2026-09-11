import React, { useState, useEffect } from 'react';
import { Cloud, CloudCheck, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { syncLocalVaultToCloud } from '../../utils/cloudSyncEngine';

export default function CloudSyncStatusWidget() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(localStorage.getItem('graceos_last_cloud_sync'));

  const runSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    const result = await syncLocalVaultToCloud();
    setIsSyncing(false);
    if (result.success) {
      setLastSync(result.timestamp);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      runSync(); // நெட் வந்தவுடன் தானாக சின்க் தொடங்கும்
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono select-none">
      {/* Network Status Badge */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
        {isOnline ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <Wifi size={13} />
            <span className="text-[10px]">Online</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-rose-400">
            <WifiOff size={13} />
            <span className="text-[10px]">Local Vault</span>
          </span>
        )}
      </div>

      {/* Sync Status & Button */}
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <span className="flex items-center gap-1.5 text-cyan-400 animate-pulse">
            <RefreshCw size={13} className="animate-spin" />
            <span className="text-[10px]">Syncing...</span>
          </span>
        ) : isOnline ? (
          <button
            type="button"
            onClick={runSync}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer"
            title="Click to Force Sync"
          >
            <CloudCheck size={14} className="text-emerald-400" />
            <span className="text-[10px]">{lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}</span>
          </button>
        ) : (
          <span className="flex items-center gap-1 text-slate-500">
            <CloudOff size={14} />
            <span className="text-[10px]">Cached</span>
          </span>
        )}
      </div>
    </div>
  );
}