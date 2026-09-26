// src/components/finance/TreasuryAndAssetDesk.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, CheckCircle2, Building2, ShieldCheck, Tag 
} from 'lucide-react';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function TreasuryAndAssetDesk({ session }) {
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  
  // Custom category input state
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [form, setForm] = useState({
    name: '',
    type: 'Movable',
    category: 'Musical Equipment',
    valuation: '',
    provenance: 'Bought by Church',
    location: 'Main Sanctuary',
    condition: 'Excellent'
  });

  useEffect(() => {
    async function loadAssets() {
      const dbAst = await getVaultData('church_assets', [
        { id: 'ast_1', name: 'Main Sanctuary Building & Freehold Land', type: 'Immovable', category: 'Main Sanctuary Building', valuation: 25000000, provenance: 'Founder Family', location: 'Campus Main', condition: 'Excellent' },
        { id: 'ast_2', name: 'Yamaha Digital Grand Piano', type: 'Movable', category: 'Musical Equipment', valuation: 185000, provenance: 'Youth Fellowship', location: 'Worship Stage', condition: 'Good' },
        { id: 'ast_3', name: 'Pastor Quarters Residence', type: 'Immovable', category: 'Pastorate Residential Quarters', valuation: 4500000, provenance: 'Church Trust Purchase', location: 'East Wing', condition: 'Good' }
      ]);
      setAssets(dbAst || []);
    }
    loadAssets();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    const finalCategory = isCustomCategory && customCategoryInput.trim() ? customCategoryInput.trim() : form.category;
    if (!form.name || !form.valuation || !finalCategory) return;

    const newAsset = {
      id: `ast_${Date.now()}`,
      ...form,
      category: finalCategory,
      valuation: Number(form.valuation) || 0
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    await setVaultData('church_assets', updated, true);
    
    setForm({
      name: '',
      type: 'Movable',
      category: 'Musical Equipment',
      valuation: '',
      provenance: 'Bought by Church',
      location: 'Main Sanctuary',
      condition: 'Excellent'
    });
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setShowModal(false);
    showToast('New asset successfully added to trust registry.');
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Are you sure you want to remove this property record?')) return;
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    await setVaultData('church_assets', updated, true);
    showToast('Asset record removed.');
  };

  const totalValuation = assets.reduce((acc, curr) => acc + Number(curr.valuation || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none text-slate-100 pb-12 animate-in fade-in">
      {toast && (
        <div className="fixed top-6 right-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header & Metric */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="text-amber-400" size={22} />
            <span>Church Asset Registry &amp; Trust Properties</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Movable equipment, gold, vehicles, land, buildings, and pastorate residential quarters inventory.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
        >
          <Plus size={15} /> Register New Asset
        </button>
      </div>

      {/* Summary Valuation Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 max-w-sm">
        <span className="text-xs text-slate-400 block uppercase font-mono">Total Trust Asset Valuation</span>
        <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
          ₹ {totalValuation.toLocaleString('en-IN')}
        </span>
        <span className="text-[11px] text-slate-400 mt-1 block">{assets.length} Registered Movable &amp; Immovable Properties</span>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((ast) => (
          <div key={ast.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  ast.type === 'Immovable' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {ast.type}
                </span>
                <span className="text-sm font-mono font-black text-amber-400">₹ {Number(ast.valuation || 0).toLocaleString('en-IN')}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{ast.name}</h4>
              <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                <div>Category: <strong className="text-slate-200">{ast.category}</strong></div>
                <div>Location: <strong className="text-slate-200">{ast.location}</strong></div>
                <div>Provenance / Donor: <strong className="text-cyan-300">{ast.provenance}</strong></div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                onClick={() => handleDeleteAsset(ast.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                title="Remove Asset"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Package size={18} className="text-amber-400" />
              <span>Register Church Property or Asset</span>
            </h3>

            <form onSubmit={handleSaveAsset} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">Asset Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pastor Quarters / Yamaha Sound System"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Property Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ 
                        ...form, 
                        type: val,
                        category: val === 'Immovable' ? 'Main Sanctuary Building' : 'Musical Equipment'
                      });
                      setIsCustomCategory(false);
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Movable">Movable</option>
                    <option value="Immovable">Immovable</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Valuation (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={form.valuation}
                    onChange={(e) => setForm({ ...form, valuation: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-400 font-bold">Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer font-semibold"
                  >
                    {isCustomCategory ? 'Select from list' : '+ Add Custom Category'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    required
                    placeholder="Type custom category name..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                ) : (
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {form.type === 'Immovable' ? (
                      <>
                        <option value="Main Sanctuary Building">Main Sanctuary Building</option>
                        <option value="Branch Chapel Building">Branch Chapel Building</option>
                        <option value="Land & Freehold Plots">Land &amp; Freehold Plots</option>
                        <option value="Pastorate Residential Quarters">Pastorate Residential Quarters (Owned)</option>
                        <option value="Rental / Leased Facilities">Rental / Leased Facility</option>
                      </>
                    ) : (
                      <>
                        <option value="Musical Equipment">Musical Equipment (Pianos, Guitars)</option>
                        <option value="Sound & Audio Systems">Sound &amp; Audio Systems</option>
                        <option value="Church Vehicles">Church Vehicles (Buses, Vans)</option>
                        <option value="Gold & Trust Valuables">Gold &amp; Trust Valuables</option>
                        <option value="Office & IT Hardware">Office &amp; IT Hardware</option>
                      </>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">Provenance / Donor / Status</label>
                <input
                  type="text"
                  placeholder="e.g. Donated by Founder Family / Church Owned / Rented"
                  value={form.provenance}
                  onChange={(e) => setForm({ ...form, provenance: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">Location / Campus</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium / East Wing"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-white shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}