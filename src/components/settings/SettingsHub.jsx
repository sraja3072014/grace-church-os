import React, { useState } from 'react';
import { 
  Building2, GitBranch, Users, UserPlus, ClipboardCheck, ShieldCheck, ShieldAlert,
  CreditCard, HeartHandshake, Receipt, BarChart3,
  Palette, Smartphone, MessageSquare, BookOpen, Database, Wrench, Sliders, Save, CheckCircle2
} from 'lucide-react';

// 1. Church Setup
import MainChurchTab from './church/MainChurchTab';
import BranchesTab from './church/BranchesTab';

// 2. People & Access
import UsersStaffTab from './people/UsersStaffTab';
import RegistrationTab from './people/RegistrationTab';
import AttendanceConfigTab from './people/AttendanceConfigTab';
import AccessControlTab from './people/AccessControlTab';
import ProtectionPolicyTab from './people/ProtectionPolicyTab';

// 3. Finance & Accounts
import BankAccountsTab from './finance/BankAccountsTab';
import GivingCategoriesTab from './finance/GivingCategoriesTab';
import Tax80GReceiptsTab from './finance/Tax80GReceiptsTab';
import FinanceReportsTab from './finance/FinanceReportsTab';

// 4. System & Hardware
import ThemeDisplayTab from './system/ThemeDisplayTab';
import MobileSyncTab from './system/MobileSyncTab';
import WhatsappHubTab from './system/WhatsappHubTab';
import BibleHubTab from './system/BibleHubTab';
import BackupDatabaseTab from './system/BackupDatabaseTab';
import ServiceRequestsTab from './system/ServiceRequestsTab';
import AdvancedSettingsTab from './system/AdvancedSettingsTab';

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
        { id: 'backup_db', label: 'Database & Backup', icon: Database },
        { id: 'service_req', label: 'Hardware Maintenance', icon: Wrench },
        { id: 'advanced_cfg', label: 'Advanced Settings', icon: Sliders },
      ]
    }
  ];

  return (
    <div className="flex h-full gap-5 select-none overflow-hidden">
      
      {/* 1. Left Sub-Navigation Menu */}
      <div className="w-80 crystal-card rounded-2xl p-4 flex flex-col justify-between overflow-hidden shrink-0 border border-white/[0.08]">
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

      {/* 2. Right Dynamic Viewport */}
      <div className="flex-1 crystal-card rounded-2xl p-6 flex flex-col overflow-hidden border border-white/[0.08]">
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Church Setup */}
          {activeTab === 'main_church' && <MainChurchTab />}
          {activeTab === 'branches' && <BranchesTab />}

          {/* People & Access */}
          {activeTab === 'users_staff' && <UsersStaffTab />}
          {activeTab === 'registration_cfg' && <RegistrationTab />}
          {activeTab === 'attendance_cfg' && <AttendanceConfigTab />}
          {activeTab === 'access_control' && <AccessControlTab />}
          {activeTab === 'safety_policy' && <ProtectionPolicyTab />}

          {/* Finance & Accounts */}
          {activeTab === 'bank_acc' && <BankAccountsTab />}
          {activeTab === 'giving_cat' && <GivingCategoriesTab />}
          {activeTab === 'tax_80g' && <Tax80GReceiptsTab />}
          {activeTab === 'fin_reports' && <FinanceReportsTab />}

          {/* System & Hardware */}
          {activeTab === 'theme_display' && <ThemeDisplayTab />}
          {activeTab === 'mobile_sync' && <MobileSyncTab />}
          {activeTab === 'whatsapp_hub' && <WhatsappHubTab />}
          {activeTab === 'bible_hub' && <BibleHubTab />}
          {activeTab === 'backup_db' && <BackupDatabaseTab />}
          {activeTab === 'service_req' && <ServiceRequestsTab />}
          {activeTab === 'advanced_cfg' && <AdvancedSettingsTab />}
        </div>
      </div>

    </div>
  );
}