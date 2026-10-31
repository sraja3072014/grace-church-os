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

  // Find today's special occasions from the church members database
  const celebrations = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      const families = raw ? JSON.parse(raw) : [];
      const list = [];

      families.forEach(fam => {
        // 1. Family Head Birthday
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
        // 2. Family Members Birthday
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
        // 3. Wedding Anniversary
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

      // Sample fallback data if no events today
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

  // WhatsApp Greeting Dispatch
  const handleSendWish = (item) => {
    soundFX?.playClickPop?.();
    const cleanPhone = item.phone?.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      showToast('Mobile phone number not registered!');
      return;
    }

    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    let message = '';
    if (item.type === 'BIRTHDAY') {
      message = 
`🎂 *Happy Birthday & Blessed Wishes!* 🕊️\nDear ${item.name},\nIn the precious name of our Lord Jesus Christ, we wish you a joyous and blessed birthday!\n\n_"The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you."_ — Numbers 6:24-25\n\nWith love & prayers,\n*Pastor & Church Family*`;
    } else {
      message = 
`💐 *Happy Wedding Anniversary!* 💍\nDear ${item.name},\nMay the Lord continue to bless your marriage and family abundantly with love, joy, and peace!\n\n_"So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate."_ — Matthew 19:6\n\nWith love & prayers,\n*Pastor & Church Family*`;
    }

    window.open(`https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`, '_blank');
    showToast(`WhatsApp greeting opened for ${item.name}! ✓`);
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
            <p className="text-[10px] text-slate-400">Today's birthdays & wedding anniversaries</p>
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
                  {item.type === 'BIRTHDAY' ? 'Birthday' : 'Anniversary'} • {item.area || item.family}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSendWish(item)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
              title="Send WhatsApp Greeting"
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