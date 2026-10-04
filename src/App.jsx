// src/App.jsx
import React, { useState, useEffect } from 'react';
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
import { NATURE_PRESETS } from './components/settings/system/ThemeDisplayTab';
import { syncLocalVaultToCloud } from './utils/cloudSyncEngine';
import { LayoutDashboard, Lock, Mail, ArrowRight, Church, Globe, QrCode } from 'lucide-react';

const DEFAULT_STYLE_WALLPAPERS = {
  glassmorphism: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2560&auto=format&fit=crop',
  aero_liquid: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2560&auto=format&fit=crop',
  naturemorphism: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2560&auto=format&fit=crop',
  neumorphism: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1920&auto=format&fit=crop',
  minimal_flat: ''
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallpaperData, setWallpaperData] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const sampleMemberId = "grace-member-uuid-12345";

  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('graceos_lang') || 'en';
  });

  const [session, setSession] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_session');
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  });

  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [theme, setTheme] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_theme_config');
      const parsed = local ? JSON.parse(local) : {};
      return {
        preset: parsed.preset || 'aurora_cosmic',
        styleModel: parsed.styleModel || 'glassmorphism',
        bgMode: parsed.bgMode || 'nature_wallpaper',
        natureWallpaperUrl: parsed.natureWallpaperUrl || (NATURE_PRESETS && NATURE_PRESETS[0]?.url) || 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2560&auto=format&fit=crop',
        bgColor: parsed.bgColor || '#07050d',
        textColor: parsed.textColor || '#ffffff',
        autoContrast: parsed.autoContrast ?? true,
        activeTextColor: parsed.textColor || '#ffffff',
        wallpaperDim: parsed.wallpaperDim ?? 35,
        wallpaperBrightness: parsed.wallpaperBrightness ?? 100,
        auraOpacity: parsed.auraOpacity ?? 32,
        glassGlowColor: parsed.glassGlowColor || 'rgba(14, 116, 144, 0.4)',
        shadowIntensity: parsed.shadowIntensity ?? 40,
        layoutStyle: parsed.layoutStyle || 'windows_dock',
        enableRainFX: parsed.enableRainFX || false,
        enableThunderPulse: parsed.enableThunderPulse || false,
        enableHolyDustFX: parsed.enableHolyDustFX || false,
        enableRainbowHover: parsed.enableRainbowHover || false
      };
    } catch {
      return {
        preset: 'aurora_cosmic',
        styleModel: 'glassmorphism',
        bgMode: 'nature_wallpaper',
        natureWallpaperUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2560&auto=format&fit=crop',
        bgColor: '#07050d',
        textColor: '#ffffff',
        autoContrast: true,
        activeTextColor: '#ffffff',
        wallpaperDim: 35,
        wallpaperBrightness: 100,
        auraOpacity: 32,
        glassGlowColor: 'rgba(14, 116, 144, 0.4)',
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
        setTheme(JSON.parse(local));
      }
      const img = await getLargeWallpaper();
      setWallpaperData(img);
    } catch (err) {
      console.error('Error syncing theme:', err);
    }
  };

  useEffect(() => {
    syncThemeAndWallpaper();
    window.addEventListener('graceos_theme_updated', syncThemeAndWallpaper);
    window.addEventListener('storage', syncThemeAndWallpaper);
    return () => {
      window.removeEventListener('graceos_theme_updated', syncThemeAndWallpaper);
      window.removeEventListener('storage', syncThemeAndWallpaper);
    };
  }, []);

  // 🌟 30 நிமிடத்திற்கு ஒருமுறை தானியங்கி கிளவுட் பேக்கப் (Auto Relay Interval)
  useEffect(() => {
    const syncTimer = setInterval(() => {
      if (navigator.onLine && session) {
        syncLocalVaultToCloud().catch((err) => console.warn('Periodic sync notice:', err));
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(syncTimer);
  }, [session]);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const u = loginCreds.username.trim().toLowerCase();
    const p = loginCreds.password.trim();

    if ((u === 'admin' || u === 'pastor') && (p === 'grace123' || p === 'admin123')) {
      const userObj = {
        username: u === 'pastor' ? 'Senior Pastor' : 'System Admin',
        role: 'SUPER_ADMIN',
        activeCampus: 'Headquarters'
      };
      localStorage.setItem('graceos_session', JSON.stringify(userObj));
      setSession(userObj);
    } else {
      setAuthError(currentLang === 'ta' ? 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்!' : 'Invalid credentials!');
    }
  };

  // 🌟 ஒரே ஒரு முறை மட்டுமே அறிவிக்கப்பட்ட Logout + Cloud Backup ஃபங்க்ஷன்
  const handleLogout = async () => {
    if (navigator.onLine) {
      try {
        await syncLocalVaultToCloud();
      } catch (err) {
        console.warn('Logout sync warning:', err);
      }
    }
    localStorage.removeItem('graceos_session');
    setSession(null);
  };

  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'ta' : 'en';
    setCurrentLang(next);
    localStorage.setItem('graceos_lang', next);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#07050d] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        <div className="ambient-glow-container" style={{ opacity: 0.25 }}>
          <div className="ambient-glow-orb orb-1" />
          <div className="ambient-glow-orb orb-2" />
        </div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-cyan-400 backdrop-blur-xl transition cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          {currentLang === 'en' ? 'தமிழ்' : 'English'}
        </button>

        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl shadow-cyan-500/20 border border-white/20">
              <Church className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {currentLang === 'ta' ? 'கிரேஸ் சர்ச் நெட்வொர்க்' : 'Grace Church Network'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {currentLang === 'ta' ? 'நிர்வாகி கட்டுப்பாட்டு அறை உள்நுழைவு' : 'Enterprise Administrative Portal'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                {currentLang === 'ta' ? 'பயனர் பெயர்' : 'Username'}
              </label>
              <input
                type="text"
                required
                value={loginCreds.username}
                onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white placeholder-slate-500"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {currentLang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <input
                type="password"
                required
                value={loginCreds.password}
                onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-sm text-white shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{currentLang === 'ta' ? 'உள்நுழையவும்' : 'Authenticate & Launch'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Authenticated Shell
  const dynamicTextColor = theme?.textColor || '#ffffff';
  const wallpaperDim = theme?.wallpaperDim ?? 35;
  const wallpaperBrightness = theme?.wallpaperBrightness ?? 100;
  const glassGlow = theme?.glassGlowColor || 'rgba(14, 116, 144, 0.4)';
  const shadowAlpha = (theme?.shadowIntensity ?? 40) / 100;
  const isDockLayout = theme?.layoutStyle === 'windows_dock';
  const dynamicBgColor = theme?.bgColor || '#07050d';
  const currentModel = theme?.styleModel || 'glassmorphism';
  const activeBgMode = theme?.bgMode || 'nature_wallpaper';

  const activeWallpaper = activeBgMode === 'custom_upload'
    ? wallpaperData
    : activeBgMode === 'nature_wallpaper'
      ? (theme.natureWallpaperUrl || (NATURE_PRESETS && NATURE_PRESETS[0]?.url) || 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2560&auto=format&fit=crop')
      : (wallpaperData || DEFAULT_STYLE_WALLPAPERS[currentModel]);

  return (
    <div 
      data-theme={currentModel}
      style={{
        backgroundColor: dynamicBgColor,
        color: dynamicTextColor,
        '--dynamic-text-color': dynamicTextColor,
        '--card-glow-color': glassGlow,
        '--shadow-depth': `rgba(0, 0, 0, ${shadowAlpha})`,
        '--ambient-glow-opacity': (theme.auraOpacity || 32) / 100
      }}
      className="relative flex h-screen w-screen overflow-hidden select-none font-sans transition-colors duration-300"
    >
      {/* அமைதியான 4 வண்ண ஆரா */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-orb orb-1" />
        <div className="ambient-glow-orb orb-2" />
        <div className="ambient-glow-orb orb-3" />
        <div className="ambient-glow-orb orb-4" />
      </div>

      <RainCanvas 
        enableRain={theme?.enableRainFX} 
        enableThunder={theme?.enableThunderPulse} 
        enableHolyDust={theme?.enableHolyDustFX} 
      />

      {/* பின்னணி வால்பேப்பர் */}
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
            onLogout={handleLogout} 
          />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <Header />

        <main className={`flex-1 overflow-y-auto ${isDockLayout ? 'pb-24' : 'p-5'}`}>
          <div className="relative p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-4 p-3 rounded-2xl win11-card shadow-lg">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300">
                Active Module: <strong className="text-cyan-400">{activeTab.replace('_', ' ')}</strong>
              </span>
              <div className="flex items-center gap-2">
                {activeTab === 'attendance' && (
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
                  >
                    <QrCode size={14} />
                    <span>Scan Aura Check-In</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md active:scale-95"
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>

            <div>
              {activeTab === 'dashboard' && <MainDashboard setActiveTab={setActiveTab} session={session} />}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <AttendanceDesk session={session} />
                </div>
              )}
              {activeTab === 'members' && <MembersDesk session={session} />}
              {activeTab === 'ministries' && <MinistriesHubDesk session={session} />}
              {activeTab === 'finance' && <FinanceDesk session={session} />}
              {activeTab === 'broadcast' && <BulkBroadcastMessenger />}
              {activeTab === 'community' && <CommunityHub session={session} />}
              {activeTab === 'visitors' && <VisitorsHub session={session} />}
              {(activeTab === 'prayer_wall' || activeTab === 'prayer') && <PrayerWall session={session} />}
              {(activeTab === 'events_hub' || activeTab === 'events') && <EventsHub session={session} />}
              {activeTab === 'livestream' && <LiveStreamMediaDesk />}
              {(activeTab === 'reports' || activeTab === 'report_hub') && <ReportDashboard session={session} />}
              {activeTab === 'settings' && <SettingsHub session={session} />}
            </div>
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