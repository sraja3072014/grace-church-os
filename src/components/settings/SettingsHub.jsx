// src/components/settings/SettingsHub.jsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, GitBranch, Users, UserPlus, ClipboardCheck, ShieldCheck, ShieldAlert,
  CreditCard, HeartHandshake, Receipt, BarChart3,
  Palette, Smartphone, MessageSquare, BookOpen, Wrench, Sliders, 
  Globe, HardDrive, Save, CheckCircle2, Cloud, Plus, MapPin, Trash2
} from 'lucide-react';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

// 1. Church Setup
import MainChurchTab from './church/MainChurchTab';
import BranchesTab from './church/BranchesTab';
import MultiCampusHQDesk from '../campus/MultiCampusHQDesk';

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
import PaymentGatewayConfigTab from './finance/PaymentGatewayConfigTab';

// 4. System & Hardware
import ThemeDisplayTab from './system/ThemeDisplayTab';
import MobileSyncTab from './system/MobileSyncTab';
import WhatsappHubTab from './system/WhatsappHubTab';
import BibleHubTab from './system/BibleHubTab';
import ServiceRequestsTab from './system/ServiceRequestsTab';
import AdvancedSettingsTab from './system/AdvancedSettingsTab';
import LanguageRegionTab from './system/LanguageRegionTab';
import AuditTrailViewerDesk from './AuditTrailViewerDesk';
import AdvancedBackupCloudHub from './system/AdvancedBackupCloudHub';

