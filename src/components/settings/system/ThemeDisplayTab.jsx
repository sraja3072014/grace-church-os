// src/components/settings/system/ThemeDisplayTab.jsx
import React, { useState, useRef } from 'react';
import {
  Palette, SunMedium, Layers, Type, LayoutGrid, Volume2, MousePointer, 
  ImageIcon, Sparkles, CheckCircle2, Upload, Trash2, CloudRain, Zap, Sliders, Droplets
} from 'lucide-react';
import { saveLargeWallpaper, deleteLargeWallpaper } from '../../../utils/storageDB';

// 🌿 4K / Real Full HD நேச்சுரல் வால்பேப்பர்கள் பட்டியல்
export const NATURE_PRESETS = [
  {
    id: 'lone_tree',
    name: 'Serene Lone Tree & Meadow',
    desc: 'அமைதியான தனி மரம் மற்றும் பரந்த பச்சை புல்வெளி',
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2560&auto=format&fit=crop'
  },
  {
    id: 'forest_sunlight',
    name: 'Sunlight Forest & Grass',
    desc: 'மரங்கள் வழியே பாயும் காலைக் கதிரவன் ஒளி',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2560&auto=format&fit=crop'
  },
  {
    id: 'green_mountain',
    name: 'Green Meadow Hills',
    desc: 'பசுமையான மலைச்சரிவு புல்வெளி மற்றும் மரங்கள்',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=2560&auto=format&fit=crop'
  },
  {
    id: 'park_canopy',
    name: 'Peaceful Tree Canopy',
    desc: 'பசுஞ்சோலை நிழல் தரும் பெரிய மரக்கூட்டம்',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=2560&auto=format&fit=crop'
  }
];

