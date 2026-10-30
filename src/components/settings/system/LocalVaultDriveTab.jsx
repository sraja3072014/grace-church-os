// src/components/settings/system/LocalVaultDriveTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  HardDrive, FolderPlus, CheckCircle2, AlertTriangle, 
  FileText, RefreshCw, Database, ShieldCheck, Terminal, Save, Check 
} from 'lucide-react';
import { 
  selectVaultFolder, 
  getMountedVaultPath, 
  isVaultConnected, 
  INIT_TABLES_SQL 
} from '../../../utils/vaultFS';
import { getVaultData, sqlFileStore } from '../../../utils/vaultStore';

const ALL_11_MODULES = [
  { key: 'members', label: 'Members Ledger', file: 'members.json' },
  { key: 'finance', label: 'Finance Ledger', file: 'finance.json' },
  { key: 'attendance', label: 'Attendance Logs', file: 'attendance.json' },
  { key: 'main_church', label: 'Church Profile', file: 'main_church.json' },
  { key: 'branches', label: 'Branch Campuses', file: 'branches.json' },
  { key: 'events', label: 'Church Events', file: 'events.json' },
  { key: 'expenses', label: 'Expense Vouchers', file: 'expenses.json' },
  { key: 'prayers', label: 'Prayer Wall', file: 'prayers.json' },
  { key: 'visitors', label: 'Visitors Desk', file: 'visitors.json' },
  { key: 'staff', label: 'Staff Credentials', file: 'staff.json' },
  { key: 'lease_vault', label: 'Lease & Properties', file: 'lease_vault.json' }
];

