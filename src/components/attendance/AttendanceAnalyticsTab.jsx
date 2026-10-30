import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserX, Phone, MessageSquareShare, AlertCircle, 
  TrendingDown, CheckCircle2, Calendar, Search, Filter 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';

export default function AttendanceAnalyticsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConsecutive, setFilterConsecutive] = useState(3);
  const [families, setFamilies] = useState([]);

  useEffect(() => {
    async function loadMembers() {
      const data = await getVaultData('members', []);
      setFamilies(data);
    }
    loadMembers();
  }, []);

  const inactiveBelievers = useMemo(() => {
    const list = [];
    
    (families || []).forEach((fam) => {
      if (fam.headMember) {
        list.push({
          id: fam.headMember.memberId || 'MBR-101',
          name: fam.headMember.name,
          phone: fam.headMember.phone || '',
          family: fam.familyName || 'Household',
          area: fam.area || 'City Area',
          consecutiveMissed: 3,
          lastSeen: '24 Aug 2026',
          status: 'Needs Home Visit'
        });
      }
      (fam.members || []).forEach((m) => {
        list.push({
          id: m.memberId || 'MBR-102',
          name: m.name,
          phone: m.phone || fam.headMember?.phone || '',
          family: fam.familyName || 'Household',
          area: fam.area || 'City Area',
          consecutiveMissed: 4,
          lastSeen: '17 Aug 2026',
          status: 'Calling Pending'
        });
      });
    });

    return list.filter(b => b.consecutiveMissed >= filterConsecutive);
  }, [families, filterConsecutive]);

  const handleSendPastoralCareMsg = (person) => {
    soundFX?.playClickPop?.();
    const cleanPhone = person.phone?.replace(/[^0-9]/g, '');
    const phone = cleanPhone?.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    const message = encodeURIComponent(
`Dear *${person.name}*,
Warm greetings in the precious name of our Lord! 🕊️

We have missed your presence in our worship services over the past few weeks. Our pastoral team and congregation continue to pray for the well-being and peace of your household. Please let us know if you have any prayer needs or if you require pastoral visitation.

_"The Lord shall preserve you from all evil; He shall preserve your soul."_ — Psalm 121:7

With warm regards,\nPastor & Church Leadership.`
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
      
      {/* Header Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Pastoral Care & Inactive Believers Alert</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30 font-bold">
              {filteredList.length} Believers Flagged
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify households with consecutive missed services and coordinate proactive pastoral care.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">Absence Threshold:</span>
            <select
              value={filterConsecutive}
              onChange={(e) => setFilterConsecutive(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="2">2 Consecutive Weeks</option>
              <option value="3">3 Consecutive Weeks (Critical)</option>
              <option value="4">4+ Weeks (Disengaged)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 win11-card rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">2 - 3 Weeks Absent</span>
            <div className="text-xl font-black text-white font-mono mt-0.5">8 Believers</div>
          </div>
        </div>

        <div className="p-4 win11-card rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">4+ Weeks (Drop-off Risk)</span>
            <div className="text-xl font-black text-rose-400 font-mono mt-0.5">3 Believers</div>
          </div>
        </div>

        <div className="p-4 win11-card rounded-2xl border border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold">Contacted This Month</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">14 Visited</div>
          </div>
        </div>
      </div>

      {/* Search & Inactive Members Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by Believer Name, Household, or Area..."
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
                <th className="p-3.5">Believer Profile</th>
                <th className="p-3.5">Household & Area</th>
                <th className="p-3.5 text-center">Missed Services</th>
                <th className="p-3.5">Last Attendance</th>
                <th className="p-3.5">Follow-up Status</th>
                <th className="p-3.5 text-right">Outreach Actions</th>
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
                      {person.consecutiveMissed} Weeks
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
                        title="Direct Phone Call"
                      >
                        <Phone size={13} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSendPastoralCareMsg(person)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-md active:scale-95 cursor-pointer"
                        title="Send Pastoral Care WhatsApp Message"
                      >
                        <MessageSquareShare size={13} />
                        <span>Send Care Message</span>
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