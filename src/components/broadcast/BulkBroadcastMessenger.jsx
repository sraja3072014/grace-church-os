import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, MessageSquare, Users, Sparkles, 
  CheckCircle2, AlertCircle, Copy, ExternalLink, Filter 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';
import WeeklyBroadcastDispatchDesk from './WeeklyBroadcastDispatchDesk';

export default function BulkBroadcastMessenger() {
  const [activeSubTab, setActiveSubTab] = useState('bulk_broadcast');
  const [selectedTarget, setSelectedTarget] = useState('ALL'); // 'ALL' | 'HEADS' | 'YOUTH'
  const [broadcastType, setBroadcastType] = useState('FESTIVAL'); // 'FESTIVAL' | 'MEETING' | 'URGENT'
  const [customMessage, setCustomMessage] = useState(
    "🕊️ *Warm Christian Greetings to You and Your Household!* 🕊️\nDear {name},\nMay the peace, joy, and divine favor of our Lord Jesus Christ abide with you and your family during this season.\n\n_\"The Lord bless you out of Zion, and may you see the good of Jerusalem all the days of your life.\"_\n- Senior Pastor & Church Leadership"
  );
  const [toast, setToast] = useState('');
  const [families, setFamilies] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadMembersFromDisk() {
      try {
        const diskData = await getVaultData('members', []);
        if (isMounted) {
          setFamilies(Array.isArray(diskData) ? diskData : []);
        }
      } catch (error) {
        console.error('[BulkBroadcastMessenger] Failed to load members from vault:', error);
      }
    }

    loadMembersFromDisk();

    return () => {
      isMounted = false;
    };
  }, []);

  const recipientList = useMemo(() => {
    const list = [];
    families.forEach((fam) => {
      if (selectedTarget === 'ALL' || selectedTarget === 'HEADS') {
        if (fam.headMember && fam.headMember.phone) {
          list.push({ name: fam.headMember.name, phone: fam.headMember.phone, family: fam.familyName });
        }
      }
      if (selectedTarget === 'ALL' || selectedTarget === 'YOUTH') {
        (fam.members || []).forEach((m) => {
          if (m.phone) {
            list.push({ name: m.name, phone: m.phone, family: fam.familyName });
          }
        });
      }
    });

    return list;
  }, [families, selectedTarget]);

  const handlePresetSelect = (type) => {
    setBroadcastType(type);
    soundFX?.playClickPop?.();
    if (type === 'FESTIVAL') {
      setCustomMessage(
        "🕊️ *Warm Christian Greetings to You and Your Household!* 🕊️\nDear {name},\nMay the peace, joy, and divine favor of our Lord Jesus Christ abide with you and your family during this season.\n\n_\"The Lord bless you out of Zion, and may you see the good of Jerusalem all the days of your life.\"_\n- Senior Pastor & Church Leadership"
      );
    } else if (type === 'MEETING') {
      setCustomMessage(
        "📢 *Special Worship Assembly & Solemn Prayer Notice* 📢\nDear {name},\nYou are warmly invited to join our upcoming Fasting & Miracle Service this Friday at 06:30 PM in the Main Sanctuary. Come expectantly with your family to receive God's breakthrough and blessings.\n\n- Grace Cathedral Ministry Desk"
      );
    } else if (type === 'URGENT') {
      setCustomMessage(
        "🚨 *Urgent Church Intercessory Prayer Request* 🚨\nDear {name},\nWe request your urgent intercessory prayers for a beloved church family undergoing critical medical care. Please uphold them in your personal and family devotions today.\n\n- Pastoral Intercessory Team"
      );
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCopyMessage = () => {
    soundFX?.playClickPop?.();
    navigator.clipboard.writeText(customMessage);
    showToast('Message text copied to clipboard!');
  };

  const sendToMember = (phone, name) => {
    soundFX?.playClickPop?.();
    const clean = phone.replace(/[^0-9]/g, '');
    const finalPhone = clean.length === 10 ? `91${clean}` : clean;
    const personalized = customMessage.replace(/{name}/g, name).replace(/{பெயர்}/g, name);
    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(personalized)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      {/* Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-black/30 rounded-2xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('bulk_broadcast')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'bulk_broadcast'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
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
              ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Weekly WhatsApp Dispatch
        </button>
      </div>

      {activeSubTab === 'weekly_dispatch' && <WeeklyBroadcastDispatchDesk />}

      {activeSubTab === 'bulk_broadcast' && (
        <>
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
                <span>SMS &amp; WhatsApp Bulk Broadcast Messenger</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Zero API Cost
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send festival greetings, meeting notices, and urgent pastoral bulletins directly via WhatsApp Web.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                Target Recipients: <strong>{recipientList.length}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Message Editor & Filter */}
            <div className="lg:col-span-2 space-y-4">
              {/* Preset Selectors */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('FESTIVAL')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    broadcastType === 'FESTIVAL' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Festival Greeting</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('MEETING')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    broadcastType === 'MEETING' ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Users size={13} />
                  <span>Special Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('URGENT')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    broadcastType === 'URGENT' ? 'bg-rose-500 text-white shadow-md font-black' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <AlertCircle size={13} />
                  <span>Urgent Prayer Request</span>
                </button>
              </div>

              {/* Message Composer */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Broadcast Message Body</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">Supports *bold*, emojis, and &#123;name&#125;</span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your broadcast announcement here..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Target Audience Dropdown */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                <Filter size={15} className="text-amber-400" />
                <span className="text-xs text-slate-300 font-medium">Select Audience Target:</span>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Registered Believers</option>
                  <option value="HEADS">Household Heads Only</option>
                  <option value="YOUTH">Youth Fellowship Members</option>
                </select>
              </div>
            </div>

            {/* Right Column: Recipient Queue */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h5 className="text-xs font-bold text-white">Recipient Queue ({recipientList.length})</h5>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Ready to Dispatch</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recipientList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 font-mono">
                      No members match the selected filter.
                    </div>
                  ) : (
                    recipientList.map((rec, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between gap-2">
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-white truncate">{rec.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono block">{rec.phone}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => sendToMember(rec.phone, rec.name)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
                          title="Open WhatsApp Web Window"
                        >
                          <Send size={11} />
                          <span>Send</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-slate-400 space-y-1">
                <span>💡 <strong>Direct Dispatch:</strong> Each button opens an official WhatsApp window to deliver personalized announcements without anti-spam restrictions.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}