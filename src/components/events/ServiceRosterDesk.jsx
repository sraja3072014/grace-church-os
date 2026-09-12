import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, Users, CheckCircle2, 
  MessageSquare, Plus, Clock, UserCheck, Trash2, Sparkles 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function ServiceRosterDesk({ session }) {
  const [selectedServiceDate, setSelectedServiceDate] = useState(() => new Date().toISOString().slice(0, 10));

  // அடிக்கடி பயன்படும் பொதுவான பொறுப்புகள் (Quick Preset Chips)
  const defaultPresets = [
    'சங்கீத தியானம் (Psalm Meditation)',
    'சேர் அரேஞ்ச்மென்ட் (Chairs Layout)',
    'குடிநீர் & உணவு ஏற்பாடு (Water & Refreshments)',
    'Audio & Sound Console',
    'Media & Lyric PPT',
    'வரவேற்பு (Ushering & Welcome)',
    'திருவிருந்து பாத்திர ஆயத்தம் (Communion)',
    'சண்டே ஸ்கூல் ஆசிரியர் (Sunday School)',
    'வாகன ஒழுங்குமுறை (Parking & Security)',
    'ஆராதனை ஆரம்ப ஜெபம் (Opening Prayer)',
    'நன்றி & முடிவு ஜெபம் (Closing Prayer)'
  ];

  // லோக்கல் ஸ்டோரேஜில் இருந்து கஸ்டம் பொறுப்புகளை எடுத்தல்
  const [customRoles, setCustomRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('graceos_roster_custom_roles');
      return saved ? JSON.parse(saved) : defaultPresets;
    } catch {
      return defaultPresets;
    }
  });

  // ரோஸ்டர் தரவுத்தளம்
  const [rosterList, setRosterList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_service_duty_roster_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'RST-101',
          serviceDate: new Date().toISOString().slice(0, 10),
          serviceType: '1st Morning Service (Tamil)',
          role: 'சங்கீத தியானம் (Psalm Meditation)',
          assignedPerson: 'Bro. David Paul',
          phone: '+91 98401 11223',
          notes: 'சங்கீதம் 103 வாசிக்க வேண்டும்'
        },
        {
          id: 'RST-102',
          serviceDate: new Date().toISOString().slice(0, 10),
          serviceType: '1st Morning Service (Tamil)',
          role: 'சேர் & குடிநீர் ஏற்பாடு (Chairs & Water)',
          assignedPerson: 'Bro. Samuel Raj',
          phone: '+91 98401 33445',
          notes: 'காலை 07:30 மணிக்கே ஆயத்தம் செய்ய வேண்டும்'
        }
      ];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    serviceType: '1st Morning Service (Tamil)',
    role: '',
    assignedPerson: '',
    phone: '',
    notes: ''
  });

  const saveRoster = (updated) => {
    setRosterList(updated);
    localStorage.setItem('graceos_service_duty_roster_db', JSON.stringify(updated));
  };

  const handleAddDuty = (e) => {
    e.preventDefault();
    if (!form.role.trim() || !form.assignedPerson.trim()) return;
    soundFX?.playSuccessChime?.();

    const trimmedRole = form.role.trim();

    // புதிய பொறுப்பாக இருந்தால் அதை எதிர்கால பரிந்துரை பட்டியலிலும் சேமித்தல்
    if (!customRoles.includes(trimmedRole)) {
      const updatedRoles = [...customRoles, trimmedRole];
      setCustomRoles(updatedRoles);
      localStorage.setItem('graceos_roster_custom_roles', JSON.stringify(updatedRoles));
    }

    const newDuty = {
      id: `RST-${Date.now().toString().slice(-3)}`,
      serviceDate: selectedServiceDate,
      ...form,
      role: trimmedRole
    };

    saveRoster([newDuty, ...rosterList]);
    setForm({ serviceType: form.serviceType, role: '', assignedPerson: '', phone: '', notes: '' });
  };

  const handleDeleteDuty = (id) => {
    soundFX?.playClickPop?.();
    const updated = rosterList.filter(item => item.id !== id);
    saveRoster(updated);
  };

  // WhatsApp-ல் பணி நினைவூட்டல் அனுப்புதல்
  const handleNotifyWhatsApp = (duty) => {
    soundFX?.playClickPop?.();
    const cleanPhone = duty.phone?.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone?.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const msg = 
`🕊️ *ஞாயிறு ஆராதனை ஊழியப் பொறுப்பு நினைவூட்டல்!*

அன்பான ${duty.assignedPerson},
வரவிருக்கும் ஞாயிறு (${duty.serviceDate}) அன்று நடைபெறும் ஆராதனையில் தாங்கள் கீழ்க்கண்ட ஊழியப் பொறுப்பில் சேவை செய்ய நியமிக்கப்பட்டுள்ளீர்கள்:

⏰ *ஆராதனை:* ${duty.serviceType}
🎯 *பணி/பொறுப்பு:* ${duty.role}
${duty.notes ? `📝 *சிறப்புக் குறிப்பு:* ${duty.notes}\n` : ''}
ஆராதனை தொடங்குவதற்கு 20 நிமிடங்களுக்கு முன்பாகவே வளாகத்திற்கு வந்து ஜெபத்தோடு ஆயத்தமாகும்படி அன்புடன் கேட்டுக்கொள்கிறோம்.

தேவ சமாதானம் உங்களோடு இருப்பதாக!
*Grace Cathedral Worship Committee*`;

    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const currentServiceRoster = useMemo(() => {
    return rosterList.filter(item => item.serviceDate === selectedServiceDate);
  }, [rosterList, selectedServiceDate]);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sunday Service Volunteer & Duty Roster</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Custom Dynamic
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            சங்கீத தியானம், சேர் ஏற்பாடுகள், வரவேற்பு மற்றும் சிறப்புப் பொறுப்புகளுக்கான அட்டவணை.
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
        
        {/* இடதுபுறம்: புதிய பணி சேர்க்கும் படிவம் */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Plus size={15} className="text-emerald-400" />
            <span>பொறுப்பை ஒதுக்குதல் (Assign Task)</span>
          </h4>

          <form onSubmit={handleAddDuty} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஆராதனைப் பிரிவு</label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="1st Morning Service (Tamil)">1st Morning Service (Tamil)</option>
                <option value="2nd English & Youth Service">2nd English & Youth Service</option>
                <option value="Sunday School">Sunday School / Kids Church</option>
                <option value="Evening Fasting Prayer">Evening Prayer Service</option>
              </select>
            </div>

            {/* 🌟 மேனுவல் டைப்பிங் + Datalist ஆட்டோ-கம்ப்ளீட் */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-400 block uppercase font-mono">
                  பொறுப்பு / பணி (Manual Entry)
                </label>
                <span className="text-[9px] text-amber-400 font-mono">Custom Allowed ✓</span>
              </div>

              <input
                type="text"
                list="church-roles-list"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="எ.கா: சங்கீத தியானம் / சேர் அரேஞ்ச்மென்ட்..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-emerald-400"
                required
              />

              <datalist id="church-roles-list">
                {customRoles.map((r, i) => (
                  <option key={i} value={r} />
                ))}
              </datalist>

              {/* Quick Select Preset Chips */}
              <div className="flex flex-wrap gap-1 mt-2">
                {defaultPresets.slice(0, 4).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, role: preset })}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition"
                  >
                    + {preset.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பொறுப்பாளர் பெயர்</label>
              <input
                type="text"
                value={form.assignedPerson}
                onChange={(e) => setForm({ ...form, assignedPerson: e.target.value })}
                placeholder="Bro. / Sis..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">தொலைபேசி எண் (WhatsApp)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98400 00000"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">சிறப்புக் குறிப்புகள் (விருப்பப்பட்டால்)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="எ.கா: காலை 8:00 மணிக்கு வரவும்..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              பணிப் பட்டியலில் சேர்
            </button>
          </form>
        </div>

        {/* வலதுபுறம்: அன்றைய தின ரோஸ்டர் பட்டியல் */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
            <span className="font-bold text-white uppercase">
              {selectedServiceDate} ரோஸ்டர் பட்டியல் ({currentServiceRoster.length})
            </span>
            <span className="text-emerald-400 font-bold">✓ Ready for Service</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {currentServiceRoster.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                இந்த தேதியில் பணிகள் எதுவும் இன்னும் திட்டமிடப்படவில்லை.
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
                        பொறுப்பாளர்: <strong className="text-amber-300">{duty.assignedPerson}</strong> ({duty.phone || 'No phone'})
                      </span>
                      {duty.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1">
                          குறிப்பு: {duty.notes}
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