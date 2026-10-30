import React, { useState } from 'react';
import { selectVaultFolder, isVaultConnected, getMountedVaultPath } from '../utils/vaultFS';

export function VaultSettingsCard() {
  const [mountedPath, setMountedPath] = useState(getMountedVaultPath());
  const [isLoading, setIsLoading] = useState(false);

  const handleMount = async () => {
    setIsLoading(true);
    try {
      const selected = await selectVaultFolder();
      if (selected) {
        setMountedPath(selected);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0f0b1a] border border-white/10 text-white">
      <h3 className="text-lg font-semibold mb-2">Physical Local Drive Vault</h3>
      <p className="text-sm text-gray-400 mb-4">
        Store church members, finance ledgers, and logs directly on your local disk (C:/, D:/, E:/).
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={handleMount}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-medium transition disabled:opacity-50"
        >
          {isLoading ? 'Mounting...' : isVaultConnected() ? 'Change Vault Folder' : 'Select & Mount Local Folder'}
        </button>

        {mountedPath && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            {mountedPath}
          </span>
        )}
      </div>
    </div>
  );
}