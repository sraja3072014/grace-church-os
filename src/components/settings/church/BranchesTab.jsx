// src/components/settings/church/BranchesTab.jsx
import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, MapPin, UserCheck, Trash2, Edit3, X, Check, Building2, ShieldCheck } from 'lucide-react';
import { persistModuleData, MODULE_STORAGE_REGISTRY } from '../../../utils/storageDispatcher';
import { getVaultData, setVaultData } from '../../../utils/vaultStore';

export default function BranchesTab() {
  const [activeSubTab, setActiveSubTab] = useState('directory'); // 'directory' | 'governance'
  
  const loadBranches = () => {
    const mainChurchStr = localStorage.getItem('graceos_main_church');
    const mainChurch = mainChurchStr ? JSON.parse(mainChurchStr) : { churchName: 'Grace City Church', seniorPastor: 'Senior Pastor', address: 'City Center' };
    
    const local = localStorage.getItem('graceos_branches');
    if (local) {
      const branches = JSON.parse(local);
      return branches.map(b => {
        if (b.code === 'GCC-MAIN' || b.id === 1) {
          return {
            ...b,
            name: `${mainChurch.churchName} (Main Campus)`,
            pastor: mainChurch.seniorPastor || b.pastor,
            location: mainChurch.address.split(',')[0] || b.location
          };
        }
        return b;
      });
    }

    return [
      { id: 1, name: `${mainChurch.churchName} (Main Campus)`, code: 'GCC-MAIN', pastor: mainChurch.seniorPastor || 'Senior Pastor', location: 'City Center, Koduvai', members: 1850 },
      { id: 2, name: 'Grace North Campus', code: 'GCC-NORTH', pastor: 'Pastor David', location: 'North Extension', members: 540 },
      { id: 3, name: 'Grace East Chapel', code: 'GCC-EAST', pastor: 'Pastor Timothy', location: 'East Bypass', members: 450 },
    ];
  };

  const [branches, setBranches] = useState(loadBranches);
  const [governance, setGovernance] = useState({
    allowBranchAutonomy: true,
    mainChurchAuditOnly: true,
    lockBranchBalancesFromHQ: true
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', pastor: '', location: '', members: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadGov() {
      const dbGov = await getVaultData('branch_governance', {
        allowBranchAutonomy: true,
        mainChurchAuditOnly: true,
        lockBranchBalancesFromHQ: true
      });
      setGovernance(dbGov || {});
    }
    loadGov();

    const handleStorageChange = () => setBranches(loadBranches());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const sync = async (data) => {
    setBranches(data);
    await persistModuleData(MODULE_STORAGE_REGISTRY.BRANCHES, data);
  };

  const handleToggleGov = async (key) => {
    const updated = { ...governance, [key]: !governance[key] };
    setGovernance(updated);
    await setVaultData('branch_governance', updated, true);
    showToast('Branch privacy & autonomy policy updated.');
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setForm({ name: '', code: `GCC-${Math.floor(100 + Math.random() * 900)}`, pastor: '', location: '', members: '0' });
    setModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditItem(branch);
    setForm(branch);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const target = branches.find(b => b.id === id);
    if (target?.code === 'GCC-MAIN' || target?.id === 1) {
      alert('The Main Headquarters Campus cannot be deleted.');
      return;
    }
    await sync(branches.filter(b => b.id !== id));
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    if (!form.name || !form.pastor) return;

    if (editItem) {
      await sync(branches.map(b => b.id === editItem.id ? { ...form, id: editItem.id, members: Number(form.members) || 0 } : b));
    } else {
      await sync([...branches, { ...form, id: Date.now(), members: Number(form.members) || 0 }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl select-none text-slate-100">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <Check size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Top Header & Sub-Tab Switcher */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Branch Campuses &amp; Financial Governance</h4>
          <p className="text-xs text-slate-400">Manage multi-campus branch profiles, pastoral assignments, and financial autonomy rules.</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 shrink-0">
          <button 
            type="button"
            onClick={() => setActiveSubTab('directory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'directory' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Branch Directory ({branches.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveSubTab('governance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'governance' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Financial Autonomy &amp; Privacy
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: BRANCH DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <Plus size={15} /> Add New Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(branch => {
              const isMain = branch.code === 'GCC-MAIN' || branch.id === 1;
              return (
                <div 
                  key={branch.id} 
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition ${
                    isMain 
                      ? 'bg-gradient-to-b from-cyan-950/30 to-slate-900/40 border-cyan-500/30 shadow-lg shadow-cyan-500/5' 
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                        isMain 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}>
                        {branch.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">{branch.members.toLocaleString()} Members</span>
                    </div>
                    
                    <h5 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      {isMain && <Building2 size={15} className="text-cyan-400 shrink-0" />}
                      <span className="truncate">{branch.name}</span>
                    </h5>
                    
                    <div className="flex flex-col gap-1 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1.5"><UserCheck size={13} className="text-indigo-400" /> {branch.pastor}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={13} className="text-rose-400" /> {branch.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => handleOpenEdit(branch)}
                      className="flex-1 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    {!isMain && (
                      <button 
                        type="button"
                        onClick={() => handleDelete(branch.id)}
                        className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FINANCIAL GOVERNANCE & PRIVACY */}
      {activeSubTab === 'governance' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            Headquarters vs Branch Privacy Policies
          </h5>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
              <div>
                <h6 className="text-xs font-bold text-white">Independent Branch Accounts (Local Autonomy)</h6>
                <p className="text-[11px] text-slate-400">Branch leaders manage tithes locally without direct central HQ debit privileges.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleGov('allowBranchAutonomy')}
                className={`w-12 h-6 rounded-full transition relative p-0.5 cursor-pointer ${governance.allowBranchAutonomy ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${governance.allowBranchAutonomy ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
              <div>
                <h6 className="text-xs font-bold text-white">Audit-Only Visibility for Main Church HQ</h6>
                <p className="text-[11px] text-slate-400">Main headquarters can review year-end audited totals only; individual donor names remain sealed.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleGov('mainChurchAuditOnly')}
                className={`w-12 h-6 rounded-full transition relative p-0.5 cursor-pointer ${governance.mainChurchAuditOnly ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${governance.mainChurchAuditOnly ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
              <div>
                <h6 className="text-xs font-bold text-white">Lock Daily Cash Balances from Central Pulls</h6>
                <p className="text-[11px] text-slate-400">Prevents automated central ledger debit sweeps. Funds remain solely with local trustees.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleGov('lockBranchBalancesFromHQ')}
                className={`w-12 h-6 rounded-full transition relative p-0.5 cursor-pointer ${governance.lockBranchBalancesFromHQ ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${governance.lockBranchBalancesFromHQ ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Branch Popup Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch size={16} className="text-cyan-400" />
                {editItem ? 'Edit Branch' : 'Add New Branch'}
              </h4>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Branch Campus Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Grace South Campus"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Branch Code</label>
                  <input 
                    type="text" 
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Members Count</label>
                  <input 
                    type="number" 
                    value={form.members}
                    onChange={(e) => setForm({ ...form, members: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Pastor in Charge</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Pastor John"
                  value={form.pastor}
                  onChange={(e) => setForm({ ...form, pastor: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Location / City</label>
                <input 
                  type="text" 
                  placeholder="e.g. Koduvai Main Road"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Check size={14} /> Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}