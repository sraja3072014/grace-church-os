// src/components/layout/FusionSidebar.jsx
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, ClipboardCheck, UserPlus, 
  HeartHandshake, Calendar, Radio, DollarSign, 
  BarChart3, Settings, ChevronDown, Building2, Megaphone, Baby 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { t } from '../../utils/localeEngine';
import { checkModulePermission } from '../../utils/accessControl';

export default function FusionSidebar({ activeTab, setActiveTab, session }) {
  const [churchName, setChurchName] = useState('Grace City Church');
  const [churchLogo, setChurchLogo] = useState(null);
  const [activeCampus, setActiveCampus] = useState('Headquarters');
  const [branches, setBranches] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    { id: 'dashboard', label: t ? t('dashboard') : 'Dashboard', icon: LayoutDashboard, color: 'from-amber-500 to-orange-600' },
    { id: 'attendance', label: t ? t('attendance') : 'Attendance', icon: ClipboardCheck, color: 'from-orange-500 to-rose-600' },
    { id: 'members', label: t ? t('members') : 'Members', icon: Users, color: 'from-amber-400 to-orange-500' },
    { id: 'visitors', label: t ? t('visitors') : 'Visitors', icon: UserPlus, color: 'from-orange-400 to-amber-600' },
    { id: 'ministries', label: t ? t('ministries') : 'Ministries', icon: Baby, color: 'from-rose-500 to-orange-500' },
    { id: 'prayer', label: t ? t('prayer') : 'Prayer', icon: HeartHandshake, color: 'from-rose-500 to-pink-600' },
    { id: 'events', label: t ? t('events') : 'Events', icon: Calendar, color: 'from-amber-500 to-rose-600' },
    { id: 'livestream', label: t ? t('livestream') : 'Live Stream', icon: Radio, color: 'from-orange-500 to-amber-500' },
    { id: 'finance', label: t ? t('finance') : 'Finance', icon: DollarSign, color: 'from-emerald-400 to-teal-600' },
    { id: 'broadcast', label: t ? t('broadcast') : 'Broadcast', icon: Megaphone, color: 'from-amber-500 to-orange-600', badge: 'SMS/WA' },
    { id: 'reports', label: t ? t('reports') : 'Reports', icon: BarChart3, color: 'from-orange-400 to-rose-500' },
    { id: 'settings', label: t ? t('settings') : 'Settings', icon: Settings, color: 'from-stone-400 to-stone-600' },
  ];

  const filteredNavigation = menuItems.filter((item) => {
    if (item.id === 'dashboard' || item.id === 'settings') return true;
    return checkModulePermission(session?.role, item.moduleKey || item.id);
  });

  return (
    <aside className="w-68 classic-glass-header flex flex-col p-3.5 select-none shrink-0 z-20 m-3 rounded-2xl shadow-2xl">
      <div className="flex flex-col gap-4">
        {/* Header / Campus Selector */}
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-orange-500/20 hover:bg-black/40 cursor-pointer transition"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-orange-500/30 shrink-0 border border-orange-500/30 overflow-hidden">
                {churchLogo ? (
                  <img src={churchLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>G</span>
                )}
              </div>
              <div className="overflow-hidden">
                <h1 className="text-xs font-black text-white tracking-wide truncate">{churchName}</h1>
                <p className="text-[10px] text-orange-300 font-medium truncate flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 animate-pulse" />
                  {activeCampus}
                </p>
              </div>
            </div>
            <ChevronDown size={14} className="text-orange-300/70 shrink-0 ml-1" />
          </div>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-black/90 backdrop-blur-xl border border-orange-500/30 rounded-xl p-1.5 shadow-2xl z-30 flex flex-col gap-1 animate-in fade-in">
              <button 
                type="button"
                onClick={() => handleSwitchCampus(`${churchName} (Main Campus)`)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-orange-100 hover:bg-orange-500/20 flex items-center gap-2"
              >
                <Building2 size={12} className="text-orange-400" />
                <span className="truncate">{churchName} (Main)</span>
              </button>
              {branches.filter(b => b.code !== 'GCC-MAIN').map(b => (
                <button 
                  key={b.id || b.name} 
                  type="button"
                  onClick={() => handleSwitchCampus(b.name)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-orange-100 hover:bg-orange-500/20 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="truncate">{b.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundFX?.playClickPop?.();
                  setActiveTab(item.id);
                }}
                className={`relative w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 text-left text-xs font-semibold active:scale-95 ${
                  isActive 
                    ? 'bg-orange-500/20 text-white border border-orange-500/30 shadow-lg shadow-orange-500/10' 
                    : 'text-orange-200/60 hover:text-orange-100 hover:bg-orange-500/10'
                }`}
              >
                {isActive && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-orange-400 shadow-md shadow-orange-500/80" />
                )}

                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                  isActive ? `bg-gradient-to-tr ${item.color} text-white shadow-md` : 'bg-black/30 text-orange-300/80 border border-orange-500/10'
                }`}>
                  <Icon size={16} />
                </div>

                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}