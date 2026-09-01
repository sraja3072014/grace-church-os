import React, { useState } from 'react';
import { 
  Building2, GitBranch, Users, UserPlus, ClipboardCheck, ShieldCheck, ShieldAlert,
  CreditCard, HeartHandshake, Receipt, BarChart3,
  Palette, Smartphone, MessageSquare, BookOpen, Database, Wrench, Save, CheckCircle2
} from 'lucide-react';

// Church Setup Sub-Components
import MainChurchTab from './church/MainChurchTab';
import BranchesTab from './church/BranchesTab';

export default function SettingsHub() {
  const [activeTab, setActiveTab] = useState('main_church');
  const [savedStatus, setSavedStatus] = useState(false);

  const navigationGroups = [
    {
      group: 'Church Setup',
      items: [
        { id: 'main_church', label: 'Main Church Profile', icon: Building2 },
        { id: 'branches', label: 'Branches Management', icon: GitBranch },
      ]
    },
    {
      group: 'People & Access',
      items: [
        { id: 'users_staff', label: 'Users & Staff Credentials', icon: Users },
        { id: 'registration_cfg', label: 'Member Registration Form', icon: UserPlus },
        { id: 'attendance_cfg', label: 'Attendance & QR Setup', icon: ClipboardCheck },
        { id: 'access_control', label: 'Access Control (RBAC)', icon: ShieldCheck },
        { id: 'safety_policy', label: 'Safety & Abuse Policy', icon: ShieldAlert },
      ]
    },
    {
      group: 'Finance & Accounts',
      items: [
        { id: 'bank_acc', label: 'Bank Accounts & UPI', icon: CreditCard },
        { id: 'giving_cat', label: 'Giving / Tithe Categories', icon: HeartHandshake },
        { id: 'tax_80g', label: 'Tax & 80G Receipts Engine', icon: Receipt },
        { id: 'fin_reports', label: 'Financial Audit Exports', icon: BarChart3 },
      ]
    },
    {
      group: 'System & Hardware',
      items: [
        { id: 'theme_display', label: 'Theme & Glass Polish', icon: Palette },
        { id: 'mobile_sync', label: 'Mobile App Node', icon: Smartphone },
        { id: 'whatsapp_hub', label: 'WhatsApp Messenger Hub', icon: MessageSquare },
        { id: 'bible_hub', label: 'Bible Display Engine', icon: BookOpen },
        { id: 'backup_db', label: 'D:\\ Local Database Backup', icon: Database },
        { id: 'service_req', label: 'Hardware Maintenance', icon: Wrench },
      ]
    }
  ];

  const handleSave = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  return (
    <div className="flex h-full gap-5 select-none overflow-hidden">
      
      {/* 1. Left Sub-Navigation Menu */}
      <div className="w-80 win11-card rounded-2xl p-4 flex flex-col justify-between overflow-hidden shrink-0">
        <div className="overflow-y-auto pr-1 flex flex-col gap-5 max-h-[calc(100vh-170px)]">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/90 px-3 mb-1">
                {group.group}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left active:scale-98 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/20 text-cyan-200 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-cyan-300' : 'text-slate-400'} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Right Sub-Tab Viewport */}
      <div className="flex-1 win11-card rounded-2xl p-6 flex flex-col overflow-hidden">
        
        {/* Sub-Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-wide capitalize">
              {activeTab.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure system parameters and preferences for this module.
            </p>
          </div>

          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          >
            {savedStatus ? <CheckCircle2 size={16} className="text-white" /> : <Save size={16} />}
            <span>{savedStatus ? 'Saved to Disk' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Dynamic Sub-Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'main_church' && <MainChurchTab />}
          {activeTab === 'branches' && <BranchesTab />}
          {activeTab !== 'main_church' && activeTab !== 'branches' && (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-black/20 text-center p-6">
              <p className="text-sm font-semibold text-slate-300 capitalize">{activeTab.replace('_', ' ')} Sub-Module</p>
              <p className="text-xs text-slate-500 mt-1">Ready for schema bindings and input controls.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}