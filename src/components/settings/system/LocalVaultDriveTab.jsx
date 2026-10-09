// src/components/settings/system/LocalVaultDriveTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  HardDrive, FolderPlus, CheckCircle2, AlertTriangle, 
  FileText, RefreshCw, Database, ShieldCheck, Terminal 
} from 'lucide-react';
import { 
  selectVaultFolder, 
  getMountedVaultPath, 
  isVaultConnected, 
  writeDatabaseFile,
  readDatabaseFile,
  INIT_TABLES_SQL 
} from '../../../utils/vaultFS';

export default function LocalVaultDriveTab() {
  const [mountedPath, setMountedPath] = useState(getMountedVaultPath());
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [fileStatus, setFileStatus] = useState({
    schemaSql: false,
    membersJson: false,
    financeJson: false
  });

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${type.toUpperCase()}: ${msg}`, ...prev.slice(0, 15)]);
  };

  // ஃபைல்கள் டிஸ்க்கில் உருவாகியுள்ளதா எனச் சரிபார்க்கும் செயல்முறை
  const verifyFilesOnDisk = async () => {
    if (!window.electronAPI) {
      addLog('Electron API கிடைக்கவில்லை! பிரவுசரில் இயங்குகிறதா என பார்க்கவும்.', 'error');
      return;
    }
    const currentPath = getMountedVaultPath();
    if (!currentPath) {
      addLog('Vault Path இன்னும் மவுண்ட் செய்யப்படவில்லை.', 'warn');
      return;
    }

    try {
      const sep = currentPath.includes('\\') ? '\\' : '/';
      const cleanPath = currentPath.replace(/[\\/]+$/, '');

      // 1. Check schema_init.sql
      const schemaRes = await window.electronAPI.readFile(`${cleanPath}${sep}database${sep}schema_init.sql`);
      // 2. Check members.json
      const membersRes = await window.electronAPI.readFile(`${cleanPath}${sep}database${sep}members.json`);
      // 3. Check finance.json
      const financeRes = await window.electronAPI.readFile(`${cleanPath}${sep}database${sep}finance.json`);

      setFileStatus({
        schemaSql: !!(schemaRes && schemaRes.success),
        membersJson: !!(membersRes && membersRes.success),
        financeJson: !!(financeRes && financeRes.success)
      });

      addLog('டிஸ்க்கில் உள்ள கோப்புகள் வெற்றிகரமாகச் சரிபார்க்கப்பட்டன!', 'success');
    } catch (err) {
      addLog(`சரிபார்ப்பில் பிழை: ${err.message}`, 'error');
    }
  };

  useEffect(() => {
    if (mountedPath && window.electronAPI) {
      verifyFilesOnDisk();
    }
  }, [mountedPath]);

  // 1. ஃபோல்டரைத் தேர்ந்தெடுத்து துவக்குதல்
  const handleMountFolder = async () => {
    setLoading(true);
    addLog('Opening folder selection window...');
    try {
      // 1. Electron Native Desktop Mode
      if (window.electronAPI && window.electronAPI.selectDirectory) {
        const chosen = await selectVaultFolder();
        if (chosen && typeof chosen === 'string') {
          setMountedPath(chosen);
          addLog(`Electron Vault Mounted: ${chosen}`, 'success');
          await verifyFilesOnDisk();
        } else {
          addLog('Folder selection was cancelled or returned empty.', 'warn');
        }
        return;
      }

      // 2. Web Browser Mode (Chrome / Edge File System Access API)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        const dbDir = await dirHandle.getDirectoryHandle('database', { create: true });
        await dirHandle.getDirectoryHandle('backup', { create: true });

        const sqlHandle = await dbDir.getFileHandle('schema_init.sql', { create: true });
        const writer = await sqlHandle.createWritable();
        await writer.write(INIT_TABLES_SQL);
        await writer.close();

        const memHandle = await dbDir.getFileHandle('members.json', { create: true });
        const memWriter = await memHandle.createWritable();
        await memWriter.write('[]');
        await memWriter.close();

        const finHandle = await dbDir.getFileHandle('finance.json', { create: true });
        const finWriter = await finHandle.createWritable();
        await finWriter.write('[]');
        await finWriter.close();

        window.__vaultRootDirHandle = dirHandle;
        localStorage.setItem('graceos_vault_folder_name', dirHandle.name);
        setMountedPath(dirHandle.name);
        addLog(`Web Browser Vault Mounted: ${dirHandle.name}`, 'success');
        setFileStatus({ schemaSql: true, membersJson: true, financeJson: true });
        return;
      }

      // 3. Firefox or unsupported browser
      alert('This web browser does not support the File System Access API. Please run GraceOS inside the Electron Desktop App (npm run electron:dev) or open in Google Chrome/Edge.');
      addLog('Browser lacks File System API support.', 'error');
    } catch (err) {
      if (err.name !== 'AbortError') {
        addLog(`Mount failed: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. ஃபோல்டர் மற்றும் ஃபைல்களை வலுக்கட்டாயமாக உருவாக்குதல் (Force Re-create)
  const handleForceCreate = async () => {
    const currentPath = getMountedVaultPath();
    if (!currentPath) {
      alert('முதலில் "Select Vault Folder" கொடுத்து ஒரு ஃபோல்டரைத் தேர்வு செய்யவும்!');
      return;
    }

    setLoading(true);
    addLog('கோப்புகளை மீண்டும் டிஸ்க்கில் எழுதும் செயல் துவங்குகிறது...');

    try {
      const sep = currentPath.includes('\\') ? '\\' : '/';
      const cleanPath = currentPath.replace(/[\\/]+$/, '');
      const dbDir = `${cleanPath}${sep}database`;
      const backupDir = `${cleanPath}${sep}backup`;

      // Directory creation
      if (window.electronAPI?.createDir) {
        await window.electronAPI.createDir(dbDir);
        await window.electronAPI.createDir(backupDir);
        addLog('database & backup ஃபோல்டர்கள் உருவாக்கப்பட்டன.', 'success');
      }

      // Write schema_init.sql
      if (window.electronAPI?.writeFile) {
        await window.electronAPI.writeFile(`${dbDir}${sep}schema_init.sql`, INIT_TABLES_SQL);
        addLog('schema_init.sql எழுதப்பட்டது.', 'success');

        // Write sample/initial json files
        await window.electronAPI.writeFile(`${dbDir}${sep}members.json`, '[]');
        await window.electronAPI.writeFile(`${dbDir}${sep}finance.json`, '[]');
        addLog('members.json மற்றும் finance.json உருவாக்கப்பட்டன.', 'success');
      }

      await verifyFilesOnDisk();
    } catch (err) {
      addLog(`Force Create-ல் பிழை: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-100 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <HardDrive size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Physical Local Drive Vault (நேரடி வன்வட்டு சேமிப்பு)</h4>
            <p className="text-xs text-slate-400">
              உங்கள் கம்ப்யூட்டர் ஹார்ட் டிரைவில் (C:, D:, E:) சபையின் தகவல்களை நேரடியாகச் சேமிக்கும் பிரத்யேக பகுதி.
            </p>
          </div>
        </div>

        <button
          onClick={verifyFilesOnDisk}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-white/10 transition"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>சரிபார் (Refresh)</span>
        </button>
      </div>

      {/* Main Drive Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Actions */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-5">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              மவுண்ட் செய்யப்பட்ட பாதை (Active Path)
            </span>
            <div className="p-3 bg-slate-950 rounded-xl border border-white/10 font-mono text-xs break-all text-slate-300">
              {mountedPath || 'எந்த ஃபோல்டரும் தேர்ந்தெடுக்கப்படவில்லை'}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleMountFolder}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus size={16} />
              <span>{mountedPath ? 'வேறொரு ஃபோல்டரை மாற்று (Change)' : 'ஃபோல்டரைத் தேர்ந்தெடு (Select Drive)'}</span>
            </button>

            <button
              onClick={handleForceCreate}
              disabled={loading || !mountedPath}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-amber-500/20 cursor-pointer disabled:opacity-40"
            >
              <Database size={15} />
              <span>வலுக்கட்டாயமாக கோப்புகளை உருவாக்கு (Force Create)</span>
            </button>
          </div>

          {/* Disk Safety Badge */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-400 text-xs">
            <ShieldCheck size={18} className="shrink-0" />
            <span>நேரடி Windows File System பாதுகாப்பு இயக்கத்தில் உள்ளது.</span>
          </div>
        </div>

        {/* Right Column: Physical File Integrity Status */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText size={15} className="text-cyan-400" />
              <span>டிஸ்க்கில் உள்ள கோப்புகளின் நிலை (Drive Status)</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border ${fileStatus.schemaSql ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                <span className="text-[10px] text-slate-400 block uppercase">SQL Schema</span>
                <span className="text-xs font-bold text-white block mt-1">schema_init.sql</span>
                <span className={`text-[10px] font-bold mt-2 block ${fileStatus.schemaSql ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fileStatus.schemaSql ? '✓ உருவாக்கப்பட்டது' : '✗ உருவாக்கப்படவில்லை'}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${fileStatus.membersJson ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                <span className="text-[10px] text-slate-400 block uppercase">Members Ledger</span>
                <span className="text-xs font-bold text-white block mt-1">members.json</span>
                <span className={`text-[10px] font-bold mt-2 block ${fileStatus.membersJson ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fileStatus.membersJson ? '✓ உருவாக்கப்பட்டது' : '✗ உருவாக்கப்படவில்லை'}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${fileStatus.financeJson ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                <span className="text-[10px] text-slate-400 block uppercase">Finance Ledger</span>
                <span className="text-xs font-bold text-white block mt-1">finance.json</span>
                <span className={`text-[10px] font-bold mt-2 block ${fileStatus.financeJson ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fileStatus.financeJson ? '✓ உருவாக்கப்பட்டது' : '✗ உருவாக்கப்படவில்லை'}
                </span>
              </div>
            </div>
          </div>

          {/* Mini Live Terminal Console */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <Terminal size={14} className="text-cyan-400" />
              <span>Live Vault Action Terminal Log:</span>
            </div>
            <div className="h-28 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1 bg-slate-950 p-2.5 rounded-xl border border-white/5">
              {logs.length === 0 ? (
                <span className="text-slate-600">// இங்கு நடக்கும் நிகழ்வுகள் தானாகப் பதிவாகும்...</span>
              ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}