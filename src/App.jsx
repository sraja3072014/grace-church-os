import React, { useState, useEffect } from 'react';
import FusionSidebar from './components/layout/FusionSidebar';
import Header from './components/layout/Header';
import MainDashboard from './components/dashboard/MainDashboard';
import AttendanceDesk from './components/attendance/AttendanceDesk';
import MembersDesk from './components/members/MembersDesk';
import FinanceDesk from './components/finance/FinanceDesk';
import CommunityHub from './components/community/CommunityHub';
import SettingsHub from './components/settings/SettingsHub';
import UnifiedLoginModal from './components/auth/UnifiedLoginModal';
import MemberPortalView from './components/portal/MemberPortalView';
import LeaderPortalView from './components/portal/LeaderPortalView';
import RainCanvas from './components/layout/RainCanvas';
import TaskbarDock from './components/layout/TaskbarDock';
import { getLargeWallpaper } from './utils/storageDB';
import VisitorsHub from './components/visitors/VisitorsDashboard';
import PrayerWall from './components/prayer/PrayerWall';
import EventsHub from './components/events/EventsHub';
import LiveDesk from './components/live/LiveDesk';
import ReportDashboard from './components/reports/ReportDashboard';
import BulkBroadcastMessenger from './components/broadcast/BulkBroadcastMessenger';
import QuickWidgetBar from './components/widgets/QuickWidgetBar';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import VaultConnectionGuard from './components/layout/VaultConnectionGuard';
import MinistriesHubDesk from './components/ministry/MinistriesHubDesk';
import ChurchInventoryDesk from './components/inventory/ChurchInventoryDesk';
import { LayoutDashboard } from 'lucide-react';
import BelieverTouchHub from './components/believer/BelieverTouchHub';
import { useAutoCloudSync } from './hooks/useAutoCloudSync';
import MobileAppRoot from './components/mobile/MobileAppRoot';

// மொபைல் சாதனத்தைக் கண்டறியும் துல்லியமான செயல்பாடு (Component-க்கு வெளியே பாதுகாப்பாக வைக்கப்பட்டுள்ளது)
const checkIsMobile = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
  const isCapacitor = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  return isCapacitor || isMobileDevice || window.innerWidth < 768;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallpaperData, setWallpaperData] = useState(null);
  const [isMobileScreen, setIsMobileScreen] = useState(checkIsMobile);
