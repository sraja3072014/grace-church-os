import React, { useState, useMemo } from 'react';
import { 
  Users, UserX, Phone, MessageSquareShare, AlertCircle, 
  TrendingDown, CheckCircle2, Calendar, Search, Filter 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function AttendanceAnalyticsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConsecutive, setFilterConsecutive] = useState(3); // 3 வாரங்களுக்கு மேல் வராதவர்கள்

  // 1. விசுவாசிகள் பட்டியல்
  const families = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // 2. அனைத்து விசுவாசிகளின் விபரம் மற்றும் வருகை நிலையைத் தொகுத்தல்
  const inactiveBelievers = useMemo(() => {
    const list = [];
    
    // மாதிரி/லைவ் விசுவாசிகள் தரவு
    (families || []).forEach((fam) => {
      if (fam.headMember) {
        list.push({
          id: fam.headMember.memberId || 'MBR-101',
          name: fam.headMember.name,
          phone: fam.headMember.phone || '+91 98401 22334',
          family: fam.familyName || 'Household',
          area: fam.area || 'City Area',
          consecutiveMissed: Math.floor(Math.random() * 4) + 2, // 2 முதல் 5 வாரங்கள்
          lastSeen: '24 Aug 2026',
          status: 'Needs Care Visit'
        });
      }
      (fam.members || []).forEach((m) => {
        list.push({
          id: m.memberId || 'MBR-102',
          name: m.name,
          phone: m.phone || fam.headMember?.phone || '+91 98401 55667',
          family: fam.familyName || 'Household',
          area: fam.area || 'City Area',
          consecutiveMissed: Math.floor(Math.random() * 4) + 2,
          lastSeen: '17 Aug 2026',
          status: 'Calling Pending'
        });
      });
    });

    // குறைந்தபட்ச மாதிரி தரவு (லைவ் டேட்டா இல்லாத போது)
    if (list.length === 0) {
      return [
        { id: 'MBR-0104', name: 'Bro. David Miller', phone: '+91 98765 11002', family: 'Miller Household', area: 'Anna Nagar', consecutiveMissed: 4, lastSeen: '10 Aug 2026', status: 'Calling Pending' },
        { id: 'MBR-0108', name: 'Sis. Sarah Jenkins', phone: '+91 98765 11001', family: 'Jenkins Household', area: 'KK Nagar', consecutiveMissed: 3, lastSeen: '17 Aug 2026', status: 'Home Visit Needed' },
        { id: 'MBR-0112', name: 'Bro. Marcus Thompson', phone: '+91 98765 11003', family: 'Thompson Household', area: 'Velachery', consecutiveMissed: 5, lastSeen: '03 Aug 2026', status: 'Pastoral Follow-up' }
      ];
    }

    return list.filter(b => b.consecutiveMissed >= filterConsecutive);
  }, [families, filterConsecutive]);

  // போதகர் விசாரிப்பு செய்தி WhatsApp வழியாக அனுப்புதல்
  const handleSendPastoralCareMsg = (person) => {
    soundFX.playClickPop();
    const cleanPhone = person.phone.replace(/[^0-9]/g, '');
    const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    const message = encodeURIComponent(
`அன்பிற்குரிய *${person.name}*,
சபையின் சார்பாக வாழ்த்துகள்! 🕊️

கடந்த சில வாரங்களாக ஞாயிறு ஆராதனையில் தங்களைக் காண இயலவில்லை. உங்களுக்காகவும் உங்கள் குடும்பத்தின் நலனுக்காகவும் நாங்கள் தொடர்ந்து ஜெபிக்கிறோம். ஏதேனும் விசேஷித்த ஜெபத் தேவைகள் அல்லது உதவி தேவைப்பட்டால் தயங்காமல் எங்களுக்குத் தெரிவிக்கவும்.

_"கர்த்தர் உன்னைப் பாதுகாத்து, உனக்கு அடைக்கலமாயிருப்பார்."_

அன்புடன்,
போதகர் & சபை நிர்வாகம்.`
    );

    window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
  };

  const filteredList = inactiveBelievers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* 🌟 1. Header Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Pastoral Care & Inactive Believers Alert</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30 font-bold">
              {filteredList.length} விசுவாசிகள் கவனிப்பு தேவை
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            தொடர்ந்து ஆராதனைக்கு வராத குடும்பங்களைக் கண்டறிந்து நலம் விசாரிக்கும் மேலாண்மைத் தளம்.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">வரம்பைத் தேர்ந்தெடுக்க:</span>
            <select
              value={filterConsecutive}
              onChange={(e) => setFilterConsecutive(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="2">2 வாரங்கள் வராதவர்கள்</option>
              <option value="3">3 வாரங்களுக்கு மேல் (Critical)</option>
              <option value="4">4 வாரங்களுக்கு மேல் (Inactive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🌟 2. Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 win11-card rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">2 - 3 வாரங்கள் வராதவர்கள்</span>
            <div className="text-xl font-black text-white font-mono mt-0.5">8 விசுவாசிகள்</div>
          </div>
        </div>

        <div className="p-4 win11-card rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">4+ வாரங்கள் (டிராப்-அவுட் அபாயம்)</span>
            <div className="text-xl font-black text-rose-400 font-mono mt-0.5">3 விசுவாசிகள்</div>
          </div>
        </div>

        <div className="p-4 win11-card rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">விசாரிப்பு முடிந்தது (This Month)</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">14 பேர்</div>
          </div>
        </div>
      </div>

      {/* 🌟 3. Search & Inactive Members Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="விசுவாசி பெயர், குடும்பம் அல்லது பகுதி மூலம் தேடுக..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="p-3.5">விசுவாசி விபரம்</th>
                <th className="p-3.5">குடும்பம் & பகுதி</th>
                <th className="p-3.5 text-center">வராத வாரங்கள்</th>
                <th className="p-3.5">கடைசியாக வந்த நாள்</th>
                <th className="p-3.5">கவனிப்பு நிலை</th>
                <th className="p-3.5 text-right">நடவடிக்கை</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filteredList.map((person) => (
                <tr key={person.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5">
                    <div className="font-bold text-white text-[13px]">{person.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{person.id} • {person.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-200 font-medium">{person.family}</div>
                    <div className="text-[10px] text-slate-400">{person.area}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {person.consecutiveMissed} வாரங்கள்
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">{person.lastSeen}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/25 font-semibold">
                      {person.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`tel:${person.phone}`}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                        title="நேரடி அழைப்பு"
                      >
                        <Phone size={13} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSendPastoralCareMsg(person)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-md active:scale-95 cursor-pointer"
                        title="நலம் விசாரிக்கும் வாட்ஸ்அப் செய்தி அனுப்புக"
                      >
                        <MessageSquareShare size={13} />
                        <span>விசாரிப்பு</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}