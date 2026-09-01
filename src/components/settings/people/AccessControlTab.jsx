import React, { useState } from 'react';
import { ShieldCheck, Check, Save, Lock } from 'lucide-react';

export default function AccessControlTab() {
  const [permissions, setPermissions] = useState(() => {
    const local = localStorage.getItem('graceos_role_permissions');
    return local ? JSON.parse(local) : {
      'Super Admin': { dashboard: true, members: true, finance: true, reports: true, settings: true, backup: true },
      'Campus Admin': { dashboard: true, members: true, finance: false, reports: true, settings: false, backup: false },
      'Finance Officer': { dashboard: true, members: false, finance: true, reports: true, settings: false, backup: false },
      'Volunteer Lead': { dashboard: true, members: true, finance: false, reports: false, settings: false, backup: false },
    };
  });

  const [toast, setToast] = useState(false);

  const togglePermission = (role, moduleKey) => {
    if (role === 'Super Admin') return; // Super admin keeps full permissions
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleKey]: !prev[role][moduleKey]
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('graceos_role_permissions', JSON.stringify(permissions));
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const modules = [
    { key: 'dashboard', label: 'Main Dashboard' },
    { key: 'members', label: 'Member Directory' },
    { key: 'finance', label: 'Finance & 80G Desk' },
    { key: 'reports', label: 'Audit Analytics' },
    { key: 'settings', label: 'System Configuration' },
    { key: 'backup', label: 'Database Backup Node' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl select-none relative">
      
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <Check size={14} />
          <span>Security Matrix Updated & Enforced!</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" />
            Role-Based Access Control Matrix (RBAC)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Define screen and data visibility permissions for distinct operational roles.</p>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Save Security Matrix
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06]">
            <tr>
              <th className="p-3.5">Security Role</th>
              {modules.map(m => (
                <th key={m.key} className="p-3.5 text-center">{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
            {Object.keys(permissions).map((role) => (
              <tr key={role} className="hover:bg-white/[0.02] transition">
                <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2">
                  {role === 'Super Admin' && <Lock size={13} className="text-amber-400" />}
                  <span>{role}</span>
                </td>
                {modules.map(m => {
                  const isChecked = permissions[role][m.key];
                  return (
                    <td key={m.key} className="p-3.5 text-center">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        disabled={role === 'Super Admin'}
                        onChange={() => togglePermission(role, m.key)}
                        className="w-4 h-4 accent-cyan-500 rounded cursor-pointer disabled:opacity-50"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}