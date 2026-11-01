// src/App.jsx
import React, { useState, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import FusionSidebar from './components/layout/FusionSidebar';
import Header from './components/layout/Header';
import MainDashboard from './components/dashboard/MainDashboard';
import AttendanceDesk from './components/attendance/AttendanceDesk';
import DynamicAuraKiosk from './components/attendance/DynamicAuraKiosk';
import SmartAttendanceScannerModal from './components/attendance/SmartAttendanceScannerModal';
import MembersDesk from './components/members/MembersDesk';
import FinanceDesk from './components/finance/FinanceDesk';
import CommunityHub from './components/community/CommunityHub';
import SettingsHub from './components/settings/SettingsHub';
import RainCanvas from './components/layout/RainCanvas';
import AmbientShimmerBackdrop from './components/layout/AmbientShimmerBackdrop';
import TaskbarDock from './components/layout/TaskbarDock';
import VisitorsHub from './components/visitors/VisitorsDashboard';
import PrayerWall from './components/prayer/PrayerWall';
import EventsHub from './components/events/EventsHub';
import LiveStreamMediaDesk from './components/media/LiveStreamMediaDesk';
import ReportDashboard from './components/reports/ReportDashboard';
import BulkBroadcastMessenger from './components/broadcast/BulkBroadcastMessenger';
import QuickWidgetBar from './components/widgets/QuickWidgetBar';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import MinistriesHubDesk from './components/ministry/MinistriesHubDesk';
import { getLargeWallpaper } from './utils/storageDB';
import { syncLocalVaultToCloud } from './utils/cloudSyncEngine';
import { hydrateCloudData, initializeRealtimeSyncEngine } from './utils/syncEngine';
import { canAccessModule } from './utils/accessControl';
import { resolveAmbientTokens, applyAmbientTokens, getCurrentTimePhase } from './utils/adaptiveAmbientEngine';

const DEFAULT_STYLE_WALLPAPERS = {
  glassmorphism: '',
  aero_liquid: '',
  neumorphism: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1920&auto=format&fit=crop',
  minimal_flat: ''
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsInitialSubTab, setSettingsInitialSubTab] = useState('main_church');
  const [memberRegistrationRequest, setMemberRegistrationRequest] = useState(false);
  const [wallpaperData, setWallpaperData] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCloudHydrating, setIsCloudHydrating] = useState(false);
  const [cloudHydrationComplete, setCloudHydrationComplete] = useState(false);
  const sampleMemberId = "grace-member-uuid-12345";

  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('graceos_auth_session')
        || localStorage.getItem('graceos_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_theme_config');
      const parsed = local ? JSON.parse(local) : {};
      return {
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
        activeTextColor: parsed.textColor || '#ffffff',
        wallpaperDim: parsed.wallpaperDim ?? 35,
        wallpaperBrightness: parsed.wallpaperBrightness ?? 100,
        auraOpacity: parsed.auraOpacity ?? 32,
        glassGlowColor: parsed.glassGlowColor || parsed.borderTint || 'rgba(6, 182, 212, 0.3)',
        shadowIntensity: parsed.shadowIntensity ?? 40,
        layoutStyle: parsed.layoutStyle || 'windows_dock',
        enableRainFX: parsed.enableRainFX || false,
        enableThunderPulse: parsed.enableThunderPulse || false,
        enableHolyDustFX: parsed.enableHolyDustFX || false,
        enableRainbowHover: parsed.enableRainbowHover || false
      };
    } catch {
      return {
        paletteId: 'obsidian_cyan',
        primaryAccent: '#06b6d4',
        auraGlow: 'rgba(6, 182, 212, 0.15)',
        borderTint: 'rgba(6, 182, 212, 0.3)',
        preset: 'aurora_cosmic',
        styleModel: 'glassmorphism',
        bgMode: 'dynamic_glow',
        bgColor: '#07050d',
        textColor: '#ffffff',
        autoContrast: true,
        activeTextColor: '#ffffff',
        wallpaperDim: 35,
        wallpaperBrightness: 100,
        auraOpacity: 32,
        glassGlowColor: 'rgba(6, 182, 212, 0.3)',
        shadowIntensity: 40,
        layoutStyle: 'windows_dock',
        enableRainFX: false,
        enableThunderPulse: false,
        enableHolyDustFX: false,
        enableRainbowHover: false
      };
    }
  });

  const syncThemeAndWallpaper = async () => {
    try {
      const local = localStorage.getItem('graceos_theme_config');
      if (local) {
        const parsed = JSON.parse(local);
        const resolved = resolveAmbientTokens(parsed);
        setTheme({ ...parsed, resolvedAmbient: resolved });
        if (resolved) {
          applyAmbientTokens(resolved);
        } else {
          const root = document.documentElement;
          if (parsed.bgColor) root.style.setProperty('--app-bg-color', parsed.bgColor);
          if (parsed.textColor) root.style.setProperty('--dynamic-text-color', parsed.textColor);
          if (parsed.primaryAccent) root.style.setProperty('--primary-accent', parsed.primaryAccent);
          if (parsed.auraGlow) root.style.setProperty('--aura-glow', parsed.auraGlow);
          if (parsed.borderTint) root.style.setProperty('--border-tint', parsed.borderTint);
          if (parsed.glassGlowColor || parsed.borderTint) {
            root.style.setProperty('--card-glow-color', parsed.glassGlowColor || parsed.borderTint);
            root.style.setProperty('--glow-accent', parsed.auraGlow || parsed.glassGlowColor);
          }
        }
        if (parsed.auraOpacity !== undefined) {
          document.documentElement.style.setProperty('--ambient-glow-opacity', (parsed.auraOpacity / 100).toString());
        }
        if (parsed.shimmerOpacity !== undefined) {
          document.documentElement.style.setProperty('--ambient-shimmer-opacity', (parsed.shimmerOpacity / 100).toString());
        }
      }
      const img = await getLargeWallpaper();
      setWallpaperData(img);
    } catch (err) {
      console.error('Error syncing theme:', err);
    }
  };

  // 100% Offline Time-Adaptive real-time clock watcher
  useEffect(() => {
    if (theme?.adaptiveMode !== 'time') return;
    const interval = setInterval(() => {
      const resolved = resolveAmbientTokens(theme);
      if (resolved) {
        applyAmbientTokens(resolved);
        setTheme((prev) => ({ ...prev, resolvedAmbient: resolved }));
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [theme?.adaptiveMode]);

  useEffect(() => {
    syncThemeAndWallpaper();
    window.addEventListener('graceos_theme_updated', syncThemeAndWallpaper);
    window.addEventListener('storage', syncThemeAndWallpaper);
    return () => {
      window.removeEventListener('graceos_theme_updated', syncThemeAndWallpaper);
      window.removeEventListener('storage', syncThemeAndWallpaper);
    };
  }, []);

  useEffect(() => {
    const syncTimer = setInterval(() => {
      if (navigator.onLine && session) {
        syncLocalVaultToCloud().catch((err) => console.warn('Periodic sync notice:', err));
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(syncTimer);
  }, [session]);

  useEffect(() => {
    if (!session) {
      setCloudHydrationComplete(false);
      return undefined;
    }

    let cancelled = false;
    let disposeRealtime = () => {};
    const localStorageIsEmpty = typeof localStorage !== 'undefined' && localStorage.length === 0;

    async function hydrateBeforeDashboard() {
      setIsCloudHydrating(true);
      try {
        // A fresh browser has no local database. Pull before any dashboard module mounts.
        // Existing sessions also pull once so stale/partial caches are repaired.
        if (localStorageIsEmpty || navigator.onLine) {
          await hydrateCloudData();
        }
      } finally {
        if (!cancelled) {
          setCloudHydrationComplete(true);
          setIsCloudHydrating(false);
          disposeRealtime = initializeRealtimeSyncEngine();
        }
      }
    }

    hydrateBeforeDashboard();
    return () => {
      cancelled = true;
      disposeRealtime();
    };
  }, [session]);

  const handleLogout = async () => {
    if (navigator.onLine) {
      try {
        await syncLocalVaultToCloud();
      } catch (err) {
        console.warn('Logout sync warning:', err);
      }
    }
    localStorage.removeItem('graceos_auth_session');
    localStorage.removeItem('graceos_session');
    setSession(null);
  };

  const handleLoginSuccess = (user) => {
    localStorage.setItem('graceos_session', JSON.stringify(user));
    setSession(user);
  };

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (isCloudHydrating || !cloudHydrationComplete) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyan-400 text-lg font-black">GraceOS</div>
          <div className="text-xs text-slate-400 mt-2">Synchronizing church database…</div>
        </div>
      </div>
    );
  }

  const dynamicTextColor = theme?.textColor || '#ffffff';
  const wallpaperDim = theme?.wallpaperDim ?? 35;
  const wallpaperBrightness = theme?.wallpaperBrightness ?? 100;
  const glassGlow = theme?.glassGlowColor || 'rgba(14, 116, 144, 0.4)';
  const shadowAlpha = (theme?.shadowIntensity ?? 40) / 100;
  const isDockLayout = theme?.layoutStyle === 'windows_dock';
  const dynamicBgColor = theme?.bgColor || '#07050d';
  const currentModel = theme?.styleModel || 'glassmorphism';
  const activeBgMode = (theme?.bgMode === 'nature_wallpaper' ? 'dynamic_glow' : theme?.bgMode) || 'dynamic_glow';

  const activeWallpaper = activeBgMode === 'custom_upload'
    ? wallpaperData
    : (activeBgMode === 'dynamic_glow' ? null : (wallpaperData || DEFAULT_STYLE_WALLPAPERS[currentModel]));

  const renderContent = () => {
    const moduleKey = {
      prayer_wall: 'prayer',
      events_hub: 'events',
      report_hub: 'reports'
    }[activeTab] || activeTab;

    if (!canAccessModule(session?.role, moduleKey)) {
      return (
        <div className="p-8 text-center bg-slate-900 border border-rose-500/20 rounded-2xl m-6">
          <h3 className="text-base font-bold text-rose-400">அணுகல் மறுக்கப்பட்டது (Access Denied)</h3>
          <p className="text-xs text-slate-400 mt-1">
            உங்கள் பொறுப்பிற்கு ({session?.role}) இந்தப் பகுதியை அணுக அனுமதி இல்லை. தலைமைப் போதகரைத் தொடர்பு கொள்ளவும்.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <MainDashboard
            setActiveTab={setActiveTab}
            session={session}
            onRegisterMember={() => {
              setActiveTab('members');
              setMemberRegistrationRequest(true);
            }}
            onOpenSettings={(subTab = 'main_church') => {
              setSettingsInitialSubTab(subTab);
              setActiveTab('settings');
            }}
          />
        );
      case 'attendance':
        return (
          <div className="space-y-6">
            <AttendanceDesk session={session} />
          </div>
        );
      case 'members':
        return (
          <MembersDesk
            session={session}
            registrationRequest={memberRegistrationRequest}
            onRegistrationRequestHandled={() => setMemberRegistrationRequest(false)}
          />
        );
      case 'ministries':
        return <MinistriesHubDesk session={session} />;
      case 'finance':
        return <FinanceDesk session={session} />;
      case 'broadcast':
        return <BulkBroadcastMessenger />;
      case 'community':
        return <CommunityHub session={session} />;
      case 'visitors':
        return <VisitorsHub session={session} />;
      case 'prayer_wall':
      case 'prayer':
        return <PrayerWall session={session} />;
      case 'events_hub':
      case 'events':
        return <EventsHub session={session} />;
      case 'livestream':
        return <LiveStreamMediaDesk />;
      case 'reports':
      case 'report_hub':
        return <ReportDashboard session={session} />;
      case 'settings':
        return (
          <SettingsHub
            session={session}
            initialSubTab={settingsInitialSubTab}
          />
        );
      default:
        return null;
    }
  };

  const activeTokens = resolveAmbientTokens(theme);
  const activeRain = activeTokens?.enableRainFX ?? theme?.enableRainFX;
  const activeThunder = activeTokens?.enableThunderPulse ?? theme?.enableThunderPulse;
  const activeHolyDust = activeTokens?.enableHolyDustFX ?? theme?.enableHolyDustFX;

  return (
    <div 
      data-theme={currentModel}
      style={{
        backgroundColor: activeTokens?.bgColor || dynamicBgColor,
        color: dynamicTextColor,
        '--dynamic-text-color': dynamicTextColor,
        '--card-glow-color': activeTokens?.cardGlow || glassGlow,
        '--shadow-depth': `rgba(0, 0, 0, ${shadowAlpha})`,
        '--ambient-glow-opacity': (theme?.auraOpacity || 32) / 100,
        '--ambient-shimmer-opacity': (activeTokens?.shimmerOpacity ?? theme?.shimmerOpacity ?? 35) / 100,
        '--primary-accent': activeTokens?.accent || theme?.primaryAccent || '#06b6d4',
        '--aura-glow': activeTokens?.aura || theme?.auraGlow || 'rgba(6, 182, 212, 0.15)',
        '--border-tint': activeTokens?.border || theme?.borderTint || 'rgba(6, 182, 212, 0.3)'
      }}
      className="relative flex h-screen w-screen overflow-hidden select-none font-sans transition-colors duration-300"
    >
      <div className="ambient-glow-container">
        <div className="ambient-glow-orb orb-1" />
        <div className="ambient-glow-orb orb-2" />
        <div className="ambient-glow-orb orb-3" />
        <div className="ambient-glow-orb orb-4" />
      </div>

      <AmbientShimmerBackdrop
        shimmerMode={activeTokens?.shimmerMode || theme?.shimmerMode || 'solar'}
        enabled={activeTokens?.enableShimmer ?? theme?.enableShimmer ?? true}
        opacity={activeTokens?.shimmerOpacity ?? theme?.shimmerOpacity ?? 35}
      />

      <RainCanvas 
        enableRain={activeRain} 
        enableThunder={activeThunder} 
        enableHolyDust={activeHolyDust} 
      />

      {activeBgMode !== 'dynamic_glow' && activeWallpaper && (
        <div 
          className="fixed inset-0 bg-cover bg-center pointer-events-none z-[0] transition-all duration-700 ease-in-out"
          style={{ 
            backgroundImage: `url(${activeWallpaper})`,
            filter: `brightness(${wallpaperBrightness}%)`,
          }}
        >
          <div 
            className="w-full h-full pointer-events-none transition-colors duration-300"
            style={{ backgroundColor: `rgba(0, 0, 0, ${wallpaperDim / 100})` }}
          />
        </div>
      )}

      {/* Fusion Sidebar */}
      {!isDockLayout && (
        <div className="relative z-20">
          <FusionSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            session={session} 
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <Header
          onLogout={handleLogout}
          session={session}
        />

        <main className={`flex-1 overflow-y-auto ${isDockLayout ? 'pb-24' : 'p-4 sm:p-5'}`}>
          <div className="relative animate-in fade-in zoom-in-95 duration-200">
            {renderContent()}
          </div>
        </main>
      </div>

      {isDockLayout && (
        <div className="relative z-30">
          <TaskbarDock activeTab={activeTab || 'dashboard'} setActiveTab={setActiveTab} />
        </div>
      )}

      <SmartAttendanceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        memberId={sampleMemberId}
      />

      <QuickWidgetBar />
      <PWAInstallPrompt />
    </div>
  );
}