import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Save, CheckCircle2, ShieldCheck, Zap, KeyRound, DollarSign } from 'lucide-react';
import { getVaultData, setVaultData } from '../../../utils/vaultStore';

export default function PaymentGatewayConfigTab() {
  const [toast, setToast] = useState('');

  const defaultGatewayConfig = {
    activeProvider: 'RAZORPAY',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayWebhookSecret: '',
    stripePublishableKey: '',
    stripeSecretKey: '',
    upiMerchantVpa: 'gracecathedral@sbi',
    upiMerchantName: 'Grace Cathedral Trust',
    enableDynamicQrOnCheckout: true,
    enableAutoReceiptAfterPayment: true
  };

  const [gatewayConfig, setGatewayConfig] = useState(defaultGatewayConfig);

  useEffect(() => {
    async function loadGatewayConfig() {
      const savedConfig = await getVaultData('payment_gateway_config', defaultGatewayConfig);
      setGatewayConfig(savedConfig);
    }
    loadGatewayConfig();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await setVaultData('payment_gateway_config', gatewayConfig, true);
    localStorage.setItem('graceos_payment_gateway_config', JSON.stringify(gatewayConfig));
    showToast('Payment Gateway Parameters Enforced Successfully!');
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none text-slate-100 pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl win11-card border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Payment Gateway &amp; UPI Merchant Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                Checkout Ready
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect Razorpay, Stripe, or Direct Merchant UPI VPA for online tithes, touch kiosks, and donor checkout.
            </p>
          </div>
        </div>

        {/* BankAccountsTab பட்டன் பாணிக்கு மாற்றப்பட்ட Save Gateway பட்டன் */}
        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <Save size={15} />
          <span>Save Gateway</span>
        </button>
      </div>

      {/* Provider Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <button
          type="button"
          onClick={() => setGatewayConfig({ ...gatewayConfig, activeProvider: 'RAZORPAY' })}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            gatewayConfig.activeProvider === 'RAZORPAY'
              ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg'
              : 'win11-card border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-cyan-400 font-sans">Razorpay</span>
            <Zap size={15} className="text-cyan-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Indian UPI, NetBanking, Cards</span>
        </button>

        <button
          type="button"
          onClick={() => setGatewayConfig({ ...gatewayConfig, activeProvider: 'UPI_DIRECT' })}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            gatewayConfig.activeProvider === 'UPI_DIRECT'
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
              : 'win11-card border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-amber-400 font-sans">Direct UPI QR</span>
            <QrCode size={15} className="text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-2">Zero 0% Fee Instant Settlement</span>
        </button>

        <button
          type="button"
          onClick={() => setGatewayConfig({ ...gatewayConfig, activeProvider: 'STRIPE' })}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            gatewayConfig.activeProvider === 'STRIPE'
              ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-lg'
              : 'win11-card border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-indigo-400 font-sans">Stripe Global</span>
            <DollarSign size={15} className="text-indigo-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-2">International Currencies (USD/AED)</span>
        </button>
      </div>

      {/* Razorpay Parameters */}
      {gatewayConfig.activeProvider === 'RAZORPAY' && (
        <div className="p-5 rounded-2xl win11-card border border-white/10 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
            <KeyRound size={14} />
            <span>Razorpay Live Merchant API Keys</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Key ID *</label>
              <input 
                type="text"
                required
                placeholder="rzp_live_xxxxxxxxxxxx"
                value={gatewayConfig.razorpayKeyId}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, razorpayKeyId: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Key Secret *</label>
              <input 
                type="password"
                required
                placeholder="••••••••••••••••••••"
                value={gatewayConfig.razorpayKeySecret}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, razorpayKeySecret: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Direct UPI Parameters */}
      {gatewayConfig.activeProvider === 'UPI_DIRECT' && (
        <div className="p-5 rounded-2xl win11-card border border-white/10 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
            <QrCode size={14} />
            <span>Direct NPCI UPI VPA Merchant Profile</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Merchant UPI VPA *</label>
              <input 
                type="text"
                required
                placeholder="churchtrust@sbi"
                value={gatewayConfig.upiMerchantVpa}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, upiMerchantVpa: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Registered Payee Legal Name</label>
              <input 
                type="text"
                required
                placeholder="Grace Cathedral Charitable Trust"
                value={gatewayConfig.upiMerchantName}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, upiMerchantName: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stripe Parameters */}
      {gatewayConfig.activeProvider === 'STRIPE' && (
        <div className="p-5 rounded-2xl win11-card border border-white/10 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1.5">
            <KeyRound size={14} />
            <span>Stripe Live Gateway API Keys</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Publishable Key</label>
              <input 
                type="text"
                placeholder="pk_live_xxxxxxxxxxxx"
                value={gatewayConfig.stripePublishableKey}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, stripePublishableKey: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Secret Key</label>
              <input 
                type="password"
                placeholder="sk_live_xxxxxxxxxxxx"
                value={gatewayConfig.stripeSecretKey}
                onChange={(e) => setGatewayConfig({ ...gatewayConfig, stripeSecretKey: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>
          </div>
        </div>
      )}

    </form>
  );
}