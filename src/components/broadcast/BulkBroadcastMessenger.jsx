import React, { useState, useMemo } from 'react';
import { 
  Send, MessageSquare, Users, Sparkles, 
  CheckCircle2, AlertCircle, Copy, ExternalLink, Filter 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import WeeklyBroadcastDispatchDesk from './WeeklyBroadcastDispatchDesk';

export default function BulkBroadcastMessenger() {
  const [activeSubTab, setActiveSubTab] = useState('bulk_broadcast');
  const [selectedTarget, setSelectedTarget] = useState('ALL'); // 'ALL' | 'HEADS' | 'YOUTH'
  const [broadcastType, setBroadcastType] = useState('FESTIVAL'); // 'FESTIVAL' | 'MEETING' | 'URGENT'
  const [customMessage, setCustomMessage] = useState('');
  const [toast, setToast] = useState('');

  const families = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // இலக்கு விசுவாசிகளை வடிகட்டுதல்
  const recipientList = useMemo(() => {
    const list = [];
    families.forEach(fam => {
      if (selectedTarget === 'ALL' || selectedTarget === 'HEADS') {
        if (fam.headMember && fam.headMember.phone) {
          list.push({ name: fam.headMember.name, phone: fam.headMember.phone, family: fam.familyName });
        }
      }
      if (selectedTarget === 'ALL' || selectedTarget === 'YOUTH') {
        (fam.members || []).forEach(m => {
          if (m.phone) {
            list.push({ name: m.name, phone: m.phone, family: fam.familyName });
          }
        });
      }
    });

    // மாதிரி விசுவாசிகள் பட்டியல் (Live data இல்லாத போது)
    if (list.length === 0) {
      return [
        { name: 'Bro. David Paul', phone: '+91 98401 11223', family: 'Paul Household' },
        { name: 'Sis. Mary Stella', phone: '+91 98401 44556', family: 'Stella Household' },
        { name: 'Bro. Joshua Samuel', phone: '+91 98401 77889', family: 'Samuel Household' }
      ];
    }

    return list;
  }, [families, selectedTarget]);

  // டெம்ப்ளேட்கள்
  const handlePresetSelect = (type) => {
    setBroadcastType(type);
    soundFX.playClickPop();
    if (type === 'FESTIVAL') {
      setCustomMessage(
`🕊️ *அன்பான சபை விசுவாசிகளுக்கு வாழ்த்துகள்!* 🕊️\nகிறிஸ்துவுக்குள் பிரியமானவர்களே, வரவிருக்கும் பண்டிகை நாட்களில் கர்த்தருடைய சமாதானமும் ஆசீர்வாதமும் உங்கள் குடும்பத்தோடு இருப்பதாக!\n\n_"கர்த்தர் உங்கள் எல்லைகளையெல்லாம் ஆசீர்வதிப்பாராக."_\n- போதகர் & சபை நிர்வாகம்.`
      );
    } else if (type === 'MEETING') {
      setCustomMessage(
`📢 *விசேஷ ஆராதனை & உபவாசக் கூட்டம் அறிவிப்பு* 📢\nஅன்பான விசுவாசிகளே, வரும் வெள்ளிக்கிழமை மாலை 6:30 மணிக்கு விசேஷ உபவாச ஜெபக் கூட்டம் நடைபெற உள்ளது. அனைவரும் குடும்பமாய் வந்து கலந்துகொண்டு தேவ ஆசீர்வாதத்தைப் பெற்றுக்கொள்ள அன்போடு அழைக்கிறோம்.`
      );
    } else if (type === 'URGENT') {
      setCustomMessage(
`🚨 *அவசர சபை ஜெப அறிவிப்பு* 🚨\nநமது சபை விசுவாசியின் அவசர மருத்துவ தேவைக்காக விசேஷ மத்தியஸ்த ஜெபம் வேண்டப்படுகிறது. அனைவரும் உங்கள் குடும்ப ஜெபங்களில் இவர்களைத் தாங்கும்படி கேட்டுக்கொள்கிறோம்.`
      );
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // தனிநபர் வாட்ஸ்அப் லிங்க் திறத்தல்
  const sendToMember = (phone, name) => {
    soundFX.playClickPop();
    const clean = phone.replace(/[^0-9]/g, '');
    const finalPhone = clean.length === 10 ? `91${clean}` : clean;
    const personalized = customMessage.replace('{பெயர்}', name);
    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(personalized)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-black/30 rounded-2xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('bulk_broadcast')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'bulk_broadcast'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bulk Broadcast Messenger
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('weekly_dispatch')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'weekly_dispatch'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Weekly WhatsApp Dispatch
        </button>
      </div>

      {activeSubTab === 'weekly_dispatch' && <WeeklyBroadcastDispatchDesk />}

      {activeSubTab === 'bulk_broadcast' && (
        <>
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>SMS / WhatsApp Bulk Broadcast Messenger</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Zero API Cost
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            பண்டிகை வாழ்த்துகள், சிறப்புக் கூட்டங்கள் மற்றும் சபை அறிவிப்புகளை நேரடியாக WhatsApp வழியாக அனுப்பும் பலகை.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
            இலக்கு நபர்கள்: <strong>{recipientList.length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: செய்தி தயாரிப்பு & வடிகட்டி */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handlePresetSelect('FESTIVAL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${broadcastType === 'FESTIVAL' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/5 text-slate-300'}`}
            >
              <Sparkles size={13} />
              <span>பண்டிகை வாழ்த்து</span>
            </button>
            <button
              onClick={() => handlePresetSelect('MEETING')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${broadcastType === 'MEETING' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-white/5 text-slate-300'}`}
            >
              <Users size={13} />
              <span>சிறப்புக் கூட்டம்</span>
            </button>
            <button
              onClick={() => handlePresetSelect('URGENT')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${broadcastType === 'URGENT' ? 'bg-rose-500 text-white shadow-md' : 'bg-white/5 text-slate-300'}`}
            >
              <AlertCircle size={13} />
              <span>அவசர அறிவிப்பு</span>
            </button>
          </div>

          {/* Textarea */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>அனுப்ப வேண்டிய செய்தி (WhatsApp Message)</span>
              <span className="text-[10px] text-slate-400 font-mono">Emoji & Bold (*text*) Supported</span>
            </label>
            <textarea
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="செய்தியை இங்கு தட்டச்சு செய்யவும்..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Recipient Filter */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <Filter size={15} className="text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">யாருக்கு அனுப்ப வேண்டும்?</span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">அனைத்து விசுவாசிகளுக்கும் (All Members)</option>
              <option value="HEADS">குடும்பத் தலைவர்களுக்கு மட்டும் (Family Heads)</option>
              <option value="YOUTH">இளைஞர்களுக்கு மட்டும் (Youth Fellowship)</option>
            </select>
          </div>

        </div>

        {/* வலதுபுறம்: விசுவாசிகள் வரிசை & அனுப்புதல் */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h5 className="text-xs font-bold text-white">பெறுநர்கள் பட்டியல் ({recipientList.length})</h5>
              <span className="text-[10px] font-mono text-emerald-400">Ready to Queue</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recipientList.map((rec, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{rec.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono block">{rec.phone}</span>
                  </div>

                  <button
                    onClick={() => sendToMember(rec.phone, rec.name)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
                    title="Send via WhatsApp"
                  >
                    <Send size={11} />
                    <span>அனுப்பு</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-slate-400 space-y-1">
            <span>💡 <strong>குறிப்பு:</strong> ஸ்பேம் பிளாக்கிங் வராமல் இருக்க, ஒவ்வொரு விசுவாசிக்கும் அதிகாரப்பூர்வ வாட்ஸ்அப் விண்டோ தனித்தனியாகத் திறக்கும்.</span>
          </div>
        </div>

      </div>

        </>
      )}

    </div>
  );
}