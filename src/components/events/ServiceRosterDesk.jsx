import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, Users, CheckCircle2, 
  MessageSquare, Plus, Clock, UserCheck, Trash2, Sparkles 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function ServiceRosterDesk({ session }) {
  const [selectedServiceDate, setSelectedServiceDate] = useState(() => new Date().toISOString().slice(0, 10));

  const defaultPresets = [
    'Psalm & Scripture Meditation',
    'Chairs & Sanctuary Layout',
    'Water & Hospitality Refreshments',
    'Audio & Sound Console Engineer',
    'Media & Lyric PPT Projection',
    'Ushering & Congregration Welcome',
    'Holy Communion Elements Preparation',
    'Sunday School Classroom Lead',
    'Parking Protocol & Security',
    'Opening & Invocation Prayer',
    'Offertory & Benediction Prayer'
  ];

  const [customRoles, setCustomRoles] = useState(defaultPresets);
  const [rosterList, setRosterList] = useState([]);

  useEffect(() => {
    async function loadRosterData() {
      const dbRoles = await getVaultData('roster_custom_roles', defaultPresets);
      const dbRosters = await getVaultData('service_duty_roster', [
        {
          id: 'RST-101',
          serviceDate: new Date().toISOString().slice(0, 10),
          serviceType: '1st Morning Divine Service',
          role: 'Psalm & Scripture Meditation',
          assignedPerson: 'Bro. David Paul',
          phone: '+91 98401 11223',
          notes: 'Read Psalm 103 responsively'
        },
        {
          id: 'RST-102',
          serviceDate: new Date().toISOString().slice(0, 10),
          serviceType: '1st Morning Divine Service',
          role: 'Chairs & Sanctuary Layout',
          assignedPerson: 'Bro. Samuel Raj',
          phone: '+91 98401 33445',
          notes: 'Setup completed by 07:15 AM'
        }
      ]);
      setCustomRoles(dbRoles);
      setRosterList(dbRosters);
    }
    loadRosterData();
  }, []);

  const [form, setForm] = useState({
    serviceType: '1st Morning Divine Service',
    role: '',
    assignedPerson: '',
    phone: '',
    notes: ''
  });

  const saveRoster = async (updated) => {
    setRosterList(updated);
    await setVaultData('service_duty_roster', updated, true);
    localStorage.setItem('graceos_service_duty_roster_db', JSON.stringify(updated));
  };

  const handleAddDuty = async (e) => {
    e.preventDefault();
    if (!form.role.trim() || !form.assignedPerson.trim()) return;
    soundFX?.playSuccessChime?.();

    const trimmedRole = form.role.trim();

    if (!customRoles.includes(trimmedRole)) {
      const updatedRoles = [...customRoles, trimmedRole];
      setCustomRoles(updatedRoles);
      await setVaultData('roster_custom_roles', updatedRoles, true);
      localStorage.setItem('graceos_roster_custom_roles', JSON.stringify(updatedRoles));
    }

    const newDuty = {
      id: `RST-${Date.now().toString().slice(-3)}`,
      serviceDate: selectedServiceDate,
      ...form,
      role: trimmedRole
    };

    const updated = [newDuty, ...rosterList];
    await saveRoster(updated);
    setForm({ serviceType: form.serviceType, role: '', assignedPerson: '', phone: '', notes: '' });
  };

  const handleDeleteDuty = async (id) => {
    if (!window.confirm('Delete this duty assignment?')) return;
    soundFX?.playClickPop?.();
    const updated = rosterList.filter((item) => item.id !== id);
    await saveRoster(updated);
  };

  const handleNotifyWhatsApp = (duty) => {
    soundFX?.playClickPop?.();
    const cleanPhone = duty.phone?.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone?.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const msg = 
`🕊️ *Sunday Worship Volunteer Duty Assignment* 🕊️

Dear ${duty.assignedPerson},
Grace and peace in our Lord Jesus Christ. You are scheduled for ministerial service this Lord's Day (${duty.serviceDate}):

⏰ *Service:* ${duty.serviceType}
🎯 *Assigned Responsibility:* ${duty.role}
${duty.notes ? `📝 *Special Instruction:* ${duty.notes}\n` : ''}
Please arrive 20 minutes before service begins to join the team prayer.

With warm regards,
*Grace Cathedral Worship Committee*`;

    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const currentServiceRoster = useMemo(() => {
    return rosterList.filter((item) => item.serviceDate === selectedServiceDate);
  }, [rosterList, selectedServiceDate]);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sunday Service Volunteer &amp; Duty Roster</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Custom Dynamic
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Assign liturgical helpers, sanctuary ushers, AV technicians, and protocol volunteers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedServiceDate}
            onChange={(e) => setSelectedServiceDate(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Assign Duty */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Plus size={15} className="text-emerald-400" />
            <span>Assign Volunteer Duty</span>
          </h4>

          <form onSubmit={handleAddDuty} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Worship Service *
              </label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="1st Morning Divine Service">1st Morning Divine Service</option>
                <option value="2nd English & Youth Service">2nd English &amp; Youth Service</option>
                <option value="Sunday School Kids Service">Sunday School Kids Service</option>
                <option value="Evening Revival Service">Evening Revival Service</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-400 block uppercase font-mono">
                  Assigned Duty / Role *
                </label>
                <span className="text-[9px] text-amber-400 font-mono">Custom Input Allowed ✓</span>
              </div>

              <input
                type="text"
                list="church-roles-list"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Scripture Reading / Communion Elements"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-emerald-400"
                required
              />

              <datalist id="church-roles-list">
                {customRoles.map((r, i) => (
                  <option key={i} value={r} />
                ))}
              </datalist>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1 mt-2">
                {defaultPresets.slice(0, 4).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, role: preset })}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition cursor-pointer"
                  >
                    + {preset.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Assigned Volunteer Name *
              </label>
              <input
                type="text"
                value={form.assignedPerson}
                onChange={(e) => setForm({ ...form, assignedPerson: e.target.value })}
                placeholder="e.g. Bro. David Paul"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98400 00000"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Duty Instructions / Remarks
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Be at the altar by 07:15 AM"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Add Duty to Roster
            </button>
          </form>
        </div>

        {/* Right Stream: Service Duty Roster */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
            <span className="font-bold text-white uppercase">
              {selectedServiceDate} Service Roster ({currentServiceRoster.length})
            </span>
            <span className="text-emerald-400 font-bold">✓ Ready for Service</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {currentServiceRoster.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No duties assigned yet for this date.
              </div>
            ) : (
              currentServiceRoster.map((duty) => (
                <div
                  key={duty.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2.5 hover:border-emerald-500/20 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold">
                        {duty.serviceType}
                      </span>
                      <h5 className="text-sm font-black text-white mt-0.5 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-400" />
                        <span>{duty.role}</span>
                      </h5>
                      <span className="text-xs text-slate-300 font-semibold block mt-1">
                        Assigned Volunteer:{' '}
                        <strong className="text-amber-300">{duty.assignedPerson}</strong>{' '}
                        ({duty.phone || 'No phone'})
                      </span>
                      {duty.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1">
                          Note: {duty.notes}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDuty(duty.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      ✓ Confirmed Duty
                    </span>

                    <button
                      type="button"
                      onClick={() => handleNotifyWhatsApp(duty)}
                      className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      <span>Send WhatsApp Notice</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}