export default function ThemeDisplayTab() {
  const [activeSubSection, setActiveSubSection] = useState('background');
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  const [themeConfig, setThemeConfig] = useState(() => {
    const local = localStorage.getItem('graceos_theme_config');
    const parsed = local ? JSON.parse(local) : {};
    return {
      preset: parsed.preset || 'aurora_cosmic',
      styleModel: parsed.styleModel || 'glassmorphism',
      bgMode: parsed.bgMode || 'nature_wallpaper',
      natureWallpaperUrl: parsed.natureWallpaperUrl || NATURE_PRESETS[0].url,
      bgColor: parsed.bgColor || '#07050d',
      textColor: parsed.textColor || '#ffffff',
      autoContrast: parsed.autoContrast ?? true,
      sidebarBg: parsed.sidebarBg || '#090d16',
      sidebarTextColor: parsed.sidebarTextColor || '#f8fafc',
      layoutStyle: parsed.layoutStyle || 'windows_dock',
      hasCustomWallpaper: parsed.hasCustomWallpaper || false,
      wallpaperDim: parsed.wallpaperDim ?? 35,
      wallpaperBrightness: parsed.wallpaperBrightness ?? 100,
      auraOpacity: parsed.auraOpacity ?? 32,
      glassGlowColor: parsed.glassGlowColor || 'rgba(14, 116, 144, 0.4)',
      shadowIntensity: parsed.shadowIntensity ?? 40,
      enableRainFX: parsed.enableRainFX || false,
      enableThunderPulse: parsed.enableThunderPulse || false,
      enableHolyDustFX: parsed.enableHolyDustFX || false,
      enableSoundWaves: parsed.enableSoundWaves || false,
    };
  });

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
    root.style.setProperty('--card-glow-color', newConfig.glassGlowColor);
    root.style.setProperty('--ambient-glow-opacity', (newConfig.auraOpacity / 100).toString());

    window.dispatchEvent(new Event('graceos_theme_updated'));
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
      const updated = { 
        ...themeConfig, 
        hasCustomWallpaper: true,
        bgMode: 'custom_upload'
      };
      updateConfig(updated);
      showToast('Custom wallpaper applied successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveWallpaper = async () => {
    await deleteLargeWallpaper();
    const updated = { 
      ...themeConfig, 
      hasCustomWallpaper: false, 
      bgMode: 'nature_wallpaper' 
    };
    updateConfig(updated);
    showToast('Wallpaper removed. Switched to Nature Wallpaper.');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl select-none animate-in fade-in duration-200 pb-12 text-slate-200">
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Left Sub-Menu */}
      <div className="w-full md:w-64 win11-card rounded-2xl p-3 flex flex-col gap-1.5 shrink-0 border border-white/[0.08] h-fit">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-3 mb-1">
          Theme &amp; Visual Studio
        </span>

        <button
          type="button"
          onClick={() => setActiveSubSection('background')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'background' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon size={16} className="text-cyan-400" />
          <span>Background &amp; Aura</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('style_models')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'style_models' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers size={16} className="text-cyan-400" />
          <span>UI Models &amp; Styles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('colors')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'colors' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette size={16} className="text-cyan-400" />
          <span>Accent Colors &amp; Dock</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('fx_studio')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'fx_studio' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={16} className="text-cyan-400" />
          <span>Atmospheric FX</span>
        </button>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 win11-card rounded-2xl p-6 border border-white/[0.08] space-y-6">
        
        {/* 1. Background & Aura Modes[cite: 16] */}
        {activeSubSection === 'background' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-cyan-400" />
                பின்னணி பாணி &amp; வால்பேப்பர் ஸ்டுடியோ
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                உங்களுக்கு விருப்பமான Real Full HD இயற்கை வால்பேப்பரை அல்லது சொந்தப் படங்களைத் தேர்ந்தெடுக்கவும்.
              </p>
            </div>

            {/* முறைமைத் தேர்வு[cite: 16] */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, bgMode: 'nature_wallpaper' })}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  themeConfig.bgMode === 'nature_wallpaper' 
                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold mb-1">🌿 Nature Wallpaper</div>
                <div className="text-[11px] opacity-70">பசுமையான புல்வெளி மற்றும் மரங்கள் கேலரி</div>
              </button>

              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, bgMode: 'dynamic_glow' })}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  themeConfig.bgMode === 'dynamic_glow' 
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold mb-1">✨ Dynamic Fluid Glow</div>
                <div className="text-[11px] opacity-70">வால்பேப்பர் இன்றி மென்மையாக நகரும் 4-வண்ண ஆரா</div>
              </button>

              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, bgMode: 'custom_upload' })}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  themeConfig.bgMode === 'custom_upload' 
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold mb-1">🖼️ Custom Wallpaper</div>
                <div className="text-[11px] opacity-70">உங்கள் சொந்த தேவாலயப் படத்தை அப்லோட் செய்தல்</div>
              </button>
            </div>

            {/* 🌟 4K Real Full HD Nature Wallpaper Gallery Picker[cite: 16] */}
            {themeConfig.bgMode === 'nature_wallpaper' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    🌿 Select Full HD Grass &amp; Tree Wallpaper
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono">Real Full HD Presets</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {NATURE_PRESETS.map((item) => {
                    const isCurrent = (themeConfig.natureWallpaperUrl || NATURE_PRESETS[0].url) === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          const updated = {
                            ...themeConfig,
                            bgMode: 'nature_wallpaper',
                            natureWallpaperUrl: item.url,
                            hasCustomWallpaper: false
                          };
                          updateConfig(updated);
                          showToast(`Applied: ${item.name} ✓`);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition relative overflow-hidden group ${
                          isCurrent
                            ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400'
                            : 'border-white/10 bg-black/40 hover:border-white/30'
                        }`}
                      >
                        <div 
                          className="w-full h-28 rounded-xl bg-cover bg-center mb-2.5 transition group-hover:scale-[1.02] duration-300 border border-white/10"
                          style={{ backgroundImage: `url(${item.url})` }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{item.name}</span>
                          {isCurrent && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Upload Card[cite: 16] */}
            {themeConfig.bgMode === 'custom_upload' && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Upload Church / Sanctuary Photo</h4>
                  <p className="text-[11px] text-slate-400">Supports PNG, JPG up to 10MB</p>
                </div>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer transition active:scale-95"
                  >
                    <Upload size={13} className="inline mr-1.5" /> Browse Image
                  </button>
                  {themeConfig.hasCustomWallpaper && (
                    <button type="button" onClick={handleRemoveWallpaper} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Sliders[cite: 16] */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">மென்மையான ஆரா வெளிச்சம் (Aura Softness)</span>
                  <span className="text-cyan-400 font-mono">{themeConfig.auraOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="65"
                  value={themeConfig.auraOpacity}
                  onChange={(e) => updateConfig({ ...themeConfig, auraOpacity: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-slate-500 block">குறைவான சதவீதம் கண்களைப் பாதுகாக்க உதவும்</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">வால்பேப்பர் இருட்டடிப்பு (Wallpaper Dim)</span>
                  <span className="text-cyan-400 font-mono">{themeConfig.wallpaperDim}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="85"
                  value={themeConfig.wallpaperDim}
                  onChange={(e) => updateConfig({ ...themeConfig, wallpaperDim: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-slate-500 block">எழுத்துக்கள் தெளிவாகத் தெரிய இருட்டடிப்பை அதிகரிக்கலாம்</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. UI Models & Architectural Styles[cite: 16] */}
        {activeSubSection === 'style_models' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-cyan-400" />
                Dynamic UI Design Models
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch the entire application layout architecture without losing data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Frosted Glassmorphism (0px Blur Crystal)[cite: 16] */}
              <div
                onClick={() => updateConfig({ ...themeConfig, styleModel: 'glassmorphism' })}
                className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                  themeConfig.styleModel === 'glassmorphism'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-xl ring-1 ring-cyan-400'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-white">✨ Frosted Liquid Glass (0px Blur Crystal)</h4>
                  {themeConfig.styleModel === 'glassmorphism' && <CheckCircle2 size={16} className="text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Pure crystal transparency without blurring background grass and trees.</p>
              </div>

              {/* 2. Windows Aero / Liquid Glass Model */}
              <div
                onClick={() => updateConfig({ ...themeConfig, styleModel: 'aero_liquid' })}
                className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                  themeConfig.styleModel === 'aero_liquid'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-xl ring-1 ring-cyan-400'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    💧 Windows Aero / Liquid Glass
                  </h4>
                  {themeConfig.styleModel === 'aero_liquid' && <CheckCircle2 size={16} className="text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Glossy specular refraction with top-edge liquid highlights and crisp 0px blur transparency.</p>
              </div>

              {/* 3. Naturemorphism[cite: 16] */}
              <div
                onClick={() => updateConfig({ ...themeConfig, styleModel: 'naturemorphism', bgMode: 'nature_wallpaper' })}
                className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                  themeConfig.styleModel === 'naturemorphism'
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-xl ring-1 ring-emerald-400'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-white">🌿 Eco Naturemorphism</h4>
                  {themeConfig.styleModel === 'naturemorphism' && <CheckCircle2 size={16} className="text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Deep forest greens and misty natural tones designed for eye relaxation.</p>
              </div>

              {/* 4. Neumorphism[cite: 16] */}
              <div
                onClick={() => updateConfig({ ...themeConfig, styleModel: 'neumorphism' })}
                className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                  themeConfig.styleModel === 'neumorphism'
                    ? 'border-indigo-400 bg-indigo-500/10 shadow-xl ring-1 ring-indigo-400'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-white">🪨 Dark Neumorphism (Soft 3D)</h4>
                  {themeConfig.styleModel === 'neumorphism' && <CheckCircle2 size={16} className="text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Soft tactile shadows, matte slate cards, and extruded card surfaces.</p>
              </div>

              {/* 5. Minimal Flat[cite: 16] */}
              <div
                onClick={() => updateConfig({ ...themeConfig, styleModel: 'minimal_flat' })}
                className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
                  themeConfig.styleModel === 'minimal_flat'
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-xl ring-1 ring-cyan-400'
                    : 'border-white/10 bg-black/30 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-white">⚡ Clean Minimal Flat</h4>
                  {themeConfig.styleModel === 'minimal_flat' && <CheckCircle2 size={16} className="text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Ultra-fast, zero-blur interface optimized for maximum speed and lower RAM usage.</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Colors & Dock Section[cite: 16] */}
        {activeSubSection === 'colors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette size={18} className="text-cyan-400" />
                Colors &amp; Navigation Layout
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">Desktop Navigation Layout</h4>
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

        {/* 4. Atmospheric FX Section[cite: 16] */}
        {activeSubSection === 'fx_studio' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                Atmospheric FX
              </h3>
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
                onClick={() => updateConfig({ ...themeConfig, enableHolyDustFX: !themeConfig.enableHolyDustFX })}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  themeConfig.enableHolyDustFX ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300' : 'border-white/10 bg-black/30 text-slate-400'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-2"><Sparkles size={15} /> Sanctuary Dust</span>
                <span className="text-xs font-mono">{themeConfig.enableHolyDustFX ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}