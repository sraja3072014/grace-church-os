import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserX, PhoneCall, MessageSquare, 
  Calendar, CheckCircle2, TrendingUp, Filter 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';

export default function AttendanceAnalyticsFollowUp() {
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [families, setFamilies] = useState([]);
  const [attendanceLedger, setAttendanceLedger] = useState([]);
  const todayDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function hydrateFollowUpData() {
      const dbFamilies = await getVaultData('members', []);
      const dbAttendance = await getVaultData('attendance', []);
      setFamilies(dbFamilies);
      setAttendanceLedger(dbAttendance);
    }
    hydrateFollowUpData();
  }, []);

  const presentMemberIds = useMemo(() => {
    return new Set(
      attendanceLedger
        .filter((record) => record.date === todayDate && record.status === 'Present')
        .map((record) => record.memberId)
    );
  }, [attendanceLedger, todayDate]);

  const absentees = useMemo(() => {
    const list = [];

    families.forEach((fam) => {
      if (selectedArea !== 'ALL' && fam.area !== selectedArea) return;

      const isHeadPresent = fam.headMember && presentMemberIds.has(fam.headMember.memberId);
      
      if (fam.headMember && !isHeadPresent) {
        list.push({
          memberId: fam.headMember.memberId,
          name: fam.headMember.name,
          phone: fam.headMember.phone,
          family: fam.familyName,
          area: fam.area || 'Main City',
          role: 'Head of Family'
        });
      }

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

    return list;
  }, [families, presentMemberIds, selectedArea]);

  const handleSendCareMessage = (member) => {
    soundFX?.playClickPop?.();
    const cleanPhone = member.phone?.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;

    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = 
`🕊️ *Warm Pastoral Greetings from Church!* 🕊️\nDear ${member.name},\nWe missed seeing you and your household in today's Lord's Day Worship service. Our pastoral team and church family are upholding you in our prayers.\n\n_"The Lord shall preserve your going out and your coming in from this time forth, and even forevermore."_ — Psalm 121:8\n\nPlease let our pastor know if you have any special prayer requests or pastoral needs.\n\nWith Love,\n*Pastor & Ministry Leadership*`;

    window.open(`https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-5 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Absentee Care & Pastoral Outreach Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Care & Ministry
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify congregation members absent from today's worship and initiate pastoral check-ins.
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
            <option value="ALL">All Locality Areas</option>
            <option value="Tambaram">Tambaram Area</option>
            <option value="Anna Nagar">Anna Nagar Area</option>
            <option value="Velachery">Velachery Area</option>
            <option value="City Center">City Center</option>
          </select>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400">Today's Verified Attendance</span>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{presentMemberIds.size} Present</p>
          </div>
          <CheckCircle2 size={32} className="text-emerald-400/40" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400">Absent Congregation Members</span>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{absentees.length} Souls</p>
          </div>
          <UserX size={32} className="text-rose-400/40" />
        </div>
      </div>

      {/* Absentee List Table */}
      <div className="p-5 rounded-3xl win11-card border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <UserX size={15} className="text-rose-400" />
            <span>Members Requiring Pastoral Contact ({absentees.length})</span>
          </h4>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {absentees.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              All registered congregation members are accounted for today.
            </div>
          ) : (
            absentees.map((member) => (
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
                    {member.phone || 'No Phone on Record'} • {member.family} ({member.area})
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
                    title="Send WhatsApp Care Message"
                  >
                    <MessageSquare size={13} />
                    <span>Care Wish</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}