import React, { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle, FolderCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { isVaultConnected, initVaultFolder, selectVaultFolder } from '../../utils/vaultFS';
import { soundFX } from '../../utils/audioEngine';

export default function VaultConnectionGuard() {
  const [isConnected, setIsConnected] = useState(true);
  const [mountedPath, setMountedPath] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
    const folder = await initVaultFolder();
    const connected = isVaultConnected();
    setIsConnected(connected);
    if (connected && folder) {
      setMountedPath(folder);
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleMountDrive = async () => {
    soundFX?.playClickPop?.();
    const selected = await selectVaultFolder();
    if (selected) {
      soundFX?.playSuccessChime?.();
      setMountedPath(selected);
      setIsConnected(true);
    }
  };

  if (isChecking || isConnected) {
    return null; // Banner remains hidden when local drive is properly mounted
  }

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-amber-200 select-none animate-in slide-in-from-top">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div className="text-xs">
            <strong className="font-bold text-amber-300">Local Hard Disk Vault Disconnected:</strong>
            <span className="text-slate-300 ml-1.5">
              Data must persist directly to your local computer drive (C/D/E:). Please connect your root database folder.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleMountDrive}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
        >
          <FolderCheck size={14} />
          <span>Connect Local Drive (C/D/E)</span>
        </button>
      </div>
    </div>
  );
}