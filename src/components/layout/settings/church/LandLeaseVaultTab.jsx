// src/components/settings/church/LandLeaseVaultTab.jsx அல்லது layout/settings/church/LandLeaseVaultTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, MapPin, Clock, DollarSign, Trash2, 
  Edit3, CheckCircle2, X, Check, Landmark, ShieldCheck, FileText, Phone 
} from 'lucide-react';
import { getVaultData, setVaultData } from '../../../../utils/vaultStore';
import { getSupabase } from '../../../../utils/supabaseClient';

export default function LandLeaseVaultTab() {
  const [properties, setProperties] = useState([]);
  const [toast, setToast] = useState('');
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
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
  };

  const [propertyForm, setPropertyForm] = useState(initialForm);

  // 1. Load Data
  useEffect(() => {
    async function loadProperties() {
      const leaseAssets = await getVaultData('lease_vault', []);
      const legacyProperties = await getVaultData('properties', []);
      const combined = Array.isArray(leaseAssets) && leaseAssets.length > 0 ? leaseAssets : legacyProperties;
      setProperties(Array.isArray(combined) ? combined : []);
    }
    loadProperties();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 2. Commit to Local Disk & Supabase Sync
  const saveProperties = async (updatedAssetList) => {
    setProperties(updatedAssetList);
    await setVaultData('lease_vault', updatedAssetList, true);
    await setVaultData('properties', updatedAssetList, false);
  };

  // 3. EDIT பட்டன் செயல்முறை (கார்டில் இருந்து Form-க்கு டேட்டாவை ஏற்றுதல்)
  const handleStartEdit = (prop) => {
    setEditingId(prop.id);
    setPropertyForm({
      title: prop.title || prop.propertyName || prop.property_name || '',
      ownershipType: prop.ownershipType || prop.ownership_type || 'RENTED',
      location: prop.location || '',
      landArea: prop.landArea || prop.land_area || '',
      docNo: prop.docNo || prop.doc_no || '',
      surveyNo: prop.surveyNo || prop.survey_no || '',
      pattaNo: prop.pattaNo || prop.patta_no || '',
      trustName: prop.trustName || prop.trust_name || 'Grace Cathedral Charitable Trust',
      landlordName: prop.landlordName || prop.landlord_name || '',
      landlordPhone: prop.landlordPhone || prop.phone || '',
      monthlyRent: prop.monthlyRent ?? prop.monthly_rent ?? '',
      advanceDeposit: prop.advanceDeposit ?? prop.advance_amount ?? '',
      leaseExpiryDate: prop.leaseExpiryDate || prop.lease_end || '',
      ebConsumerNo: prop.ebConsumerNo || prop.eb_consumer_no || ''
    });
    showToast('திருத்துவதற்கு படிவத்தில் விவரங்கள் ஏற்றப்பட்டன.');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPropertyForm(initialForm);
  };

  // 4. DELETE பட்டன் செயல்முறை (Local Disk + Supabase நேரடி நீக்கம்)
  const handleDeleteProperty = async (id) => {
    const target = properties.find((p) => p.id === id);
    const targetName = target?.title || target?.propertyName || 'Property';

    if (!window.confirm(`"${targetName}" பதிவை நிரந்தரமாக நீக்க வேண்டுமா?`)) return;

    try {
      const supabase = getSupabase();
      if (supabase && navigator.onLine) {
        await supabase.from('lease_vault').delete().eq('id', String(id));
      }

      const updated = properties.filter((p) => p.id !== id);
      await saveProperties(updated);
      
      if (editingId === id) handleCancelEdit();
      showToast('✓ பதிவு வெற்றிகரமாக நீக்கப்பட்டது.');
    } catch (err) {
      console.error(err);
      showToast('நீக்குவதில் பிழை ஏற்பட்டது.');
    }
  };

  // 5. SAVE / UPDATE செயல்முறை
  const handleAddOrUpdateProperty = async (e) => {
    e.preventDefault();
    if (!propertyForm.title.trim() || !propertyForm.location.trim()) return;

    let updated = [];
    if (editingId) {
      // எடிட் செய்ததை அப்டேட் செய்தல்
      updated = properties.map((p) =>
        p.id === editingId
          ? {
              ...p,
              ...propertyForm,
              propertyName: propertyForm.title,
              monthlyRent: Number(propertyForm.monthlyRent) || 0,
              advanceDeposit: Number(propertyForm.advanceDeposit) || 0
            }
          : p
      );
      showToast('✓ சொத்து விவரங்கள் புதுப்பிக்கப்பட்டன.');
      setEditingId(null);
    } else {
      // புதிய பதிவைச் சேர்த்தல்
      const newProperty = {
        id: `PROP-${Date.now().toString().slice(-4)}`,
        propertyName: propertyForm.title,
        ...propertyForm,
        monthlyRent: Number(propertyForm.monthlyRent) || 0,
        advanceDeposit: Number(propertyForm.advanceDeposit) || 0,
        createdAt: new Date().toISOString()
      };
      updated = [newProperty, ...properties];
      showToast('✓ புதிய சொத்து / லீஸ் பதிவு சேமிக்கப்பட்டது.');
    }

    await saveProperties(updated);
    setPropertyForm(initialForm);
  };

  const totalAdvanceDeposits = properties
    .filter((prop) => (prop.ownershipType || prop.ownership_type) === 'RENTED')
    .reduce((sum, prop) => sum + (Number(prop.advanceDeposit ?? prop.advance_amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-100 pb-12 animate-in fade-in">
      {toast && (
        <div className="fixed top-6 right-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Building2 size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Land, Lease &amp; Trust Property Vault</h4>
            <p className="text-xs text-slate-400">
              Manage church freeholds, lease contracts, title deeds, and trust real estate dossiers.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
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

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form (Add or Edit Mode) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              {editingId ? <Edit3 size={15} className="text-amber-400" /> : <Plus size={15} className="text-amber-400" />}
              <span>{editingId ? 'Edit Facility / Lease' : 'Register Facility / Lease'}</span>
            </h4>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleAddOrUpdateProperty} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Facility Title *</label>
              <input
                type="text"
                required
                placeholder="Facility Name (e.g. North Campus)"
                value={propertyForm.title}
                onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Ownership Category</label>
              <select
                value={propertyForm.ownershipType}
                onChange={(e) => setPropertyForm({ ...propertyForm, ownershipType: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="RENTED">Leased / Rented Facility</option>
                <option value="OWNED">Freehold Cathedral Owned</option>
                <option value="TRUST_LEASE">Trust Endowment Property</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Location Address *</label>
              <input
                type="text"
                required
                placeholder="Location Address"
                value={propertyForm.location}
                onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {propertyForm.ownershipType === 'RENTED' && (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">Rental Financials</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Monthly Rent (₹)"
                    value={propertyForm.monthlyRent}
                    onChange={(e) => setPropertyForm({ ...propertyForm, monthlyRent: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Deposit (₹)"
                    value={propertyForm.advanceDeposit}
                    onChange={(e) => setPropertyForm({ ...propertyForm, advanceDeposit: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Landlord Name"
                    value={propertyForm.landlordName}
                    onChange={(e) => setPropertyForm({ ...propertyForm, landlordName: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Owner Phone"
                    value={propertyForm.landlordPhone}
                    onChange={(e) => setPropertyForm({ ...propertyForm, landlordPhone: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {propertyForm.ownershipType !== 'RENTED' && (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold block">Title Deed &amp; Registry</span>
                <input
                  type="text"
                  placeholder="Doc Reg No (e.g. DOC-1244/2019)"
                  value={propertyForm.docNo}
                  onChange={(e) => setPropertyForm({ ...propertyForm, docNo: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {editingId ? 'Update Facility in Vault' : 'Save Facility to Vault'}
            </button>
          </form>
        </div>

        {/* Right Column: Cards with EDIT & DELETE BUTTONS INSIDE */}
        <div className="lg:col-span-2 space-y-4 max-h-[580px] overflow-y-auto pr-1">
          {properties.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-900 rounded-3xl border border-white/10">
              No real estate properties registered in administration.
            </div>
          ) : (
            properties.map((prop) => (
                <div 
                  key={prop.id} 
                  className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 hover:border-amber-500/30 transition shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{prop.title || prop.propertyName || prop.property_name || 'Property'}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {prop.id}
                        </span>
                      </h5>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin size={13} className="text-rose-400 shrink-0" /> 
                        <span>{prop.location}</span>
                        {(prop.landArea || prop.land_area) && <span>• ({prop.landArea || prop.land_area})</span>}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                      {prop.ownershipType || prop.ownership_type || 'RENTED'}
                    </span>
                  </div>

                  {(prop.ownershipType || prop.ownership_type || 'RENTED') === 'RENTED' && (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Monthly Rent:</span>
                        <span className="text-amber-300 font-bold">₹ {Number(prop.monthlyRent ?? prop.monthly_rent ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Advance Deposit:</span>
                        <span className="text-white font-bold">₹ {Number(prop.advanceDeposit ?? prop.advance_amount ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(prop)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-amber-500/40"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-rose-500/40"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>

                </div>
              ))
          )}
        </div>

      </div>
    </div>
  );
}