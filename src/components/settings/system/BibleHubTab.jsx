import React, { useState } from 'react';
import { BookOpen, Save, CheckCircle2, Monitor, Type, Layers, Play, Eye } from 'lucide-react';

export default function BibleHubTab() {
  const [toast, setToast] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);

  const [bibleConfig, setBibleConfig] = useState(() => {
    const local = localStorage.getItem('graceos_bible_config');
    return local ? JSON.parse(local) : {
      primaryTranslation: 'Tamil (BSI / OV)',
      secondaryTranslation: 'English (KJV)',
      dualLanguageDisplay: true,
      fontSize: '48px',
      fontColor: '#ffffff',
      backgroundStyle: 'Glass Transparent (Live Feed Overlay)',
      activeMonitor: 'Display 2 (Projector HDMI-1)'
    };
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_bible_config', JSON.stringify(bibleConfig));
    showToast('Bible Projection Engine Saved & Screen Bound!');
  };

  const handleTriggerLiveTest = () => {
    setShowLivePreview(!showLivePreview);
    showToast(showLivePreview ? 'Live overlay closed' : 'Broadcasting sample scripture slide to Projector output...');
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none">
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Bible Projection & Multi-Screen Hub
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">Dual Output Ready</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Control live Scripture display for Church Projectors, OBS NDI video feeds, and LED Wall displays.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleTriggerLiveTest}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition active:scale-95"
          >
            <Play size={13} className="text-cyan-400" />
            <span>{showLivePreview ? 'Close Preview' : 'Test Projector'}</span>
          </button>

          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          >
            <Save size={14} /> Save Projection
          </button>
        </div>
      </div>

      {/* Live Scripture Projection Slide Simulation */}
      {showLivePreview && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl flex flex-col items-center justify-center text-center gap-2 animate-in zoom-in-95">
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">John 3:16 • யோவான் 3:16</span>
          <h3 className="text-lg sm:text-xl font-bold text-white max-w-2xl leading-relaxed">
            "தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்."
          </h3>
          <p className="text-xs text-slate-400 italic mt-1">
            "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
          </p>
        </div>
      )}

      {/* Translation & Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Primary Language Version</label>
          <select 
            value={bibleConfig.primaryTranslation}
            onChange={(e) => setBibleConfig(prev => ({ ...prev, primaryTranslation: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option>Tamil (BSI / OV)</option>
            <option>English (KJV)</option>
            <option>English (NIV)</option>
            <option>Telugu (BSI)</option>
            <option>Malayalam (BSI)</option>
            <option>Hindi (BSI)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Target Output Screen</label>
          <select 
            value={bibleConfig.activeMonitor}
            onChange={(e) => setBibleConfig(prev => ({ ...prev, activeMonitor: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option>Display 2 (Projector HDMI-1)</option>
            <option>Display 3 (Sanctuary LED Wall)</option>
            <option>OBS Studio (Virtual NDI Feed)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Projection Font Size</label>
          <input 
            type="text" 
            value={bibleConfig.fontSize}
            onChange={(e) => setBibleConfig(prev => ({ ...prev, fontSize: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Background Overlay Format</label>
          <select 
            value={bibleConfig.backgroundStyle}
            onChange={(e) => setBibleConfig(prev => ({ ...prev, backgroundStyle: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option>Glass Transparent (Live Feed Overlay)</option>
            <option>Deep Obsidian Black</option>
            <option>Motion Video Gradient</option>
          </select>
        </div>
      </div>
    </form>
  );
}