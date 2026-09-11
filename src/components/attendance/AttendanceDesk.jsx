import React, { useState } from 'react';
import AttendanceDeskScanner from './AttendanceDeskScanner';
import AttendanceAnalyticsFollowUp from './AttendanceAnalyticsFollowUp';
import { QrCode, UserX } from 'lucide-react';

export default function AttendanceDesk() {
  const [activeSubTab, setActiveSubTab] = useState('scanner'); // 'scanner' | 'followup'

  return (
    <div className="space-y-6">
      {/* Sub Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('scanner')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'scanner'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <QrCode size={14} />
          <span>Live Rapid Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('followup')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'followup'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserX size={14} />
          <span>Absentee Care Desk</span>
        </button>
      </div>

      {/* Panels */}
      {activeSubTab === 'scanner' && <AttendanceDeskScanner />}
      {activeSubTab === 'followup' && <AttendanceAnalyticsFollowUp />}
    </div>
  );
}
