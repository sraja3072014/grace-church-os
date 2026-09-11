import React, { useState, useMemo } from 'react';
import { 
  Users, UserX, PhoneCall, MessageSquare, 
  Calendar, CheckCircle2, TrendingUp, Filter 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function AttendanceAnalyticsFollowUp() {
  const [selectedArea, setSelectedArea] = useState('ALL');

  // குடும்பங்கள் பட்டியல்
  const families = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // வருகைப் பதிவு லெட்ஜர்
  const attendanceLedger = useMemo(() => {
    try {
      const raw = localStorage.getItem('graceos_attendance_ledger');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // இன்று ஆராதனைக்கு வந்த விசுவாசிகள் (Present IDs)
  const presentMemberIds = useMemo(() => {
    return new Set(attendanceLedger.map((record) => record.memberId));
  }, [attendanceLedger]);

  // வராத விசுவாசிகள் (Absent Members & Families)
  const absentees = useMemo(() => {
    const list = [];

    families.forEach((fam) => {
      if (selectedArea !== 'ALL' && fam.area !== selectedArea) return;

      const isHeadPresent = fam.headMember && presentMemberIds.has(fam.headMember.memberId);
      
      // குடும்பத் தலைவர் வரவில்லை என்றால்
      if (fam.headMember && !isHeadPresent) {
        list.push({
          memberId: fam.headMember.memberId,
          name: fam.headMember.name,
          phone: fam.headMember.phone,
          family: fam.familyName,
          area: fam.area || 'Main City',
          role: 'Head'
        });
      }

      // உறுப்பினர்களில் வராதவர்கள்
      (fam.members || []).forEach((m) => {
        if (!presentMemberIds.has(m.memberId)) {
          list.push({
            memberId: m.memberId,
            name: m.name,
            phone: m.phone || fam.headMember?.phone,
            family: fam.familyName,
            area: fam.area || 'Main City',
            role: m.roleInFamily || 'Member'
          });
        }
      });
    });

    // மாதிரித் தரவு (லைவ் டேட்டா இல்லாத போது)
    if (list.length === 0) {
      return [
        { memberId: 'MBR-1008', name: 'Bro. Samuel Raj', phone: '+91 98401 33445', family: 'Raj Household', area: 'Tambaram', role: 'Head' },
        { memberId: 'MBR-1014', name: 'Sis. Rachel Mary', phone: '+91 98401 77889', family: 'Mary Household', area: 'Anna Nagar', role: 'Member' }
      ];
    }

    return list;
  }, [families, presentMemberIds, selectedArea]);

  // தனிப்பட்ட நலம் விசாரிப்பு செய்தி (Follow-up Message)
  const handleSendCareMessage = (member) => {
    soundFX?.playClickPop?.();
    const cleanPhone = member.phone?.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;

    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = 
`🕊️ *அன்பான சபை நலம் விசாரிப்பு!* 🕊️\nஅன்பான ${member.name},\nஇன்றைய ஞாயிறு ஆராதனையில் தங்களைக் காணாமல் சபை குடும்பம் மிஸ் செய்தது. உங்கள் சுகம் மற்றும் தேவைகளுக்காக ஜெபிக்கிறோம்.\n\nஏதேனும் ஜெபத் தேவைகள் இருந்தால் போதகரைத் தொடர்பு கொள்ளவும்.\n\n_"கர்த்தர் உங்கள் போக்கையும் உங்கள் வரத்தையும் இதுமுதற்கொண்டு என்றென்றைக்கும் காப்பாராக."_ — சங்கீதம் 121:8\n\nஅன்புடன்,\n*போதகர் & சபை நிர்வாகம்*`;

    window.open(`https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-5 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Absentee Follow-up Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Care & Ministry
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            இன்றைய ஆராதனைக்கு வராத விசுவாசிகளைக் கண்டறிந்து நலம் விசாரிக்கும் மேலாண்மை பலகை.
          </p>
        </div>

        {/* Area Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-amber-400" />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">அனைத்துப் பகுதிகள் (All Areas)</option>
            <option value="Tambaram">Tambaram Area</option>
            <option value="Anna Nagar">Anna Nagar Area</option>
            <option value="Velachery">Velachery Area</option>
          </select>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400">இன்றைய ஆராதனை வருகை</span>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{presentMemberIds.size} பேர்</p>
          </div>
          <CheckCircle2 size={32} className="text-emerald-400/40" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400">வருகை தராத விசுவாசிகள்</span>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{absentees.length} பேர்</p>
          </div>
          <UserX size={32} className="text-rose-400/40" />
        </div>
      </div>

      {/* Absentee List Table */}
      <div className="p-5 rounded-3xl win11-card border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <UserX size={15} className="text-rose-400" />
            <span>நலம் விசாரிக்க வேண்டியவர்கள் ({absentees.length})</span>
          </h4>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {absentees.map((member) => (
            <div 
              key={member.memberId} 
              className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition"
            >
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-white truncate">{member.name}</h5>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                    {member.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                  {member.phone || 'No Phone'} • {member.family} ({member.area})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                    title="Direct Phone Call"
                  >
                    <PhoneCall size={13} />
                  </a>
                )}
                
                <button
                  type="button"
                  onClick={() => handleSendCareMessage(member)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="WhatsApp Care Message"
                >
                  <MessageSquare size={13} />
                  <span>Care Wish</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}