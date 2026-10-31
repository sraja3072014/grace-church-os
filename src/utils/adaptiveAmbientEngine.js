// src/utils/adaptiveAmbientEngine.js

/**
 * 🌟 GraceOS Adaptive Ambient UI Engine
 * Windows 11 Fluent Acrylic & Dark Glassmorphism Adaptive Atmosphere Engine.
 * Supports:
 * 1. Time-Adaptive UI (100% offline, local system time based)
 * 2. Live Weather-Adaptive UI (Rain, Sunny, Cloudy, Mist)
 */

export const TIME_PHASES = {
  morning: {
    id: 'morning',
    name: 'Morning Golden Hour',
    timeRange: '06:00 – 11:00',
    accent: '#f59e0b',
    aura: 'rgba(245, 158, 11, 0.18)',
    border: 'rgba(245, 158, 11, 0.35)',
    cardGlow: 'rgba(245, 158, 11, 0.35)',
    bgColor: '#0a0805',
    cardBlur: 'blur(16px)',
    enableRainFX: false,
    enableThunderPulse: false,
    enableHolyDustFX: true,
    shimmerMode: 'solar',
    desc: 'Warm Amber & Golden Radial Glow to elevate morning prayers and staff devotion.'
  },
  noon: {
    id: 'noon',
    name: 'High Noon / Daylight',
    timeRange: '11:00 – 16:00',
    accent: '#06b6d4',
    aura: 'rgba(6, 182, 212, 0.18)',
    border: 'rgba(6, 182, 212, 0.35)',
    cardGlow: 'rgba(6, 182, 212, 0.35)',
    bgColor: '#070b12',
    cardBlur: 'blur(14px)',
    enableRainFX: false,
    enableThunderPulse: false,
    enableHolyDustFX: false,
    shimmerMode: 'solar',
    desc: 'Crisp Cyan & Sky Blue Acrylic Glow for sharp midday focus and high contrast.'
  },
  dusk: {
    id: 'dusk',
    name: 'Dusk / Twilight',
    timeRange: '16:00 – 19:00',
    accent: '#8b5cf6',
    aura: 'rgba(139, 92, 246, 0.18)',
    border: 'rgba(244, 63, 94, 0.32)',
    cardGlow: 'rgba(139, 92, 246, 0.32)',
    bgColor: '#0e0915',
    cardBlur: 'blur(16px)',
    enableRainFX: false,
    enableThunderPulse: false,
    enableHolyDustFX: false,
    shimmerMode: 'lunar',
    desc: 'Royal Violet & Rose Sunset Gradient for serene evening fellowship.'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Deep Dark',
    timeRange: '19:00 – 06:00',
    accent: '#6366f1',
    aura: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.25)',
    cardGlow: 'rgba(99, 102, 241, 0.25)',
    bgColor: '#050508',
    cardBlur: 'blur(16px)',
    enableRainFX: false,
    enableThunderPulse: false,
    enableHolyDustFX: false,
    shimmerMode: 'lunar',
    desc: 'OLED Midnight Obsidian & Indigo Glow for maximum eye comfort at night.'
  }
};

export const WEATHER_CONDITIONS = {
  rainy: {
    id: 'rainy',
    name: 'Rainy / Thunderstorm',
    accent: '#38bdf8',
    aura: 'rgba(56, 189, 248, 0.18)',
    border: 'rgba(56, 189, 248, 0.32)',
    cardGlow: 'rgba(56, 189, 248, 0.32)',
    bgColor: '#080d16',
    cardBlur: 'blur(18px)',
    enableRainFX: true,
    enableThunderPulse: true,
    enableHolyDustFX: false,
    shimmerMode: 'rain',
    desc: 'Deep blue-grey storm mesh, steel blue highlights, and gentle raindrop diffusion.'
  },
  sunny: {
    id: 'sunny',
    name: 'Sunny / Clear Sky',
    accent: '#f59e0b',
    aura: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 0.35)',
    cardGlow: 'rgba(245, 158, 11, 0.35)',
    bgColor: '#0a0805',
    cardBlur: 'blur(12px)',
    enableRainFX: false,
    enableThunderPulse: false,
    enableHolyDustFX: true,
    shimmerMode: 'solar',
    desc: 'Golden Amber radiant aura with clean sunlight crystal clarity.'
  },
  cloudy: {
    id: 'cloudy',
    name: 'Cloudy / Overcast',
    accent: '#94a3b8',
    aura: 'rgba(148, 163, 184, 0.14)',
    border: 'rgba(148, 163, 184, 0.25)',
    cardGlow: 'rgba(148, 163, 184, 0.25)',
    bgColor: '#080a10',
    cardBlur: 'blur(16px)',
    enableRainFX: false,
    enableThunderPulse: false,
    enableHolyDustFX: false,
    shimmerMode: 'mist',
    desc: 'Soft muted slate grey, low ambient aura, and calm understated glass.'
  },
  mist: {
    id: 'mist',
    name: 'Mist / Fog',
    accent: '#cbd5e1',
    aura: 'rgba(203, 213, 225, 0.15)',
    border: 'rgba(203, 213, 225, 0.35)',
    cardGlow: 'rgba(203, 213, 225, 0.35)',
    bgColor: '#0a0d12',
    cardBlur: 'blur(24px)',
    enableRainFX: false,
    enableThunderPulse: false,
    enableHolyDustFX: false,
    shimmerMode: 'mist',
    desc: 'Thick 24px frosted acrylic blur with soft diffused ice-white glow.'
  }
};

