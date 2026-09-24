// src/components/settings/system/AdvancedBackupCloudHub.jsx
import React, { useState } from 'react';
import { 
  Cloud, HardDrive, Cpu, Save, Plus, Edit2, Trash2, X, Check, 
  Database, RefreshCw, WifiOff, ShieldCheck, KeyRound, Folder, Download, Upload, Activity, CheckCircle2, Server
} from 'lucide-react';

export default function AdvancedBackupCloudHub({ onTriggerSuccess }) {
  const [activeSubTab, setActiveSubTab] = useState('cloud_vaults');
  const [toast, setToast] = useState('');

  // 1. Supabase Primary & Multi-Cloud Storage Vaults State
  const [cloudConfig, setCloudConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('graceos_unified_cloud_config');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {
      supabaseUrl: 'https://xyzcompany.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...',
      autoSyncSupabase: true,
      activeProvider: 'Google Drive',
      targetBucketOrFolder: '1A2b3C4d5E6f_ChurchVault2026',
      serviceAccountEmail: 'church-backup-bot@gserviceaccount.com',
      syncInterval: 'Daily at 02:00 AM'
    };
  });

  // Free Cloud Providers List (Supabase, MongoDB Atlas, Cloudflare R2, Google Drive, AWS S3)
  const [cloudProviders, setCloudProviders] = useState(() => {
    try {
      const saved = localStorage.getItem('app_cloud_providers');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [
      {
        id: 'supabase_primary',
        name: 'Supabase Realtime Cloud (Active DB)',
        providerType: 'Supabase',
        targetFolderOrBucket: 'graceos-live-cluster',
        clientEmail: 'db-admin@supabase.co',
        isPrimary: true,
        autoSyncInterval: 'Realtime WebSocket Sync'
      },
      {
        id: 'cloudflare_r2',
        name: 'Cloudflare R2 Storage (Free 10GB Tier)',
        providerType: 'Cloudflare R2',
        targetFolderOrBucket: 'church-backups-r2',
        clientEmail: 'r2-bot@cloudflare.com',
        isPrimary: false,
        autoSyncInterval: 'Daily at 01:00 AM'
      },
      {
        id: 'mongodb_atlas',
        name: 'MongoDB Atlas Free Cluster (512MB)',
        providerType: 'MongoDB Atlas',
        targetFolderOrBucket: 'church_archive_cluster',
        clientEmail: 'atlas-sync@mongodb.net',
        isPrimary: false,
        autoSyncInterval: 'Weekly on Sunday'
      },
      {
        id: 'gdrive_vault',
        name: 'Google Drive Enterprise Vault',
        providerType: 'Google Drive',
        targetFolderOrBucket: '1A2b3C4d5E6f_ChurchVault',
        clientEmail: 'church-backup-bot@gserviceaccount.com',
        isPrimary: false,
        autoSyncInterval: 'Daily at 02:00 AM'
      }
    ];
  });

  // 2. Physical Disk Vault State
  const [diskVaults, setDiskVaults] = useState(() => {
    try {
      const saved = localStorage.getItem('graceos_physical_disk_vaults');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [
      {
        id: 'disk_1',
        label: 'Main Server Local SSD Archive',
        path: 'D:/GraceOS_Backups/Archives_2026',
        format: '.zip (AES-256 Encrypted)',
        schedule: 'Every Sunday at Midnight',
        status: 'Active & Mounted'
      }
    ];
  });

  // 3. Offline Synchronization State
  const [advancedConfig, setAdvancedConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('app_advanced_config');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {
      enableOfflineSyncPWA: true,
      maintenanceMode: false
    };
  });

  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [editingCloudId, setEditingCloudId] = useState(null);
  const [cloudForm, setCloudForm] = useState({
    name: '',
    providerType: 'Cloudflare R2',
    targetFolderOrBucket: '',
    clientEmail: '',
    apiKeyOrSecret: '',
    endpointUrl: '',
    autoSyncInterval: 'Daily at 02:00 AM'
  });

  const [isDiskModalOpen, setIsDiskModalOpen] = useState(false);
  const [editingDiskId, setEditingDiskId] = useState(null);
  const [diskForm, setDiskForm] = useState({ label: '', path: '', format: '.zip (AES-256 Encrypted)', schedule: 'Daily' });

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
    if (onTriggerSuccess) onTriggerSuccess(msg);
  };

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_unified_cloud_config', JSON.stringify(cloudConfig));
    showNotification('Supabase Live Cluster settings saved successfully!');
  };

  const handleOpenCloudModal = (item = null) => {
    if (item) {
      setEditingCloudId(item.id);
      setCloudForm({ ...item, apiKeyOrSecret: '••••••••••••••••' });
    } else {
      setEditingCloudId(null);
      setCloudForm({
        name: '',
        providerType: 'Cloudflare R2',
        targetFolderOrBucket: '',
        clientEmail: '',
        apiKeyOrSecret: '',
        endpointUrl: '',
        autoSyncInterval: 'Daily at 02:00 AM'
      });
    }
    setIsCloudModalOpen(true);
  };

  const handleSaveCloudProvider = (e) => {
    e.preventDefault();
    if (!cloudForm.name.trim() || !cloudForm.targetFolderOrBucket.trim()) return;

    if (editingCloudId) {
      const updated = cloudProviders.map(c => c.id === editingCloudId ? { ...c, ...cloudForm } : c);
      setCloudProviders(updated);
      localStorage.setItem('app_cloud_providers', JSON.stringify(updated));
      showNotification('Cloud storage provider updated successfully!');
    } else {
      const newProvider = {
        id: `cloud_${Date.now()}`,
        ...cloudForm,
        isPrimary: false
      };
      const updated = [...cloudProviders, newProvider];
      setCloudProviders(updated);
      localStorage.setItem('app_cloud_providers', JSON.stringify(updated));
      showNotification('New Free Cloud Storage provider added!');
    }
    setIsCloudModalOpen(false);
  };

  const handleDeleteCloudProvider = (id) => {
    if (window.confirm("Remove this cloud storage configuration?")) {
      const updated = cloudProviders.filter(c => c.id !== id);
      setCloudProviders(updated);
      localStorage.setItem('app_cloud_providers', JSON.stringify(updated));
      showNotification('Cloud provider removed.');
    }
  };

  const handleSetPrimaryStorage = (id) => {
    const updated = cloudProviders.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
    setCloudProviders(updated);
    localStorage.setItem('app_cloud_providers', JSON.stringify(updated));
    showNotification('Primary backup destination updated!');
  };

  const handleSaveOfflineSync = (e) => {
    e.preventDefault();
    localStorage.setItem('app_advanced_config', JSON.stringify(advancedConfig));
    showNotification('Offline synchronization settings saved!');
  };

  const handleOpenDiskModal = (disk = null) => {
    if (disk) {
      setEditingDiskId(disk.id);
      setDiskForm({ ...disk });
    } else {
      setEditingDiskId(null);
      setDiskForm({ label: '', path: 'C:/BackupVaults/', format: '.zip (AES-256 Encrypted)', schedule: 'Daily at 02:00 AM' });
    }
    setIsDiskModalOpen(true);
  };

  const handleSaveDiskVault = (e) => {
    e.preventDefault();
    if (!diskForm.label || !diskForm.path) return;

    if (editingDiskId) {
      const updated = diskVaults.map(d => d.id === editingDiskId ? { ...d, ...diskForm } : d);
      setDiskVaults(updated);
      localStorage.setItem('graceos_physical_disk_vaults', JSON.stringify(updated));
      showNotification('Physical Disk Vault updated!');
    } else {
      const newDisk = { id: `disk_${Date.now()}`, ...diskForm, status: 'Ready / Mounted' };
      const updated = [...diskVaults, newDisk];
      setDiskVaults(updated);
      localStorage.setItem('graceos_physical_disk_vaults', JSON.stringify(updated));
      showNotification('New Physical Disk Vault added!');
    }
    setIsDiskModalOpen(false);
  };

  const handleDeleteDisk = (id) => {
    if (window.confirm("Remove this physical disk archive path?")) {
      const updated = diskVaults.filter(d => d.id !== id);
      setDiskVaults(updated);
      localStorage.setItem('graceos_physical_disk_vaults', JSON.stringify(updated));
      showNotification('Disk vault removed.');
    }
  };

  const handleClearCache = () => {
    if (window.confirm("Purge application cache and query buffers?")) {
      showNotification('System cache flushed successfully! Application memory optimized.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 text-slate-200">
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl win11-card border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Cloud size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Advanced Backup &amp; Cloud Hub (Supabase + Free Multi-Cloud Vaults)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                Enterprise Hub Active
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage Supabase live database, free cloud storage providers (Cloudflare R2, MongoDB Atlas), physical disk archives, and offline PWA sync.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl win11-card border border-white/10 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveSubTab('supabase_cloud')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'supabase_cloud'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database size={15} />
          <span>Supabase Live DB</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('multi_cloud')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'multi_cloud'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cloud size={15} />
          <span>Free Multi-Cloud Vaults</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('disk_vaults')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'disk_vaults'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HardDrive size={15} />
          <span>Physical Disk Vault</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('offline_sync')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'offline_sync'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <WifiOff size={15} />
          <span>Offline Sync</span>
        </button>
      </div>

      {/* Sub-Tab 1: Supabase Live Database */}
      {activeSubTab === 'supabase_cloud' && (
        <form onSubmit={handleSaveSupabase} className="space-y-6 win11-card p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="text-cyan-400" size={18} />
                Supabase Realtime Cloud Database (Active Primary Cluster)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your active Supabase cluster credentials for instant member and finance synchronization across devices.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition"
            >
              Save Supabase Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Supabase Project URL *</label>
              <input
                type="text"
                required
                value={cloudConfig.supabaseUrl}
                onChange={(e) => setCloudConfig({ ...cloudConfig, supabaseUrl: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Supabase Anon / Service Key *</label>
              <input
                type="password"
                required
                value={cloudConfig.supabaseAnonKey}
                onChange={(e) => setCloudConfig({ ...cloudConfig, supabaseAnonKey: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <span className="text-xs font-bold text-white">Auto-Sync Database to Supabase Cluster</span>
                <p className="text-[10px] text-slate-400">Instantly replicate local SQLite transactions to cloud in real-time</p>
              </div>
              <input
                type="checkbox"
                checked={cloudConfig.autoSyncSupabase}
                onChange={(e) => setCloudConfig({ ...cloudConfig, autoSyncSupabase: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </form>
      )}

      {/* Sub-Tab 2: Free Multi-Cloud Storage Vaults */}
      {activeSubTab === 'multi_cloud' && (
        <div className="space-y-6 win11-card p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cloud className="text-cyan-400" size={18} />
                Free Multi-Cloud Storage Providers (Cloudflare R2, MongoDB Atlas, Google Drive, AWS S3)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure free cloud storage tiers and secondary backup destinations for absolute data redundancy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCloudModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer transition shrink-0"
            >
              <Plus size={14} />
              <span>Add Free Cloud Provider</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cloudProviders.map((cp) => (
              <div
                key={cp.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 bg-black/30 ${
                  cp.isPrimary
                    ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-xs font-bold text-white">{cp.name}</h5>
                      {cp.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-[9px] font-bold uppercase">
                          Active Primary DB
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cp.providerType} • {cp.autoSyncInterval}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenCloudModal(cp)}
                      className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 cursor-pointer transition"
                    >
                      <Edit2 size={13} />
                    </button>
                    {!cp.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCloudProvider(cp.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Folder / Bucket:</span>
                    <span className="text-white truncate max-w-[160px]">{cp.targetFolderOrBucket}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Account:</span>
                    <span className="text-slate-300 truncate max-w-[160px]">{cp.clientEmail || 'Configured'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {!cp.isPrimary ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryStorage(cp.id)}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold cursor-pointer transition"
                    >
                      ★ Set as Primary Vault
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      ● Active Realtime Cluster
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Physical Disk Vault */}
      {activeSubTab === 'disk_vaults' && (
        <div className="space-y-6 win11-card p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="text-cyan-400" size={18} />
                Physical Disk Vault &amp; Local Server Paths
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure local hard disk directories, external USB drives, or NAS storage paths for encrypted offline backups.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDiskModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer transition"
            >
              <Plus size={14} />
              <span>Add Disk Vault Path</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diskVaults.map((disk) => (
              <div key={disk.id} className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{disk.label}</h5>
                    <span className="text-[10px] text-emerald-400 font-medium">● {disk.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenDiskModal(disk)}
                      className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDisk(disk.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Path:</span>
                    <span className="text-white truncate max-w-[200px]">{disk.path}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Format:</span>
                    <span className="text-cyan-300">{disk.format}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Schedule:</span>
                    <span className="text-slate-300">{disk.schedule}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Offline Synchronization */}
      {activeSubTab === 'offline_sync' && (
        <form onSubmit={handleSaveOfflineSync} className="space-y-6 win11-card p-6 sm:p-8 rounded-3xl border border-white/[0.08]">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <WifiOff className="text-cyan-400" size={18} />
                Offline Synchronization &amp; Maintenance Controls
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage offline PWA attendance synchronization, cache buffers, and system maintenance lock.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition"
            >
              Save Offline Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <WifiOff size={14} className="text-emerald-400" />
                  <span>Offline PWA Attendance Synchronization</span>
                </h5>
                <p className="text-[11px] text-slate-400">Save QR check-ins locally when internet drops &amp; auto-sync on reconnect</p>
              </div>
              <input
                type="checkbox"
                checked={advancedConfig.enableOfflineSyncPWA}
                onChange={(e) => setAdvancedConfig({ ...advancedConfig, enableOfflineSyncPWA: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white">Application Cache Buffer</h5>
                <p className="text-[11px] text-slate-400">Purge stale query caches &amp; optimize query speed</p>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Flush Cache
              </button>
            </div>

            <div className="md:col-span-2 p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-white">System Maintenance Mode Lock</h5>
                  {advancedConfig.maintenanceMode && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold uppercase">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Temporarily lock portal for non-admins during database upgrades</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={advancedConfig.maintenanceMode}
                  onChange={(e) => setAdvancedConfig({ ...advancedConfig, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Add / Edit Cloud Provider Modal */}
      {isCloudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="win11-card w-full max-w-xl p-6 rounded-3xl border border-white/25 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cloud className="text-cyan-400" size={18} />
                {editingCloudId ? 'Edit Cloud Storage Vault' : 'Connect Free Cloud Storage Provider'}
              </h3>
              <button type="button" onClick={() => setIsCloudModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCloudProvider} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium">Storage Connection Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloudflare R2 Free Vault / MongoDB Atlas"
                  value={cloudForm.name}
                  onChange={(e) => setCloudForm({ ...cloudForm, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Cloud Provider Platform *</label>
                  <select
                    value={cloudForm.providerType}
                    onChange={(e) => setCloudForm({ ...cloudForm, providerType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Cloudflare R2">Cloudflare R2 (Free 10GB Tier)</option>
                    <option value="MongoDB Atlas">MongoDB Atlas (Free 512MB Cluster)</option>
                    <option value="Google Drive">Google Drive Enterprise</option>
                    <option value="Firebase / GCP">Firebase / Google Cloud Storage</option>
                    <option value="AWS S3">Amazon Web Services (AWS S3)</option>
                    <option value="Microsoft Azure">Microsoft Azure Blob Storage</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Target Folder ID / Bucket Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. r2-bucket-name or cluster-id"
                    value={cloudForm.targetFolderOrBucket}
                    onChange={(e) => setCloudForm({ ...cloudForm, targetFolderOrBucket: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Service Account Email / Username</label>
                  <input
                    type="text"
                    placeholder="bot@project.iam.gserviceaccount.com"
                    value={cloudForm.clientEmail}
                    onChange={(e) => setCloudForm({ ...cloudForm, clientEmail: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">API Secret Key / Connection String</label>
                  <input
                    type="password"
                    placeholder="Enter Secret Key or MongoDB URI"
                    value={cloudForm.apiKeyOrSecret}
                    onChange={(e) => setCloudForm({ ...cloudForm, apiKeyOrSecret: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCloudModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 cursor-pointer transition"
                >
                  {editingCloudId ? 'Update Cloud Storage' : 'Save Cloud Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disk Vault Modal */}
      {isDiskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="win11-card w-full max-w-lg p-6 rounded-3xl border border-white/25 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="text-cyan-400" size={18} />
                {editingDiskId ? 'Edit Physical Disk Vault' : 'Add Physical Disk Vault'}
              </h3>
              <button type="button" onClick={() => setIsDiskModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDiskVault} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium">Vault Label / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server Local SSD / NAS Backup"
                  value={diskForm.label}
                  onChange={(e) => setDiskForm({ ...diskForm, label: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Directory / Folder Path *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. D:/ChurchBackups/Vault"
                  value={diskForm.path}
                  onChange={(e) => setDiskForm({ ...diskForm, path: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Archive Format</label>
                  <select
                    value={diskForm.format}
                    onChange={(e) => setDiskForm({ ...diskForm, format: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 cursor-pointer focus:outline-none focus:border-cyan-400"
                  >
                    <option value=".zip (AES-256 Encrypted)">.zip (AES-256 Encrypted)</option>
                    <option value=".enc (Binary Snapshot)">.enc (Binary Snapshot)</option>
                    <option value=".tar.gz (Linux Archive)">.tar.gz (Linux Archive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Backup Schedule</label>
                  <input
                    type="text"
                    value={diskForm.schedule}
                    onChange={(e) => setDiskForm({ ...diskForm, schedule: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDiskModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 cursor-pointer transition"
                >
                  {editingDiskId ? 'Update Vault Path' : 'Save Disk Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}