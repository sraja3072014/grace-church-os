// src/components/finance/TreasuryAndAssetDesk.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function TreasuryAndAssetDesk({ session }) {
  const [toast, setToast] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [assets, setAssets] = useState([]);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category: 'SOUND',
    quantity: 1,
    location: '',
    cost: '',
    condition: 'EXCELLENT'
  });

  useEffect(() => {
    let isMounted = true;
    async function loadAssets() {
      try {
        const diskAssets = await getVaultData('assets', []);
        if (!isMounted) return;
        setAssets(Array.isArray(diskAssets) ? diskAssets : []);
      } catch (error) {
        console.error('Vault read error:', error);
      }
    }
    loadAssets();
    return () => { isMounted = false; };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveAssets = async (updated) => {
    setAssets(updated);
    await setVaultData('assets', updated, true);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const finalCategory = isCustomCategory && customCategoryInput.trim() ? customCategoryInput.trim() : equipmentForm.category;
    if (!equipmentForm.name.trim() || !finalCategory) return;
    soundFX?.playSuccessChime?.();

    const newItem = {
      id: `AST-${Date.now().toString().slice(-3)}`,
      name: equipmentForm.name.trim(),
      category: finalCategory,
      quantity: Number(equipmentForm.quantity) || 1,
      location: equipmentForm.location.trim() || 'Main Sanctuary',
      cost: Number(equipmentForm.cost) || 0,
      condition: equipmentForm.condition,
      lastService: new Date().toISOString().slice(0, 10)
    };

    const updated = [newItem, ...assets];
    await saveAssets(updated);
    setEquipmentForm({ name: '', category: 'SOUND', quantity: 1, location: '', cost: '', condition: 'EXCELLENT' });
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    showToast('Equipment registered successfully!');
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Remove this equipment item?')) return;
    await saveAssets(assets.filter(a => a.id !== id));
    showToast('Equipment item removed.');
  };

  const totalGearValuation = useMemo(() => assets.reduce((sum, item) => sum + (Number(item.cost) || 0), 0), [assets]);

  const conditionBadges = {
    EXCELLENT: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    NEEDS_SERVICE: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none text-slate-100 pb-12 animate-in fade-in">
      {toast && (
        <div className="fixed top-6 right-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="text-cyan-400" size={22} />
            <span>Equipment Inventory Desk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sanctuary sound, media, and musical equipment asset tracking.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 max-w-sm">
          <span className="text-xs text-slate-400 block uppercase font-mono">Total Equipment Valuation</span>
          <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">₹ {totalGearValuation.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">{assets.length} Registered Equipment Items</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Plus size={15} className="text-cyan-400" />
              <span>Register Equipment</span>
            </h4>

            <form onSubmit={handleAddAsset} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Yamaha Keyboard / Shure Mic"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={equipmentForm.quantity}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Valuation (₹)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={equipmentForm.cost}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-slate-400 font-bold">Category</label>
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
                    value={equipmentForm.category}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="SOUND">Audio &amp; PA System</option>
                    <option value="MEDIA">Visual &amp; Projection</option>
                    <option value="FACILITY">Sanctuary Fixtures</option>
                    <option value="INSTRUMENTS">Musical Instruments</option>
                  </select>
                )}
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Stage / Control Booth"
                  value={equipmentForm.location}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Save Equipment
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {assets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-900 rounded-3xl border border-white/10">
                  No equipment registered yet.
                </div>
              ) : (
                assets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-white">{asset.name} (Qty: {asset.quantity})</h5>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {asset.id} • Category: <strong className="text-cyan-300">{asset.category}</strong> • Location: {asset.location} • Cost: ₹ {Number(asset.cost).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${conditionBadges[asset.condition]}`}>
                        {asset.condition}
                      </span>
                      <button onClick={() => handleDeleteAsset(asset.id)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}