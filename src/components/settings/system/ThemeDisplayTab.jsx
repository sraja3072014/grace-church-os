// src/components/settings/system/ThemeDisplayTab.jsx
import React, { useState, useRef } from 'react';
import {
  Palette, SunMedium, Layers, Type, LayoutGrid, Volume2, MousePointer, 
  ImageIcon, Sparkles, CheckCircle2, Upload, Trash2, CloudRain, Zap, Sliders, Droplets,
  Clock, Sun, Sunset, Moon, CloudLightning, Cloud, Wind, Activity, CloudFog, Cpu
} from 'lucide-react';
import { saveLargeWallpaper, deleteLargeWallpaper } from '../../../utils/storageDB';
import {
  TIME_PHASES,
  WEATHER_CONDITIONS,
  SHIMMER_PRESETS,
  getCurrentTimePhase,
  resolveAmbientTokens,
  applyAmbientTokens
} from '../../../utils/adaptiveAmbientEngine';

// 🌿 Nature wallpaper presets (deprecated).
export const NATURE_PRESETS = [];

// 🌟 6 Windows 11 Acrylic & Dark Glassmorphism Premium Palettes
export const PREMIUM_PALETTES = [
  {
    id: 'obsidian_cyan',
    name: 'Obsidian Cyan (Default)',
    accent: '#06b6d4',
    aura: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.3)',
    desc: 'Modern Church Tech, Sharp Visibility'
  },
  {
    id: 'midnight_royal',
    name: 'Midnight Royal (Purple)',
    accent: '#8b5cf6',
    aura: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.3)',
    desc: 'Clergy, Spiritual Majesty, Deep Glass'
  },
  {
    id: 'emerald_sanctuary',
    name: 'Emerald Sanctuary',
    accent: '#10b981',
    aura: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)',
    desc: 'Growth, Finance & Giving Dashboards'
  },
  {
    id: 'celestial_sapphire',
    name: 'Celestial Sapphire',
    accent: '#3b82f6',
    aura: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    desc: 'Windows 11 Native Fluent Blue'
  },
  {
    id: 'imperial_gold',
    name: 'Imperial Gold / Amber',
    accent: '#f59e0b',
    aura: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)',
    desc: 'Pastoral VIP, Special Events, Warm Lit'
  },
  {
    id: 'rose_velvet',
    name: 'Rose Velvet',
    accent: '#f43f5e',
    aura: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.3)',
    desc: 'Youth & Vibrant Fellowship'
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
      adaptiveMode: parsed.adaptiveMode || 'off', // 'off' | 'time' | 'weather'
      weatherCondition: parsed.weatherCondition || 'sunny', // 'rainy' | 'sunny' | 'cloudy' | 'mist'
      paletteId: parsed.paletteId || 'obsidian_cyan',
      primaryAccent: parsed.primaryAccent || '#06b6d4',
      auraGlow: parsed.auraGlow || 'rgba(6, 182, 212, 0.15)',
      borderTint: parsed.borderTint || 'rgba(6, 182, 212, 0.3)',
      preset: parsed.preset || 'aurora_cosmic',
      styleModel: parsed.styleModel === 'naturemorphism' ? 'glassmorphism' : (parsed.styleModel || 'glassmorphism'),
      bgMode: parsed.bgMode === 'nature_wallpaper' ? 'dynamic_glow' : (parsed.bgMode || 'dynamic_glow'),
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
      glassGlowColor: parsed.glassGlowColor || parsed.borderTint || 'rgba(6, 182, 212, 0.3)',
      shadowIntensity: parsed.shadowIntensity ?? 40,
      enableRainFX: parsed.enableRainFX || false,
      enableThunderPulse: parsed.enableThunderPulse || false,
      enableHolyDustFX: parsed.enableHolyDustFX || false,
      enableSoundWaves: parsed.enableSoundWaves || false,
      shimmerMode: parsed.shimmerMode || 'solar',
      enableShimmer: parsed.enableShimmer ?? true,
      shimmerOpacity: parsed.shimmerOpacity ?? 35,
    };
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const updateConfig = (newConfig) => {
    setThemeConfig(newConfig);
    localStorage.setItem('graceos_theme_config', JSON.stringify(newConfig));

    const resolved = resolveAmbientTokens(newConfig);
    if (resolved) {
      applyAmbientTokens(resolved);
    } else {
      const root = document.documentElement;
      root.style.setProperty('--app-bg-color', newConfig.bgColor);
      root.style.setProperty('--dynamic-text-color', newConfig.textColor);
      root.style.setProperty('--primary-accent', newConfig.primaryAccent || '#06b6d4');
      root.style.setProperty('--aura-glow', newConfig.auraGlow || 'rgba(6, 182, 212, 0.15)');
      root.style.setProperty('--border-tint', newConfig.borderTint || 'rgba(6, 182, 212, 0.3)');
      root.style.setProperty('--card-glow-color', newConfig.glassGlowColor || newConfig.borderTint || 'rgba(6, 182, 212, 0.3)');
      root.style.setProperty('--glow-accent', newConfig.auraGlow || 'rgba(6, 182, 212, 0.15)');
    }
    if (newConfig.auraOpacity !== undefined) {
      document.documentElement.style.setProperty('--ambient-glow-opacity', (newConfig.auraOpacity / 100).toString());
    }
    if (newConfig.shimmerOpacity !== undefined) {
      document.documentElement.style.setProperty('--ambient-shimmer-opacity', (newConfig.shimmerOpacity / 100).toString());
    }

    window.dispatchEvent(new Event('graceos_theme_updated'));
  };

  const handleSelectPalette = (palette) => {
    const updated = {
      ...themeConfig,
      adaptiveMode: 'off',
      paletteId: palette.id,
      primaryAccent: palette.accent,
      auraGlow: palette.aura,
      borderTint: palette.border,
      glassGlowColor: palette.border
    };
    updateConfig(updated);
    showToast(`Palette activated: ${palette.name} ✓`);
  };

  const handleSelectTimePhase = (phase) => {
    const updated = {
      ...themeConfig,
      adaptiveMode: 'time',
      primaryAccent: phase.accent,
      auraGlow: phase.aura,
      borderTint: phase.border,
      glassGlowColor: phase.border,
      bgColor: phase.bgColor,
      enableRainFX: phase.enableRainFX,
      enableThunderPulse: phase.enableThunderPulse,
      enableHolyDustFX: phase.enableHolyDustFX,
      shimmerMode: phase.shimmerMode || 'solar'
    };
    updateConfig(updated);
    showToast(`Time simulation active: ${phase.name} (${phase.timeRange}) ✓`);
  };

  const handleSelectWeather = (weather) => {
    const updated = {
      ...themeConfig,
      adaptiveMode: 'weather',
      weatherCondition: weather.id,
      primaryAccent: weather.accent,
      auraGlow: weather.aura,
      borderTint: weather.border,
      glassGlowColor: weather.border,
      bgColor: weather.bgColor,
      enableRainFX: weather.enableRainFX,
      enableThunderPulse: weather.enableThunderPulse,
      enableHolyDustFX: weather.enableHolyDustFX,
      shimmerMode: weather.shimmerMode || 'solar'
    };
    updateConfig(updated);
    showToast(`Weather atmosphere active: ${weather.name} ✓`);
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
      bgMode: 'dynamic_glow' 
    };
    updateConfig(updated);
    showToast('Wallpaper removed. Switched to Dynamic Fluid Glow.');
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
          onClick={() => setActiveSubSection('adaptive')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
            activeSubSection === 'adaptive' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity size={16} className="text-cyan-400" />
          <span>Adaptive Ambient UI</span>
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
        
        {/* 1. Background and aura modes */}
        {activeSubSection === 'background' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-cyan-400" />
                Background Style &amp; Wallpaper Studio
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose a Dynamic Fluid Glow aura or upload your own custom sanctuary wallpaper.
              </p>
            </div>

            {/* Background mode selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, bgMode: 'dynamic_glow' })}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  themeConfig.bgMode === 'dynamic_glow' 
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold mb-1">✨ Dynamic Fluid Glow</div>
                <div className="text-[11px] opacity-70">A smooth four-color aura without a wallpaper</div>
              </button>

              <button
                type="button"
                onClick={() => updateConfig({ ...themeConfig, bgMode: 'custom_upload' })}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  themeConfig.bgMode === 'custom_upload' 
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold mb-1">🖼️ Custom Wallpaper</div>
                <div className="text-[11px] opacity-70">Upload your own church or sanctuary image</div>
              </button>
            </div>

            {/* Custom upload card */}
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

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Aura Softness</span>
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
                  <span className="text-[10px] text-slate-500 block">Lower percentages create a softer, more eye-friendly glow.</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Wallpaper Dim</span>
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
                  <span className="text-[10px] text-slate-500 block">Increase dimming to improve text clarity.</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. UI models and architectural styles */}
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
            {/* 1. Frosted glassmorphism (0px blur crystal) */}
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

            {/* 4. Neumorphism */}
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

            {/* 5. Minimal flat */}
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

        {/* 3. Colors and dock */}
        {activeSubSection === 'colors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette size={18} className="text-cyan-400" />
                Windows 11 Acrylic &amp; Dark Glassmorphism Palettes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select from 6 curated color palettes with primary accents, aura glows, and glass border tints.
              </p>
            </div>

            {/* 6 Premium Palettes Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Palette size={14} className="text-cyan-400" />
                  <span>Premium Dark Acrylic Palettes</span>
                </h4>
                <span className="text-[10px] text-cyan-400 font-mono">6 Curated Palettes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {PREMIUM_PALETTES.map((pal) => {
                  const isSelected = (themeConfig.paletteId || 'obsidian_cyan') === pal.id;
                  return (
                    <div
                      key={pal.id}
                      onClick={() => handleSelectPalette(pal)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-white/40 shadow-xl ring-2'
                          : 'border-white/10 bg-slate-950/60 hover:border-white/25 hover:bg-slate-950/80'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.85)' : undefined,
                        borderColor: isSelected ? pal.accent : undefined,
                        boxShadow: isSelected ? `0 12px 30px ${pal.aura}, 0 0 20px ${pal.aura}` : undefined
                      }}
                    >
                      {/* Top Accent Swatch & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-7 h-7 rounded-xl shadow-md flex items-center justify-center shrink-0 border border-white/20 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: pal.accent }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-sm" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white truncate">{pal.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{pal.accent}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div 
                            className="p-1 rounded-full text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: pal.accent }}
                          >
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>

                      {/* Acrylic Glass Color Tri-Swatch Bar */}
                      <div className="flex items-center gap-1.5 h-3.5 rounded-lg overflow-hidden bg-slate-900/80 border border-white/10 p-0.5 mb-2.5">
                        <div className="flex-1 h-full rounded" style={{ backgroundColor: pal.accent }} title={`Primary Accent: ${pal.accent}`} />
                        <div className="w-1/3 h-full rounded" style={{ backgroundColor: pal.border }} title={`Border Tint: ${pal.border}`} />
                        <div className="w-1/4 h-full rounded" style={{ backgroundColor: pal.aura }} title={`Aura Glow: ${pal.aura}`} />
                      </div>

                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{pal.desc}</p>
                    </div>
                  );
                })}
              </div>
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

        {/* Adaptive Ambient UI Engine Section */}
        {activeSubSection === 'adaptive' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-cyan-400" />
                    Adaptive Ambient UI Engine
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    100% Offline Real-Time Atmosphere: Automatically harmonize ambient glow with your local time or weather.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                  Windows 11 Fluent Engine
                </span>
              </div>
            </div>

            {/* Mode Selection Tabs */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Atmosphere Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, adaptiveMode: 'off' })}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                    (themeConfig.adaptiveMode || 'off') === 'off'
                      ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                      : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold mb-1">
                    <Palette size={14} className="text-cyan-400" />
                    <span>Fixed Palette</span>
                  </div>
                  <p className="text-[11px] opacity-75">Use manual selection from the 6 Premium Palettes</p>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, adaptiveMode: 'time' })}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                    themeConfig.adaptiveMode === 'time'
                      ? 'border-amber-400 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                      : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold mb-1">
                    <Clock size={14} className="text-amber-400" />
                    <span>Time-Adaptive (100% Offline)</span>
                  </div>
                  <p className="text-[11px] opacity-75">Shifts aura by computer clock (Morning, Noon, Dusk, Midnight)</p>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, adaptiveMode: 'weather' })}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                    themeConfig.adaptiveMode === 'weather'
                      ? 'border-sky-400 bg-sky-500/15 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-400'
                      : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold mb-1">
                    <CloudRain size={14} className="text-sky-400" />
                    <span>Live Weather-Adaptive</span>
                  </div>
                  <p className="text-[11px] opacity-75">Atmosphere, blur &amp; particles adjust to live climate</p>
                </button>
              </div>
            </div>

            {/* 1. Time-Adaptive UI Panel */}
            {themeConfig.adaptiveMode === 'time' && (
              <div className="space-y-4 pt-1 animate-in fade-in">
                {/* Active Phase Status Pill */}
                {(() => {
                  const currentPhase = getCurrentTimePhase();
                  return (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                          <Clock size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">System Time Detected:</span>
                            <span className="text-xs font-mono font-bold text-amber-300">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">100% Offline</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Active Slot: <strong className="text-amber-400">{currentPhase.name}</strong> ({currentPhase.timeRange})
                          </p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                    </div>
                  );
                })()}

                {/* 4 Time Phase Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.values(TIME_PHASES).map((phase) => {
                    const isDetected = getCurrentTimePhase().id === phase.id;
                    const IconComponent = phase.id === 'morning' ? Sun : phase.id === 'noon' ? SunMedium : phase.id === 'dusk' ? Sunset : Moon;
                    return (
                      <div
                        key={phase.id}
                        className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                          isDetected 
                            ? 'border-white/40 bg-slate-900/90 shadow-xl ring-2' 
                            : 'border-white/10 bg-slate-950/60'
                        }`}
                        style={{
                          borderColor: isDetected ? phase.accent : undefined,
                          boxShadow: isDetected ? `0 12px 28px ${phase.aura}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg border border-white/15" style={{ backgroundColor: phase.aura, color: phase.accent }}>
                              <IconComponent size={15} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{phase.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400">{phase.timeRange}</span>
                            </div>
                          </div>
                          {isDetected && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                              ACTIVE NOW
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{phase.desc}</p>

                        <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-md border border-white/20" style={{ backgroundColor: phase.accent }} />
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{phase.accent}</span>
                            <span className="text-[9px] font-mono text-cyan-300/80 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                              {phase.shimmerMode === 'solar' ? '☀️ Solar Radiance' : '🌙 Lunar Obsidian'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectTimePhase(phase)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-bold text-cyan-300 border border-white/10 transition cursor-pointer"
                          >
                            Simulate Slot ↗
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Live Weather-Adaptive UI Panel */}
            {themeConfig.adaptiveMode === 'weather' && (
              <div className="space-y-4 pt-1 animate-in fade-in">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-indigo-500/10 border border-sky-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                      <CloudRain size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Live Climate Atmosphere Simulator</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Selected: <strong className="text-sky-300">{WEATHER_CONDITIONS[themeConfig.weatherCondition || 'sunny']?.name}</strong> • Cards &amp; Canvas sync in real-time
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/30">
                    REAL-TIME SYNC
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.values(WEATHER_CONDITIONS).map((weather) => {
                    const isSelected = (themeConfig.weatherCondition || 'sunny') === weather.id;
                    const WeatherIcon = weather.id === 'rainy' ? CloudLightning : weather.id === 'sunny' ? Sun : weather.id === 'cloudy' ? Cloud : Wind;
                    return (
                      <div
                        key={weather.id}
                        onClick={() => handleSelectWeather(weather)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected 
                            ? 'border-white/40 bg-slate-900/90 shadow-xl ring-2' 
                            : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                        }`}
                        style={{
                          borderColor: isSelected ? weather.accent : undefined,
                          boxShadow: isSelected ? `0 12px 28px ${weather.aura}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg border border-white/15" style={{ backgroundColor: weather.aura, color: weather.accent }}>
                              <WeatherIcon size={16} />
                            </div>
                            <h4 className="text-xs font-bold text-white">{weather.name}</h4>
                          </div>
                          {isSelected && (
                            <div className="p-1 rounded-full text-white shrink-0 shadow-sm" style={{ backgroundColor: weather.accent }}>
                              <CheckCircle2 size={13} />
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{weather.desc}</p>

                        <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2.5 text-[10px] font-mono text-slate-400">
                          <div className="flex items-center justify-between">
                            <span>Glass Blur: <strong className="text-white">{weather.cardBlur}</strong></span>
                            <span>Shimmer: <strong className="text-cyan-300">{weather.shimmerMode === 'rain' ? 'Rain Shimmer' : weather.shimmerMode === 'mist' ? 'Mist Shimmer' : 'Solar Radiance'}</strong></span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-500">
                            <span>Particles: <strong className="text-slate-300">{weather.enableRainFX ? 'Rain & Thunder' : weather.enableHolyDustFX ? 'Sanctuary Dust' : 'None'}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Off / Fixed Palette Note */}
            {(!themeConfig.adaptiveMode || themeConfig.adaptiveMode === 'off') && (
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
                  <Palette size={20} />
                </div>
                <h4 className="text-xs font-bold text-white">Manual / Fixed Palette Mode Active</h4>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  GraceOS is currently using your static palette selection. Switch to <strong>Time-Adaptive</strong> to let the atmosphere flow with your day, or <strong>Live Weather-Adaptive</strong> to reflect climate nuances.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSubSection('colors')}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition cursor-pointer"
                >
                  Configure Fixed Palettes ↗
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Atmospheric FX & Pure CSS Shimmer Studio */}
        {activeSubSection === 'fx_studio' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  Atmospheric FX &amp; Shimmer Studio
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pure CSS GPU-accelerated atmospheric shimmer layers running with 0% CPU consumption.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  <Cpu size={12} />
                  0% CPU &bull; GPU Native
                </span>
              </div>
            </div>

            {/* Master Shimmer Toggle & Opacity Slider */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-400" />
                    Atmospheric Background Shimmer
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Silky ambient aura floating softly beneath cards for calming visual depth
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, enableShimmer: !themeConfig.enableShimmer })}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                    themeConfig.enableShimmer
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm'
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  {themeConfig.enableShimmer ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {themeConfig.enableShimmer && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Sliders size={13} className="text-cyan-400" /> Shimmer Layer Opacity
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{themeConfig.shimmerOpacity ?? 35}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={themeConfig.shimmerOpacity ?? 35}
                    onChange={(e) => updateConfig({ ...themeConfig, shimmerOpacity: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10% (Subtle Whispers)</span>
                    <span>35% (Balanced Fluent)</span>
                    <span>100% (Vivid Glow)</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4 Shimmer Mode Selection Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Shimmer Aura Model
                </label>
                <span className="text-[11px] text-slate-400">
                  Select a mode or let Adaptive UI switch automatically
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SHIMMER_PRESETS.map((preset) => {
                  const isSelected = (themeConfig.shimmerMode || 'solar') === preset.id;
                  const Icon = preset.id === 'solar' ? Sun : preset.id === 'lunar' ? Moon : preset.id === 'rain' ? CloudRain : CloudFog;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        updateConfig({ ...themeConfig, shimmerMode: preset.id, enableShimmer: true });
                        showToast(`Atmospheric shimmer activated: ${preset.name} ✓`);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-white/40 bg-slate-900/90 shadow-xl ring-2'
                          : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                      }`}
                      style={{
                        borderColor: isSelected ? preset.accent : undefined,
                        boxShadow: isSelected ? `0 12px 28px ${preset.aura}` : undefined
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="p-2 rounded-xl border border-white/15"
                            style={{ backgroundColor: preset.aura, color: preset.accent }}
                          >
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              {preset.name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">{preset.subtitle}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="p-1 rounded-full text-white shrink-0 shadow-sm" style={{ backgroundColor: preset.accent }}>
                            <CheckCircle2 size={13} />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                        {preset.desc}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.accent }} />
                          {preset.accent}
                        </span>
                        <span className="text-cyan-300 font-semibold">
                          {preset.id === 'rain' ? 'Mist + Rain Streaks' : preset.id === 'solar' ? 'Daybeam Pulse' : preset.id === 'lunar' ? 'Obsidian Moonlight' : 'Frosted Mist Float'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Particle FX (Canvas 2D Complementary Layers) */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dynamic Weather Particles (Canvas 2D)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, enableRainFX: !themeConfig.enableRainFX })}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    themeConfig.enableRainFX ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-black/30 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-2"><CloudRain size={15} /> Raindrops FX</span>
                  <span className="text-xs font-mono">{themeConfig.enableRainFX ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, enableThunderPulse: !themeConfig.enableThunderPulse })}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    themeConfig.enableThunderPulse ? 'border-sky-400 bg-sky-500/10 text-sky-300' : 'border-white/10 bg-black/30 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-2"><Zap size={15} /> Thunder Flash</span>
                  <span className="text-xs font-mono">{themeConfig.enableThunderPulse ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig({ ...themeConfig, enableHolyDustFX: !themeConfig.enableHolyDustFX })}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    themeConfig.enableHolyDustFX ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300' : 'border-white/10 bg-black/30 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-2"><Sparkles size={15} /> Sanctuary Dust</span>
                  <span className="text-xs font-mono">{themeConfig.enableHolyDustFX ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}