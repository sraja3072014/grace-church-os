import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, ClipboardCheck, UserPlus, 
  HeartHandshake, Calendar, Radio, DollarSign, 
  BarChart3, Settings, ShieldCheck, LogOut, ChevronDown, Building2
} from 'lucide-react';

export default function FusionSidebar({ activeTab, setActiveTab, session, onLogout }) {
  const [churchName, setChurchName] = useState('Grace City Church');
  const [churchLogo, setChurchLogo] = useState(null);
  const [activeCampus, setActiveCampus] = useState('Headquarters');
  const [branches, setBranches] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Main Church, Logo மற்றும் Session தகவல்களை லோட் செய்தல்
  const refreshChurchData = () => {
    const mainChurch = JSON.parse(localStorage.getItem('graceos_main_church') || '{}');
    const localBranches = JSON.parse(localStorage.getItem('graceos_branches') || '[]');
    const currentSession = JSON.parse(localStorage.getItem('graceos_session') || '{}');
    const savedLogo = localStorage.getItem('graceos_church_logo');

    if (mainChurch.churchName) {
      setChurchName(mainChurch.churchName);
    }
    setChurchLogo(savedLogo);
    setBranches(localBranches);
    if (currentSession.activeCampus) {
      setActiveCampus(currentSession.activeCampus);
    }
  };

  useEffect(() => {
    refreshChurchData();
    window.addEventListener('storage', refreshChurchData);
    return () => window.removeEventListener('storage', refreshChurchData);
  }, [session]);

  const handleSwitchCampus = (campusName) => {
    setActiveCampus(campusName);
    const currentSession = JSON.parse(localStorage.getItem('graceos_session') || '{}');
    localStorage.setItem('graceos_session', JSON.stringify({ ...currentSession, activeCampus: campusName }));
    setIsDropdownOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, color: 'from-cyan-500 to-blue-600' },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, color: 'from-emerald-500 to-teal-600' },
    { id: 'members', label: 'Members Desk', icon: Users, color: 'from-indigo-500 to-purple-600' },
    { id: 'visitors', label: 'Visitors Hub', icon: UserPlus, color: 'from-amber-500 to-orange-600' },
    { id: 'prayer', label: 'Prayer Wall', icon: HeartHandshake, color: 'from-rose-500 to-pink-600' },
    { id: 'events', label: 'Events Hub', icon: Calendar, color: 'from-sky-500 to-indigo-600' },
    { id: 'livestream', label: 'Live Desk', icon: Radio, color: 'from-violet-500 to-fuchsia-600' },
    { id: 'finance', label: 'Finance & 80G', icon: DollarSign, color: 'from-emerald-400 to-green-600' },
    { id: 'reports', label: 'Reports', icon: BarChart3, color: 'from-teal-400 to-cyan-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-slate-400 to-slate-600' },
  ];

  return (
    <aside className="w-68 win11-glass flex flex-col justify-between p-3.5 select-none shrink-0 z-20 m-3 rounded-2xl border border-white/10">
      
      <div className="flex flex-col gap-4">
        
        {/* Dynamic Header: Main Church Logo / Branch Switcher */}
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] cursor-pointer transition"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Dynamic Logo Box */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-cyan-500/20 shrink-0 border border-white/20 overflow-hidden">
                {churchLogo ? (
                  <img src={churchLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>G</span>
                )}
              </div>
              
              <div className="overflow-hidden">
                <h1 className="text-xs font-black text-white tracking-wide truncate">{churchName}</h1>
                <p className="text-[10px] text-cyan-300 font-medium truncate flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {activeCampus}
                </p>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
          </div>

          {/* Branch Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-white/15 rounded-xl p-1.5 shadow-2xl z-30 flex flex-col gap-1 animate-in fade-in">
              <button 
                onClick={() => handleSwitchCampus(`${churchName} (Main Campus)`)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-200 hover:bg-white/10 flex items-center gap-2"
              >
                <Building2 size={12} className="text-cyan-400" />
                <span className="truncate">{churchName} (Main)</span>
              </button>
              {branches.filter(b => b.code !== 'GCC-MAIN').map(b => (
                <button 
                  key={b.id} 
                  onClick={() => handleSwitchCampus(b.name)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-200 hover:bg-white/10 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span className="truncate">{b.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 text-left text-xs font-semibold active:scale-95 ${
                  isActive 
                    ? 'win11-card text-white border-white/20 shadow-lg shadow-cyan-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80" />
                )}

                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                  isActive ? `bg-gradient-to-tr ${item.color} text-white shadow-md` : 'bg-white/[0.05] text-slate-400'
                }`}>
                  <Icon size={16} />
                </div>

                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Badge & Logout */}
      <div className="flex items-center justify-between p-2.5 win11-card rounded-xl border border-white/5">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={15} />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-bold text-slate-200 truncate">{session?.username || 'Admin'}</p>
            <p className="text-[9px] text-emerald-400 font-mono">{session?.role || 'Super Admin'}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          title="Sign Out"
          className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition active:scale-90 shrink-0"
        >
          <LogOut size={13} />
        </button>
      </div>

    </aside>
  );
}