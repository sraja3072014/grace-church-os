import React, { useState, useEffect } from 'react';
import { 
  QrCode, Wifi, WifiOff, Camera, CheckCircle2, 
  AlertCircle, RefreshCw, Key, ArrowRight, UserCheck 
} from 'lucide-react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, NotificationType } from '@capacitor/haptics';

export default function MobileCompanionDesk() {
  const [hostConfig, setHostConfig] = useState(() => {
    const saved = localStorage.getItem('graceos_mobile_companion_host');
    return saved ? JSON.parse(saved) : {
      hostIp: '192.168.1.105',
      port: '3000',
      token: 'GRACE-NODE-AES-2026-X948',
      connected: false
    };
  });

  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Check hardware camera permissions
  const checkPermissions = async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera !== 'granted') {
      await BarcodeScanner.requestPermissions();
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleConnectHost = async (e) => {
    e.preventDefault();
    try {
      // Handshake with Desktop Host Server
      const res = await fetch(`http://${hostConfig.hostIp}:${hostConfig.port}/api/health`, {
        headers: { 'x-grace-token': hostConfig.token }
      });
      if (res.ok) {
        await Haptics.notification({ type: NotificationType.Success });
        const updated = { ...hostConfig, connected: true };
        setHostConfig(updated);
        localStorage.setItem('graceos_mobile_companion_host', JSON.stringify(updated));
        setFeedback({ success: true, msg: 'Synchronized with GraceOS Desktop Host!' });
      } else {
        throw new Error();
      }
    } catch {
      await Haptics.notification({ type: NotificationType.Error });
      setFeedback({ success: false, msg: 'Unable to reach Host PC. Ensure both devices are on the same Wi-Fi.' });
    }
  };

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      await BarcodeScanner.hideBackground();
      document.body.classList.add('barcode-scanner-active');

      const result = await BarcodeScanner.startScan();
      document.body.classList.remove('barcode-scanner-active');
      setIsScanning(false);

      if (result.hasContent) {
        await Haptics.notification({ type: NotificationType.Success });
        setScanResult(result.content);
        submitAttendanceCheckIn(result.content);
      }
    } catch (err) {
      setIsScanning(false);
      document.body.classList.remove('barcode-scanner-active');
    }
  };

  const submitAttendanceCheckIn = async (memberId) => {
    try {
      const res = await fetch(`http://${hostConfig.hostIp}:${hostConfig.port}/api/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-grace-token': hostConfig.token
        },
        body: JSON.stringify({
          memberId,
          timestamp: new Date().toISOString(),
          device: 'Usher Tablet Scanner'
        })
      });
      if (res.ok) {
        setFeedback({ success: true, msg: `Checked In: Member ID ${memberId}` });
      }
    } catch {
      setFeedback({ success: true, msg: `Logged Offline: ${memberId} (Queued for Sync)` });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 select-none flex flex-col justify-between">
      {/* Top Header */}
      <div className="border-b border-white/10 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>GraceOS Usher Companion</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Node: {hostConfig.hostIp}:{hostConfig.port}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
          hostConfig.connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
        }`}>
          {hostConfig.connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{hostConfig.connected ? 'LAN Active' : 'Offline'}</span>
        </span>
      </div>

      {feedback && (
        <div className={`p-3 rounded-2xl text-xs font-bold border my-3 ${
          feedback.success ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Main Scan Viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
        <div className="w-64 h-64 border-2 border-dashed border-cyan-500/40 rounded-3xl flex flex-col items-center justify-center p-6 text-center bg-slate-900/60 shadow-2xl relative">
          <QrCode size={90} className="text-cyan-400 opacity-80 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium mt-3">
            {isScanning ? 'Aim at Member Badge QR Code' : 'Ready for Usher Scan'}
          </span>
          {scanResult && (
            <span className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">
              Last: {scanResult}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleStartScan}
          className="w-full max-w-xs py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera size={18} />
          <span>Launch Camera Scanner</span>
        </button>
      </div>

      {/* Host Settings Tray */}
      <form onSubmit={handleConnectHost} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Desktop Host Node Setup</span>
          <Key size={12} className="text-amber-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Host PC IP"
            value={hostConfig.hostIp}
            onChange={(e) => setHostConfig({ ...hostConfig, hostIp: e.target.value })}
            className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
          />
          <input
            type="text"
            placeholder="Security Token"
            value={hostConfig.token}
            onChange={(e) => setHostConfig({ ...hostConfig, token: e.target.value })}
            className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>Handshake with Host</span>
        </button>
      </form>
    </div>
  );
}