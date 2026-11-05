// src/components/layout/RoleNavSwitcher.jsx
// ============================================================
// Interactive Role Navigation Switcher (RBAC Realtime Preview)
// ============================================================

import React, { useState } from 'react';
import { ShieldAlert, Coins, Users, User, ChevronDown, Check, Sparkles, RotateCcw } from 'lucide-react';
import { ROLE_KEYS, resolveRoleKey } from '../../config/navigationConfig';

const PREVIEW_PERSONAS = [
  {
    key: ROLE_KEYS.SUPER_ADMIN,
    label: 'Super Admin',
    roleTitle: 'Senior Pastor / Super Admin',
    icon: ShieldAlert,
    color: 'from-amber-400 to-rose-500 text-amber-300',
    borderColor: 'border-amber-400/40',
    profile: {
      id: 'STF-101',
      name: 'Rev. Dr. S. Johnraja',
      username: 'pastor.lead',
      role: 'Senior Pastor / Super Admin',
      campus: 'All Campuses',
      department: 'Pastoral Office'
    }
  },
  {
    key: ROLE_KEYS.FINANCE_OFFICER,
    label: 'Finance Officer',
    roleTitle: 'Finance Officer',
    icon: Coins,
    color: 'from-emerald-400 to-teal-500 text-emerald-300',
    borderColor: 'border-emerald-400/40',
    profile: {
      id: 'STF-102',
      name: 'Bro. Wilson David',
      username: 'wilson.finance',
      role: 'Finance Officer',
      campus: 'Headquarters',
      department: 'Treasury & Accounts'
    }
  },
  {
    key: ROLE_KEYS.LEADER,
    label: 'Ministry Lead',
    roleTitle: 'Youth Leader',
    icon: Users,
    color: 'from-cyan-400 to-blue-500 text-cyan-300',
    borderColor: 'border-cyan-400/40',
    profile: {
      id: 'STF-103',
      name: 'Sis. Sharon Deborah',
      username: 'sharon.youth',
      role: 'Youth Leader',
      campus: 'Headquarters',
      department: 'Youth Fellowship'
    }
  },
  {
    key: ROLE_KEYS.MEMBER,
    label: 'Church Member',
    roleTitle: 'Member',
    icon: User,
    color: 'from-purple-400 to-pink-500 text-purple-300',
    borderColor: 'border-purple-400/40',
    profile: {
      id: 'MEM-1001',
      name: 'Bro. Emmanuel Raj',
      username: 'emmanuel.raj',
      role: 'Member',
      campus: 'Headquarters',
      department: 'Congregation'
    }
  }
];

export default function RoleNavSwitcher({ session }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentUser = session || (() => {
    try {
      const saved = localStorage.getItem('graceos_auth_session') || localStorage.getItem('graceos_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isDev = Boolean(import.meta.env?.DEV);
  const previewOriginal = localStorage.getItem('graceos_role_preview_original');
  const isMasterAdmin = currentUser?.username === 'pastor.lead' 
    || currentUser?.username === 'admin' 
    || currentUser?.role === 'Senior Pastor / Super Admin'
    || Boolean(previewOriginal)
    || isDev;

  // Permission Gate: Render strictly for administrators or in development mode
  if (!isMasterAdmin) {
    return null;
  }

  const activeRoleKey = resolveRoleKey(currentUser?.role) || ROLE_KEYS.SUPER_ADMIN;
  const currentPersona = PREVIEW_PERSONAS.find((p) => p.key === activeRoleKey) || PREVIEW_PERSONAS[0];
  const CurrentIcon = currentPersona.icon;

  const handleSelectRole = (persona) => {
    // If we are currently on real admin and haven't backed up, save original session
    if (!previewOriginal && (currentUser?.username === 'pastor.lead' || currentUser?.role === 'Senior Pastor / Super Admin')) {
      localStorage.setItem('graceos_role_preview_original', JSON.stringify(currentUser));
    }

    const newSession = {
      ...currentUser,
      ...persona.profile,
      isSimulatedRole: true,
      activeCampus: currentUser?.activeCampus || persona.profile.campus
    };

    localStorage.setItem('graceos_auth_session', JSON.stringify(newSession));
    localStorage.setItem('graceos_session', JSON.stringify(newSession));
    setIsOpen(false);

    // Hard reload triggers clean re-render of FusionSidebar, FinanceDesk & MainDashboard with new permissions
    window.location.reload();
  };

  const handleResetToAdmin = () => {
    if (previewOriginal) {
      try {
        const original = JSON.parse(previewOriginal);
        localStorage.setItem('graceos_auth_session', JSON.stringify(original));
        localStorage.setItem('graceos_session', JSON.stringify(original));
      } catch {
        // Fallback admin session
        const masterAdmin = PREVIEW_PERSONAS[0].profile;
        localStorage.setItem('graceos_auth_session', JSON.stringify(masterAdmin));
        localStorage.setItem('graceos_session', JSON.stringify(masterAdmin));
      }
      localStorage.removeItem('graceos_role_preview_original');
    } else {
      const masterAdmin = PREVIEW_PERSONAS[0].profile;
      localStorage.setItem('graceos_auth_session', JSON.stringify(masterAdmin));
      localStorage.setItem('graceos_session', JSON.stringify(masterAdmin));
    }
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative inline-block text-left select-none z-50">
      {/* Floating Glass Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Role Navigation Preview Switcher (RBAC Mode)"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 border border-white/15 text-xs text-slate-200 backdrop-blur-md shadow-lg shadow-black/40 transition active:scale-95 cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-full bg-gradient-to-tr ${currentPersona.color} animate-pulse`} />
        <CurrentIcon size={13} className={currentPersona.color.split(' ').pop()} />
        <span className="font-semibold hidden sm:inline text-[11px] tracking-wide">
          Role: <strong className="text-white">{currentPersona.label}</strong>
        </span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950/95 border border-white/15 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>RBAC Persona Switcher</span>
              </span>
              {previewOriginal && (
                <button
                  type="button"
                  onClick={handleResetToAdmin}
                  className="text-[10px] text-rose-300 hover:text-rose-200 font-bold flex items-center gap-1 cursor-pointer"
                  title="Reset to Original Super Admin"
                >
                  <RotateCcw size={10} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="mt-1 space-y-1">
              {PREVIEW_PERSONAS.map((persona) => {
                const Icon = persona.icon;
                const isSelected = persona.key === activeRoleKey;

                return (
                  <button
                    key={persona.key}
                    type="button"
                    onClick={() => handleSelectRole(persona)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 text-white font-bold border border-white/15 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg bg-slate-900 border ${persona.borderColor} flex items-center justify-center shrink-0`}>
                        <Icon size={12} className={persona.color.split(' ').pop()} />
                      </div>
                      <div className="truncate">
                        <div className="text-[11px] font-bold leading-tight">{persona.label}</div>
                        <div className="text-[9px] text-slate-400 leading-tight truncate">{persona.roleTitle}</div>
                      </div>
                    </div>
                    {isSelected && <Check size={13} className="text-cyan-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1.5 pt-1.5 border-t border-white/5 px-2 text-[9px] text-slate-500 font-mono text-center">
              Preview updates menu &amp; sub-tabs in real time
            </div>
          </div>
        </>
      )}
    </div>
  );
}

