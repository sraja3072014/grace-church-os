import React, { useState } from 'react';
import StageFlowControlDesk from './StageFlowControlDesk';
import ScriptureLyricProjectionEngine from './ScriptureLyricProjectionEngine';
import { Clock, Tv } from 'lucide-react';

export default function LiveDesk() {
  const [liveSubTab, setLiveSubTab] = useState('projection'); // 'projection' | 'stageflow'

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setLiveSubTab('projection')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            liveSubTab === 'projection'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tv size={14} />
          <span>Scripture & Lyric Projection</span>
        </button>

        <button
          type="button"
          onClick={() => setLiveSubTab('stageflow')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            liveSubTab === 'stageflow'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock size={14} />
          <span>Stage Flow & Timer</span>
        </button>
      </div>

      {liveSubTab === 'projection' && <ScriptureLyricProjectionEngine />}
      {liveSubTab === 'stageflow' && <StageFlowControlDesk />}
    </div>
  );
}
