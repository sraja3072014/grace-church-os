// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Calendar,
  Settings,
  LogOut,
  Church,
  Search,
  Bell,
  Globe,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  CreditCard,
  UserCheck,
  CalendarDays,
  Sliders,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight
} from 'lucide-react';
import { supabase } from './utils/supabaseClient';

// Bilingual translations dictionary
const translations = {
  en: {
    appTitle: "Grace Church OS",
    tagline: "Next-Gen Enterprise Suite",
    dashboard: "Command Center",
    members: "Believers Directory",
    finance: "Finance & Tithes",
    events: "Events & Calendar",
    settings: "System Config",
    logout: "Terminate Session",
    welcome: "Administrator Console",
    totalMembers: "Total Registered",
    monthlyIncome: "Monthly Inflow",
    activePledges: "Active Ministries",
    cloudSync: "Supabase Connected",
    offline: "Local Cache Active",
    recentTransactions: "Live Financial Ledger",
    addRecord: "New Record",
    donor: "Donor / Believer",
    amount: "Amount",
    category: "Classification",
    mode: "Payment Channel",
    searchPlaceholder: "Search records, members, transactions...",
    loginTitle: "GraceOS Portal Access",
    loginSubtitle: "Enter valid administrator credentials",
    username: "Admin Username",
    password: "Password",
    loginBtn: "Authorize & Launch",
    switchLang: "தமிழ்",
    quickInsertTitle: "Add Ledger Entry",
    saveBtn: "Commit Record",
    cancelBtn: "Abort",
    notes: "Notes",
    invalidAuth: "Invalid credentials! (Demo: admin / grace123)",
    demoFill: "Fill Demo Login"
  },
  ta: {
    appTitle: "கிரேஸ் சர்ச் OS",
    tagline: "முன்னணி மேலாண்மை தளம்",
    dashboard: "கட்டுப்பாட்டு மையம்",
    members: "உறுப்பினர்கள் பட்டியல்",
    finance: "நிதி & காணிக்கை",
    events: "நிகழ்வுகள் & நாட்காட்டி",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    welcome: "நிர்வாகி கட்டுப்பாட்டு அறை",
    totalMembers: "மொத்த உறுப்பினர்கள்",
    monthlyIncome: "மாத வரவு",
    activePledges: "ஊழியப் பிரிவுகள்",
    cloudSync: "Supabase இணைப்பு தயார்",
    offline: "ஆஃப்லைன் முறை",
    recentTransactions: "சமீபத்திய நிதிப் பதிவுகள்",
    addRecord: "புதிய பதிவு",
    donor: "நன்கொடையாளர்",
    amount: "தொகை",
    category: "பிரிவு",
    mode: "செலுத்திய முறை",
    searchPlaceholder: "பதிவுகள், உறுப்பினர்களைத் தேடுக...",
    loginTitle: "கிரேஸ் போர்டல் உள்நுழைவு",
    loginSubtitle: "நிர்வாகி சான்றுகளுடன் உள்நுழையவும்",
    username: "நிர்வாகி பயனர் பெயர்",
    password: "கடவுச்சொல்",
    loginBtn: "உள்நுழையவும்",
    switchLang: "English",
    quickInsertTitle: "காணிக்கை பதிவு சேர்க்க",
    saveBtn: "சேமிக்க",
    cancelBtn: "ரத்து செய்",
    notes: "குறிப்புகள்",
    invalidAuth: "தவறான விவரம்! (மாதிரி: admin / grace123)",
    demoFill: "மாதிரி லாகின்"
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('graceos_auth') === 'true';
  });
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('graceos_lang') || 'en';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  // Data States
  const [membersCount, setMembersCount] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [syncStatus, setSyncStatus] = useState('Checking...');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    donor_name: '',
    category: 'TITHE',
    amount: '',
    payment_mode: 'UPI',
    notes: 'Direct Entry'
  });

  const t = translations[lang];

  // Language Switch
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ta' : 'en';
    setLang(nextLang);
    localStorage.setItem('graceos_lang', nextLang);
  };

  // Dedicated Admin Auth Handler
  const handleLogin = (e) => {
    e?.preventDefault();
    setAuthError('');

    const u = loginCreds.username.trim().toLowerCase();
    const p = loginCreds.password.trim();

    // Default admin credential checks
    if ((u === 'admin' || u === 'pastor' || u === 'admin@gracechurch.org') && (p === 'grace123' || p === 'admin123')) {
      setIsAuthenticated(true);
      localStorage.setItem('graceos_auth', 'true');
      localStorage.setItem('graceos_role', 'ADMIN');
    } else {
      setAuthError(t.invalidAuth);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('graceos_auth');
    localStorage.removeItem('graceos_role');
    setLoginCreds({ username: '', password: '' });
  };

  const fillDemoCreds = () => {
    setLoginCreds({ username: 'admin', password: 'grace123' });
    setAuthError('');
  };

  // Supabase Data Sync
  const fetchCloudData = async () => {
    try {
      setSyncStatus('Syncing...');

      // Members count & list
      const { data: mData, count: mCount } = await supabase
        .from('members')
        .select('*', { count: 'exact' })
        .limit(10);

      setMembersCount(mCount || (mData ? mData.length : 0));
      if (mData) setMembersList(mData);

      // Finance Ledger
      const { data: ledgerData, error: lErr } = await supabase
        .from('finance_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (!lErr && ledgerData) {
        setLedger(ledgerData);
      }
      setSyncStatus(t.synced);
    } catch {
      setSyncStatus(t.offline);
    }
  };

  // Add Record
  const handleInsertRecord = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    try {
      const { error } = await supabase
        .from('finance_ledger')
        .insert([{
          donor_name: formData.donor_name || 'Anonymous',
          category: formData.category,
          amount: parseFloat(formData.amount),
          payment_mode: formData.payment_mode,
          notes: formData.notes
        }]);

      if (!error) {
        setIsModalOpen(false);
        setFormData({ donor_name: '', category: 'TITHE', amount: '', payment_mode: 'UPI', notes: 'Direct Entry' });
        await fetchCloudData();
      } else {
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCloudData();
    }
  }, [isAuthenticated, lang]);

  // ==========================================
  // VIEW 1: MODERN GLASS LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05030a] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        {/* Neon Backdrops */}
        <div className="absolute top-1/6 left-1/5 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/6 right-1/5 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Floating Language Switch */}
        <button
          onClick={toggleLanguage}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-semibold text-cyan-400 backdrop-blur-xl transition-all cursor-pointer shadow-lg"
        >
          <Globe className="w-4 h-4" />
          {t.switchLang}
        </button>

        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative z-10">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-cyan-500/25 border border-white/20">
              <Church className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">{t.loginTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">{t.loginSubtitle}</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                {t.username}
              </label>
              <input
                type="text"
                required
                value={loginCreds.username}
                onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-400 focus:bg-white/[0.06] focus:outline-none text-sm text-white placeholder-slate-500 transition-all"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {t.password}
              </label>
              <input
                type="password"
                required
                value={loginCreds.password}
                onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-cyan-400 focus:bg-white/[0.06] focus:outline-none text-sm text-white placeholder-slate-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-sm text-white shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Demo: <b className="text-cyan-400">admin</b> / <b className="text-cyan-400">grace123</b></span>
            <button
              type="button"
              onClick={fillDemoCreds}
              className="text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              {t.demoFill}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNIFIED DESKTOP ERP DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#07050e] text-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-white/10 bg-white/[0.02] backdrop-blur-2xl flex flex-col justify-between p-5 select-none z-30">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3.5 px-3 py-3 mb-8 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-white/20">
              <Church className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">{t.appTitle}</h2>
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">{t.tagline}</span>
            </div>
          </div>

          {/* Nav List with dynamic routing */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'members', label: t.members, icon: Users },
              { id: 'finance', label: t.finance, icon: Receipt },
              { id: 'events', label: t.events, icon: Calendar },
              { id: 'settings', label: t.settings, icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-transparent border border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 hover:bg-white/[0.07] transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Language
            </span>
            <span className="font-bold text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-400/10 border border-cyan-400/20">{t.switchLang}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Interactive Stage */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Control Bar */}
        <header className="h-16 border-b border-white/10 bg-white/[0.01] backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{syncStatus}</span>
            </div>
            <button
              onClick={fetchCloudData}
              title="Refresh Cloud Ledger"
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div className="p-8 space-y-6">
          {/* TAB 1: COMMAND CENTER (DASHBOARD) */}
          {activeTab === 'dashboard' && (
            <>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-wide">{t.dashboard}</h1>
                <p className="text-xs text-slate-400 mt-1">{t.welcome}</p>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-cyan-500/30 transition-all shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">{t.totalMembers}</span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white">{membersCount}</div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-2 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> Live Supabase Synced
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-all shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">{t.monthlyIncome}</span>
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white">₹ 48,500</div>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">Tithes, Building Fund & Mission</span>
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-purple-500/30 transition-all shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">{t.activePledges}</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white">12 Wings</div>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">Active Outreach Ministries</span>
                </div>
              </div>

              {/* Transactions Table Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-cyan-400" />
                    {t.recentTransactions}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t.addRecord}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">{t.donor}</th>
                        <th className="py-3.5 px-4">{t.category}</th>
                        <th className="py-3.5 px-4">{t.amount}</th>
                        <th className="py-3.5 px-4">{t.mode}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {ledger.length > 0 ? (
                        ledger.map((row) => (
                          <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">{row.donor_name || 'Anonymous'}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[10px] text-cyan-400 font-mono font-semibold">
                                {row.category || 'TITHE'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-400">₹ {row.amount}</td>
                            <td className="py-3.5 px-4 text-slate-400">{row.payment_mode || 'UPI'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-10 text-center text-slate-500 font-medium">
                            No ledger entries found. Click "+ New Record" to sync transactions.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BELIEVERS REGISTRY */}
          {activeTab === 'members' && (
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">{t.members}</h2>
                  <p className="text-xs text-slate-400">Official Church Believers Database</p>
                </div>
                <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Total Records: {membersCount}
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {membersList.length > 0 ? (
                  membersList.map((m, idx) => (
                    <div key={m.id || idx} className="py-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-cyan-400">
                          {m.full_name ? m.full_name.charAt(0) : 'B'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{m.full_name || 'Member ' + (idx + 1)}</div>
                          <div className="text-[10px] text-slate-400">{m.phone || 'Phone not set'}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                        Active Believer
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs font-medium">
                    Members directory synced with Supabase. Ready for input.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCE & TITHES */}
          {activeTab === 'finance' && (
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{t.finance}</h2>
                  <p className="text-xs text-slate-400">Comprehensive Accounts and Offerings Ledger</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.addRecord}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <span className="text-xs text-slate-400">Total Recorded Tithes</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">₹ 32,800</div>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <span className="text-xs text-slate-400">General Offerings</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">₹ 15,700</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EVENTS & CALENDAR */}
          {activeTab === 'events' && (
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-2">{t.events}</h2>
              <p className="text-xs text-slate-400 mb-6">Upcoming Services & Parish Gatherings</p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="font-semibold text-white">Sunday Worship & Holy Communion</div>
                      <div className="text-[10px] text-slate-400">Upcoming Sunday - 09:00 AM</div>
                    </div>
                  </div>
                  <span className="text-cyan-400 text-[11px] font-bold">Confirmed</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="font-semibold text-white">Wednesday Fasting Prayer</div>
                      <div className="text-[10px] text-slate-400">Weekly - 07:00 PM</div>
                    </div>
                  </div>
                  <span className="text-slate-400 text-[11px] font-medium">Regular</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">{t.settings}</h2>
                <p className="text-xs text-slate-400">System Preferences & Cloud Endpoints</p>
              </div>

              <div className="space-y-4 max-w-xl text-xs">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Cloud Database Synchronization</div>
                    <div className="text-[10px] text-slate-400">Supabase REST Client Active</div>
                  </div>
                  <button onClick={fetchCloudData} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-cyan-400 cursor-pointer">
                    Sync Now
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Primary Interface Language</div>
                    <div className="text-[10px] text-slate-400">Toggle between English and Tamil</div>
                  </div>
                  <button onClick={toggleLanguage} className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 cursor-pointer">
                    {t.switchLang}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* QUICK INSERT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0e0b1c] border border-white/15 shadow-2xl">
            <h3 className="text-sm font-extrabold text-white mb-5 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              {t.quickInsertTitle}
            </h3>
            <form onSubmit={handleInsertRecord} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">{t.donor}</label>
                <input
                  type="text"
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  placeholder="e.g. Bro. David (Optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">{t.category}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#17132a] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="TITHE">TITHE</option>
                    <option value="OFFERING">OFFERING</option>
                    <option value="MISSION">MISSION</option>
                    <option value="BUILDING">BUILDING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">{t.amount} (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1000"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-bold text-cyan-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">{t.mode}</label>
                <select
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#17132a] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="UPI">UPI</option>
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-all font-semibold cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-bold text-white transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}