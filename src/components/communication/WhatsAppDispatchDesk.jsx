import React, { useState, useMemo } from 'react';
import { 
  Send, MessageSquare, Phone, CheckCircle2, 
  Users, DollarSign, Calendar, Sparkles, Search 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function WhatsAppDispatchDesk() {
  const [targetType, setTargetType] = useState('ALL_MEMBERS'); // 'ALL_MEMBERS' | 'OFFERING_RECEIPT' | 'EVENT_ALERT'
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // விசுவாசிகள் பட்டியல்
  const members = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      const families = raw ? JSON.parse(raw) : [];
      const list = [];
      families.forEach(f => {
        if (f.headMember) {
          list.push({ ...f.headMember, familyName: f.familyName, area: f.area });
        }
        (f.members || []).forEach(m => {
          list.push({ ...m, familyName: f.familyName, area: f.area });
        });
      });
      return list.length > 0 ? list : [
        { memberId: 'MBR-1001', name: 'Bro. David Paul', phone: '9840111223', area: 'Anna Nagar' },
        { memberId: 'MBR-1002', name: 'Sis. Sarah Jenkins', phone: '9840155667', area: 'Tambaram' }
      ];
    } catch {
      return [];
    }
  }, []);

  // வடிகட்டப்பட்ட பட்டியல்
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(m => 
      m.name?.toLowerCase().includes(q) || 
      m.phone?.includes(q) ||
      m.area?.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // மெசேஜ் டெம்ப்ளேட் உருவாக்கும் முறை
  const generateMessage = (member) => {
    if (targetType === 'OFFERING_RECEIPT') {
      return (
`🕊️ *கர்த்தருக்குள் அன்பான ${member.name} அவர்களுக்கு,*

தங்களுடைய தாராளமான தசமபாகம் / காணிக்கை சபையின் கணக்கில் வரவு வைக்கப்பட்டது. கர்த்தர் உங்களை ஆசீர்வதிப்பாராக!

🧾 *ரசீது எண்:* REC-${Date.now().toString().slice(-6)}
📅 *தேதி:* ${new Date().toLocaleDateString('en-IN')}
⛪ *சபை:* Grace Cathedral Church

_"உற்சாகமாய்க் கொடுக்கிறவனிடத்தில் தேவன் பிரியமாயிருக்கிறார்."_ — 2 கொரிந்தியர் 9:7

${customNote ? `\n*சிறப்பு குறிப்பு:* ${customNote}` : ''}
அன்புடன்,
*போதகர் & நிர்வாகக் குழு*`
      );
    }

    if (targetType === 'EVENT_ALERT') {
      return (
`🔔 *சபை முக்கிய அறிவிப்பு!*

அன்பான ${member.name},
வரவிருக்கும் ஞாயிறு ஆராதனை மற்றும் சிறப்பு கூட்டத்தில் குடும்பமாகப் பங்குபெற்று தேவ ஆசீர்வாதத்தைப் பெற்றுக்கொள்ள அன்போடு அழைக்கிறோம்.

📍 *இடம்:* Main Sanctuary Hall
⏰ *நேரம்:* காலை 08:30 AM

${customNote ? `\n*விவரம்:* ${customNote}` : ''}
*Grace Cathedral Church*`
      );
    }

    // GENERAL_ANNOUNCEMENT
    return (
`🕊️ *சபையின் அன்பான வாழ்த்துகள்!*

அன்பான ${member.name},
கர்த்தர் உங்கள் போக்கையும் உங்கள் வரத்தையும் இதுமுதற்கொண்டு என்றென்றைக்கும் காப்பாராக (சங்கீதம் 121:8).

${customNote ? `\n*செய்தி:* ${customNote}` : ''}
ஜெபங்களுடன்,
*Grace Cathedral Church*`
    );
  };

  const handleSendWhatsApp = (member) => {
    soundFX?.playClickPop?.();
    const cleanPhone = member.phone?.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert('தொலைபேசி எண் இல்லை!');
      return;
    }
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = generateMessage(member);
    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Direct WhatsApp Notification Hub</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              API-Free Direct
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            காணிக்கை ரசீதுகள், சிறப்பு நிகழ்வுகள் மற்றும் ஜெபக் குறிப்புகளை விசுவாசிகளுக்கு நேரடியாக அனுப்பும் மையம்.
          </p>
        </div>

        {/* Dispatch Category Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setTargetType('ALL_MEMBERS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              targetType === 'ALL_MEMBERS' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            பொது செய்தி
          </button>
          <button
            type="button"
            onClick={() => setTargetType('OFFERING_RECEIPT')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              targetType === 'OFFERING_RECEIPT' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            காணிக்கை ரசீது
          </button>
          <button
            type="button"
            onClick={() => setTargetType('EVENT_ALERT')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              targetType === 'EVENT_ALERT' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            கூட்ட அறிவிப்பு
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: செய்தி தனிப்பயனாக்கம் (Message Customizer) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <MessageSquare size={15} className="text-emerald-400" />
            <span>செய்திக் குறிப்பு சேர்த்தல்</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                கூடுதல் செய்தி / வசனம் (Optional Note)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="எ.கா: சிறப்பு உபவாசக் கூட்டம் மாலை 6:30 மணிக்கு நடைபெறும்..."
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 resize-none leading-relaxed"
              />
            </div>

            {/* நேரடி மாதிரி முன்னோட்டம் (Live Preview Card) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase tracking-wider">
                WhatsApp Preview Output:
              </span>
              <p className="text-[11px] text-slate-300 font-sans whitespace-pre-line leading-relaxed italic bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/10">
                {generateMessage({ name: 'விசுவாசி பெயர்' })}
              </p>
            </div>
          </div>
        </div>

        {/* வலதுபுறம்: விசுவாசிகள் பட்டியல் & அனுப்பும் பலகை */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="பெயர் அல்லது போன் எண் மூலம் தேடுக..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">
              மொத்தம்: <strong className="text-white">{filteredMembers.length}</strong>
            </span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredMembers.map((member) => (
              <div
                key={member.memberId || member.phone}
                className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3 hover:border-emerald-500/20 transition"
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-white truncate">{member.name}</h5>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {member.memberId}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                    {member.phone} • {member.area || member.familyName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(member)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95 shrink-0"
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}