export const SHIMMER_PRESETS = [
  {
    id: 'solar',
    name: 'Solar Radiance Aura',
    subtitle: 'Golden Amber Daybeam',
    desc: 'Soft golden radial radiance and soothing sun rays for morning and daytime prayers.',
    icon: 'Sun',
    accent: '#f59e0b',
    aura: 'rgba(245, 158, 11, 0.22)',
  },
  {
    id: 'lunar',
    name: 'Lunar Obsidian Shimmer',
    subtitle: 'Silvery Indigo Moonlight',
    desc: 'Calm obsidian night aura and tranquil moonlight shimmer for restful evening study.',
    icon: 'Moon',
    accent: '#818cf8',
    aura: 'rgba(129, 140, 248, 0.20)',
  },
  {
    id: 'rain',
    name: 'Rain Shimmer',
    subtitle: 'Acrylic Rain & Storm Diffusion',
    desc: 'Silky GPU-accelerated diagonal rainfall streaks with deep atmospheric storm haze.',
    icon: 'CloudRain',
    accent: '#38bdf8',
    aura: 'rgba(56, 189, 248, 0.18)',
  },
  {
    id: 'mist',
    name: 'Acrylic Mist Shimmer',
    subtitle: 'Frosted Glass Overcast Float',
    desc: 'Gentle floating horizontal clouds of slate-cyan mist for calm focused environments.',
    icon: 'CloudFog',
    accent: '#cbd5e1',
    aura: 'rgba(203, 213, 225, 0.16)',
  }
];

/**
 * Calculates current time phase based on local system time.
 * 100% Offline, zero external API calls.
 */
export function getCurrentTimePhase() {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 11) {
    return TIME_PHASES.morning;
  } else if (currentHour >= 11 && currentHour < 16) {
    return TIME_PHASES.noon;
  } else if (currentHour >= 16 && currentHour < 19) {
    return TIME_PHASES.dusk;
  } else {
    return TIME_PHASES.midnight;
  }
}

/**
 * Resolves current active ambient tokens based on theme configuration.
 */
export function resolveAmbientTokens(themeConfig) {
  if (!themeConfig) return null;

  const defaultShimmer = themeConfig.shimmerMode || 'solar';
  const enableShimmer = themeConfig.enableShimmer !== false;
  const shimmerOpacity = themeConfig.shimmerOpacity !== undefined ? Number(themeConfig.shimmerOpacity) : 35;

  if (themeConfig.adaptiveMode === 'time') {
    const timePhase = getCurrentTimePhase();
    return {
      ...timePhase,
      shimmerMode: themeConfig.shimmerModeOverride || timePhase.shimmerMode || 'solar',
      enableShimmer,
      shimmerOpacity,
      isAdaptive: true,
      mode: 'time'
    };
  }

  if (themeConfig.adaptiveMode === 'weather') {
    const weather = WEATHER_CONDITIONS[themeConfig.weatherCondition || 'sunny'] || WEATHER_CONDITIONS.sunny;
    return {
      ...weather,
      shimmerMode: themeConfig.shimmerModeOverride || weather.shimmerMode || 'solar',
      enableShimmer,
      shimmerOpacity,
      isAdaptive: true,
      mode: 'weather'
    };
  }

  return {
    accent: themeConfig.primaryAccent || '#06b6d4',
    aura: themeConfig.auraGlow || 'rgba(6, 182, 212, 0.15)',
    border: themeConfig.borderTint || 'rgba(6, 182, 212, 0.3)',
    cardGlow: themeConfig.glassGlowColor || themeConfig.borderTint || 'rgba(6, 182, 212, 0.3)',
    bgColor: themeConfig.bgColor || '#07050d',
    cardBlur: 'blur(16px)',
    enableRainFX: Boolean(themeConfig.enableRainFX),
    enableThunderPulse: Boolean(themeConfig.enableThunderPulse),
    enableHolyDustFX: Boolean(themeConfig.enableHolyDustFX),
    shimmerMode: defaultShimmer,
    enableShimmer,
    shimmerOpacity,
    isAdaptive: false,
    mode: 'manual'
  };
}

/**
 * Applies ambient CSS variables directly to the root DOM document element.
 */
export function applyAmbientTokens(tokens) {
  if (!tokens || typeof document === 'undefined') return;
  const root = document.documentElement;
  if (tokens.accent) root.style.setProperty('--primary-accent', tokens.accent);
  if (tokens.aura) root.style.setProperty('--aura-glow', tokens.aura);
  if (tokens.border) root.style.setProperty('--border-tint', tokens.border);
  if (tokens.cardGlow || tokens.border) root.style.setProperty('--card-glow-color', tokens.cardGlow || tokens.border);
  if (tokens.cardBlur) root.style.setProperty('--theme-card-blur', tokens.cardBlur);
  if (tokens.bgColor) root.style.setProperty('--app-bg-color', tokens.bgColor);
  if (tokens.shimmerOpacity !== undefined) {
    root.style.setProperty('--ambient-shimmer-opacity', (tokens.shimmerOpacity / 100).toString());
  }
}

