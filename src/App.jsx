import React, { useState, useEffect } from 'react';
import FusionSidebar from './components/layout/FusionSidebar';
import Header from './components/layout/Header';
import MainDashboard from './components/dashboard/MainDashboard';
import AttendanceDesk from './components/attendance/AttendanceDesk';
import MembersDesk from './components/members/MembersDesk';
import FinanceDesk from './components/finance/FinanceDesk';
import SettingsHub from './components/settings/SettingsHub';
import LoginModal from './components/auth/LoginModal';
import RainCanvas from './components/layout/RainCanvas';
import { getLargeWallpaper } from './utils/storageDB';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallpaperData, setWallpaperData] = useState(null);
  const [session, setSession] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_session');
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      const local = localStorage.getItem('graceos_theme_config');
      const parsed = local ? JSON.parse(local) : {};
      return {
        preset: parsed.preset || 'fluid_aurora_mesh',
        customColor: parsed.customColor || '#06b6d4',
        useCustomColor: parsed.useCustomColor || false,
        activeTextColor: parsed.activeTextColor || '#ffffff',
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

  // பிழையைத் தீர்க்கும் வரையறை: textColor-க்கு fallback மதிப்பு #ffffff
  const textColor = theme?.activeTextColor || '#ffffff';

  return (
    <div 
      style={{
        '--dynamic-text-color': textColor,
        color: textColor
      }}
      className="relative flex h-screen w-screen overflow-hidden select-none font-sans bg-[#07050d]"
    >
      {/* 1. Atmospheric Rain, Thunder & Sanctuary Dust Canvas */}
      <RainCanvas 
        enableRain={theme.enableRainFX} 
        enableThunder={theme.enableThunderPulse} 
        enableHolyDust={theme.enableHolyDustFX} 
      />

      {/* 2. 10MB Custom Wallpaper (IndexedDB) */}
      {wallpaperData && (
        <div 
          className="fixed inset-0 bg-cover bg-center pointer-events-none z-[0] transition-all duration-700"
          style={{ backgroundImage: `url(${wallpaperData})` }}
        >
          <div className="w-full h-full backdrop-blur-md bg-black/75" />
        </div>
      )}

      {/* 3. Custom Glow Color Orb */}
      {theme.useCustomColor && !wallpaperData && (
        <div 
          className="fixed top-[-15%] left-[-10%] w-[65vw] h-[65vw] rounded-full blur-[170px] pointer-events-none opacity-25 transition-all duration-700 z-[0]"
          style={{ backgroundColor: theme.customColor }}
        />
      )}

      {/* 4. Fluid Waves Dark Ambient Lighting */}
      {!wallpaperData && !theme.useCustomColor && (
        <>
          {theme.preset === 'fluid_aurora_mesh' && (
            <>
              <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-rose-600/20 blur-[160px] pointer-events-none animate-pulse" />
              <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-700/20 blur-[170px] pointer-events-none" />
              <div className="absolute top-[25%] left-[30%] w-[45vw] h-[45vw] rounded-full bg-amber-500/15 blur-[150px] pointer-events-none" />
            </>
          )}
          {theme.preset === 'sunset_glow' && (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/20 blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-700/20 blur-[160px] pointer-events-none" />
            </>
          )}
          {theme.preset === 'velvet_pink' && (
            <>
              <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-rose-600/20 blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-800/25 blur-[160px] pointer-events-none" />
            </>
          )}
          {theme.preset === 'midnight_rain' && (
            <>
              <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/20 blur-[150px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-800/25 blur-[160px] pointer-events-none" />
            </>
          )}
        </>
      )}

      {/* 5. Main Desktop Workspace */}
      {!session ? (
        <LoginModal onLoginSuccess={(user) => setSession(user)} />
      ) : (
        <>
          <FusionSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            session={session} 
            onLogout={() => {
              localStorage.removeItem('graceos_session');
              setSession(null);
            }} 
          />

          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
            <Header />

            <main className="flex-1 p-5 overflow-y-auto">
              {activeTab === 'dashboard' && <MainDashboard setActiveTab={setActiveTab} session={session} />}
              {activeTab === 'attendance' && <AttendanceDesk session={session} />}
              {activeTab === 'members' && <MembersDesk session={session} />}
              {activeTab === 'finance' && <FinanceDesk session={session} />}
              {activeTab === 'settings' && <SettingsHub />}
            </main>
          </div>
        </>
      )}
    </div>
  );
}