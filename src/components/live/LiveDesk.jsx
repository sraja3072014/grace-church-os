import React, { useState } from 'react';
import StageFlowControlDesk from './StageFlowControlDesk';
import ScriptureLyricProjectionEngine from './ScriptureLyricProjectionEngine';
import AltarThanksgivingDesk from './AltarThanksgivingDesk';
import { Clock, Tv, Heart } from 'lucide-react';

export default function LiveDesk({ session }) {
  const [activeSubTab, setActiveSubTab] = useState('projection'); // 'projection' | 'stageflow' | 'altar_announcements'

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('projection')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'projection'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tv size={14} />
          <span>Scripture & Lyric Projection</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('stageflow')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'stageflow'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock size={14} />
          <span>Stage Flow & Timer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('altar_announcements')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            activeSubTab === 'altar_announcements'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart size={14} />
          <span>Altar Thanksgiving Slip</span>
        </button>
      </div>

      {activeSubTab === 'projection' && <ScriptureLyricProjectionEngine />}
      {activeSubTab === 'stageflow' && <StageFlowControlDesk />}
      {activeSubTab === 'altar_announcements' && <AltarThanksgivingDesk session={session} />}
    </div>
  );
}
