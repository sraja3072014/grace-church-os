import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Edit3, Trash2, X, Check, Tag, ShieldCheck } from 'lucide-react';
import { getVaultData, setVaultData } from '../../../utils/vaultStore';

export default function GivingCategoriesTab() {
  const defaultCategories = [
    { id: 1, name: 'Sunday Tithes (10%)', code: 'TITHE-01', taxExempt80G: true, targetFund: 'General Operations', status: 'Active' },
    { id: 2, name: 'Missionary Support Fund', code: 'MISS-02', taxExempt80G: true, targetFund: 'Missions & Outreach', status: 'Active' },
    { id: 3, name: 'Church Building Project', code: 'BLDG-03', taxExempt80G: true, targetFund: 'Capital Projects', status: 'Active' },
    { id: 4, name: 'Sunday School & Youth', code: 'YOUTH-04', taxExempt80G: false, targetFund: 'Departmental', status: 'Active' },
    { id: 5, name: 'Thanksgiving Offering', code: 'THNK-05', taxExempt80G: true, targetFund: 'General Treasury', status: 'Active' },
  ];

  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', taxExempt80G: true, targetFund: 'General Operations', status: 'Active' });

  useEffect(() => {
    async function loadCategories() {
      const data = await getVaultData('giving_categories', defaultCategories);
      setCategories(data);
    }
    loadCategories();
  }, []);

  const sync = async (data) => {
    setCategories(data);
    await setVaultData('giving_categories', data, true);
    localStorage.setItem('graceos_giving_categories', JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setForm({ name: '', code: `CAT-${Math.floor(10 + Math.random() * 90)}`, taxExempt80G: true, targetFund: 'General Operations', status: 'Active' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditItem(cat);
    setForm(cat);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (categories.length === 1) {
      alert('At least one giving category is required.');
      return;
    }
    if (!window.confirm('Delete this giving category?')) return;
    await sync(categories.filter(c => c.id !== id));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    if (editItem) {
      await sync(categories.map(c => c.id === editItem.id ? { ...form, id: editItem.id } : c));
    } else {
      await sync([...categories, { ...form, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl select-none text-slate-100">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Giving &amp; Tithe Categories ({categories.length})</h4>
          <p className="text-xs text-slate-400 mt-0.5">Classify incoming donations, fund allocation tags, and 80G tax receipt rules.</p>
        </div>
        <button 
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between gap-4 hover:border-cyan-500/30 transition shadow-lg">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {cat.code}
                </span>
                {cat.taxExempt80G ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck size={11} /> 80G Tax Exempt
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    Standard
                  </span>
                )}
              </div>

              <h5 className="text-sm font-bold text-slate-100 mt-1">{cat.name}</h5>
              
              <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Tag size={13} className="text-indigo-400" /> Fund Ledger: <strong className="text-slate-200">{cat.targetFund}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <button 
                type="button"
                onClick={() => handleOpenEdit(cat)}
                className="flex-1 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} /> Edit
              </button>
              <button 
                type="button"
                onClick={() => handleDelete(cat.id)}
                className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition cursor-pointer"
                title="Delete Category"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartHandshake size={16} className="text-cyan-400" />
                <span>{editItem ? 'Edit Category' : 'Create Giving Category'}</span>
              </h4>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Category Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Missionary Support Fund"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Category Code *</label>
                  <input 
                    type="text" 
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Target Fund</label>
                  <select 
                    value={form.targetFund}
                    onChange={(e) => setForm({ ...form, targetFund: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option>General Operations</option>
                    <option>Missions &amp; Outreach</option>
                    <option>Capital Projects</option>
                    <option>Departmental</option>
                    <option>General Treasury</option>
                  </select>
                </div>
              </div>

              <div 
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between cursor-pointer" 
                onClick={() => setForm({ ...form, taxExempt80G: !form.taxExempt80G })}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">80G Tax Exemption Eligible</p>
                  <p className="text-[10px] text-slate-400">Generates legal 80G tax vouchers automatically</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={form.taxExempt80G} 
                  onChange={() => {}} 
                  className="w-4 h-4 accent-cyan-500 rounded pointer-events-none"
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
                  <Check size={14} /> Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}