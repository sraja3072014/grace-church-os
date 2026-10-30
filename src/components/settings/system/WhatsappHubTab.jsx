import React, { useState } from 'react';
import { MessageSquare, Save, CheckCircle2, Send, Zap, Smartphone, BellRing } from 'lucide-react';

export default function WhatsappHubTab() {
  const [toast, setToast] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [settings, setSettings] = useState(() => {
    const local = localStorage.getItem('graceos_whatsapp_config');
    return local ? JSON.parse(local) : {
      apiKey: 'WA_LIVE_TOKEN_984291842019482',
      senderPhone: '+91 98765 43210',
      testRecipient: '+91 94433 22110',
      autoBirthdayWishes: true,
      autoSundayReminder: true,
      auto80GReceipt: true,
      reminderDay: 'Saturday 07:00 PM',
      birthdayTemplate: 'Dear {name}, Grace City Church wishes you a blessed Birthday! May God shower His abundant grace on you this year.'
    };
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_whatsapp_config', JSON.stringify(settings));
    showToast('WhatsApp Gateway Configuration Saved!');
  };

  const handleSendTestMessage = () => {
    if (!settings.testRecipient) {
      showToast('Please enter a valid test recipient number.');
      return;
    }
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      showToast(`Test WhatsApp dispatch sent successfully to ${settings.testRecipient}!`);
    }, 1200);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none">
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              WhatsApp Cloud Messenger Gateway
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">Connected API</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Automates event reminders, automated 80G tax receipt PDFs, and pastor announcements.</p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Save Gateway
        </button>
      </div>

      {/* API Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Registered Business WhatsApp Number</label>
          <input 
            type="text" 
            value={settings.senderPhone}
            onChange={(e) => setSettings(prev => ({ ...prev, senderPhone: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Gateway API Token</label>
          <input 
            type="password" 
            value={settings.apiKey}
            onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300">Automated Birthday Blessing Template</label>
          <textarea 
            rows="2"
            value={settings.birthdayTemplate}
            onChange={(e) => setSettings(prev => ({ ...prev, birthdayTemplate: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Test Dispatch Sandbox */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Smartphone size={16} className="text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">Live Dispatch Sandbox</span>
            <span className="text-[10px] text-slate-400">Send an instant test message to verify token handshake</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={settings.testRecipient}
            onChange={(e) => setSettings(prev => ({ ...prev, testRecipient: e.target.value }))}
            placeholder="+91 90000 00000"
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
          />
          <button 
            type="button"
            onClick={handleSendTestMessage}
            disabled={isSendingTest}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition active:scale-95 disabled:opacity-50"
          >
            <Send size={13} />
            <span>{isSendingTest ? 'Sending...' : 'Test Send'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}