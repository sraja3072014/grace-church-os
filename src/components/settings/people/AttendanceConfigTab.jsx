import React, { useState } from 'react';
import { ClipboardCheck, Save, CheckCircle2, QrCode, Clock, Camera, Zap } from 'lucide-react';

export default function AttendanceConfigTab() {
  const [toast, setToast] = useState(false);

  const [settings, setSettings] = useState(() => {
    const local = localStorage.getItem('graceos_attendance_config');
    return local ? JSON.parse(local) : {
      qrTimeoutSeconds: 45,
      allowSelfCheckIn: true,
      multiServiceTracking: true,
      autoLateThreshold: '09:30 AM',
      sundaySchoolAutoLink: true,
      soundChimeOnScan: true,
      services: [
        { id: 1, name: '1st Service (Tamil)', startTime: '06:00 AM', endTime: '08:30 AM', target: 800 },
        { id: 2, name: '2nd Service (English / Multi)', startTime: '09:00 AM', endTime: '11:30 AM', target: 1200 },
        { id: 3, name: 'Evening Service', startTime: '06:00 PM', endTime: '08:00 PM', target: 400 },
      ]
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_attendance_config', JSON.stringify(settings));
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none">
      
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>Attendance Configuration Saved!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              High-Speed QR Check-in Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">0.2s Scan Latency</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Manage dynamic QR rotation speed, multi-service session slots, and automated Sunday check-in counters.</p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Save Setup
        </button>
      </div>

      {/* Scan Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <QrCode size={14} className="text-cyan-400" /> Dynamic QR Code Refresh (Seconds)
          </label>
          <input 
            type="number" 
            value={settings.qrTimeoutSeconds}
            onChange={(e) => setSettings(prev => ({ ...prev, qrTimeoutSeconds: Number(e.target.value) }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <p className="text-[10px] text-slate-500">Auto-regenerates screen QR code to prevent duplicate or shared scan attempts.</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Clock size={14} className="text-amber-400" /> Late Arrival Threshold
          </label>
          <input 
            type="text" 
            value={settings.autoLateThreshold}
            onChange={(e) => setSettings(prev => ({ ...prev, autoLateThreshold: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
          <p className="text-[10px] text-slate-500">Check-ins scanned past this timestamp get flagged as Late Entry.</p>
        </div>

      </div>

      {/* Active Service Schedule Table */}
      <div className="flex flex-col gap-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Sunday Service Slot Windows</h5>
        <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-black/20">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Start Window</th>
                <th className="p-3">End Window</th>
                <th className="p-3">Target Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
              {settings.services.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-semibold text-slate-100">{s.name}</td>
                  <td className="p-3 font-mono text-cyan-300">{s.startTime}</td>
                  <td className="p-3 font-mono text-slate-400">{s.endTime}</td>
                  <td className="p-3 font-mono text-emerald-400">{s.target} seats</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </form>
  );
}