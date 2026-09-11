import React, { useState, useMemo } from 'react';
import { 
  Cake, Heart, Send, CheckCircle2, MessageSquareShare, 
  Sparkles, BellRing, PhoneCall 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function CelebrationDispatcherWidget() {
  const [toast, setToast] = useState('');

  const todayMonthDay = useMemo(() => {
    return new Date().toISOString().slice(5, 10); // MM-DD
  }, []);

  // சபை விசுவாசிகள் பட்டியலிலிருந்து இன்றைய விசேஷ நாட்களைக் கண்டறிதல்
  const celebrations = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      const families = raw ? JSON.parse(raw) : [];
      const list = [];

      families.forEach(fam => {
        // 1. குடும்பத் தலைவர் பிறந்தநாள்
        if (fam.headMember?.dob?.endsWith(todayMonthDay)) {
          list.push({
            id: `bday-${fam.headMember.memberId}`,
            type: 'BIRTHDAY',
            name: fam.headMember.name,
            phone: fam.headMember.phone,
            family: fam.familyName,
            area: fam.area
          });
        }
        // 2. குடும்ப உறுப்பினர்கள் பிறந்தநாள்
        (fam.members || []).forEach(m => {
          if (m.dob?.endsWith(todayMonthDay)) {
            list.push({
              id: `bday-${m.memberId}`,
              type: 'BIRTHDAY',
              name: m.name,
              phone: m.phone || fam.headMember?.phone,
              family: fam.familyName,
              area: fam.area
            });
          }
        });
        // 3. திருமண நாள் (Marriage Anniversary)
        if (fam.anniversaryDate?.endsWith(todayMonthDay)) {
          list.push({
            id: `anni-${fam.familyId}`,
            type: 'ANNIVERSARY',
            name: fam.familyName,
            phone: fam.headMember?.phone,
            family: fam.familyName,
            area: fam.area
          });
        }
      });

      // மாதிரித் தரவு (இன்றைய நாளில் யாரும் இல்லாத போது காட்டிச் சோதிக்க)
      if (list.length === 0) {
        return [
          { id: 'bday-sample-1', type: 'BIRTHDAY', name: 'Bro. Emmanuel Raj', phone: '+91 98401 22334', family: 'Raj Household', area: 'Tambaram' },
          { id: 'anni-sample-2', type: 'ANNIVERSARY', name: 'Stephen & Hepzibah', phone: '+91 98401 55667', family: 'Stephen Household', area: 'Anna Nagar' }
        ];
      }

      return list;
    } catch {
      return [];
    }
  }, [todayMonthDay]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // WhatsApp வாழ்த்துச் செய்தி அனுப்புதல்
  const handleSendWish = (item) => {
    soundFX?.playClickPop?.();
    const cleanPhone = item.phone?.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      showToast('மொபைல் எண் பதிவு செய்யப்படவில்லை!');
      return;
    }

    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    let message = '';
    if (item.type === 'BIRTHDAY') {
      message = 
`🎂 *இனிய பிறந்தநாள் வாழ்த்துகள்!* 🕊️\nஅன்பான ${item.name},\nகர்த்தராகிய இயேசு கிறிஸ்துவின் நாமத்தில் உங்களுக்கு எங்களது மனமார்ந்த பிறந்தநாள் வாழ்த்துகளைத் தெரிவித்துக் கொள்கிறோம்!\n\n_"கர்த்தர் உன்னை ஆசீர்வதித்து, உன்னைக் காக்கக்கடவர்; கர்த்தர் தம்முடைய முகத்தை உன்மேல் பிரகாசிக்கப்பண்ணி, உன்மேல் கிருபையாயிருக்கக்கடவர்."_ — எண்ணாகமம் 6:24-25\n\nஅன்புடன்,\n*போதகர் & சபை குடும்பம்*`;
    } else {
      message = 
`💐 *இனிய திருமண நாள் நல்வாழ்த்துகள்!* 💍\nஅன்பான ${item.name},\nஉங்கள் குடும்பத்தை கர்த்தர் மென்மேலும் ஆசீர்வதித்து, சமாதானத்தினாலும் மகிழ்ச்சியினாலும் நிரப்புவாராக!\n\n_"அவர்கள் இருவர் அல்ல, ஒரே மாம்சமாயிருக்கிறார்கள்; ஆகையால், தேவன் இணைத்ததை மனுஷன் பிரிக்காதிருக்கக்கடவன்."_ — மத்தேயு 19:6\n\nஅன்புடன்,\n*போதகர் & சபை குடும்பம்*`;
    }

    window.open(`https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`, '_blank');
    showToast(`${item.name}-க்கு வாழ்த்து விண்டோ திறக்கப்பட்டது! ✓`);
  };

  return (
    <div className="p-5 rounded-3xl win11-card border border-white/10 space-y-4 select-none">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Today's Celebrations
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {celebrations.length}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">இன்றைய பிறந்தநாள் & திருமண நாள் விசுவாசிகள்</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {celebrations.map((item) => (
          <div 
            key={item.id} 
            className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                item.type === 'BIRTHDAY' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {item.type === 'BIRTHDAY' ? <Cake size={16} /> : <Heart size={16} />}
              </div>
              <div className="overflow-hidden">
                <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  {item.type === 'BIRTHDAY' ? 'பிறந்தநாள்' : 'திருமண நாள்'} • {item.area || item.family}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSendWish(item)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
              title="வாட்ஸ்அப் வாழ்த்து அனுப்புக"
            >
              <MessageSquareShare size={13} />
              <span>Wish</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}