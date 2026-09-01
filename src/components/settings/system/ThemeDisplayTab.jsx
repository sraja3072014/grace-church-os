import React, { useState, useEffect } from 'react';
import { Palette, Save, CheckCircle2, Monitor, Sparkles, Sliders } from 'lucide-react';

export default function ThemeDisplayTab() {
  const [toast, setToast] = useState(false);

  const [themeConfig, setThemeConfig] = useState(() => {
    const local = localStorage.getItem('graceos_theme_config');
    return local ? JSON.parse(local) : {
      preset: 'sunset_violet',
      blurIntensity: '28px',
      saturation: '160%',
      animatedGlow: true,
      glassOpacity: '0.65',
      highContrastText: false
    };
  });

  const presets = [
    { id: 'sunset_violet', name: 'Sunset Glow (macOS + Win11)', accent: 'from-orange-500 to-purple-600', bg: '#07050d' },
    { id: 'deep_teal_navy', name: 'Deep Teal & Midnight (Liquid Mica)', accent: 'from-cyan-500 to-blue-600', bg: '#0b1320' },
    { id: 'cosmic_burgundy', name: 'Velvet Burgundy & Wine (Cosmic)', accent: 'from-rose-500 to-pink-600', bg: '#140810' },
    { id: 'pure_obsidian', name: 'Obsidian OLED (High Contrast)', accent: 'from-emerald-500 to-teal-600', bg: '#000000' }
  ];

  const handleApplyPreset = (presetId) => {
    const updated = { ...themeConfig, preset: presetId };
    setThemeConfig(updated);
    localStorage.setItem('graceos_theme_config', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToastAlert('Theme Preset Applied Instantly!');
  };

  const showToastAlert = (msg) => {
    setToast(msg || 'Theme Settings Saved!');
    setTimeout(() => setToast(false), 2500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_theme_config', JSON.stringify(themeConfig));
    window.dispatchEvent(new Event('storage'));
    showToastAlert('Display Engine Configuration Saved!');
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
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Palette size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Tri-Fusion Theme & Display Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">GPU Accelerated</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Customize Windows 11 Mica blur, macOS ambient aura colors, and UI scaling.</p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Apply Display
        </button>
      </div>

      {/* Preset Visual Chooser */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Ambient Aura Presets</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((p) => {
            const isSelected = themeConfig.preset === p.id;
            return (
              <div 
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                  isSelected 
                    ? 'bg-white/[0.08] border-cyan-400 shadow-lg shadow-cyan-500/10' 
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${p.accent} shadow-md`} />
                  <div>
                    <p className="text-xs font-bold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.bg}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500/30' : 'border-white/20'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blur & Motion Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300">Glass Frosted Blur Intensity</label>
          <input 
            type="text" 
            value={themeConfig.blurIntensity}
            onChange={(e) => setThemeConfig(prev => ({ ...prev, blurIntensity: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Dynamic macOS Glow Motion</span>
            <input 
              type="checkbox" 
              checked={themeConfig.animatedGlow}
              onChange={(e) => setThemeConfig(prev => ({ ...prev, animatedGlow: e.target.checked }))}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-slate-500">Enables smooth ambient aura pulses on the GPU layer.</p>
        </div>
      </div>
    </form>
  );
}