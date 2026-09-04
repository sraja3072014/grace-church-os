import React, { useState } from 'react';
import { 
  LayoutGrid, LayoutDashboard, CheckSquare, Users, 
  Receipt, MessageSquare, BarChart3, HeartHandshake, 
  CalendarDays, Radio, BookOpen, HeartPulse, 
  Settings, Search, Sparkles, X
} from 'lucide-react';

export default function TaskbarDock({ activeTab, setActiveTab }) {
  const [startOpen, setStartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allModules = [
    { id: 'dashboard', label: 'Dashboard', desc: 'Realtime Church Overview', icon: LayoutDashboard, pinned: true },
    { id: 'attendance', label: 'Attendance', desc: 'Service Check-in & QR Desk', icon: CheckSquare, pinned: true },
    { id: 'members', label: 'Members Registry', desc: 'Family & Soul Directory', icon: Users, pinned: true },
    { id: 'finance', label: 'Finance & 80G', desc: 'Tithe Counter & Tax Receipts', icon: Receipt, pinned: true },
    { id: 'community', label: 'Community Feed', desc: 'Broadcasts & Group Circles', icon: MessageSquare, pinned: true },
    { id: 'prayer_wall', label: 'Prayer Wall', desc: 'Intercession & Healing Requests', icon: HeartHandshake, pinned: true },
    { id: 'events_hub', label: 'Events Hub', desc: 'Service Schedules & Meetings', icon: CalendarDays, pinned: true },
    { id: 'live_desk', label: 'Live Desk', desc: 'Stage Flow & Countdown Timers', icon: Radio, pinned: true },
    { id: 'bible_engine', label: 'Bible Engine', desc: 'Scripture Search & Projection', icon: BookOpen, pinned: true },
    { id: 'reports', label: 'Reports & Audits', desc: 'Analytics & Financial Statements', icon: BarChart3, pinned: true },
    { id: 'settings', label: 'Settings Studio', desc: 'Theme, Language & System Setup', icon: Settings, pinned: true },
  ];

  const pinnedApps = allModules.filter((app) => app.pinned);
  const normalizedSearchQuery = searchQuery.toLowerCase();
  const filteredApps = allModules.filter((app) =>
    app.label.toLowerCase().includes(normalizedSearchQuery) ||
    app.desc.toLowerCase().includes(normalizedSearchQuery)
  );

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
      
      {/* 🌟 Windows 11 Full Start Menu Popup */}
      {startOpen && (
        <div
          style={{
            background: 'rgba(10, 15, 30, 0.75)',
            borderColor: 'var(--card-glow-color, rgba(255, 255, 255, 0.2))',
            boxShadow: '0 25px 60px -10px var(--shadow-depth, rgba(0, 0, 0, 0.8)), 0 0 25px -5px var(--card-glow-color, #06b6d4)',
            color: 'var(--dynamic-text-color, #ffffff)'
          }}
          className="mb-3 w-[520px] p-5 rounded-3xl backdrop-blur-3xl border animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider">GraceOS All Modules & Launchpad</span>
            </div>
            <button
              onClick={() => setStartOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Reports, Prayer Wall, Events, Bible..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              const isActive = activeTab === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setActiveTab(app.id);
                    setStartOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition group text-center cursor-pointer border ${
                    isActive
                      ? 'bg-white/15 border-cyan-400/60 shadow-md shadow-cyan-500/20'
                      : 'border-transparent hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div
                    style={{ borderColor: isActive ? 'var(--card-glow-color, #06b6d4)' : 'rgba(255, 255, 255, 0.1)' }}
                    className="w-10 h-10 rounded-xl bg-white/5 border flex items-center justify-center transition group-hover:scale-105"
                  >
                    <Icon size={18} className={isActive ? 'text-cyan-300' : 'text-slate-300 group-hover:text-white'} />
                  </div>
                  <div className="w-full">
                    <span className="text-[11px] font-bold block truncate">{app.label}</span>
                    <span className="text-[9px] text-slate-400 block truncate">{app.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🌟 Windows 11 Adaptive Floating Taskbar */}
      <div
        style={{
          background: 'rgba(10, 15, 30, 0.65)',
          borderColor: 'var(--card-glow-color, rgba(255, 255, 255, 0.18))',
          boxShadow: '0 15px 40px -5px var(--shadow-depth, rgba(0, 0, 0, 0.6)), 0 0 16px -3px var(--card-glow-color, #06b6d4)',
          color: 'var(--dynamic-text-color, #ffffff)'
        }}
        className="px-3 py-2 rounded-2xl backdrop-blur-2xl border flex items-center gap-1 transition-all duration-300 max-w-[95vw] overflow-x-auto"
      >
        <button
          onClick={() => setStartOpen(!startOpen)}
          style={{ backgroundColor: startOpen ? 'var(--card-glow-color, #06b6d4)' : 'transparent' }}
          className={`p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer shrink-0 ${
            startOpen ? 'text-slate-950 font-bold shadow-lg' : 'hover:bg-white/10 text-cyan-400'
          }`}
          title="Start All Modules"
        >
          <LayoutGrid size={18} />
        </button>

        <div className="w-[1px] h-5 bg-white/15 mx-1 shrink-0" />

        <div className="flex items-center gap-1">
          {pinnedApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeTab === app.id;
          return (
            <button
              key={app.id}
              onClick={() => {
                setActiveTab(app.id);
                setStartOpen(false);
              }}
              title={app.label}
              style={{ color: isActive ? 'var(--card-glow-color, #06b6d4)' : 'inherit' }}
              className={`p-2.5 rounded-xl transition relative group cursor-pointer shrink-0 ${
                isActive ? 'bg-white/15 shadow-inner' : 'hover:bg-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              <Icon size={17} />
              {isActive && (
                <div
                  style={{ backgroundColor: 'var(--card-glow-color, #06b6d4)' }}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-0.5 rounded-full shadow-sm"
                />
              )}
            </button>
          );
          })}
        </div>
      </div>

    </div>
  );
}