import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, CloudRain, Zap, CheckCircle2, 
  Upload, Image as ImageIcon, Trash2, Pipette, 
  Sparkles, HardDrive, Sliders, SunMedium, Layers
} from 'lucide-react';
import { saveLargeWallpaper, getLargeWallpaper, deleteLargeWallpaper } from '../../../utils/storageDB';
import { getAverageBrightnessFromImage } from '../../../utils/contrastEngine';

export default function ThemeDisplayTab() {
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  const [themeConfig, setThemeConfig] = useState(() => {
    const local = localStorage.getItem('graceos_theme_config');
    const parsed = local ? JSON.parse(local) : {};
    return {
      preset: parsed.preset || 'fluid_aurora_mesh',
      customColor: parsed.customColor || '#06b6d4',
      useCustomColor: parsed.useCustomColor || false,
      hasCustomWallpaper: parsed.hasCustomWallpaper || false,
      
      // Auto-Adaptive / Manual Font Colors
      manualTextColorOverride: parsed.manualTextColorOverride || false,
      activeTextColor: parsed.activeTextColor || '#ffffff',

      // Wallpaper Tuner (Dimming & Brightness)
      wallpaperDim: parsed.wallpaperDim ?? 35,
      wallpaperBrightness: parsed.wallpaperBrightness ?? 100,

      // Glass Card Elevation & Border Glow
      glassShadowColor: parsed.glassShadowColor || '#000000',
      glassGlowColor: parsed.glassGlowColor || '#06b6d4',
      shadowIntensity: parsed.shadowIntensity ?? 40,

      // Atmospheric Engines
      enableRainFX: parsed.enableRainFX || false,
      enableThunderPulse: parsed.enableThunderPulse || false,
      enableHolyDustFX: parsed.enableHolyDustFX || false,

      // Local Backup Directory
      localDbPath: parsed.localDbPath || 'D:\\GraceOS_Data'
    };
  });

  useEffect(() => {
    getLargeWallpaper().then((img) => {
      if (img) setThemeConfig(prev => ({ ...prev, hasCustomWallpaper: true }));
    });
  }, []);

  const darkPresets = [
    { 
      id: 'fluid_aurora_mesh', 
      name: 'Cinematic Fluid Mesh', 
      desc: '3D Liquid aura waves blending rose, violet and electric amber.',
      accent: 'from-pink-500 via-purple-600 to-amber-500' 
    },
    { 
      id: 'sunset_glow', 
      name: 'Sunset Liquid Aura', 
      desc: 'Obsidian base with warm amber-orange 3D glass edge glow.',
      accent: 'from-orange-500 to-amber-600' 
    },
    { 
      id: 'velvet_pink', 
      name: 'Cosmic Rose & Violet', 
      desc: 'Deep midnight purple with vibrant neon pink radiance.',
      accent: 'from-rose-500 to-purple-600' 
    },
    { 
      id: 'midnight_rain', 
      name: 'Midnight Thunderstorm', 
      desc: 'Deep slate navy with wet glass mood & electric cyan glow.',
      accent: 'from-cyan-500 to-blue-700' 
    }
  ];

  const updateConfig = (newConfig) => {
    setThemeConfig(newConfig);
    localStorage.setItem('graceos_theme_config', JSON.stringify(newConfig));
    window.dispatchEvent(new Event('graceos_theme_updated'));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
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

      let recommendedColor = '#ffffff';
      if (!themeConfig.manualTextColorOverride) {
        recommendedColor = await getAverageBrightnessFromImage(reader.result);
      }

      const updated = { 
        ...themeConfig, 
        hasCustomWallpaper: true,
        activeTextColor: recommendedColor
      };
      updateConfig(updated);
      showToast(`Wallpaper loaded! Text set to ${recommendedColor === '#ffffff' ? 'White' : 'Dark'}`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveWallpaper = async () => {
    await deleteLargeWallpaper();
    const updated = { ...themeConfig, hasCustomWallpaper: false, activeTextColor: '#ffffff' };
    updateConfig(updated);
    showToast('Custom wallpaper removed.');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl select-none animate-in fade-in duration-200 pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
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
              Liquid Dark Studio & Theme Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                Windows 11 Mica Tuner
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize contrast sliders, 10MB wallpapers, card elevation, and atmospheric engines.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Dark Acrylic Wave Presets */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Dark Acrylic Wave Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {darkPresets.map((preset) => {
            const isSelected = themeConfig.preset === preset.id && !themeConfig.useCustomColor && !themeConfig.hasCustomWallpaper;
            return (
              <div
                key={preset.id}
                onClick={() => updateConfig({ ...themeConfig, preset: preset.id, useCustomColor: false })}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 cursor-pointer transition relative overflow-hidden group ${
                  isSelected 
                    ? 'border-cyan-400 bg-white/[0.08] shadow-xl shadow-cyan-500/10' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${preset.accent} border border-white/20 shadow-md shrink-0`} />
                    <div>
                      <h5 className="text-xs font-bold text-white">{preset.name}</h5>
                      <span className="text-[10px] text-slate-400">Fluent Dark Glass</span>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500/40' : 'border-white/20'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{preset.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Smart Contrast & Text Color */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white">Smart Contrast & Text Color</span>
            <p className="text-[10px] text-slate-400">Auto-detect dark/white text based on background, or customize manually.</p>
          </div>
          
          <label className="flex items-center gap-2 text-xs text-cyan-300 font-semibold cursor-pointer">
            <span>Manual Color</span>
            <input 
              type="checkbox"
              checked={themeConfig.manualTextColorOverride}
              onChange={(e) => updateConfig({ ...themeConfig, manualTextColorOverride: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </label>
        </div>

        {themeConfig.manualTextColorOverride ? (
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="color"
              value={themeConfig.activeTextColor || '#ffffff'}
              onChange={(e) => updateConfig({ ...themeConfig, activeTextColor: e.target.value })}
              className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-white uppercase">{themeConfig.activeTextColor}</span>
            <span className="text-[10px] text-slate-400">Custom user font color active</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auto-Adaptive Mode Active (System monitors background luminance)</span>
          </div>
        )}
      </div>

      {/* 3. Wallpaper Exposure & Dimming Tuner */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <SunMedium size={15} className="text-amber-400" />
            Wallpaper Exposure & Dimming Controls
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
              <Upload size={13} /> {themeConfig.hasCustomWallpaper ? 'Change Image' : 'Upload up to 10MB...'}
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

        {/* Dimming Slider */}
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
          <span className="text-[10px] text-slate-500">
            படத்தின் மேல் உள்ள இருட்டைக் குறைக்க ஸ்லைடரை இடதுபுறம் நகர்த்தவும்.
          </span>
        </div>

        {/* Brightness Slider */}
        <div className="space-y-1.5 pt-2">
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

      {/* 4. Windows Glass Card Shadow & Glow Studio */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/5 pb-3">
          <Layers size={15} className="text-cyan-400" />
          Windows Glass Card Shadow & Border Glow Studio
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Border Glow Color */}
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
              <span className="text-[11px] text-slate-400">
                கார்டுகளின் விளிம்பில் ஒளிரும் பார்டர் நிறம்
              </span>
            </div>
          </div>

          {/* Shadow Depth Intensity */}
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
            <span className="text-[10px] text-slate-500">கார்டுகளின் கீழ் விழும் நிழலின் அடர்த்தி</span>
          </div>
        </div>
      </div>

      {/* 5. Custom Color Glow & Local DB Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Custom Glow Aura */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Pipette size={15} className="text-cyan-400" />
              Custom Glow Aura
            </span>
            <label className="flex items-center gap-2 text-[10px] text-slate-400 cursor-pointer">
              <span>Enable</span>
              <input 
                type="checkbox" 
                checked={themeConfig.useCustomColor} 
                onChange={(e) => updateConfig({ ...themeConfig, useCustomColor: e.target.checked })} 
                className="w-3.5 h-3.5 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={themeConfig.customColor}
              onChange={(e) => updateConfig({ ...themeConfig, customColor: e.target.value, useCustomColor: true })}
              className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
            />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-white uppercase">{themeConfig.customColor}</span>
              <span className="text-[10px] text-slate-500">பின்னணியில் ஒளிரும் நிறம்</span>
            </div>
          </div>
        </div>

        {/* Local Storage Directory */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <HardDrive size={15} className="text-emerald-400" />
              Local Database & Backup Directory
            </span>
            <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              Drive Path
            </span>
          </div>
          <input 
            type="text"
            value={themeConfig.localDbPath}
            onChange={(e) => updateConfig({ ...themeConfig, localDbPath: e.target.value })}
            placeholder="e.g. D:\GraceOS_Backups"
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* 6. Atmospheric Weather Engine */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-3">
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