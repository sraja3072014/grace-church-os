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

  // Verify if files exist on disk (Browser & Electron Hybrid)
  const verifyFilesOnDisk = async () => {
    addLog('Starting disk files verification process...');
    const statusMap = { schemaSql: false };

    // 1. Check in Electron Runtime
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
        addLog('Electron hard drive files verified successfully!', 'success');
        return;
      } catch (err) {
        addLog(`Electron verification error: ${err.message}`, 'error');
      }
    }

    // 2. Check in Web Browser File System Handle
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
        addLog('Local disk files verified via browser successfully!', 'success');
        return;
      } catch (err) {
        addLog(`Browser Vault unreachable: ${err.message}`, 'warn');
      }
    }

    addLog('Vault is not mounted yet or requires access permission.', 'warn');
  };

  useEffect(() => {
    if (mountedPath) {
      verifyFilesOnDisk();
    }
  }, [mountedPath]);

  // 1. Select drive folder and create all 11 files with live data
  const handleMountFolder = async () => {
    setLoading(true);
    addLog('Opening folder selection dialog...');
    try {
      // 🌟 1. Electron Native Desktop Mode
      if (window.electronAPI && window.electronAPI.selectDirectory) {
        const chosen = await selectVaultFolder();
        if (chosen && typeof chosen === 'string') {
          setMountedPath(chosen);
          addLog(`Electron Vault Mounted: ${chosen}`, 'success');
          await writeAll11ModulesData();
        } else {
          addLog('Folder selection was cancelled.', 'warn');
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
        addLog(`Web Browser Vault connected: /${dirHandle.name}`, 'success');

        // Immediately write all 11 modules with live data
        await writeAll11ModulesData();
        return;
      }

      alert('This browser does not support the File System Access API. Please use Google Chrome or Microsoft Edge.');
      addLog('Browser lacks File System API support.', 'error');
    } catch (err) {
      if (err.name !== 'AbortError') {
        addLog(`Mount failed: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Main function to write all 11 files with live data to disk
  const writeAll11ModulesData = async () => {
    setLoading(true);
    addLog('Writing all 11 modules data to disk...', 'info');

    try {
      // Generate complete SQL schema dump
      const generatedSql = await sqlFileStore.generateSQLDump();

      // A. Browser File System Access API
      if (window.__vaultRootDirHandle) {
        const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', { create: true });
        await window.__vaultRootDirHandle.getDirectoryHandle('backup', { create: true });

        // 1. Write SQL Dump
        const sqlHandle = await dbDir.getFileHandle('schema_init.sql', { create: true });
        const sqlWriter = await sqlHandle.createWritable();
        await sqlWriter.write(generatedSql);
        await sqlWriter.close();
        addLog('✓ schema_init.sql (with full SQL structure) written successfully.', 'success');

        // 2. Write 11 JSON files with live vault data
        for (const mod of ALL_11_MODULES) {
          const liveData = await getVaultData(mod.key, []);
          const fileHandle = await dbDir.getFileHandle(mod.file, { create: true });
          const writer = await fileHandle.createWritable();
          await writer.write(JSON.stringify(liveData, null, 2));
          await writer.close();
          addLog(`✓ ${mod.file} (${Array.isArray(liveData) ? liveData.length : 1} records) written.`, 'success');
        }

        await verifyFilesOnDisk();
        addLog('All 11 files have been successfully saved to your drive!', 'success');
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
        addLog('Electron: All 11 files written to disk completely!', 'success');
        return;
      }

      alert('Please click "Select Drive Folder" first to choose a folder on your computer!');
    } catch (err) {
      addLog(`File writing error: ${err.message}`, 'error');
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
            <h4 className="text-base font-bold text-white">Physical Local Drive Vault (Direct Disk Storage)</h4>
            <p className="text-xs text-orange-200/60 mt-0.5">
              Directly stores all 11 church modules on your local drive (C:, D:, E:) as .json & .sql files.
            </p>
          </div>
        </div>

        <button
          onClick={verifyFilesOnDisk}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-white/10 transition cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Drive Actions */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-5 h-fit">
          <div>
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-1">
              Active Vault Path
            </span>
            <div className="p-3 bg-slate-950 rounded-xl border border-white/10 font-mono text-xs break-all text-orange-300">
              {mountedPath ? `Local Drive: /${mountedPath}` : 'No folder selected'}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleMountFolder}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus size={16} />
              <span>{mountedPath ? 'Change Drive Folder' : 'Select Computer Drive Folder'}</span>
            </button>

            <button
              onClick={writeAll11ModulesData}
              disabled={loading || !mountedPath}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-emerald-500/30 cursor-pointer disabled:opacity-40"
            >
              <Save size={15} />
              <span>Sync All 11 Files to Disk</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-400 text-xs">
            <ShieldCheck size={18} className="shrink-0" />
            <span>Browser Native File System API is active and ready.</span>
          </div>
        </div>

        {/* Right Column: 11 Core Files Status & Live Logs */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-orange-400" />
                <span>Disk Files Status (11 Data Files + SQL)</span>
              </h5>
              <span className="text-[10px] font-mono text-slate-400">Folder: /database/</span>
            </div>

            {/* SQL Schema Badge */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-amber-400" />
                <span className="font-bold text-white">schema_init.sql</span>
                <span className="text-[10px] text-slate-400 font-mono">(Full Table DDL & RLS)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fileStatus.schemaSql ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {fileStatus.schemaSql ? '✓ Created' : '✗ Missing'}
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
                      {isCreated ? '✓ Present on Disk' : 'Missing'}
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
                <span className="text-slate-600">// Live operations will be logged here automatically...</span>
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