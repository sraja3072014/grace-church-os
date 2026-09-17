import React, { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, MessageSquare, Send, Users, 
  Sparkles, CheckCircle2, Search, Filter, Copy 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';

export default function WeeklyBroadcastDispatchDesk() {
  const [selectedTemplate, setSelectedTemplate] = useState('SUNDAY_SERVICE');
  const [customNote, setCustomNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [membersList, setMembersList] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const families = await getVaultData('members', []);
        const flatMembers = [];

        families.forEach((fam) => {
          if (fam.headMember?.phone) {
            flatMembers.push({ ...fam.headMember, familyName: fam.familyName });
          }
          (fam.members || []).forEach((member) => {
            if (member.phone) {
              flatMembers.push({ ...member, familyName: fam.familyName });
            }
          });
        });

        if (isMounted) setMembersList(flatMembers);
      } catch (error) {
        console.error('[WeeklyBroadcastDispatchDesk] Failed to load members from vault:', error);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const templates = {
    SUNDAY_SERVICE: {
      title: 'Lord\'s Day Worship Invitation',
      text: (name) => 
`🕊️ *Dear ${name},*

You and your household are warmly invited to worship with us this Lord's Day!

⏰ *Service Times:*
• 08:30 AM — Morning Divine Worship
• 10:30 AM — English & Contemporary Service
📍 *Venue:* Main Cathedral Sanctuary

${customNote ? `📢 *Special Pastoral Notice:* ${customNote}\n\n` : ''}Come expectantly as a family to encounter God's presence and grace!

With Love,
_Grace Central Cathedral Church_`
    },
    FASTING_PRAYER: {
      title: 'Friday Fasting & Deliverance Assembly',
      text: (name) => 
`🔥 *Beloved Intercessor ${name},*

Our congregational Fasting & Miracle Prayer Assembly will convene this Friday from 10:00 AM to 01:30 PM in the Main Sanctuary.

${customNote ? `🎯 *Special Focus:* ${customNote}\n\n` : ''}Let us stand together in the gap for our families, church, and community!

With Prayer,
_Grace Cathedral Prayer Wall_`
    },
    THANKSGIVING_REMINDER: {
      title: 'Love Feast & Thanksgiving Confirmation',
      text: (name) => 
`🍲 *Dear ${name},*

We express our sincere gratitude for your commitment to sponsor this Sunday's fellowship meal and altar thanksgiving. 

May the Lord richly bless and reward your cheerful giving!

With Warm Regards,
_Grace Cathedral Fellowship Committee_`
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCopyPreview = () => {
    soundFX?.playClickPop?.();
    const previewMessage = templates[selectedTemplate].text('Bro. David Paul');
    navigator.clipboard.writeText(previewMessage);
    showToast('Template preview text copied!');
  };

  const handleSendWhatsApp = (member) => {
    soundFX?.playClickPop?.();
    const cleanPhone = member.phone?.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone?.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = templates[selectedTemplate].text(member.name);

    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return membersList.filter((m) => 
      m.name?.toLowerCase().includes(query) ||
      m.familyName?.toLowerCase().includes(query) ||
      m.phone?.includes(searchQuery)
    );
  }, [membersList, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
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
            <span>Weekly Service &amp; Event WhatsApp Dispatch</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Direct WA
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dispatch weekly service invitations, fasting reminders, and thanksgiving confirmations directly to believers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            {membersList.length} Believers Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Selection & Preview */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Megaphone size={15} className="text-emerald-400" />
            <span>Select Announcement Template</span>
          </h4>

          <div className="space-y-2">
            {Object.keys(templates).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTemplate(key)}
                className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition cursor-pointer ${
                  selectedTemplate === key
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md font-black'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {templates[key].title}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
              Additional Custom Note (Appends to Message)
            </label>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Holy Communion will be administered during this service..."
              rows={3}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">
                Live Preview:
              </span>
              <button
                type="button"
                onClick={handleCopyPreview}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
              >
                <Copy size={11} />
                <span>Copy</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {templates[selectedTemplate].text('Bro. David Paul')}
            </p>
          </div>
        </div>

        {/* Right Column: Member Directory & One-Click Dispatch */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member name or household..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-medium"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">{filteredMembers.length} Contacts</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No matching contacts found.
              </div>
            ) : (
              filteredMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3 hover:border-emerald-500/20 transition"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{member.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {member.familyName} • {member.phone}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(member)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95 shrink-0"
                  >
                    <Send size={12} />
                    <span>Send WhatsApp</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}