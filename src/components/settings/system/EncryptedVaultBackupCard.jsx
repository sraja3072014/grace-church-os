import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Usb, Lock, Key, Download, 
  Upload, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { encryptDataPayload, decryptDataPayload } from '../../../utils/cryptoEngine';
import { soundFX } from '../../../utils/audioEngine';
import { getVaultData } from '../../../utils/vaultStore';

export default function EncryptedVaultBackupCard() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState('');
  const [daysSinceBackup, setDaysSinceBackup] = useState(0);

  useEffect(() => {
    const lastDate = localStorage.getItem('graceos_last_backup_time');
    if (lastDate) {
      const diffDays = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
      setDaysSinceBackup(diffDays);
    } else {
      setDaysSinceBackup(4);
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleExportEncryptedVault = async (e) => {
    e.preventDefault();
    if (!password || password.length < 4) {
      showToast('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    soundFX?.playClickPop?.();

    try {
      const [members, finance, expenses, prayers] = await Promise.all([
        getVaultData('members', []),
        getVaultData('finance', []),
        getVaultData('expenses', []),
        getVaultData('prayers', [])
      ]);

      const fullData = {
        timestamp: new Date().toISOString(),
        church: JSON.parse(localStorage.getItem('graceos_main_church') || '{}'),
        members,
        finance,
        expenses,
        prayers
      };

      const encryptedString = await encryptDataPayload(fullData, password);

      const blob = new Blob([encryptedString], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timeTag = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `GraceOS_Secured_Backup_${timeTag}.godb`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      localStorage.setItem('graceos_last_backup_time', new Date().toISOString());
      setDaysSinceBackup(0);
      soundFX?.playSuccessChime?.();
      showToast('AES-256 password-protected .godb vault downloaded successfully! ✓');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('An error occurred during vault archive creation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 select-none text-slate-100">
      
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Backup Reminder Banner */}
      {daysSinceBackup >= 3 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold">Backup Reminder: {daysSinceBackup} days since the last vault archive.</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Safeguard church data on an external USB flash drive or physical disk partition.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
            Pending
          </span>
        </div>
      )}

      {/* Main Encrypted Backup Card */}
      <div className="p-6 rounded-3xl win11-card border border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                AES-256 Encrypted Offline Vault (.godb)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Hardware Grade
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Passphrase-encrypted database snapshots suitable for secure offline USB drive storage.
              </p>
            </div>
          </div>
          <Usb size={20} className="text-slate-400" />
        </div>

        <form onSubmit={handleExportEncryptedVault} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block">Security Password:</label>
              <input
                type="password"
                required
                placeholder="Minimum 4 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1.5 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium block">Confirm Password:</label>
              <input
                type="password"
                required
                placeholder="Repeat password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1.5 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[10px] text-slate-500 font-mono">
              Format: .godb • Multi-layered GCM Encryption
            </span>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isProcessing ? 'Encrypting Archive...' : 'Save Encrypted Vault (.godb)'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}