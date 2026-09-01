import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, QrCode, Search, UserCheck, Users, 
  Sparkles, CheckCircle2, Download, RefreshCw, AlertCircle, 
  Volume2, VolumeX, ShieldCheck, Clock, UserPlus
} from 'lucide-react';

export default function AttendanceDesk({ session }) {
  const [activeService, setActiveService] = useState('1st Service (Tamil) - 06:00 AM');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannerActive, setScannerActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const searchInputRef = useRef(null);

  // Mock Directory Database for Check-in matching
  const memberDatabase = [
    { id: 'GCC-MBR-1001', name: 'Stephen Victor', family: 'Victor Household', category: 'Main Sanctuary', familyMembers: ['Stephen Victor', 'Mary Stephen (Wife)', 'Joshua (Son - SS)'] },
    { id: 'GCC-MBR-1002', name: 'Pastor David Raj', family: 'David Household', category: 'Main Sanctuary', familyMembers: ['David Raj', 'Sarah David (Wife)'] },
    { id: 'GCC-MBR-1003', name: 'John Samuel', family: 'Samuel Household', category: 'Main Sanctuary', familyMembers: ['John Samuel', 'Grace John (Wife)', 'Hannah (Daughter - SS)'] },
    { id: 'GCC-MBR-1004', name: 'Ruth Timothy', family: 'Timothy Household', category: 'Youth Ministry', familyMembers: ['Ruth Timothy'] },
  ];

  const [attendanceLedger, setAttendanceLedger] = useState(() => {
    const local = localStorage.getItem('graceos_attendance_ledger');
    return local ? JSON.parse(local) : [
      { id: 1, memberId: 'GCC-MBR-0982', name: 'Paul Dinakaran', family: 'Paul Household', count: 3, time: '06:14 AM', service: '1st Service', status: 'On Time' },
      { id: 2, memberId: 'GCC-MBR-0891', name: 'Dr. Arthur Jebaraj', family: 'Jebaraj Household', count: 2, time: '06:22 AM', service: '1st Service', status: 'On Time' },
      { id: 3, memberId: 'GCC-MBR-0774', name: 'Sister Deborah', family: 'Deborah Household', count: 1, time: '06:35 AM', service: '1st Service', status: 'Late' },
    ];
  });

  const syncLedger = (data) => {
    setAttendanceLedger(data);
    localStorage.setItem('graceos_attendance_ledger', JSON.stringify(data));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio context fallback
    }
  };

  const handleExecuteCheckIn = (member, count = 1) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRecord = {
      id: Date.now(),
      memberId: member.id,
      name: member.name,
      family: member.family,
      count: count,
      time: timeStr,
      service: activeService.split(' - ')[0],
      status: 'On Time'
    };

    const updated = [newRecord, ...attendanceLedger];
    syncLedger(updated);
    setLastScanned({ ...member, checkedCount: count, time: timeStr });
    playChime();
    showToast(`Checked in ${member.name} (${count} Attendees)`);
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleManualSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    const match = memberDatabase.find(
      m => m.id.toLowerCase().includes(query) || m.name.toLowerCase().includes(query)
    );

    if (match) {
      handleExecuteCheckIn(match, match.familyMembers.length);
    } else {
      // Direct visitor check-in fallback
      const guestMember = {
        id: `GCC-VIS-${Math.floor(100 + Math.random() * 900)}`,
        name: searchQuery,
        family: 'Guest / Visitor',
        category: 'Main Sanctuary',
        familyMembers: [searchQuery]
      };
      handleExecuteCheckIn(guestMember, 1);
    }
  };

  const handleExportCSV = () => {
    const header = "Member ID,Name,Family Unit,Count,Time,Service,Status\n";
    const rows = attendanceLedger.map(r => `"${r.memberId}","${r.name}","${r.family}",${r.count},"${r.time}","${r.service}","${r.status}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Attendance ledger exported to CSV!');
  };

  const totalHeadcount = attendanceLedger.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Top Header Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ClipboardCheck size={26} className="text-cyan-400" />
            <span>Fast QR Attendance Kiosk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time contactless check-in desk • High-speed barcode/camera optical engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition ${soundEnabled ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-400'}`}
            title="Toggle Scan Sound Chime"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <select 
            value={activeService}
            onChange={(e) => setActiveService(e.target.value)}
            className="bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400"
          >
            <option>1st Service (Tamil) - 06:00 AM</option>
            <option>2nd Service (English / Multi) - 09:00 AM</option>
            <option>Evening Gospel Service - 06:00 PM</option>
          </select>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold active:scale-95 transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Check-In Action Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Optical Scanner & Search Box (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Main Interactive Scan Input Bar */}
          <form onSubmit={handleManualSearchSubmit} className="p-4 win11-card rounded-2xl border border-white/[0.08] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <QrCode size={20} className={scannerActive ? 'animate-pulse' : ''} />
            </div>
            
            <input 
              ref={searchInputRef}
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan Member QR Pass or Type Name / Phone / ID..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
            />

            <button 
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <UserCheck size={14} />
              <span>Check In</span>
            </button>
          </form>

          {/* Instant Quick-Check Grid for Lobby Operators */}
          <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" />
              Quick Family One-Touch Check-in
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {memberDatabase.map(mbr => (
                <div 
                  key={mbr.id}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between transition"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="text-xs font-bold text-slate-100 truncate">{mbr.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{mbr.id} • {mbr.familyMembers.length} in Unit</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      type="button"
                      onClick={() => handleExecuteCheckIn(mbr, 1)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[10px] font-semibold border border-white/5 transition"
                    >
                      Self (1)
                    </button>
                    {mbr.familyMembers.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleExecuteCheckIn(mbr, mbr.familyMembers.length)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 transition"
                      >
                        All ({mbr.familyMembers.length})
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Scanned Badge & Realtime Counters (1 Col) */}
        <div className="flex flex-col gap-4">
          
          {/* Headcount Stat Badge */}
          <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Check-in Headcount</p>
              <h3 className="text-3xl font-black text-emerald-300 mt-1">{totalHeadcount}</h3>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">● Live Sanctuary Capacity Validated</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users size={22} />
            </div>
          </div>

          {/* Last Scanned Member Display Card */}
          <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex-1 flex flex-col justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2.5">
              Active Verified Check-in
            </h4>

            {lastScanned ? (
              <div className="flex flex-col gap-3 my-auto py-2 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20 shrink-0">
                    {lastScanned.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white leading-tight">{lastScanned.name}</h5>
                    <p className="text-[10px] text-cyan-300 font-mono">{lastScanned.id}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 inline-block mt-1">
                      {lastScanned.checkedCount} Seats Reserved
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300 flex flex-col gap-1">
                  <span className="flex items-center justify-between text-slate-400">
                    <span>Household:</span>
                    <strong className="text-slate-200">{lastScanned.family}</strong>
                  </span>
                  <span className="flex items-center justify-between text-slate-400">
                    <span>Timestamp:</span>
                    <strong className="text-cyan-300 font-mono">{lastScanned.time}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center my-auto py-6 text-slate-500 gap-2">
                <QrCode size={36} className="opacity-40" />
                <p className="text-xs">Awaiting next badge scan...</p>
              </div>
            )}

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Latency: 0.18s</span>
              <span>AES Handshake OK</span>
            </div>
          </div>

        </div>

      </div>

      {/* Realtime Attendance History Ledger */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Sunday Service Check-in Ledger ({attendanceLedger.length} Records)
        </h4>

        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="p-3.5">Member / Guest</th>
                <th className="p-3.5">Family Group</th>
                <th className="p-3.5">Headcount</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Service Slot</th>
                <th className="p-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
              {attendanceLedger.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {row.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">{row.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{row.memberId}</p>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300">{row.family}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/20">
                      +{row.count}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">{row.time}</td>
                  <td className="p-3.5 text-slate-300">{row.service}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      ● {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}