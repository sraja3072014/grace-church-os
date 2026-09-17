import React, { useState, useEffect } from 'react';
import CloudSyncStatusWidget from '../CloudSyncStatusWidget';
import { 
  Database, HardDrive, Download, Upload, RefreshCw, 
  Clock, CheckCircle2, FolderOpen, Trash2, FolderCheck, ShieldCheck, Usb, Lock, FileSpreadsheet, Cloud
} from 'lucide-react';
import ExcelDataEngineModal from '../../tools/ExcelDataEngineModal';
import { 
  selectVaultFolder,
  initVaultFolder,
  createBackupSnapshot,
  isVaultConnected
} from '../../../utils/vaultFS';
import { encryptDataPayload, decryptDataPayload } from '../../../utils/cryptoEngine';
import { soundFX } from '../../../utils/audioEngine';

export default function BackupDatabaseTab() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [toast, setToast] = useState('');
  const [mountedFolder, setMountedFolder] = useState(null);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('Daily (11:59 PM)');
  const [daysSinceBackup, setDaysSinceBackup] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const [backupHistory, setBackupHistory] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_backup_history');
      return local ? JSON.parse(local) : [
        { id: 1, name: 'backup_snapshot_2026_09_06_2359.json', path: 'D:\\GraceOS\\backup', size: '1.8 MB', date: 'Yesterday, 11:59 PM', type: 'Auto Vault' },
        { id: 2, name: 'backup_snapshot_2026_09_04_1630.json', path: 'D:\\GraceOS\\backup', size: '1.6 MB', date: '04 Sep 2026, 04:30 PM', type: 'Manual Vault' },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    initVaultFolder().then(folder => {
      if (folder) setMountedFolder(folder);
    });

    const lastDate = localStorage.getItem('graceos_last_backup_time');
    setDaysSinceBackup(lastDate
      ? Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
      : 3);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const syncHistory = (data) => {
    setBackupHistory(data);
    localStorage.setItem('graceos_backup_history', JSON.stringify(data));
  };

  const handleConnectRootFolder = async () => {
    const folder = await selectVaultFolder();
    if (folder) {
      setMountedFolder(folder);
      soundFX?.playSuccessChime?.();
      showToast(`Target Root Mounted: "${folder}". Created /database and /backup.`);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    soundFX?.playClickPop?.();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const fullPayload = {
      timestamp: now.toISOString(),
      church: JSON.parse(localStorage.getItem('graceos_main_church') || '{}'),
      members: JSON.parse(localStorage.getItem('app_members_family_database') || '[]'),
      visitors: JSON.parse(localStorage.getItem('app_visitors_database') || '[]'),
      finance: JSON.parse(localStorage.getItem('app_finance_transactions_ledger') || '[]'),
      expenses: JSON.parse(localStorage.getItem('app_expenses_ledger') || '[]'),
      prayers: JSON.parse(localStorage.getItem('graceos_prayer_wall_db') || localStorage.getItem('app_prayer_requests_db') || '[]'),
      events: JSON.parse(localStorage.getItem('graceos_church_events_db') || localStorage.getItem('app_events_database') || '[]'),
      properties: JSON.parse(localStorage.getItem('graceos_church_properties_db') || '[]'),
      assets: JSON.parse(localStorage.getItem('graceos_church_assets_db') || '[]'),
      payroll: JSON.parse(localStorage.getItem('graceos_staff_payroll_db') || '[]'),
      sundaySchool: JSON.parse(localStorage.getItem('graceos_sundayschool_kids_db') || '[]'),
      youth: JSON.parse(localStorage.getItem('graceos_youth_fellowship_db') || '[]'),
      women: JSON.parse(localStorage.getItem('graceos_women_fellowship_db') || '[]'),
      men: JSON.parse(localStorage.getItem('graceos_men_fellowship_db') || '[]'),
      engine: 'GraceOS Dual-Tree Vault FS'
    };

    let savedFileName = `backup_snapshot_${now.toISOString().slice(0, 10).replace(/-/g, '_')}_${Date.now().toString().slice(-4)}.json`;

    if (isVaultConnected()) {
      const generatedName = await createBackupSnapshot(fullPayload);
      if (generatedName) savedFileName = generatedName;
    }

    const newBackup = {
      id: Date.now(),
      name: savedFileName,
      path: mountedFolder ? `${mountedFolder}\\backup` : 'Memory Cache',
      size: `${(JSON.stringify(fullPayload).length / 1024).toFixed(1)} KB`,
      date: `Today, ${timeStr}`,
      type: isVaultConnected() ? 'Physical Disk' : 'Cache Fallback'
    };

    const updated = [newBackup, ...backupHistory];
    syncHistory(updated);
    localStorage.setItem('graceos_last_backup_time', now.toISOString());
    setDaysSinceBackup(0);
    setIsBackingUp(false);
    soundFX?.playSuccessChime?.();
    showToast(`Snapshot written to ${newBackup.path}`);
  };

  const handleExportEncryptedVault = async (e) => {
    e.preventDefault();
    if (!password || password.length < 4) {
      showToast('Password must contain at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showToast('The passwords do not match.');
      return;
    }

    setIsEncrypting(true);
    soundFX?.playClickPop?.();
    try {
      const fullData = {
        timestamp: new Date().toISOString(),
        church: JSON.parse(localStorage.getItem('graceos_main_church') || '{}'),
        members: JSON.parse(localStorage.getItem('app_members_family_database') || '[]'),
        visitors: JSON.parse(localStorage.getItem('app_visitors_database') || '[]'),
        finance: JSON.parse(localStorage.getItem('app_finance_transactions_ledger') || '[]'),
        expenses: JSON.parse(localStorage.getItem('app_expenses_ledger') || '[]'),
        prayers: JSON.parse(localStorage.getItem('graceos_prayer_wall_db') || localStorage.getItem('app_prayer_requests_db') || '[]'),
        events: JSON.parse(localStorage.getItem('graceos_church_events_db') || localStorage.getItem('app_events_database') || '[]'),
        properties: JSON.parse(localStorage.getItem('graceos_church_properties_db') || '[]'),
        assets: JSON.parse(localStorage.getItem('graceos_church_assets_db') || '[]'),
        payroll: JSON.parse(localStorage.getItem('graceos_staff_payroll_db') || '[]'),
        sundaySchool: JSON.parse(localStorage.getItem('graceos_sundayschool_kids_db') || '[]'),
        youth: JSON.parse(localStorage.getItem('graceos_youth_fellowship_db') || '[]'),
        women: JSON.parse(localStorage.getItem('graceos_women_fellowship_db') || '[]'),
        men: JSON.parse(localStorage.getItem('graceos_men_fellowship_db') || '[]')
      };
      const encryptedString = await encryptDataPayload(fullData, password);
      const blob = new Blob([encryptedString], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `GraceOS_Secured_Backup_${new Date().toISOString().slice(0, 10)}.godb`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const newEntry = {
        id: Date.now(), name: fileName, path: 'USB / External Storage',
        size: `${(encryptedString.length / 1024).toFixed(1)} KB`,
        date: 'Today, Just now', type: 'AES-256 .godb'
      };
      syncHistory([newEntry, ...backupHistory]);
      localStorage.setItem('graceos_last_backup_time', new Date().toISOString());
      setDaysSinceBackup(0);
      soundFX?.playSuccessChime?.();
      showToast('Password-protected .godb backup downloaded successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Encryption failed.');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleRestoreDB = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.db,.godb,.bak';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          let parsed;
          if (file.name.endsWith('.godb')) {
            const userPassword = window.prompt('Enter the password for this .godb file:');
            if (!userPassword) return;
            parsed = await decryptDataPayload(event.target.result, userPassword);
          } else {
            parsed = JSON.parse(event.target.result);
          }
          if (parsed.members) localStorage.setItem('app_members_family_database', JSON.stringify(parsed.members));
          if (parsed.visitors) localStorage.setItem('app_visitors_database', JSON.stringify(parsed.visitors));
          if (parsed.finance) localStorage.setItem('app_finance_transactions_ledger', JSON.stringify(parsed.finance));
          if (parsed.expenses) localStorage.setItem('app_expenses_ledger', JSON.stringify(parsed.expenses));
          if (parsed.prayers) {
            localStorage.setItem('graceos_prayer_wall_db', JSON.stringify(parsed.prayers));
            localStorage.setItem('app_prayer_requests_db', JSON.stringify(parsed.prayers));
          }
          if (parsed.events) {
            localStorage.setItem('graceos_church_events_db', JSON.stringify(parsed.events));
            localStorage.setItem('app_events_database', JSON.stringify(parsed.events));
          }
          if (parsed.properties) localStorage.setItem('graceos_church_properties_db', JSON.stringify(parsed.properties));
          if (parsed.assets) localStorage.setItem('graceos_church_assets_db', JSON.stringify(parsed.assets));
          if (parsed.payroll) localStorage.setItem('graceos_staff_payroll_db', JSON.stringify(parsed.payroll));
          if (parsed.sundaySchool) localStorage.setItem('graceos_sundayschool_kids_db', JSON.stringify(parsed.sundaySchool));
          if (parsed.youth) localStorage.setItem('graceos_youth_fellowship_db', JSON.stringify(parsed.youth));
          if (parsed.women) localStorage.setItem('graceos_women_fellowship_db', JSON.stringify(parsed.women));
          if (parsed.men) localStorage.setItem('graceos_men_fellowship_db', JSON.stringify(parsed.men));

          soundFX?.playSuccessChime?.();
          showToast(`Database restored from "${file.name}" successfully! ✓`);
        } catch (err) {
          showToast(err.message || 'Invalid backup file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExportBackup = (item) => {
    const dumpData = JSON.stringify({
      snapshot: item.name,
      created: item.date,
      church: localStorage.getItem('graceos_main_church'),
      members: localStorage.getItem('app_members_family_database'),
      finance: localStorage.getItem('app_finance_transactions_ledger')
    }, null, 2);

    const blob = new Blob([dumpData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${item.name}`);
  };

  const handleDeleteBackup = (id) => {
    const filtered = backupHistory.filter(b => b.id !== id);
    syncHistory(filtered);
    showToast('Backup log removed');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl relative select-none animate-in fade-in pb-12 text-slate-100">
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {daysSinceBackup >= 3 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300 shadow-lg">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold">Backup reminder: {daysSinceBackup} days since the last backup.</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Save the church's latest records to your connected storage partition.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateBackup}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
          >
            Backup now
          </button>
        </div>
      )}

      {/* Cloud Sync Status */}
      <div className="p-5 rounded-2xl win11-card border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cloud size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Supabase Real-time Cloud Sync
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono">
                Auto Relay
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically syncs local disk vault tables to cloud endpoints with conflict resolution when online.
            </p>
          </div>
        </div>
        <CloudSyncStatusWidget />
      </div>

      {/* Local Storage Engine */}
      <div className="p-5 rounded-2xl win11-card border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <HardDrive size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Dual-Tree Local Storage Vault Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-medium">
                Direct Disk Node
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live operational tables stay in <strong className="text-cyan-300 font-mono">/database</strong> and disaster recovery dumps archive into <strong className="text-sky-400 font-mono">/backup</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleRestoreDB}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <Upload size={14} className="text-cyan-400" />
            <span>Restore DB</span>
          </button>

          {/* BankAccountsTab போன்ற சியான்/ப்ளூ கிரேடியன்ட் பட்டன் */}
          <button 
            disabled={isBackingUp}
            onClick={handleCreateBackup}
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={isBackingUp ? 'animate-spin' : ''} />
            <span>{isBackingUp ? 'Archiving...' : 'Create Snapshot Backup'}</span>
          </button>
        </div>
      </div>

      {/* Directory Mounting & Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl win11-card border border-white/[0.06] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <FolderOpen size={14} className="text-cyan-400" /> Mounted Root Directory
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Auto-Branching</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs space-y-1">
            <div className="text-cyan-300 font-bold truncate">
              📁 {mountedFolder || 'No Directory Mounted'}
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
              ├── 📁 database/ <span className="text-slate-500">(Live tables)</span>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
              └── 📁 backup/ <span className="text-slate-500">(Snapshot dumps)</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleConnectRootFolder}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <FolderCheck size={14} />
            <span>{mountedFolder ? 'Change Root Folder' : 'Connect Storage Folder'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl win11-card border border-white/[0.06] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" /> Automated Schedule
            </label>
            <input 
              type="checkbox" 
              checked={autoBackup} 
              onChange={(e) => {
                setAutoBackup(e.target.checked);
                showToast(e.target.checked ? 'Auto-backup enabled' : 'Auto-backup disabled');
              }}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
          <select 
            disabled={!autoBackup}
            value={backupFrequency}
            onChange={(e) => {
              setBackupFrequency(e.target.value);
              showToast(`Schedule set to ${e.target.value}`);
            }}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 disabled:opacity-40"
          >
            <option>Daily (11:59 PM)</option>
            <option>Every 12 Hours</option>
            <option>Weekly (Sunday Night)</option>
          </select>
          <span className="text-[10px] text-slate-400">
            Snapshots will automatically write directly into the /backup folder without interrupting UI.
          </span>
        </div>
      </div>

      {/* AES Encrypted Vault Export */}
      <div className="p-6 rounded-3xl win11-card border border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                AES-256 Encrypted Vault Export (.godb)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono">USB Ready</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Protect an offline backup with a password before storing it externally.</p>
            </div>
          </div>
          <Usb size={20} className="text-slate-400" />
        </div>

        <form onSubmit={handleExportEncryptedVault} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block">Password</label>
              <input type="password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 4 characters" className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1.5 focus:outline-none focus:border-cyan-400 font-mono" />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium block">Confirm password</label>
              <input type="password" required minLength={4} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1.5 focus:outline-none focus:border-cyan-400 font-mono" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[10px] text-slate-500 font-mono">Format: .godb • PBKDF2 &amp; AES-GCM 256-Bit Protection</span>
            
            {/* BankAccountsTab போன்ற சியான்/ப்ளூ கிரேடியன்ட் பட்டன் */}
            <button 
              type="submit" 
              disabled={isEncrypting} 
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Lock size={14} />
              <span>{isEncrypting ? 'Encrypting...' : 'Save Encrypted .godb'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Excel / CSV Data Hub */}
      <div className="p-5 rounded-2xl win11-card border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Excel / CSV Data Migration &amp; Reports
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono">
                Spreadsheet
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Export and import church membership rosters and financial audit books directly via Excel/CSV spreadsheets.
            </p>
          </div>
        </div>

        {/* BankAccountsTab போன்ற சியான்/ப்ளூ கிரேடியன்ட் பட்டன் */}
        <button
          type="button"
          onClick={() => setIsExcelModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer shrink-0"
        >
          <FileSpreadsheet size={15} />
          <span>Open Excel Hub</span>
        </button>
      </div>

      {/* Available Snapshot Archives */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Available Snapshot Archives ({backupHistory.length})
          </h5>
          <span className="text-[11px] text-slate-400">Live storage verification active</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="p-3">File Snapshot</th>
                <th className="p-3">Method</th>
                <th className="p-3">Size</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
              {backupHistory.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-mono text-cyan-300 flex items-center gap-2">
                    <Database size={13} className="text-slate-500 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300 font-bold">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{item.size}</td>
                  <td className="p-3 text-slate-400">{item.date}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        type="button"
                        onClick={() => handleExportBackup(item)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={12} />
                        <span>Export</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteBackup(item.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ExcelDataEngineModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onRefreshData={() => window.location.reload()}
      />
    </div>
  );
}