import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Save, Lock, Smartphone, Monitor } from 'lucide-react';
import { getVaultData, setVaultData } from '../../../utils/vaultStore';

export default function AccessControlTab() {
  // 7 விரிவான சபை ரோல்கள் மற்றும் அவற்றிற்கான மாட்யூல் அனுமதிகள்
  const defaultPermissions = {
    'Senior Pastor / Super Admin': {
      dashboard: true,
      members: true,
      finance: true,
      auditReports: true,
      branches: true,
      attendanceScan: true,
      sundaySchool: true,
      pastoralCare: true,
      settings: true,
      mobileApp: true
    },
    'Branch Pastor': {
      dashboard: true,
      members: true,
      finance: false,
      auditReports: true,
      branches: false,
      attendanceScan: true,
      sundaySchool: true,
      pastoralCare: true,
      settings: false,
      mobileApp: true
    },
    'Church Elders / Board': {
      dashboard: true,
      members: true,
      finance: false,
      auditReports: true,
      branches: false,
      attendanceScan: false,
      sundaySchool: false,
      pastoralCare: true,
      settings: false,
      mobileApp: true
    },
    'Finance Officer': {
      dashboard: true,
      members: false,
      finance: true,
      auditReports: true,
      branches: false,
      attendanceScan: false,
      sundaySchool: false,
      pastoralCare: false,
      settings: false,
      mobileApp: false
    },
    'Sunday School Teacher': {
      dashboard: false,
      members: false,
      finance: false,
      auditReports: false,
      branches: false,
      attendanceScan: true,
      sundaySchool: true,
      pastoralCare: false,
      settings: false,
      mobileApp: true
    },
    'Usher / Greeter': {
      dashboard: false,
      members: false,
      finance: false,
      auditReports: false,
      branches: false,
      attendanceScan: true,
      sundaySchool: false,
      pastoralCare: false,
      settings: false,
      mobileApp: true
    },
    'Church Member': {
      dashboard: false,
      members: false,
      finance: false,
      auditReports: false,
      branches: false,
      attendanceScan: false,
      sundaySchool: false,
      pastoralCare: false,
      settings: false,
      mobileApp: true
    }
  };

  const [permissions, setPermissions] = useState(defaultPermissions);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    async function loadPermissions() {
      const data = await getVaultData('role_permissions_matrix', defaultPermissions);
      setPermissions(data);
    }
    loadPermissions();
  }, []);

  const togglePermission = (role, moduleKey) => {
    // Senior Pastor / Super Admin-க்கு அனைத்து உரிமைகளும் எப்போதும் இயங்க வேண்டும்
    if (role === 'Senior Pastor / Super Admin') return;

    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleKey]: !prev[role][moduleKey]
      }
    }));
  };

  const handleSave = async () => {
    await setVaultData('role_permissions_matrix', permissions, true);
    localStorage.setItem('graceos_role_permissions', JSON.stringify(permissions));
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  // 10 செயல்பாட்டு மாட்யூல்கள்
  const modules = [
    { key: 'dashboard', label: 'Main Dashboard' },
    { key: 'members', label: 'Member Directory' },
    { key: 'finance', label: 'Treasury & 80G' },
    { key: 'auditReports', label: 'Audit Reports' },
    { key: 'branches', label: 'Multi-Campus HQ' },
    { key: 'attendanceScan', label: 'QR Usher Check-in' },
    { key: 'sundaySchool', label: 'Kids & Sunday School' },
    { key: 'pastoralCare', label: 'Pastoral Care' },
    { key: 'settings', label: 'System Settings' },
    { key: 'mobileApp', label: 'Mobile App Node' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl select-none relative text-slate-100 pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <Check size={14} />
          <span>Security Matrix &amp; Mobile Access Updated!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl win11-card border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Role-Based Access Control Matrix (RBAC &amp; Mobile)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                7 Security Roles
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Define exact module visibility, desktop privileges, and mobile companion app screens for church hierarchy.
            </p>
          </div>
        </div>

        {/* BankAccountsTab போன்ற சியான்/ப்ளூ கிரேடியன்ட் பட்டன் */}
        <button 
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <Save size={14} />
          <span>Save Security Matrix</span>
        </button>
      </div>

      {/* RBAC Table Matrix */}
      <div className="rounded-2xl border border-white/[0.08] overflow-x-auto bg-slate-950/60 shadow-xl">
        <table className="w-full text-left text-xs min-w-[800px]">
          <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06] font-mono text-[11px] uppercase">
            <tr>
              <th className="p-3.5 sticky left-0 bg-slate-950/90 backdrop-blur-md z-10">Security Role</th>
              {modules.map(m => (
                <th key={m.key} className="p-3 text-center whitespace-nowrap">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium font-sans">
            {Object.keys(permissions).map((role) => {
              const isRoot = role === 'Senior Pastor / Super Admin';
              return (
                <tr key={role} className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2 sticky left-0 bg-slate-950/90 backdrop-blur-md z-10 whitespace-nowrap">
                    {isRoot && <Lock size={13} className="text-amber-400" />}
                    <span>{role}</span>
                  </td>

                  {modules.map(m => {
                    const isChecked = permissions[role]?.[m.key] ?? false;
                    return (
                      <td key={m.key} className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          disabled={isRoot}
                          onChange={() => togglePermission(role, m.key)}
                          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Guidance Note */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>💡 Mobile Companion screens will automatically adapt based on the logged-in role.</span>
        <span className="text-cyan-400 font-bold">Encrypted Vault Verified ✓</span>
      </div>

    </div>
  );
}