const { syncStatus, lastSyncedAt } = useAutoCloudSync();
  // மொழி தேர்வு நிலை: 'en' அல்லது 'ta'
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('graceos_lang') || 'en';
  });

  // 1. Session State Management
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_session');
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  });

  const session = currentUser;

  // Screen resize watcher
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(checkIsMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Theme Configuration State
  const [theme, setTheme] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_theme_config');
      const parsed = local ? JSON.parse(local) : {};
      return {
        preset: parsed.preset || 'fluid_aurora_mesh',
        customColor: parsed.customColor || '#06b6d4',
        useCustomColor: parsed.useCustomColor || false,
        activeTextColor: parsed.activeTextColor || '#ffffff',
        manualTextColorOverride: parsed.manualTextColorOverride || false,
        wallpaperDim: parsed.wallpaperDim ?? 20,
        wallpaperBrightness: parsed.wallpaperBrightness ?? 100,
        glassGlowColor: parsed.glassGlowColor || '#06b6d4',
        shadowIntensity: parsed.shadowIntensity ?? 40,
        layoutStyle: parsed.layoutStyle || 'sidebar',
        enableRainFX: parsed.enableRainFX || false,
        enableThunderPulse: parsed.enableThunderPulse || false,
        enableHolyDustFX: parsed.enableHolyDustFX || false
      };
    } catch {
      return {
        preset: 'fluid_aurora_mesh',
        customColor: '#06b6d4',
        useCustomColor: false,
        activeTextColor: '#ffffff',
        manualTextColorOverride: false,
        wallpaperDim: 20,
        wallpaperBrightness: 100,
        glassGlowColor: '#06b6d4',
        shadowIntensity: 40,
        layoutStyle: 'sidebar',
        enableRainFX: false,
        enableThunderPulse: false,
        enableHolyDustFX: false
      };
    }
  });

  const syncThemeAndWallpaper = async () => {
    try {
      const local = localStorage.getItem('graceos_theme_config');
      if (local) setTheme(JSON.parse(local));
      const img = await getLargeWallpaper();
      setWallpaperData(img);
    } catch (err) {
      console.error('Error syncing theme:', err);
    }
  };

  useEffect(() => {
    syncThemeAndWallpaper();
    window.addEventListener('graceos_theme_updated', syncThemeAndWallpaper);
    return () => window.removeEventListener('graceos_theme_updated', syncThemeAndWallpaper);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('graceos_session');
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user) => {
    localStorage.setItem('graceos_session', JSON.stringify(user));
    setCurrentUser(user);
  };
if (isMobileScreen) {
  return (
    <MobileAppRoot 
      session={session} 
      onLogout={handleLogout} 
      onSwitchToDesktop={() => setIsMobileScreen(false)} 
    />
  );
}
  // 3. User Authentication Guard
  if (!session) {
    return <UnifiedLoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  const isSuperAdmin = session.role === 'SUPER_ADMIN' || session.role === 'PASTOR' || session.role === 'ADMIN';

  // 4. விசுவாசி (Believer/Member) மொபைலில் திறக்கும் போது மட்டும் Believer Dashboard காட்டும்
  if (isMobileScreen && !isSuperAdmin) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden bg-slate-950">
        <MobileAppRoot
          session={session} 
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
          onLogout={handleLogout} 
        />
      </div>
    );
  }

  // 5. Believer / Member Desktop Portal Routing
  if (session.role === 'MEMBER' || session.role === 'BELIEVER') {
    return <BelieverTouchHub session={session} onLogout={handleLogout} />;
  }

  // 6. Leader Portal
  if (session.role === 'LEADER' || session.role === 'DEPARTMENT_LEAD') {
    return <LeaderPortalView userSession={session} onLogout={handleLogout} />;
  }
  
  // 7. Desktop Pastor & Administrator Workspace
  const dynamicTextColor = theme?.activeTextColor || '#ffffff';
  const wallpaperDim = theme?.wallpaperDim ?? 20;
  const wallpaperBrightness = theme?.wallpaperBrightness ?? 100;
  const glassGlow = theme?.glassGlowColor || '#06b6d4';
  const shadowAlpha = (theme?.shadowIntensity ?? 40) / 100;
  const isDockLayout = theme?.layoutStyle === 'windows_dock';

  return (
    <div 
      style={{
        '--dynamic-text-color': dynamicTextColor,
        '--card-glow-color': glassGlow,
        '--shadow-depth': `rgba(0, 0, 0, ${shadowAlpha})`,
        color: dynamicTextColor
      }}
      className="relative flex h-screen w-screen overflow-hidden select-none font-sans bg-[#07050d]"
    >
      {/* Weather Canvas */}
      <RainCanvas 
        enableRain={theme?.enableRainFX} 
        enableThunder={theme?.enableThunderPulse} 
        enableHolyDust={theme?.enableHolyDustFX} 
      />

      {/* Wallpaper Layer */}
      {wallpaperData && (
        <div 
          className="fixed inset-0 bg-cover bg-center pointer-events-none z-[0] transition-all duration-300"
          style={{ 
            backgroundImage: `url(${wallpaperData})`,
            filter: `brightness(${wallpaperBrightness}%)`,
            imageRendering: 'auto'
          }}
        >
          <div 
            className="w-full h-full pointer-events-none transition-colors duration-300"
            style={{ backgroundColor: `rgba(0, 0, 0, ${wallpaperDim / 100})` }}
          />
        </div>
      )}

      {/* Custom Color Glow Aura */}
      {theme?.useCustomColor && !wallpaperData && (
        <div 
          className="fixed top-[-15%] left-[-10%] w-[65vw] h-[65vw] rounded-full blur-[170px] pointer-events-none opacity-25 transition-all duration-700 z-[0]"
          style={{ backgroundColor: theme.customColor }}
        />
      )}

      {/* Fluid Mesh Waves Presets */}
      {!wallpaperData && !theme?.useCustomColor && (
        <>
          {theme?.preset === 'fluid_aurora_mesh' && (
            <>
              <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-rose-600/20 blur-[160px] pointer-events-none animate-pulse" />
              <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-700/20 blur-[170px] pointer-events-none" />
              <div className="absolute top-[25%] left-[30%] w-[45vw] h-[45vw] rounded-full bg-amber-500/15 blur-[150px] pointer-events-none" />
            </>
          )}
          {theme?.preset === 'sunset_glow' && (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/20 blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-700/20 blur-[160px] pointer-events-none" />
            </>
          )}
          {theme?.preset === 'velvet_pink' && (
            <>
              <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-rose-600/20 blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-800/25 blur-[160px] pointer-events-none" />
            </>
          )}
          {theme?.preset === 'midnight_rain' && (
            <>
              <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/20 blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-800/25 blur-[160px] pointer-events-none" />
            </>
          )}
        </>
      )}

      {/* Classic Sidebar Mode */}
      {!isDockLayout && (
        <FusionSidebar 
          activeTab={activeTab || 'dashboard'} 
          setActiveTab={setActiveTab} 
          session={session} 
          onLogout={handleLogout} 
        />
      )}

      {/* Primary Desktop Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <VaultConnectionGuard />
        <Header />

        <main className={`flex-1 overflow-y-auto ${isDockLayout ? 'pb-24' : 'p-5'}`}>
          {activeTab && (
            <div className="relative p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Window Header Indicator */}
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  Module: <strong className="text-cyan-400">{activeTab.replace('_', ' ')}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3 py-1 bg-black/40 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  title="Return to Home Dashboard"
                >
                  <LayoutDashboard size={12} />
                  <span>Home Dashboard</span>
                </button>
              </div>

              {/* Core Functional Modules */}
              {activeTab === 'dashboard' && <MainDashboard setActiveTab={setActiveTab} session={session} />}
              {activeTab === 'attendance' && <AttendanceDesk session={session} />}
              {activeTab === 'members' && <MembersDesk session={session} />}
              {activeTab === 'ministries' && <MinistriesHubDesk session={session} />}
              {activeTab === 'inventory' && <ChurchInventoryDesk session={session} />}
              {activeTab === 'finance' && <FinanceDesk session={session} />}
              {activeTab === 'broadcast' && <BulkBroadcastMessenger />}
              {activeTab === 'community' && <CommunityHub session={session} />}
              {activeTab === 'visitors' && <VisitorsHub session={session} />}
              {(activeTab === 'prayer_wall' || activeTab === 'prayer') && <PrayerWall session={session} />}
              {(activeTab === 'events_hub' || activeTab === 'events') && <EventsHub session={session} />}
              {(activeTab === 'live_desk' || activeTab === 'live') && <LiveDesk session={session} />}
              {(activeTab === 'reports' || activeTab === 'report_hub') && <ReportDashboard session={session} />}
              {activeTab === 'settings' && <SettingsHub session={session} />}
            </div>
          )}

          {/* Desktop Fallback */}
          {!activeTab && (
            <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center select-none text-center space-y-4">
              <div className="p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md space-y-2">
                <h1 className="text-3xl font-black text-white tracking-widest uppercase">GraceOS Desktop</h1>
                <p className="text-xs text-slate-400">All windows minimized. Click below to reopen your workspace.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
                >
                  Open Main Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Windows 11 Taskbar Dock Mode */}
      {isDockLayout && (
        <TaskbarDock activeTab={activeTab || 'dashboard'} setActiveTab={setActiveTab} />
      )}

      {/* Utilities */}
      <QuickWidgetBar />
      <PWAInstallPrompt />
    </div>
  );
}