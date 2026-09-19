import React, { useState, useEffect } from 'react';
import { Cloud, Key, CheckCircle2, AlertCircle, RefreshCw, Save, Database, ShieldCheck } from 'lucide-react';

export default function CloudSyncConfigTab() {
  const [toast, setToast] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const [config, setConfig] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_supabase_config');
      return local ? JSON.parse(local) : {
        supabaseUrl: '',
        supabaseAnonKey: '',
        supabaseServiceKey: '',
        bucketName: 'graceos-vault-backups',
        autoSyncIntervalMins: 15,
        enableRealtimeSync: true
      };
    } catch {
      return {
        supabaseUrl: '',
        supabaseAnonKey: '',
        supabaseServiceKey: '',
        bucketName: 'graceos-vault-backups',
        autoSyncIntervalMins: 15,
        enableRealtimeSync: true
      };
    }
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_supabase_config', JSON.stringify(config));
    showToast('Supabase Cloud Credentials Saved to Local Vault!');
  };

  const handleTestConnection = async () => {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      showToast('Please enter both Supabase Project URL and API Key.');
      return;
    }

    setIsTesting(true);
    setConnectionStatus(null);

    try {
      const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
      const testEndpoint = `${cleanUrl}/rest/v1/members?select=*&limit=1`;

      const res = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'apikey': config.supabaseAnonKey.trim(),
          'Authorization': `Bearer ${config.supabaseAnonKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok || res.status === 200 || res.status === 206) {
        setConnectionStatus({ success: true, message: 'Connected successfully to Supabase Node!' });
        showToast('Supabase Live Handshake Successful! ✓');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP Error ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      setConnectionStatus({ 
        success: false, 
        message: `Handshake failed: ${err.message}. Check your Anon Key.` 
      });
      showToast('Cloud Handshake Failed.');
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none text-slate-100">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl win11-card border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Cloud size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Supabase & Cloud Vault Configuration
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                PostgreSQL + Storage
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect your church cloud instance for automatic multi-branch database relay and secure offsite snapshots.
            </p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <Save size={14} />
          <span>Save Cloud Node</span>
        </button>
      </div>

      {/* Connection Status Banner */}
      {connectionStatus && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
          connectionStatus.success 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          {connectionStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{connectionStatus.message}</span>
        </div>
      )}

      {/* API Key Inputs */}
      <div className="p-5 rounded-2xl win11-card border border-white/10 space-y-4">
        <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
          <Key size={14} />
          <span>Supabase Gateway Credentials</span>
        </h5>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Project URL <span className="text-rose-400">*</span>
            </label>
            <input 
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={config.supabaseUrl}
              onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Project Anon / Public API Key <span className="text-rose-400">*</span>
            </label>
            <input 
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={config.supabaseAnonKey}
              onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Storage Bucket ID (For .godb Snapshots)
              </label>
              <input 
                type="text"
                placeholder="graceos-vault-backups"
                value={config.bucketName}
                onChange={(e) => setConfig({ ...config, bucketName: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Auto Sync Interval (Minutes)
              </label>
              <input 
                type="number"
                min="5"
                max="120"
                value={config.autoSyncIntervalMins}
                onChange={(e) => setConfig({ ...config, autoSyncIntervalMins: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Click to test TLS handshake with Supabase server.
          </span>
          <button 
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Verifying...' : 'Test Connection'}</span>
          </button>
        </div>
      </div>

    </form>
  );
}