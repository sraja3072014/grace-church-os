import React, { useState, useRef } from 'react';
import {
  Palette, CloudRain, Zap, CheckCircle2,
  Upload, Trash2, Sparkles, HardDrive, SunMedium, Layers, Check, Layout
} from 'lucide-react';
import { saveLargeWallpaper, getLargeWallpaper, deleteLargeWallpaper } from '../../../utils/storageDB';

export default function ThemeDisplayTab() {
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  const [themeConfig, setThemeConfig] = useState(() => {
    const local = localStorage.getItem('graceos_theme_config');
    const parsed = local ? JSON.parse(local) : {};
    return {
      preset: parsed.preset || 'fluid_aurora_mesh',
      bgColor: parsed.bgColor || '#0f172a',
      textColor: parsed.textColor || '#f8fafc',

      sidebarBg: parsed.sidebarBg || '#090d16',
      sidebarTextColor: parsed.sidebarTextColor || '#f8fafc',
      layoutStyle: parsed.layoutStyle || 'windows_dock',

      hasCustomWallpaper: parsed.hasCustomWallpaper || false,
      wallpaperDim: parsed.wallpaperDim ?? 35,
      wallpaperBrightness: parsed.wallpaperBrightness ?? 100,

      glassGlowColor: parsed.glassGlowColor || '#06b6d4',
      shadowIntensity: parsed.shadowIntensity ?? 40,

      enableRainFX: parsed.enableRainFX || false,
      enableThunderPulse: parsed.enableThunderPulse || false,
      enableHolyDustFX: parsed.enableHolyDustFX || false,
    };
  });

  const darkPresets = [
    {
      id: 'fluid_aurora_mesh',
      name: 'Cinematic Fluid Mesh',
      desc: '3D Liquid aura waves blending rose, violet and electric amber.',
      accent: 'from-pink-500 via-purple-600 to-amber-500',
      defaultBg: '#0f172a'
    },
    {
      id: 'sunset_glow',
      name: 'Sunset Liquid Aura',
      desc: 'Obsidian base with warm amber-orange 3D glass edge glow.',
      accent: 'from-orange-500 to-amber-600',
      defaultBg: '#1c1917'
    },
    {
      id: 'velvet_pink',
      name: 'Cosmic Rose & Violet',
      desc: 'Deep midnight purple with vibrant neon pink radiance.',
      accent: 'from-rose-500 to-purple-600',
      defaultBg: '#1e1b4b'
    },
    {
      id: 'midnight_rain',
      name: 'Midnight Thunderstorm',
      desc: 'Deep slate navy with wet glass mood & electric cyan glow.',
      accent: 'from-cyan-500 to-blue-700',
      defaultBg: '#082f49'
    }
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const updateConfig = (newConfig) => {
    setThemeConfig(newConfig);
    localStorage.setItem('graceos_theme_config', JSON.stringify(newConfig));

    const root = document.documentElement;
    root.style.setProperty('--app-bg-color', newConfig.bgColor);
    root.style.setProperty('--dynamic-text-color', newConfig.textColor);
    root.style.setProperty('--sidebar-bg-color', newConfig.sidebarBg);
    root.style.setProperty('--sidebar-text-color', newConfig.sidebarTextColor);
    root.style.setProperty('--card-glow-color', newConfig.glassGlowColor);

    window.dispatchEvent(new Event('graceos_theme_updated'));
  };

  const handlePresetSelect = (p) => {
    const updated = {
      ...themeConfig,
      preset: p.id,
      bgColor: p.defaultBg,
      hasCustomWallpaper: false // Preset தேர்வு செய்யும்போது கஸ்டம் வால்பேப்பர் ஆஃப் செய்யப்படும்
    };
    updateConfig(updated);
    showToast(`Preset Applied: ${p.name} ✓`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File exceeds 10MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await saveLargeWallpaper(reader.result);
      const updated = { ...themeConfig, hasCustomWallpaper: true };
      updateConfig(updated);
      showToast('Custom wallpaper loaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveWallpaper = async () => {
    await deleteLargeWallpaper();
    const updated = { ...themeConfig, hasCustomWallpaper: false };
    updateConfig(updated);
    showToast('Custom wallpaper removed.');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl select-none animate-in fade-in duration-200 pb-12 text-slate-200">
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl win11-card border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Palette size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Liquid Dark Acrylic Studio &amp; Theme Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                Active Studio
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Select dark acrylic wave presets, manage custom wallpapers, and toggle atmospheric FX.
            </p>
          </div>
        </div>
      </div>

      {/* Dark Presets (Fixed & Working) */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Dark Acrylic Wave Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {darkPresets.map((p) => {
            const isSelected = themeConfig.preset === p.id && !themeConfig.hasCustomWallpaper;
            return (
              <div
                key={p.id}
                onClick={() => handlePresetSelect(p)}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 cursor-pointer transition relative overflow-hidden group ${
                  isSelected
                    ? 'border-cyan-400 bg-white/[0.08] shadow-xl shadow-cyan-500/10'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${p.accent} border border-white/20 shadow-md shrink-0`} />
                    <div>
                      <h5 className="text-xs font-bold text-white">{p.name}</h5>
                      <span className="text-[10px] text-slate-400">Acrylic Glass Waves</span>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500/40' : 'border-white/20'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wallpaper Controls */}
      <div className="p-5 rounded-2xl win11-card border border-white/[0.08] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <SunMedium size={15} className="text-amber-400" />
            Wallpaper Exposure &amp; Dimming Controls
          </span>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload size={13} /> {themeConfig.hasCustomWallpaper ? 'Change Image' : 'Upload Wallpaper (10MB)'}
            </button>
            {themeConfig.hasCustomWallpaper && (
              <button
                type="button"
                onClick={handleRemoveWallpaper}
                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Background Dark Tint (Dimming)</span>
            <span className="font-mono text-cyan-400 font-bold">{themeConfig.wallpaperDim}% Tint</span>
          </div>
          <input
            type="range"
            min="0"
            max="85"
            value={themeConfig.wallpaperDim}
            onChange={(e) => updateConfig({ ...themeConfig, wallpaperDim: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Image Native Brightness</span>
            <span className="font-mono text-amber-400 font-bold">{themeConfig.wallpaperBrightness}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="140"
            value={themeConfig.wallpaperBrightness}
            onChange={(e) => updateConfig({ ...themeConfig, wallpaperBrightness: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Glass Edge & Shadow Elevation */}
      <div className="p-5 rounded-2xl win11-card border border-white/[0.08] flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/5 pb-3">
          <Layers size={15} className="text-cyan-400" />
          Windows Glass Card Shadow &amp; Border Glow Studio
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Glass Edge Glow</span>
              <span className="text-[10px] font-mono text-cyan-300 uppercase">{themeConfig.glassGlowColor}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeConfig.glassGlowColor}
                onChange={(e) => updateConfig({ ...themeConfig, glassGlowColor: e.target.value })}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">Card edge luminous border highlight</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Shadow Elevation / Depth</span>
              <span className="font-mono text-cyan-400 font-bold">{themeConfig.shadowIntensity}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="80"
              value={themeConfig.shadowIntensity}
              onChange={(e) => updateConfig({ ...themeConfig, shadowIntensity: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] text-slate-500">Underlying glass elevation drop-shadow</span>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Layout Style */}
      <div className="p-5 rounded-2xl win11-card border border-white/[0.08] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Desktop Navigation Layout Style
          </span>
          <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
            {themeConfig.layoutStyle === 'windows_dock' ? 'Windows 11 Dock' : 'Classic Sidebar'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => updateConfig({ ...themeConfig, layoutStyle: 'sidebar' })}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              themeConfig.layoutStyle !== 'windows_dock'
                ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-md'
                : 'border-white/5 bg-black/20 text-slate-400 hover:bg-white/5'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-white">Classic Fusion Sidebar</div>
              <div className="text-[10px] text-slate-400">Fixed vertical left-hand navigation panel</div>
            </div>
            {themeConfig.layoutStyle !== 'windows_dock' && <CheckCircle2 size={16} className="text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ ...themeConfig, layoutStyle: 'windows_dock' })}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              themeConfig.layoutStyle === 'windows_dock'
                ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-md'
                : 'border-white/5 bg-black/20 text-slate-400 hover:bg-white/5'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-white">Windows 11 Centered Dock</div>
              <div className="text-[10px] text-slate-400">Bottom floating taskbar with interactive Start Menu</div>
            </div>
            {themeConfig.layoutStyle === 'windows_dock' && <CheckCircle2 size={16} className="text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Atmospheric FX Engine */}
      <div className="p-4 rounded-2xl win11-card border border-white/[0.08] flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-400" />
          Atmospheric Engine
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ ...themeConfig, enableRainFX: !themeConfig.enableRainFX })}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              themeConfig.enableRainFX ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-black/20 text-slate-400'
            }`}
          >
            <span className="text-xs font-bold flex items-center gap-2"><CloudRain size={14} /> Raindrops</span>
            <span className="text-[10px] font-mono">{themeConfig.enableRainFX ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ ...themeConfig, enableThunderPulse: !themeConfig.enableThunderPulse })}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              themeConfig.enableThunderPulse ? 'border-amber-400 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-black/20 text-slate-400'
            }`}
          >
            <span className="text-xs font-bold flex items-center gap-2"><Zap size={14} /> Thunder Pulse</span>
            <span className="text-[10px] font-mono">{themeConfig.enableThunderPulse ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ ...themeConfig, enableHolyDustFX: !themeConfig.enableHolyDustFX })}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              themeConfig.enableHolyDustFX ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300' : 'border-white/5 bg-black/20 text-slate-400'
            }`}
          >
            <span className="text-xs font-bold flex items-center gap-2"><Sparkles size={14} /> Sanctuary Dust</span>
            <span className="text-[10px] font-mono">{themeConfig.enableHolyDustFX ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}