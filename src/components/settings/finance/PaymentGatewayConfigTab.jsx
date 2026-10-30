// src/components/settings/finance/PaymentGatewayConfigTab.jsx
import React, { useState } from 'react';
import { 
  Wallet, Plus, Edit2, Trash2, X, Check, 
  KeyRound, ShieldCheck, Eye, EyeOff, Radio, RefreshCw, Zap
} from 'lucide-react';

export default function PaymentGatewaysTab({ onTriggerSuccess }) {
  const [gateways, setGateways] = useState([
    {
      id: 1,
      provider: 'Razorpay',
      displayName: 'Razorpay PG (UPI, Cards, NetBanking)',
      environment: 'Live',
      apiKey: 'rzp_live_98a7sd98f7asdf89',
      apiSecret: '••••••••••••••••••••••••',
      merchantId: 'M_RAZOR_CATHERAL',
      webhookSecret: 'whsec_987asdf89a7sdf',
      isEnabled: true,
      supportedModes: ['GPay / PhonePe UPI', 'Debit/Credit Cards', 'NetBanking'],
      feePayer: 'Church Absorbs Fee (0% to Donor)'
    },
    {
      id: 2,
      provider: 'PhonePe PG',
      displayName: 'PhonePe Direct Payment Gateway',
      environment: 'Live',
      apiKey: 'PHONEPE_PG_MID_109283',
      apiSecret: '••••••••••••••••••••••••',
      merchantId: 'PHONEPE_M_98234',
      webhookSecret: 'ph_wh_098234asdf',
      isEnabled: true,
      supportedModes: ['PhonePe UPI Direct', 'QR Auto-Intent', 'Credit Cards'],
      feePayer: 'Church Absorbs Fee'
    },
    {
      id: 3,
      provider: 'Stripe',
      displayName: 'Stripe International (Foreign USD/EUR Donations)',
      environment: 'Test',
      apiKey: 'pk_test_51Mz897asdf897asdf',
      apiSecret: '••••••••••••••••••••••••',
      merchantId: 'acct_1Mz897asdf',
      webhookSecret: 'whsec_stripe_test_123',
      isEnabled: false,
      supportedModes: ['International Cards', 'Apple Pay', 'Google Pay Global'],
      feePayer: 'Donor Covers Fee (Add 2.5%)'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  const [formState, setFormState] = useState({
    provider: 'Razorpay',
    displayName: '',
    environment: 'Live',
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    webhookSecret: '',
    feePayer: 'Church Absorbs Fee (0% to Donor)',
    isEnabled: true
  });

  const providerTemplates = {
    Razorpay: {
      name: 'Razorpay PG (UPI, Cards, NetBanking)',
      keyPlaceholder: 'rzp_live_...',
      secretPlaceholder: 'Razorpay Key Secret'
    },
    'PhonePe PG': {
      name: 'PhonePe Direct Payment Gateway',
      keyPlaceholder: 'Merchant Key / App ID',
      secretPlaceholder: 'Salt Key / Secret Key'
    },
    'Paytm PG': {
      name: 'Paytm All-In-One Gateway',
      keyPlaceholder: 'Paytm Merchant ID (MID)',
      secretPlaceholder: 'Merchant Key'
    },
    Stripe: {
      name: 'Stripe Global (Foreign Cards & Currencies)',
      keyPlaceholder: 'pk_live_... / pk_test_...',
      secretPlaceholder: 'sk_live_... / sk_test_...'
    },
    Cashfree: {
      name: 'Cashfree AutoCollect & PG',
      keyPlaceholder: 'App ID',
      secretPlaceholder: 'Secret Key'
    }
  };

  const handleOpenModal = (gw = null) => {
    setShowSecret(false);
    if (gw) {
      setEditingId(gw.id);
      setFormState({ ...gw });
    } else {
      setEditingId(null);
      setFormState({
        provider: 'Razorpay',
        displayName: providerTemplates['Razorpay'].name,
        environment: 'Live',
        apiKey: '',
        apiSecret: '',
        merchantId: '',
        webhookSecret: '',
        feePayer: 'Church Absorbs Fee (0% to Donor)',
        isEnabled: true
      });
    }
    setIsModalOpen(true);
  };

  const handleProviderChange = (prov) => {
    setFormState({
      ...formState,
      provider: prov,
      displayName: providerTemplates[prov]?.name || prov
    });
  };

  const handleSaveGateway = (e) => {
    e.preventDefault();
    if (!formState.apiKey || !formState.apiSecret) {
      alert('API Key and Secret are required');
      return;
    }

    if (editingId) {
      setGateways(gateways.map(g => g.id === editingId ? { ...formState, id: g.id } : g));
      onTriggerSuccess('Payment Gateway credentials updated successfully!');
    } else {
      const newGw = {
        ...formState,
        id: Date.now(),
        supportedModes: ['UPI (GPay / PhonePe)', 'Cards', 'NetBanking']
      };
      setGateways([...gateways, newGw]);
      onTriggerSuccess('New Payment Gateway integration added!');
    }
    setIsModalOpen(false);
  };

  const handleToggleEnable = (id) => {
    setGateways(gateways.map(g => {
      if (g.id === id) {
        const nextState = !g.isEnabled;
        onTriggerSuccess(`${g.provider} Gateway ${nextState ? 'Activated' : 'Deactivated'}`);
        return { ...g, isEnabled: nextState };
      }
      return g;
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Payment Gateway configuration?")) {
      setGateways(gateways.filter(g => g.id !== id));
      onTriggerSuccess('Payment gateway configuration removed.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-200">
      {/* Gateway Directory Card */}
      <div className="win11-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="text-cyan-400" size={20} />
              Online Payment Gateways &amp; API Webhooks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect Razorpay, PhonePe, Paytm, and Stripe to collect tithes on Member Mobile App with instant 80G tax receipts
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 cursor-pointer shrink-0 transition"
          >
            <Plus size={15} />
            <span>Connect Payment Gateway</span>
          </button>
        </div>

        {/* Gateways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 win11-card ${
                gw.isEnabled
                  ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                  : 'border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{gw.displayName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      gw.environment === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {gw.environment}
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-400 font-medium">{gw.feePayer}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(gw)}
                    className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 cursor-pointer transition"
                    title="Edit API Keys"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(gw.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer transition"
                    title="Delete Gateway"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* API Credentials Box */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">API Key / MID:</span>
                  <span className="text-white font-bold">{gw.apiKey.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">Key Secret:</span>
                  <span className="text-slate-400">••••••••••••••••</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">Webhook Secret:</span>
                  <span className="text-emerald-400">{gw.webhookSecret ? 'Configured & Active' : 'Not Set'}</span>
                </div>
              </div>

              {/* Toggle Enable & Mode */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">Instant Auto-Reconciliation</span>
                
                <button
                  type="button"
                  onClick={() => handleToggleEnable(gw.id)}
                  className={`cursor-pointer px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                    gw.isEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-white/10'
                  }`}
                >
                  {gw.isEnabled ? '● Active on App' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Connect Gateway */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="win11-card w-full max-w-xl p-6 rounded-3xl border border-white/25 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="text-cyan-400" size={18} />
                {editingId ? 'Edit Payment Gateway Keys' : 'Connect New Payment Gateway'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="space-y-3.5">
              {/* Select Provider */}
              <div>
                <label className="text-xs text-slate-300 font-medium">Select Gateway Provider *</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1.5">
                  {['Razorpay', 'PhonePe PG', 'Paytm PG', 'Stripe', 'Cashfree'].map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => handleProviderChange(prov)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        formState.provider === prov
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-black/30 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">Gateway Display Label *</label>
                  <input
                    type="text"
                    required
                    value={formState.displayName}
                    onChange={(e) => setFormState({ ...formState, displayName: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Environment Mode</label>
                  <select
                    value={formState.environment}
                    onChange={(e) => setFormState({ ...formState, environment: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Live">Live Production Mode</option>
                    <option value="Test">Test / Sandbox Mode</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Merchant ID / MID</label>
                  <input
                    type="text"
                    placeholder="e.g. M_RAZOR_CATHERAL"
                    value={formState.merchantId}
                    onChange={(e) => setFormState({ ...formState, merchantId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">
                    API Key / Key ID * ({formState.provider})
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={providerTemplates[formState.provider]?.keyPlaceholder || 'Enter Key'}
                    value={formState.apiKey}
                    onChange={(e) => setFormState({ ...formState, apiKey: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-medium">
                      API Key Secret *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{showSecret ? 'Hide Secret' : 'Show Secret'}</span>
                    </button>
                  </div>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    required
                    placeholder={providerTemplates[formState.provider]?.secretPlaceholder || 'Enter Secret'}
                    value={formState.apiSecret}
                    onChange={(e) => setFormState({ ...formState, apiSecret: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">Webhook Signing Secret (For Auto-Receipts)</label>
                  <input
                    type="text"
                    placeholder="whsec_..."
                    value={formState.webhookSecret}
                    onChange={(e) => setFormState({ ...formState, webhookSecret: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">Transaction Fee Policy</label>
                  <select
                    value={formState.feePayer}
                    onChange={(e) => setFormState({ ...formState, feePayer: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Church Absorbs Fee (0% to Donor)">Church Absorbs Fee (Donor pays exact giving amount)</option>
                    <option value="Donor Covers Fee (Add 2.0%)">Donor Option to Cover Processing Fee (Recommended)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 cursor-pointer transition"
                >
                  {editingId ? 'Update Credentials' : 'Save & Connect Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}