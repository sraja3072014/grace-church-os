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
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from './utils/supabaseClient';

// இருமொழி அகராதி (English & தமிழ்)
const translations = {
  en: {
    appTitle: "Grace Church OS",
    tagline: "Enterprise Management Suite",
    dashboard: "Dashboard",
    members: "Believers Registry",
    finance: "Finance & Tithes",
    events: "Events & Calendar",
    settings: "Settings",
    logout: "Sign Out",
    welcome: "Welcome Back, Pastor / Administrator",
    totalMembers: "Total Registered",
    monthlyIncome: "Monthly Offerings",
    activePledges: "Active Ministries",
    cloudSync: "Live Cloud Sync",
    synced: "Connected to Supabase",
    offline: "Local Storage Mode",
    recentTransactions: "Recent Finance Ledger",
    addRecord: "New Record",
    donor: "Donor / Believer",
    amount: "Amount",
    category: "Category",
    mode: "Payment Mode",
    searchPlaceholder: "Search records, members, transactions...",
    loginTitle: "GraceOS Portal Access",
    loginSubtitle: "Sign in with your administrative credentials",
    username: "Username / Email",
    password: "Password",
    loginBtn: "Authenticate & Enter",
    switchLang: "தமிழ்",
    quickInsertTitle: "Quick Tithe / Offering Entry",
    saveBtn: "Save Record",
    cancelBtn: "Cancel",
    notes: "Notes"
  },
  ta: {
    appTitle: "கிரேஸ் சர்ச் OS",
    tagline: "தேவாலய மேலாண்மை தளம்",
    dashboard: "டாஷ்போர்டு",
    members: "உறுப்பினர்கள் பட்டியல்",
    finance: "நிதி & காணிக்கை",
    events: "நிகழ்வுகள் & நாட்காட்டி",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    welcome: "வணக்கம், போதகர் / நிர்வாகி",
    totalMembers: "மொத்த உறுப்பினர்கள்",
    monthlyIncome: "மாத காணிக்கை வரவு",
    activePledges: "செயலில் உள்ள ஊழியங்கள்",
    cloudSync: "கிளவுட் இணைப்பு",
    synced: "Supabase இணைக்கப்பட்டுள்ளது",
    offline: "ஆஃப்லைன் முறை",
    recentTransactions: "சமீபத்திய நிதிப் பதிவுகள்",
    addRecord: "புதிய பதிவு",
    donor: "நன்கொடையாளர் பெயர்",
    amount: "தொகை",
    category: "பிரிவு",
    mode: "செலுத்திய முறை",
    searchPlaceholder: "பதிவுகள், உறுப்பினர்களைத் தேடுக...",
    loginTitle: "கிரேஸ் போர்டல் உள்நுழைவு",
    loginSubtitle: "நிர்வாகி சான்றுகளுடன் உள்நுழையவும்",
    username: "பயனர் பெயர் / மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    loginBtn: "உள்நுழையவும்",
    switchLang: "English",
    quickInsertTitle: "விரைவுக் காணிக்கை பதிவு",
    saveBtn: "பதிவு செய்க",
    cancelBtn: "ரத்து செய்",
    notes: "குறிப்புகள்"
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
  const [membersCount, setMembersCount] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [syncStatus, setSyncStatus] = useState('Connecting...');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    donor_name: '',
    category: 'TITHE',
    amount: '',
    payment_mode: 'UPI',
    notes: 'Direct Entry'
  });

  const t = translations[lang];

  // லாகின் செயல்முறை
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username && loginCreds.password) {
      setIsAuthenticated(true);
      localStorage.setItem('graceos_auth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('graceos_auth');
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ta' : 'en';
    setLang(nextLang);
    localStorage.setItem('graceos_lang', nextLang);
  };

  // நேரலை Supabase டேட்டா வாசித்தல்
  const fetchCloudData = async () => {
    try {
      setSyncStatus('Syncing...');
      
      // உறுப்பினர்கள் எண்ணிக்கை
      const { count: mCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      setMembersCount(mCount || 0);

      // நிதி அட்டவணை பதிவுகள்
      const { data: ledgerData, error: lErr } = await supabase
        .from('finance_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!lErr && ledgerData) {
        setLedger(ledgerData);
      }
      setSyncStatus(t.synced);
    } catch {
      setSyncStatus(t.offline);
    }
  };

  // புதிய காணிக்கை பதிவு சேர்த்தல்
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

  // --- 1. லாகின் திரை ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07050d] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px] pointer-events-none" />

        <button 
          onClick={toggleLanguage}
          className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-cyan-400 backdrop-blur-md transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          {t.switchLang}
        </button>

        <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
              <Church className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-wide text-white">{t.loginTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">{t.loginSubtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.username}</label>
              <input 
                type="text" 
                required
                value={loginCreds.username}
                onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-all"
                placeholder="admin@gracechurch.org"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t.password}</label>
              <input 
                type="password" 
                required
                value={loginCreds.password}
                onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-semibold text-sm text-white shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              {t.loginBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. முதன்மை டெஸ்க்டாப் ERP டேஷ்போர்டு ---
  return (
    <div className="min-h-screen bg-[#080612] text-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between p-4 select-none">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Church className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight text-white">{t.appTitle}</h2>
              <span className="text-[10px] text-cyan-400">{t.tagline}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button 
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-xs text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Language
            </span>
            <span className="font-semibold text-cyan-400">{t.switchLang}</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-white/[0.01] backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{syncStatus}</span>
            </div>
            <button 
              onClick={fetchCloudData}
              title="Refresh Cloud Sync"
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">{t.dashboard}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t.welcome}</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{t.totalMembers}</span>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{membersCount}</div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3 h-3" /> Live Verified Sync
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{t.monthlyIncome}</span>
                <Receipt className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">₹ 48,500</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Tithe, Offering & Special Funds</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{t.activePledges}</span>
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">12 Wings</div>
              <span className="text-[10px] text-slate-400 mt-1 block">Youth, Sunday School, Women's Wing</span>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                {t.recentTransactions}
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-medium transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {t.addRecord}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 px-3">{t.donor}</th>
                    <th className="py-3 px-3">{t.category}</th>
                    <th className="py-3 px-3">{t.amount}</th>
                    <th className="py-3 px-3">{t.mode}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {ledger.length > 0 ? (
                    ledger.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-medium text-white">{row.donor_name || 'Anonymous'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-cyan-400 font-mono">
                            {row.category || 'TITHE'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">₹ {row.amount}</td>
                        <td className="py-3 px-3 text-slate-400">{row.payment_mode || 'UPI'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        No ledger entries found. Perform a sync or insert records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* புதிய பதிவு சேர்க்கும் Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f0c1b] border border-white/10 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              {t.quickInsertTitle}
            </h3>
            <form onSubmit={handleInsertRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">{t.donor}</label>
                <input 
                  type="text" 
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  placeholder="e.g. John Doe (Optional)"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">{t.category}</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#181427] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TITHE">TITHE</option>
                    <option value="OFFERING">OFFERING</option>
                    <option value="MISSION">MISSION</option>
                    <option value="BUILDING">BUILDING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">{t.amount} (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">{t.mode}</label>
                <select 
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#181427] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                </select>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-all cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 font-semibold text-white transition-all cursor-pointer"
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