import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Clock, Radio, 
  Mic2, Music, BookOpen, Bell, AlertTriangle, Maximize2 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function StageFlowControlDesk() {
  const [segments, setSegments] = useState([
    { id: 1, name: 'Opening Prayer & Welcome', durationMins: 10, icon: Bell, status: 'DONE' },
    { id: 2, name: 'Praise & Worship', durationMins: 35, icon: Music, status: 'ACTIVE' },
    { id: 3, name: 'Church Announcements & Tithe', durationMins: 10, icon: Radio, status: 'PENDING' },
    { id: 4, name: 'Sermon / Message', durationMins: 45, icon: BookOpen, status: 'PENDING' },
    { id: 5, name: 'Benediction & Closing', durationMins: 5, icon: Mic2, status: 'PENDING' }
  ]);

  const [activeSegmentIndex, setActiveSegmentIndex] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(35 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Countdown Timer Engine
  useEffect(() => {
    let timer = null;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      soundFX?.playAlertTone?.();
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining]);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectSegment = (index) => {
    soundFX?.playClickPop?.();
    setActiveSegmentIndex(index);
    setSecondsRemaining(segments[index].durationMins * 60);
    setIsRunning(false);

    setSegments((prev) =>
      prev.map((seg, i) => ({
        ...seg,
        status: i < index ? 'DONE' : i === index ? 'ACTIVE' : 'PENDING'
      }))
    );
  };

  const toggleTimer = () => {
    soundFX?.playClickPop?.();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundFX?.playClickPop?.();
    setIsRunning(false);
    setSecondsRemaining(segments[activeSegmentIndex].durationMins * 60);
  };

  const activeSegment = segments[activeSegmentIndex];
  const isOvertime = secondsRemaining <= 120 && secondsRemaining > 0;
  const isTimeUp = secondsRemaining === 0;

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sanctuary Stage Flow & Confidence Monitor</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Live Stage Director
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ஞாயிறு ஆராதனை நிகழ்வுகளின் நேரக்கட்டுப்பாடு மற்றும் மேடை மானிட்டர் டைமர் பலகை.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            Current Phase: <strong className="text-cyan-400">{activeSegment.name}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: நேரடி மேடை டைமர் (Confidence Display Card) */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          {/* Background Warning Glow */}
          {isOvertime && (
            <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none" />
          )}
          {isTimeUp && (
            <div className="absolute inset-0 bg-rose-500/20 animate-pulse pointer-events-none" />
          )}

          <div className="space-y-1 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
              Live Stage Segment
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {activeSegment.name}
            </h2>
          </div>

          {/* Big Confidence Timer Numbers */}
          <div className={`text-6xl sm:text-8xl font-black font-mono tracking-tight transition-colors relative z-10 ${
            isTimeUp 
              ? 'text-rose-500 animate-bounce' 
              : isOvertime 
              ? 'text-amber-400' 
              : 'text-cyan-400'
          }`}>
            {formatTime(secondsRemaining)}
          </div>

          {isOvertime && (
            <div className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse relative z-10">
              <AlertTriangle size={13} />
              <span>2 நிமிடங்களுக்குள் முடிக்கவும் (Wrap-up Warning)</span>
            </div>
          )}

          {isTimeUp && (
            <div className="text-xs font-bold text-rose-300 bg-rose-500/20 border border-rose-500/40 px-4 py-1.5 rounded-full flex items-center gap-1.5 relative z-10">
              <AlertTriangle size={14} />
              <span>நேரம் முடிந்தது (Time Over)</span>
            </div>
          )}

          {/* Timer Controls */}
          <div className="flex items-center gap-3 pt-2 relative z-10">
            <button
              type="button"
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xl ${
                isRunning 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Pause' : 'Start Timer'}</span>
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition active:scale-95 cursor-pointer"
              title="Reset Segment Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>

        </div>

        {/* வலதுபுறம்: ஆராதனை வரிசைப் பட்டியல் (Order of Service Timeline) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Clock size={15} className="text-cyan-400" />
              <span>Order of Service Flow</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Total: 105 Mins</span>
          </div>

          <div className="space-y-2.5">
            {segments.map((seg, idx) => {
              const Icon = seg.icon;
              const isSelected = activeSegmentIndex === idx;

              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => handleSelectSegment(idx)}
                  className={`w-full text-left p-3 rounded-2xl transition border flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-white shadow-md' 
                      : 'bg-slate-950/70 border-white/5 text-slate-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'
                    }`}>
                      <Icon size={15} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate">{seg.name}</div>
                      <span className="text-[10px] font-mono block opacity-70">
                        {seg.durationMins} mins allocation
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 font-bold ${
                    seg.status === 'DONE' 
                      ? 'bg-emerald-500/15 text-emerald-400' 
                      : isSelected 
                      ? 'bg-cyan-500/20 text-cyan-300' 
                      : 'bg-white/5 text-slate-500'
                  }`}>
                    {seg.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}