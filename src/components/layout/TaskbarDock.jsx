import React, { useState } from 'react';
import { 
  LayoutGrid, LayoutDashboard, Users, Receipt, 
  MessageSquare, Settings, CheckSquare, Sparkles 
} from 'lucide-react';

export default function TaskbarDock({ activeTab, setActiveTab }) {
  const [startOpen, setStartOpen] = useState(false);

  const apps = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'members', label: 'Members Registry', icon: Users },
    { id: 'finance', label: 'Finance Desk', icon: Receipt },
    { id: 'community', label: 'Community Feed', icon: MessageSquare },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
      
      {/* 🌟 Windows 11 Popup Start Menu */}
      {startOpen && (
        <div className="mb-3 w-80 p-5 rounded-3xl win11-card shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" /> GraceOS Launchpad
            </span>
            <span className="text-[9px] font-mono text-slate-400">Win11 Shell</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setActiveTab(app.id);
                    setStartOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 transition group text-center cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-300 group-hover:border-cyan-500/40">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300 truncate w-full">{app.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🌟 Floating Centered Liquid Glass Dock */}
      <div className="px-3 py-2 rounded-2xl win11-card shadow-2xl border border-white/20 backdrop-blur-2xl flex items-center gap-1.5">
        
        {/* Windows 11 Start Button */}
        <button
          onClick={() => setStartOpen(!startOpen)}
          className={`p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
            startOpen ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-cyan-400 hover:bg-white/10'
          }`}
        >
          <LayoutGrid size={18} />
        </button>

        <div className="w-[1px] h-5 bg-white/15 mx-1" />

        {/* Pinned App Icons */}
        {apps.map((app) => {
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
              className={`p-2.5 rounded-xl transition relative group cursor-pointer ${
                isActive ? 'bg-white/15 text-cyan-300 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {isActive && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}