// src/components/settings/tabs/ThemeDisplayTab.jsx
import React, { useState, useRef } from 'react';
import {
  Palette, SunMedium, Layers, Type, LayoutGrid, Volume2, MousePointer, 
  Image as ImageIcon, Sparkles, CheckCircle2, Upload, Trash2, CloudRain, Zap
} from 'lucide-react';
import { saveLargeWallpaper, deleteLargeWallpaper } from '../../../utils/storageDB';

export default function ThemeDisplayTab() {
  const [activeSubSection, setActiveSubSection] = useState('background');
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  const [themeConfig, setThemeConfig] = useState(() => {
    const local = localStorage.getItem('graceos_theme_config');
    const parsed = local ? JSON.parse(local) : {};
    return {
      preset: parsed.preset || 'aurora_cosmic',
      bgColor: parsed.bgColor || '#07050d',
      textColor: parsed.textColor || '#ffffff',
      autoContrast: parsed.autoContrast ?? true,
      sidebarBg: parsed.sidebarBg || '#090d16',
      sidebarTextColor: parsed.sidebarTextColor || '#f8fafc',
      layoutStyle: parsed.layoutStyle || 'windows_dock',
      hasCustomWallpaper: parsed.hasCustomWallpaper || false,
      wallpaperDim: parsed.wallpaperDim ?? 20,
      wallpaperBrightness: parsed.wallpaperBrightness ?? 100,
      glassGlowColor: parsed.glassGlowColor || '#06b6d4',
      shadowIntensity: parsed.shadowIntensity ?? 40,
      enableRainFX: parsed.enableRainFX || false,
      enableThunderPulse: parsed.enableThunderPulse || false,
      enableHolyDustFX: parsed.enableHolyDustFX || false,
      enableSoundWaves: parsed.enableSoundWaves || false,
      enableRainbowHover: parsed.enableRainbowHover || false,
    };
  });

  const themeCategories = [
    {
      categoryTitle: '1. Aurora Gradient (Lumina) - 3 Styles',
      styles: [
        { id: 'aurora_cosmic', name: 'Cosmic Violet & Cyan', desc: 'Deep cosmic purple base with electric cyan aura glow.', defaultBg: '#07050d', glow: '#06b6d4', accent: 'from-cyan-500 to-purple-600' },
        { id: 'aurora_sunset', name: 'Sunset Amber Wave', desc: 'Obsidian warm base with glowing orange-amber highlights.', defaultBg: '#1c1917', glow: '#f59e0b', accent: 'from-orange-500 to-amber-600' },
        { id: 'aurora_midnight', name: 'Midnight Neon Pink', desc: 'Deep midnight blue with vibrant neon pink radiance.', defaultBg: '#1e1b4b', glow: '#ec4899', accent: 'from-rose-500 to-indigo-600' }
      ]
    },
    {
      categoryTitle: '2. Glassmorphism Pro (Mac & Win Fluent) - 3 Styles',
      styles: [
        { id: 'glass_frosted', name: 'Pure Frosted Acrylic', desc: 'Translucent glass with clean crystal-blue borders.', defaultBg: '#0f172a', glow: '#38bdf8', accent: 'from-blue-500 to-slate-700' },
        { id: 'glass_obsidian', name: 'Dark Obsidian Glass', desc: 'Pitch dark sleek glass finish with ultra-sharp reflections.', defaultBg: '#09090b', glow: '#a855f7', accent: 'from-purple-500 to-zinc-800' },
        { id: 'glass_platinum', name: 'Platinum Silver Mist', desc: 'Bright silver-tinted glass surface for corporate look.', defaultBg: '#18181b', glow: '#e2e8f0', accent: 'from-zinc-400 to-slate-600' }
      ]
    },
    {
      categoryTitle: '3. Organic Earth & Moss (Bio-Minimalism) - 3 Styles',
      styles: [
        { id: 'earth_forest', name: 'Deep Forest Pine', desc: 'Calming dark forest greens with emerald moss glow.', defaultBg: '#06130b', glow: '#10b981', accent: 'from-emerald-600 to-teal-800' },
        { id: 'earth_stone', name: 'Warm Stone & Clay', desc: 'Earthy brown and stone mineral tones for eye comfort.', defaultBg: '#1c1917', glow: '#d97706', accent: 'from-amber-700 to-stone-800' },
        { id: 'earth_sage', name: 'Sage & Olive Mist', desc: 'Soft olive haze with natural muted green atmosphere.', defaultBg: '#111815', glow: '#84cc16', accent: 'from-lime-600 to-emerald-900' }
      ]
    },
    {
      categoryTitle: '4. Rainbow Liquid Spectrum - 3 Styles',
      styles: [
        { id: 'rainbow_neon', name: 'Neon Prism Spectrum', desc: 'Continuous multi-color shifting spectrum bubbles.', defaultBg: '#0a0a0f', glow: '#ec4899', accent: 'from-rose-500 via-purple-500 to-cyan-500' },
        { id: 'rainbow_aurora', name: 'Aurora Borealis Wave', desc: 'Flowing shifting rainbow lights across obsidian base.', defaultBg: '#090d16', glow: '#34d399', accent: 'from-emerald-400 via-cyan-500 to-purple-600' },
        { id: 'rainbow_sunset', name: 'Holographic Sunset Glow', desc: 'Vibrant shifting warm sunset chromatic radiance.', defaultBg: '#18121a', glow: '#f43f5e', accent: 'from-amber-400 via-rose-500 to-indigo-600' }
      ]
    }
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const calculateSmartTextColor = (hexColor) => {
    if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
    const r = parseInt(hexColor.slice(1, 3), 16) || 0;
    const g = parseInt(hexColor.slice(3, 5), 16) || 0;
    const b = parseInt(hexColor.slice(5, 7), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0f172a' : '#ffffff';
  };

  const updateConfig = (newConfig) => {
    let finalTextColor = newConfig.textColor;
    if (newConfig.autoContrast) {
      finalTextColor = calculateSmartTextColor(newConfig.bgColor);
      newConfig.textColor = finalTextColor;
    }

    setThemeConfig(newConfig);
    localStorage.setItem('graceos_theme_config', JSON.stringify(newConfig));

    const root = document.documentElement;
    root.style.setProperty('--app-bg-color', newConfig.bgColor);
    root.style.setProperty('--dynamic-text-color', finalTextColor);
    root.style.setProperty('--card-glow-color', newConfig.glassGlowColor);

    document.body.style.backgroundColor = newConfig.bgColor;
    document.body.style.color = finalTextColor;

    window.dispatchEvent(new Event('graceos_theme_updated'));
  };

  const handleSubStyleSelect = (subStyle) => {
    const smartText = themeConfig.autoContrast ? calculateSmartTextColor(subStyle.defaultBg) : '#ffffff';
    const updated = {
      ...themeConfig,
      preset: subStyle.id,
      bgColor: subStyle.defaultBg,
      glassGlowColor: subStyle.glow,
      textColor: smartText,
      hasCustomWallpaper: false
    };
    updateConfig(updated);
    showToast(`Style Applied: ${subStyle.name} ✓`);
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
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl select-none animate-in fade-in duration-200 pb-12 text-slate-200">
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Windows 11 Left Navigation Sub-Menu */}
      <div className="w-full md:w-64 win11-card rounded-2xl p-3 flex flex-col gap-1.5 shrink-0 border border-white/[0.08] h-fit">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-3 mb-1">
          Personalization
        </span>

        <button
          type="button"
          onClick={() => setActiveSubSection('background')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'background' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon size={16} className="text-cyan-400" />
          <span>Background &amp; Tint</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('colors')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'colors' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette size={16} className="text-cyan-400" />
          <span>Colors &amp; Contrast</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('themes')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'themes' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutGrid size={16} className="text-cyan-400" />
          <span>Themes &amp; Sub-Styles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('fx_studio')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'fx_studio' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={16} className="text-cyan-400" />
          <span>Atmospheric FX Studio</span>
        </button>
      </div>

      {/* Windows 11 Right Dynamic Viewport */}
      <div className="flex-1 win11-card rounded-2xl p-6 border border-white/[0.08] space-y-6">
        
        {/* 1. Background Section */}
        {activeSubSection === 'background' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-cyan-400" />
                Personalize your background
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Choose a picture, upload wallpaper, or adjust dark room dimming exposure.</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">Custom Wallpaper Image</h4>
                <p className="text-[11px] text-slate-400">Supports high-resolution PNG, JPG up to 10MB</p>
              </div>
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer transition"
                >
                  <Upload size={13} className="inline mr-1.5" /> {themeConfig.hasCustomWallpaper ? 'Change Image' : 'Browse Photos'}
                </button>
                {themeConfig.hasCustomWallpaper && (
                  <button type="button" onClick={handleRemoveWallpaper} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Background Dark Tint (Dimming Exposure)</span>
                <span className="font-mono text-cyan-400 font-bold">{themeConfig.wallpaperDim}%</span>
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
          </div>
        )}

        {/* 2. Colors Section */}
        {activeSubSection === 'colors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette size={18} className="text-cyan-400" />
                Colors &amp; Smart Contrast Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Accent colors, glass card edge glow, and automatic luminance typography.</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
              <div>
                <h4 className="text-xs font-bold text-white">Auto-Adjust Typography Contrast</h4>
                <p className="text-[11px] text-slate-400">Calculates RGB luminance for perfect text readability</p>
              </div>
              <input
                type="checkbox"
                checked={themeConfig.autoContrast}
                onChange={(e) => updateConfig({ ...themeConfig, autoContrast: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Glass Card Edge Luminous Color</span>
                <span className="font-mono text-cyan-300 text-xs">{themeConfig.glassGlowColor}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeConfig.glassGlowColor}
                  onChange={(e) => updateConfig({ ...themeConfig, glassGlowColor: e.target.value })}
                  className="w-12 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400">Select custom neon border highlight for desktop windows</span>
              </div>
            </div>

            {/* Desktop Layout Style */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">Desktop Navigation Layout Style</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, layoutStyle: 'sidebar' })}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    themeConfig.layoutStyle !== 'windows_dock' ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-black/20 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Classic Fusion Sidebar</div>
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, layoutStyle: 'windows_dock' })}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    themeConfig.layoutStyle === 'windows_dock' ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-black/20 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Windows 11 Centered Dock</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Themes Section */}
        {activeSubSection === 'themes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LayoutGrid size={18} className="text-cyan-400" />
                Master Categories &amp; Sub-Styles (4 Master Themes)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select professional design concepts under Aurora, Glassmorphism, Organic Earth, and Rainbow Spectrum.</p>
            </div>

            <div className="flex flex-col gap-6">
              {themeCategories.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400">{cat.categoryTitle}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {cat.styles.map((sub) => {
                      const isSelected = themeConfig.preset === sub.id && !themeConfig.hasCustomWallpaper;
                      return (
                        <div
                          key={sub.id}
                          onClick={() => handleSubStyleSelect(sub)}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-2 cursor-pointer transition ${
                            isSelected ? 'border-cyan-400 bg-white/10 shadow-lg' : 'border-white/10 bg-black/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${sub.accent}`} />
                            {isSelected && <CheckCircle2 size={14} className="text-cyan-400" />}
                          </div>
                          <div>
                            <h6 className="text-xs font-bold text-white">{sub.name}</h6>
                            <p className="text-[10px] text-slate-400 leading-tight">{sub.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Atmospheric FX Studio Section */}
        {activeSubSection === 'fx_studio' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                Atmospheric FX &amp; Live Sound Waves Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage rain effects, thunder lightning pulse, sanctuary dust, and live audio waves.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, enableRainFX: !themeConfig.enableRainFX })}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  themeConfig.enableRainFX ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-black/30 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-2"><CloudRain size={15} /> Raindrops FX</span>
                <span className="text-xs font-mono">{themeConfig.enableRainFX ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, enableThunderPulse: !themeConfig.enableThunderPulse })}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  themeConfig.enableThunderPulse ? 'border-amber-400 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-black/30 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-2"><Zap size={15} /> Thunder Pulse FX</span>
                <span className="text-xs font-mono">{themeConfig.enableThunderPulse ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, enableHolyDustFX: !themeConfig.enableHolyDustFX })}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  themeConfig.enableHolyDustFX ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300' : 'border-white/10 bg-black/30 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-2"><Sparkles size={15} /> Sanctuary Dust</span>
                <span className="text-xs font-mono">{themeConfig.enableHolyDustFX ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, enableSoundWaves: !themeConfig.enableSoundWaves })}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  themeConfig.enableSoundWaves ? 'border-pink-400 bg-pink-500/10 text-pink-300' : 'border-white/10 bg-black/30 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-2"><Volume2 size={15} /> Sound Waves</span>
                <span className="text-xs font-mono">{themeConfig.enableSoundWaves ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}