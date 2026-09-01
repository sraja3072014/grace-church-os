import React, { useState, useEffect } from 'react';
import FusionSidebar from './components/layout/FusionSidebar';
import Header from './components/layout/Header';
import SettingsHub from './components/settings/SettingsHub';
import LoginModal from './components/auth/LoginModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState(() => {
    const local = localStorage.getItem('graceos_session');
    return local ? JSON.parse(local) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('graceos_session');
    setSession(null);
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#07050d] text-slate-100 overflow-hidden select-none font-sans">
      
      {/* Background Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[450px] min-h-[450px] rounded-full bg-orange-600/20 blur-[150px] pointer-events-none animate-orange-random" />
      <div className="absolute bottom-[-10%] left-[30%] w-[45vw] h-[45vw] min-w-[400px] min-h-[400px] rounded-full bg-purple-700/20 blur-[160px] pointer-events-none animate-crimson-float" />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] min-w-[400px] min-h-[400px] rounded-full bg-rose-700/15 blur-[150px] pointer-events-none animate-sunset-1" />

      {/* 1. Login Authentication Viewport */}
      {!session ? (
        <LoginModal onLoginSuccess={(user) => setSession(user)} />
      ) : (
        /* 2. Main Desktop OS Workspace */
        <>
          <FusionSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            session={session} 
            onLogout={handleLogout} 
          />

          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
            <Header />

            <main className="flex-1 p-5 overflow-y-auto">
              {activeTab === 'settings' ? (
                <SettingsHub />
              ) : (
                <div className="crystal-card rounded-2xl p-6 min-h-full flex flex-col justify-between border border-white/[0.08]">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-5">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white capitalize">
                          {activeTab} Overview
                        </h2>
                        <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                          Active Node: {session.activeCampus}
                        </p>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        ● Live Synced
                      </div>
                    </div>

                    {/* Standard Dashboard Cards */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                      <div className="p-5 crystal-card rounded-xl">
                        <p className="text-xs text-slate-400 font-medium">Campus Members</p>
                        <p className="text-2xl font-black text-white mt-1">2,840</p>
                      </div>
                      <div className="p-5 crystal-card rounded-xl">
                        <p className="text-xs text-slate-400 font-medium">Today Attendance</p>
                        <p className="text-2xl font-black text-orange-300 mt-1">642</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>GraceOS Touch Core</span>
                    <span>Encrypted Local DB</span>
                  </div>
                </div>
              )}
            </main>
          </div>
        </>
      )}

    </div>
  );
}