// Inline Land, Lease & Trust Vault Component
function LandLeaseVaultSection() {
  const [properties, setProperties] = useState([]);
  const [toast, setToast] = useState('');
  
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    ownershipType: 'RENTED',
    location: '',
    landArea: '',
    docNo: '',
    surveyNo: '',
    pattaNo: '',
    trustName: 'Grace Cathedral Charitable Trust',
    landlordName: '',
    landlordPhone: '',
    monthlyRent: '',
    advanceDeposit: '',
    leaseExpiryDate: '',
    ebConsumerNo: ''
  });

  useEffect(() => {
    async function loadProperties() {
      const dbProps = await getVaultData('properties', []);
      setProperties(Array.isArray(dbProps) ? dbProps : []);
    }
    loadProperties();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveProperties = async (updated) => {
    setProperties(updated);
    await setVaultData('properties', updated, true);
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!propertyForm.title.trim() || !propertyForm.location.trim()) return;

    const newProperty = {
      id: `PROP-${Date.now().toString().slice(-3)}`,
      ...propertyForm,
      monthlyRent: Number(propertyForm.monthlyRent) || 0,
      advanceDeposit: Number(propertyForm.advanceDeposit) || 0
    };

    const updated = [newProperty, ...properties];
    await saveProperties(updated);
    setPropertyForm({
      title: '', ownershipType: 'RENTED', location: '', landArea: '',
      docNo: '', surveyNo: '', pattaNo: '', trustName: 'Grace Cathedral Charitable Trust',
      landlordName: '', landlordPhone: '', monthlyRent: '', advanceDeposit: '', leaseExpiryDate: '', ebConsumerNo: ''
    });
    showToast('Real estate property & lease dossier saved successfully.');
  };

  const totalAdvanceDeposits = properties.filter(p => p.ownershipType === 'RENTED').reduce((sum, p) => sum + (Number(p.advanceDeposit) || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-100 pb-12 animate-in fade-in">
      {toast && (
        <div className="fixed top-6 right-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Building2 size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Land, Lease &amp; Trust Property Vault</h4>
            <p className="text-xs text-slate-400">Manage church freeholds, lease contracts, title deeds, and trust real estate dossiers.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[10px] text-slate-400 block uppercase">Registered Campuses</span>
          <span className="text-xl font-black text-white font-sans mt-0.5">{properties.length} Facilities</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] text-amber-300 block uppercase">Lease Advance Deposits</span>
          <span className="text-xl font-black text-amber-400 mt-0.5">₹ {totalAdvanceDeposits.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-300 block uppercase">Trust Legal Standing</span>
          <span className="text-xs font-bold text-emerald-300 block mt-2">✓ Sections 12A &amp; 80G Certified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Plus size={15} className="text-amber-400" />
            <span>Register Facility / Lease</span>
          </h4>

          <form onSubmit={handleAddProperty} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Facility Name (e.g. North Campus)"
              value={propertyForm.title}
              onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <select
              value={propertyForm.ownershipType}
              onChange={(e) => setPropertyForm({ ...propertyForm, ownershipType: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="RENTED">Leased / Rented Facility</option>
              <option value="OWNED">Freehold Cathedral Owned</option>
              <option value="TRUST_LEASE">Trust Endowment Property</option>
            </select>
            <input
              type="text"
              required
              placeholder="Location Address"
              value={propertyForm.location}
              onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            {propertyForm.ownershipType === 'RENTED' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Monthly Rent (₹)"
                  value={propertyForm.monthlyRent}
                  onChange={(e) => setPropertyForm({ ...propertyForm, monthlyRent: e.target.value })}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Deposit (₹)"
                  value={propertyForm.advanceDeposit}
                  onChange={(e) => setPropertyForm({ ...propertyForm, advanceDeposit: e.target.value })}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Save Facility to Vault
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {properties.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-900 rounded-3xl border border-white/10">
              No real estate properties registered in administration.
            </div>
          ) : (
            properties.map((prop) => (
              <div key={prop.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-white">{prop.title}</h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {prop.ownershipType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={13} className="text-rose-400" /> {prop.location}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsHub({ session }) {
  const [activeTab, setActiveTab] = useState('main_church');
  const [toast, setToast] = useState('');

  const triggerSuccess = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const isSeniorPastorOrAdmin = 
    session?.role === 'ADMIN' || 
    session?.role === 'PASTOR' || 
    session?.username?.toLowerCase().includes('pastor');

  const navigationGroups = [
    {
      group: 'Church Administration',
      items: [
        { id: 'main_church', label: 'Main Church Profile', icon: Building2 },
        { id: 'branches', label: 'Branch Campuses', icon: GitBranch },
        { id: 'properties', label: 'Land, Lease & Trust Vault', icon: Building2 },
        ...(isSeniorPastorOrAdmin ? [{ id: 'campus_hq', label: 'Multi-Campus Network HQ', icon: Globe }] : []),
      ]
    },
    {
      group: 'People & Access',
      items: [
        { id: 'users_staff', label: 'Staff Credentials', icon: Users },
        { id: 'registration_cfg', label: 'Member Registration Intake', icon: UserPlus },
        { id: 'attendance_cfg', label: 'Attendance & QR Setup', icon: ClipboardCheck },
        { id: 'access_control', label: 'Access Control (RBAC)', icon: ShieldCheck },
        { id: 'safety_policy', label: 'Safety & Protection Policy', icon: ShieldAlert },
      ]
    },
    {
      group: 'Treasury & Taxation',
      items: [
        { id: 'bank_acc', label: 'Bank Accounts & UPI', icon: CreditCard },
        { id: 'giving_cat', label: 'Tithe & Giving Categories', icon: HeartHandshake },
        { id: 'tax_80g', label: '80G Tax Engine Setup', icon: Receipt },
        { id: 'fin_reports', label: 'Financial Audit Exports', icon: BarChart3 },
        { id: 'payment_gw', label: 'Payment Gateway & UPI', icon: CreditCard },
      ]
    },
    {
      group: 'System & Vault Node',
      items: [
        { id: 'theme_display', label: 'Theme & Liquid Polish', icon: Palette },
        { id: 'language_region', label: 'Language & Locale', icon: Globe },
        { id: 'mobile_sync', label: 'Mobile App Relay', icon: Smartphone },
        { id: 'whatsapp_hub', label: 'WhatsApp Messenger Hub', icon: MessageSquare },
        { id: 'bible_hub', label: 'Scripture Display Engine', icon: BookOpen },
        { id: 'audit', label: 'Audit Trail & Security Logs', icon: ShieldAlert },
        { id: 'service_req', label: 'Hardware Maintenance', icon: Wrench },
        { id: 'advanced_backup_cloud', label: 'Advanced Backup & Cloud Hub', icon: Cloud },
        { id: 'advanced_cfg', label: 'Advanced Engine Setup', icon: Sliders },
      ]
    }
  ];

  return (
    <div className="flex h-full gap-5 select-none overflow-hidden text-slate-100 relative">
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}
      
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
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left active:scale-98 cursor-pointer ${
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
          {/* Church Administration */}
          {activeTab === 'main_church' && <MainChurchTab />}
          {activeTab === 'branches' && <BranchesTab />}
          {activeTab === 'properties' && <LandLeaseVaultSection />}
          {activeTab === 'campus_hq' && <MultiCampusHQDesk session={session} />}
          
          {/* People & Access */}
          {activeTab === 'users_staff' && <UsersStaffTab />}
          {activeTab === 'registration_cfg' && <RegistrationTab />}
          {activeTab === 'attendance_cfg' && <AttendanceConfigTab />}
          {activeTab === 'access_control' && <AccessControlTab />}
          {activeTab === 'safety_policy' && <ProtectionPolicyTab />}

          {/* Treasury & Taxation */}
          {activeTab === 'bank_acc' && <BankAccountsTab />}
          {activeTab === 'giving_cat' && <GivingCategoriesTab />}
          {activeTab === 'tax_80g' && <Tax80GReceiptsTab />}
          {activeTab === 'fin_reports' && <FinanceReportsTab />}
          {activeTab === 'payment_gw' && <PaymentGatewayConfigTab />}

          {/* System & Vault Node */}
          {activeTab === 'theme_display' && <ThemeDisplayTab />}
          {activeTab === 'language_region' && <LanguageRegionTab />}
          {activeTab === 'mobile_sync' && <MobileSyncTab />}
          {activeTab === 'whatsapp_hub' && <WhatsappHubTab />}
          {activeTab === 'bible_hub' && <BibleHubTab />}
          {activeTab === 'audit' && <AuditTrailViewerDesk />}
          {activeTab === 'service_req' && <ServiceRequestsTab />}
          {activeTab === 'advanced_backup_cloud' && <AdvancedBackupCloudHub onTriggerSuccess={triggerSuccess} />}
          {activeTab === 'advanced_cfg' && <AdvancedSettingsTab />}
        </div>
      </div>

    </div>
  );
}