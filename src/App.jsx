// src/App.jsx
import React, { useState, useEffect } from 'react';
import FusionSidebar from './components/layout/FusionSidebar';
import Header from './components/layout/Header';
import MainDashboard from './components/dashboard/MainDashboard';
import AttendanceDesk from './components/attendance/AttendanceDesk';
import MembersDesk from './components/members/MembersDesk';
import FinanceDesk from './components/finance/FinanceDesk';
import CommunityHub from './components/community/CommunityHub';
import SettingsHub from './components/settings/SettingsHub';
import RainCanvas from './components/layout/RainCanvas';
import TaskbarDock from './components/layout/TaskbarDock';
import VisitorsHub from './components/visitors/VisitorsDashboard';
import PrayerWall from './components/prayer/PrayerWall';
import EventsHub from './components/events/EventsHub';
import LiveDesk from './components/live/LiveDesk';
import ReportDashboard from './components/reports/ReportDashboard';
import BulkBroadcastMessenger from './components/broadcast/BulkBroadcastMessenger';
import QuickWidgetBar from './components/widgets/QuickWidgetBar';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import MinistriesHubDesk from './components/ministry/MinistriesHubDesk';
import ChurchInventoryDesk from './components/inventory/ChurchInventoryDesk';
import { getLargeWallpaper } from './utils/storageDB';
import { LayoutDashboard, Lock, Mail, ArrowRight, Church, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallpaperData, setWallpaperData] = useState(null);

  // 1. மொழித் தேர்வு ('en' அல்லது 'ta')
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('graceos_lang') || 'en';
  });

  // 2. அட்மின் லாகின் செஷன் நிலை
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

  // 3. தீம் அமைப்பு
  const [theme, setTheme] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_theme_config');
      const parsed = local ? JSON.parse(local) : {};
      return {
        preset: parsed.preset || 'fluid_aurora_mesh',
        customColor: parsed.customColor || '#06b6d4',
        useCustomColor: parsed.useCustomColor || false,
        activeTextColor: parsed.activeTextColor || '#ffffff',
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

  // அட்மின் லாகின் சரிபார்த்தல்
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
      setAuthError(currentLang === 'ta' ? 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்! (மாதிரி: admin / grace123)' : 'Invalid credentials! (Demo: admin / grace123)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('graceos_session');
    setSession(null);
    setLoginCreds({ username: '', password: '' });
  };

  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'ta' : 'en';
    setCurrentLang(next);
    localStorage.setItem('graceos_lang', next);
  };

  // --- 1. லாகின் திரை ---
  if (!session) {
    return (
      <div className="min-h-screen bg-[#07050d] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        <div className="absolute top-1/6 left-1/5 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/6 right-1/5 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

        <button
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

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Demo: <b className="text-cyan-400">admin</b> / <b className="text-cyan-400">grace123</b></span>
            <button
              type="button"
              onClick={() => setLoginCreds({ username: 'admin', password: 'grace123' })}
              className="text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              Fill Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. முதன்மை டெஸ்க்டாப் ஒர்க்ஸ்பேஸ் ---
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

      {/* Ambient Glows */}
      {!wallpaperData && (
        <>
          <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-rose-600/15 blur-[160px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-700/15 blur-[170px] pointer-events-none" />
          <div className="absolute top-[25%] left-[30%] w-[45vw] h-[45vw] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
        </>
      )}

      {/* Classic Sidebar Navigation */}
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
        <Header />

        <main className={`flex-1 overflow-y-auto ${isDockLayout ? 'pb-24' : 'p-5'}`}>
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
            {(activeTab === 'live_desk' || activeTab === 'livestream' || activeTab === 'live') && <LiveDesk session={session} />}
            {(activeTab === 'reports' || activeTab === 'report_hub') && <ReportDashboard session={session} />}
            {activeTab === 'settings' && <SettingsHub session={session} />}
          </div>
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