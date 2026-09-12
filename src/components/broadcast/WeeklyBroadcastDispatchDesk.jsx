import React, { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, MessageSquare, Send, Users, 
  Sparkles, CheckCircle2, Search, Filter 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';

export default function WeeklyBroadcastDispatchDesk() {
  const [selectedTemplate, setSelectedTemplate] = useState('SUNDAY_SERVICE');
  const [customNote, setCustomNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. விசுவாசிகள் பட்டியல் — லோக்கல் டிஸ்க் வால்ட்டிலிருந்து ஏற்றுதல்
  const [membersList, setMembersList] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const families = await getVaultData('members', []);
        const flatMembers = [];

        families.forEach(fam => {
          if (fam.headMember?.phone) {
            flatMembers.push({ ...fam.headMember, familyName: fam.familyName });
          }
          (fam.members || []).forEach(member => {
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

  // 2. முன்வடிவமைக்கப்பட்ட செய்திகள் (Templates)
  const templates = {
    SUNDAY_SERVICE: {
      title: 'ஞாயிறு ஆராதனை அழைப்பு (Sunday Worship)',
      text: (name) => 
`🕊️ *அன்பான ${name},*

நாளை நடைபெறும் கர்த்தருடைய பரிசுத்த ஓய்வுநாள் ஆராதனைக்கு உங்களையும் உங்கள் குடும்பத்தாரையும் அன்புடன் அழைக்கிறோம்!

⏰ *ஆராதனை நேரம்:*
• காலை 08:30 AM (தமிழ் ஆராதனை)
• காலை 10:30 AM (ஆங்கிலம் & இளைஞர் ஆராதனை)
📍 *இடம்:* பிரதான ஆலயம் (Main Cathedral)

${customNote ? `📢 *விசேஷ அறிவிப்பு:* ${customNote}\n\n` : ''}குடும்பமாக வந்து தேவ பிரசன்னத்தைப் பெற்றுக்கொள்ளுங்கள்!
_Grace Cathedral Church_`
    },
    FASTING_PRAYER: {
      title: 'உபவாச ஜெபக் கூடுகை (Fasting Prayer)',
      text: (name) => 
`🔥 *ஜெப வீரன் ${name} அவர்களுக்கு,*

நமது சபையின் சிறப்பு உபவாச ஜெபக் கூடுகை வரவிருக்கும் வெள்ளிக்கிழமை காலை 10:00 மணி முதல் மதியம் 01:30 மணி வரை ஆலயத்தில் நடைபெறும்.

${customNote ? `🎯 *ஜெபக் குறிப்பு:* ${customNote}\n\n` : ''}தேசத்திற்காகவும், சபை குடும்பங்களுக்காகவும் திறப்பில் நிற்க வாருங்கள்!
_Grace Cathedral Prayer Wall_`
    },
    THANKSGIVING_REMINDER: {
      title: 'அன்பு விருந்து & ஸ்தோத்திர நினைவூட்டல்',
      text: (name) => 
`🍲 *அன்பான ${name},*

வரவிருக்கும் ஞாயிறு ஆராதனையில் தாங்கள் பொறுப்பேற்றுள்ள அன்பு விருந்து மற்றும் ஸ்தோத்திரப் பங்களிப்பிற்காக சபையின் சார்பாக நன்றி செலுத்துகிறோம். 

தேவன் உங்கள் குடும்பத்தை ஆசீர்வதிப்பாராக!
_Grace Cathedral Fellowship Committee_`
    }
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
    return membersList.filter(m => 
      m.name?.toLowerCase().includes(query) ||
      m.familyName?.toLowerCase().includes(query) ||
      m.phone?.includes(searchQuery)
    );
  }, [membersList, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Weekly Service & Event WhatsApp Dispatch</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Direct WA
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ஞாயிறு ஆராதனை, உபவாசக் கூடுகை மற்றும் விசேஷ நிகழ்வு நினைவூட்டல்களை விசுவாசிகளின் வாட்ஸ்அப்பிற்கு அனுப்பும் தளம்.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            {membersList.length} விசுவாசிகள் தயார்
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: செய்தி டெம்ப்ளேட் & பிரிவியூ */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Megaphone size={15} className="text-emerald-400" />
            <span>செய்தி டெம்ப்ளேட் தேர்வு</span>
          </h4>

          <div className="space-y-2">
            {Object.keys(templates).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTemplate(key)}
                className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition cursor-pointer ${
                  selectedTemplate === key
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {templates[key].title}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
              கூடுதல் சிறப்புக் குறிப்பு (Optional Note)
            </label>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="எ.கா: திருவிருந்து ஆராதனை நடைபெறும்..."
              rows={3}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1.5">
            <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">
              செய்தி மாதிரி முன்னோட்டம் (Preview):
            </span>
            <p className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {templates[selectedTemplate].text('Bro. David')}
            </p>
          </div>
        </div>

        {/* வலதுபுறம்: விசுவாசிகள் பட்டியல் & ஒரு-கிளிக் அனுப்புதல் */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="பெயர் அல்லது குடும்பம் தேடுக..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <span className="text-xs font-mono text-slate-400">{filteredMembers.length} தொடர்புகள்</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredMembers.map((member, idx) => (
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
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}