export default function LocalVaultDriveTab() {
  const [mountedPath, setMountedPath] = useState(() => {
    return getMountedVaultPath() || localStorage.getItem('graceos_vault_folder_name') || '';
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [fileStatus, setFileStatus] = useState({});

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${type.toUpperCase()}: ${msg}`, ...prev.slice(0, 20)]);
  };

  // டிஸ்க்கில் கோப்புகள் உள்ளனவா எனச் சரிபார்த்தல் (Browser & Electron Hybrid)
  const verifyFilesOnDisk = async () => {
    addLog('கோப்புகளைச் சரிபார்க்கும் செயல்முறை துவங்குகிறது...');
    const statusMap = { schemaSql: false };

    // 1. Electron Runtime-ல் சரிபார்த்தல்
    if (window.electronAPI?.readFile && getMountedVaultPath()) {
      try {
        const currentPath = getMountedVaultPath();
        const sep = currentPath.includes('\\') ? '\\' : '/';
        const cleanPath = currentPath.replace(/[\\/]+$/, '');

        const schemaRes = await window.electronAPI.readFile(`${cleanPath}${sep}database${sep}schema_init.sql`);
        statusMap.schemaSql = !!(schemaRes && schemaRes.success);

        for (const mod of ALL_11_MODULES) {
          const res = await window.electronAPI.readFile(`${cleanPath}${sep}database${sep}${mod.file}`);
          statusMap[mod.key] = !!(res && res.success);
        }

        setFileStatus(statusMap);
        addLog('Electron ஹார்ட் டிஸ்க் கோப்புகள் வெற்றிகரமாகச் சரிபார்க்கப்பட்டன!', 'success');
        return;
      } catch (err) {
        addLog(`Electron சரிபார்ப்பில் பிழை: ${err.message}`, 'error');
      }
    }

    // 2. Web Browser File System Handle-ல் சரிபார்த்தல்
    if (window.__vaultRootDirHandle) {
      try {
        const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', { create: false });
        
        try {
          await dbDir.getFileHandle('schema_init.sql');
          statusMap.schemaSql = true;
        } catch { statusMap.schemaSql = false; }

        for (const mod of ALL_11_MODULES) {
          try {
            await dbDir.getFileHandle(mod.file);
            statusMap[mod.key] = true;
          } catch {
            statusMap[mod.key] = false;
          }
        }

        setFileStatus(statusMap);
        addLog('உலாவி வழியாக லோக்கல் டிஸ்க் கோப்புகள் சரிபார்க்கப்பட்டன!', 'success');
        return;
      } catch (err) {
        addLog(`Browser Vault அணுக முடியவில்லை: ${err.message}`, 'warn');
      }
    }

    addLog('Vault இன்னும் மவுண்ட் செய்யப்படவில்லை அல்லது அணுகல் அனுமதி தேவை.', 'warn');
  };

  useEffect(() => {
    if (mountedPath) {
      verifyFilesOnDisk();
    }
  }, [mountedPath]);

  // 1. டிரைவ் ஃபோல்டரைத் தேர்ந்தெடுத்து 11 கோப்புகளையும் உண்மையான தரவுகளுடன் உருவாக்குதல்
  const handleMountFolder = async () => {
    setLoading(true);
    addLog('ஃபோல்டர் தேர்ந்தெடுக்கும் சாளரம் திறக்கப்படுகிறது...');
    try {
      // 🌟 1. Electron Native Desktop Mode
      if (window.electronAPI && window.electronAPI.selectDirectory) {
        const chosen = await selectVaultFolder();
        if (chosen && typeof chosen === 'string') {
          setMountedPath(chosen);
          addLog(`Electron Vault Mounted: ${chosen}`, 'success');
          await writeAll11ModulesData();
        } else {
          addLog('ஃபோல்டர் தேர்வு ரத்து செய்யப்பட்டது.', 'warn');
        }
        return;
      }

      // 🌟 2. Web Browser Mode (Chrome / Edge Native File System API)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });

        window.__vaultRootDirHandle = dirHandle;
        localStorage.setItem('graceos_vault_folder_name', dirHandle.name);
        setMountedPath(dirHandle.name);
        addLog(`Web Browser Vault இணைக்கப்பட்டது: /${dirHandle.name}`, 'success');

        // உடனே அனைத்து 11 கோப்புகளையும் உண்மையான தரவுகளுடன் எழுதுதல்
        await writeAll11ModulesData();
        return;
      }

      alert('இந்த பிரவுசரில் File System API வசதி இல்லை. தயவுசெய்து Google Chrome அல்லது Microsoft Edge உலாவியைப் பயன்படுத்தவும்.');
      addLog('Browser lacks File System API support.', 'error');
    } catch (err) {
      if (err.name !== 'AbortError') {
        addLog(`Mount failed: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. அனைத்து 11 ஃபைல்களையும் உண்மையான டேட்டாவுடன் டிஸ்க்கில் எழுதும் முதன்மை செயல்பாடு
  const writeAll11ModulesData = async () => {
    setLoading(true);
    addLog('அனைத்து 11 மாட்யூல்களின் தகவல்களும் டிஸ்க்கில் எழுதப்படுகின்றன...', 'info');

    try {
      // முழுமையான SQL Schema உருவாக்கிக்கொள்ளுதல்
      const generatedSql = await sqlFileStore.generateSQLDump();

      // A. Browser File System Access API
      if (window.__vaultRootDirHandle) {
        const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', { create: true });
        await window.__vaultRootDirHandle.getDirectoryHandle('backup', { create: true });

        // 1. SQL Dump எழுதுதல்
        const sqlHandle = await dbDir.getFileHandle('schema_init.sql', { create: true });
        const sqlWriter = await sqlHandle.createWritable();
        await sqlWriter.write(generatedSql);
        await sqlWriter.close();
        addLog('✓ schema_init.sql (முழுமையான SQL அமைப்புடன்) எழுதப்பட்டது.', 'success');

        // 2. 11 JSON கோப்புகளையும் லோக்கல் வோல்ட் தரவோடு எழுதுதல்
        for (const mod of ALL_11_MODULES) {
          const liveData = await getVaultData(mod.key, []);
          const fileHandle = await dbDir.getFileHandle(mod.file, { create: true });
          const writer = await fileHandle.createWritable();
          await writer.write(JSON.stringify(liveData, null, 2));
          await writer.close();
          addLog(`✓ ${mod.file} (${Array.isArray(liveData) ? liveData.length : 1} பதிவுகள்) எழுதப்பட்டது.`, 'success');
        }

        await verifyFilesOnDisk();
        addLog('அனைத்து 11 கோப்புகளும் உங்கள் ஹார்ட் டிரைவில் வெற்றிகரமாகச் சேமிக்கப்பட்டன!', 'success');
        return;
      }

      // B. Electron Native FS
      if (window.electronAPI?.writeFile && getMountedVaultPath()) {
        const currentPath = getMountedVaultPath();
        const sep = currentPath.includes('\\') ? '\\' : '/';
        const cleanPath = currentPath.replace(/[\\/]+$/, '');
        const dbDir = `${cleanPath}${sep}database`;

        if (window.electronAPI?.createDir) {
          await window.electronAPI.createDir(dbDir);
          await window.electronAPI.createDir(`${cleanPath}${sep}backup`);
        }

        await window.electronAPI.writeFile(`${dbDir}${sep}schema_init.sql`, generatedSql);

        for (const mod of ALL_11_MODULES) {
          const liveData = await getVaultData(mod.key, []);
          await window.electronAPI.writeFile(`${dbDir}${sep}${mod.file}`, JSON.stringify(liveData, null, 2));
        }

        await verifyFilesOnDisk();
        addLog('Electron: 11 கோப்புகளும் டிஸ்க்கில் முழுமையாக எழுதப்பட்டன!', 'success');
        return;
      }

      alert('முதலில் "ஃபோல்டரைத் தேர்ந்தெடு" கொடுத்து கம்ப்யூட்டரில் ஒரு ஃபோல்டரைத் தேர்வு செய்யவும்!');
    } catch (err) {
      addLog(`கோப்புகள் எழுதுவதில் பிழை: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-100 pb-12 animate-in fade-in">
      
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-orange-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <HardDrive size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Physical Local Drive Vault (நேரடி வன்வட்டு சேமிப்பு)</h4>
            <p className="text-xs text-orange-200/60 mt-0.5">
              11 மாட்யூல்களையும் கணினியின் வன்வட்டில் (C:, D:, E:) நேரடி .json & .sql கோப்புகளாகச் சேமிக்கும் தளம்.
            </p>
          </div>
        </div>

        <button
          onClick={verifyFilesOnDisk}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-white/10 transition cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>நிலை சரிபார் (Refresh)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Drive Actions */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-5 h-fit">
          <div>
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-1">
              தேர்ந்தெடுக்கப்பட்ட பாதை (Active Vault Path)
            </span>
            <div className="p-3 bg-slate-950 rounded-xl border border-white/10 font-mono text-xs break-all text-orange-300">
              {mountedPath ? `Local Drive: /${mountedPath}` : 'எந்த ஃபோல்டரும் தேர்ந்தெடுக்கப்படவில்லை'}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleMountFolder}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus size={16} />
              <span>{mountedPath ? 'வேறொரு டிரைவ் பாத் மாற்று' : 'கம்ப்யூட்டர் டிரைவ் பாத் தேர்வு செய்'}</span>
            </button>

            <button
              onClick={writeAll11ModulesData}
              disabled={loading || !mountedPath}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-emerald-500/30 cursor-pointer disabled:opacity-40"
            >
              <Save size={15} />
              <span>11 கோப்புகளையும் உடனே சேமி (Sync to Disk)</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-400 text-xs">
            <ShieldCheck size={18} className="shrink-0" />
            <span>Browser Native File System API நேரடி இயக்கத்தில் உள்ளது.</span>
          </div>
        </div>

        {/* Right Column: 11 Core Files Status & Live Logs */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-orange-400" />
                <span>டிஸ்க்கில் உள்ள கோப்புகளின் நிலை (11 Data Files + SQL)</span>
              </h5>
              <span className="text-[10px] font-mono text-slate-400">Folder: /database/</span>
            </div>

            {/* SQL Schema Badge */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-amber-400" />
                <span className="font-bold text-white">schema_init.sql</span>
                <span className="text-[10px] text-slate-400 font-mono">(முழுமையான அட்டவணை DDL & RLS)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fileStatus.schemaSql ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {fileStatus.schemaSql ? '✓ உருவாக்கப்பட்டது' : '✗ உருவாக்கப்படவில்லை'}
              </span>
            </div>

            {/* 11 Modules Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_11_MODULES.map((mod) => {
                const isCreated = !!fileStatus[mod.key];
                return (
                  <div 
                    key={mod.key} 
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      isCreated ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200' : 'bg-white/[0.02] border-white/5 text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{mod.file}</span>
                      <span className="text-[10px] text-slate-400 block">{mod.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isCreated ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isCreated ? '✓ டிஸ்க்கில் உள்ளது' : 'இல்லை'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Terminal Log */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <Terminal size={14} className="text-orange-400" />
              <span>Live Terminal Action Log:</span>
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