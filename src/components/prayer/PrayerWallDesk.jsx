import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Globe2,
  HandHeart,
  Heart,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Plus,
  Shield,
  Users,
  X
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { canAccessModule } from '../../utils/accessControl';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

const INDIA_STATES = [
  { id: 'delhi', name: 'Delhi', x: 200, y: 91, focus: 'National leaders: pray for wisdom, justice, humility, and decisions that serve every community.' },
  { id: 'punjab', name: 'Punjab', x: 166, y: 69, focus: 'Border peace: pray for peace, protection of families, and safety for communities near the border.' },
  { id: 'jammu-kashmir', name: 'Jammu & Kashmir', x: 182, y: 44, focus: 'Peace and protection: pray for reconciliation, safety, and hope for every family.' },
  { id: 'west-bengal', name: 'West Bengal', x: 241, y: 137, focus: 'Youth awakening: pray for students, young leaders, and the next generation.' },
  { id: 'maharashtra', name: 'Maharashtra', x: 160, y: 153, focus: 'City and state leadership: pray for integrity, compassionate service, and thriving neighborhoods.' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', x: 199, y: 222, focus: 'Church revival: pray for local churches, pastors, families, and renewed love for their neighbors.' },
  { id: 'assam', name: 'Assam & Northeast', x: 274, y: 115, focus: 'Missionary protection: pray for courage, safety, and support for those serving across the Northeast.' },
  { id: 'karnataka', name: 'Karnataka', x: 174, y: 190, focus: 'Youth awakening: pray for students and young adults to grow in wisdom, compassion, and hope.' }
];

const QUICK_TAGS = ['#NationalRevival', '#StateLeaders', '#BorderPeace', '#YouthAwakening'];
const CATEGORIES = ['HEALING', 'FAMILY', 'JOB', 'SPIRITUAL', 'DELIVERANCE'];
const SLOT_COUNT = 24;
const SLOT_MINUTES = 60;
const CORPORATE_BURDEN = {
  title: 'Humble hearts, renewed land',
  scripture: '2 Chronicles 7:14',
  text: 'Pray for our churches to seek God with humility, serve our neighbors with compassion, and become a source of peace and hope in every community.'
};

const pad = (value) => String(value).padStart(2, '0');
const localDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const slotLabel = (index) => `${pad(index)}:00`;

function normalizePrayer(record = {}) {
  const visibility = String(record.visibility || '').toUpperCase();
  const isConfidential = record.is_confidential === true
    || record.isPrivate === true
    || visibility === 'PASTORAL';
  const isAnonymous = visibility === 'ANONYMOUS' || record.is_anonymous === true;
  const legacyCategory = String(record.category || 'GENERAL').toUpperCase();
  const category = ['HEALING', 'FAMILY', 'JOB', 'SPIRITUAL', 'DELIVERANCE', 'NATION', 'GENERAL'].includes(legacyCategory)
    ? legacyCategory
    : 'GENERAL';
  const status = String(record.status || '').toUpperCase();

  return {
    ...record,
    id: String(record.id || `PR-${Date.now()}`),
    user_id: record.user_id || record.member_id || record.memberId || null,
    author_name: isAnonymous
      ? 'Anonymous Believer'
      : record.author_name || record.requester_name || record.requester || record.name || 'Anonymous Believer',
    category,
    description: record.description || record.request_text || record.request || record.details || '',
    visibility: isConfidential ? 'PASTORAL' : isAnonymous ? 'ANONYMOUS' : 'PUBLIC',
    prayer_count: Math.max(0, Number(record.prayer_count ?? record.prayerCount) || 0),
    is_answered: record.is_answered === true || status === 'ANSWERED',
    created_at: record.created_at || record.createdAt || record.date || new Date().toISOString(),
    updated_at: record.updated_at || record.updatedAt || record.created_at || new Date().toISOString(),
    praise_report: record.praise_report || record.praiseReport || ''
  };
}

function categoryColor(category) {
  return {
    HEALING: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
    FAMILY: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
    JOB: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    SPIRITUAL: 'border-violet-300/20 bg-violet-300/10 text-violet-100',
    DELIVERANCE: 'border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100',
    GENERAL: 'border-slate-300/20 bg-slate-300/10 text-slate-100'
  }[category] || 'border-slate-300/20 bg-slate-300/10 text-slate-100';
}

function IndiaMap({ selectedState, onSelectState }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07111b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.16),transparent_68%)]" />
      <svg viewBox="0 0 400 275" role="img" aria-label="Interactive India prayer map" className="relative z-10 h-[280px] w-full">
        <defs>
          <linearGradient id="india-land-fill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#155e75" />
            <stop offset="100%" stopColor="#102737" />
          </linearGradient>
          <pattern id="india-map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#94a3b8" strokeOpacity=".07" />
          </pattern>
        </defs>
        <rect width="400" height="275" fill="url(#india-map-grid)" />
        <path
          d="M175 15 194 24 213 28 224 42 239 48 247 61 264 65 270 78 287 79 294 91 281 101 288 111 278 123 280 137 264 144 255 157 251 177 239 189 231 209 220 225 214 245 202 263 191 251 186 233 175 220 169 201 158 187 150 172 137 158 124 148 115 131 103 120 102 106 88 95 92 81 109 77 116 64 131 61 139 48 154 46 159 32 171 30Z"
          fill="url(#india-land-fill)"
          stroke="#67e8f9"
          strokeOpacity=".55"
          strokeWidth="2"
        />
        <path d="m109 79 38-9 24 8 32-1 26 10 39-2m-146 25 41-11 38 7 28-5 41 9m-135 16 32-8 39 7 34-4 30 10m-118 8 29-8 30 6 22 20m-67 4 22-13 22 18m-15 17 20-12" fill="none" stroke="#a5f3fc" strokeOpacity=".17" strokeWidth="1.5" />
        {INDIA_STATES.map((state) => {
          const active = selectedState.id === state.id;
          return (
            <g
              key={state.id}
              role="button"
              tabIndex="0"
              aria-label={`Prayer focus: ${state.name}`}
              aria-pressed={active}
              onMouseEnter={() => onSelectState(state)}
              onFocus={() => onSelectState(state)}
              onClick={() => onSelectState(state)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectState(state);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <circle cx={state.x} cy={state.y} r={active ? 14 : 11} fill="#22d3ee" fillOpacity={active ? '.18' : '.09'}>
                <animate attributeName="r" values={active ? '11;17;11' : '8;12;8'} dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx={state.x} cy={state.y} r={active ? 4 : 3} fill={active ? '#fcd34d' : '#67e8f9'} stroke="#ecfeff" strokeWidth="1.2" />
              <text x={state.x + 7} y={state.y - 7} fill="#e2e8f0" fontSize="8.5" className="pointer-events-none">{state.name}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/75 px-2.5 py-1 text-[10px] text-cyan-100 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" /> Select a state prayer point
      </div>
      <div className="absolute right-3 top-3 rounded-lg border border-white/10 bg-slate-950/70 p-1.5 text-cyan-200"><Globe2 size={15} /></div>
    </div>
  );
}

export default function PrayerWallDesk({ session }) {
  const [prayers, setPrayers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedState, setSelectedState] = useState(INDIA_STATES[0]);
  const [showSlotDrawer, setShowSlotDrawer] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filter, setFilter] = useState('ACTIVE');
  const [clock, setClock] = useState(Date.now());
  const [error, setError] = useState('');
  const [prayedIds, setPrayedIds] = useState(() => {
    try {
      const key = session?.user?.id || session?.id || 'guest';
      const saved = JSON.parse(localStorage.getItem(`graceos_prayed_request_ids:${key}`) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [request, setRequest] = useState({
    author_name: session?.name || session?.fullName || session?.user?.name || '',
    category: 'HEALING',
    description: '',
    visibility: 'PUBLIC'
  });

  const userId = session?.user?.id || session?.id || session?.memberId || session?.member_id || null;
  const authorName = session?.name || session?.fullName || session?.user?.name || 'Prayer Warrior';
  const role = session?.role || session?.userRole || session?.user?.role || '';
  const canViewPastoral = Boolean(canAccessModule(role, 'pastoralCare'));
  const dateNow = new Date(clock);
  const today = localDateKey(dateNow);
  const currentMinute = dateNow.getHours() * 60 + dateNow.getMinutes();
  const storageUserKey = userId || 'guest';

  const refreshPrayerData = useCallback(async () => {
    const [savedPrayers, savedSlots] = await Promise.all([
      getVaultData('prayers', []),
      getVaultData('prayer_slots', [])
    ]);
    setPrayers(Array.isArray(savedPrayers) ? savedPrayers.map(normalizePrayer) : []);
    setSlots(Array.isArray(savedSlots) ? savedSlots : []);
  }, []);

  useEffect(() => {
    refreshPrayerData();
    window.addEventListener('graceos_vault_updated', refreshPrayerData);
    window.addEventListener('storage', refreshPrayerData);
    const timer = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => {
      window.removeEventListener('graceos_vault_updated', refreshPrayerData);
      window.removeEventListener('storage', refreshPrayerData);
      window.clearInterval(timer);
    };
  }, [refreshPrayerData]);

  const savePrayers = async (records) => {
    const normalized = records.map(normalizePrayer);
    setPrayers(normalized);
    await setVaultData('prayers', normalized, true);
  };

  const todaySlots = useMemo(() => slots.filter((slot) => (
    slot.date === today && slot.status !== 'CANCELLED'
  )), [slots, today]);
  const activeWarriors = useMemo(() => {
    const active = todaySlots.filter((slot) => (
      Number(slot.start_minute) <= currentMinute
      && Number(slot.start_minute) + Number(slot.duration_minutes || SLOT_MINUTES) > currentMinute
    ));
    return Array.from(new Map(active.map((slot) => [slot.user_id || slot.userId || slot.id, slot])).values());
  }, [todaySlots, currentMinute]);
  const ownSlotAt = (index) => todaySlots.find((slot) => (
    (slot.user_id || slot.userId) === storageUserKey
    && index * SLOT_MINUTES >= Number(slot.start_minute)
    && index * SLOT_MINUTES < Number(slot.start_minute) + Number(slot.duration_minutes || SLOT_MINUTES)
  ));
  const slotTaken = (index) => todaySlots.some((slot) => {
    const from = index * SLOT_MINUTES;
    const to = from + SLOT_MINUTES;
    const slotFrom = Number(slot.start_minute);
    const slotTo = slotFrom + Number(slot.duration_minutes || SLOT_MINUTES);
    return from < slotTo && to > slotFrom && (slot.user_id || slot.userId) !== storageUserKey;
  });
  const visiblePrayers = useMemo(() => prayers.filter((item) => {
    if (item.visibility === 'PASTORAL' && !canViewPastoral) return false;
    if (filter === 'ACTIVE') return !item.is_answered;
    if (filter === 'ANSWERED') return item.is_answered;
    return true;
  }), [prayers, filter, canViewPastoral]);

  const bookSlot = async (index) => {
    const ownSlot = ownSlotAt(index);
    if (!ownSlot && slotTaken(index)) return;
    soundFX?.playClickPop?.();
    const updatedSlots = ownSlot
      ? slots.map((slot) => slot.id === ownSlot.id ? { ...slot, status: 'CANCELLED' } : slot)
      : [...slots, {
        id: `PS-${today.replaceAll('-', '')}-${index}-${storageUserKey}`,
        user_id: storageUserKey,
        author_name: authorName,
        date: today,
        start_minute: index * SLOT_MINUTES,
        duration_minutes: SLOT_MINUTES,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }];
    setSlots(updatedSlots);
    await setVaultData('prayer_slots', updatedSlots, true);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setError('');
    if (!request.description.trim() || (request.visibility === 'PUBLIC' && !request.author_name.trim())) {
      setError('Add your name or choose Anonymous/Pastoral, and enter a prayer request.');
      return;
    }
    const isAnonymous = request.visibility === 'ANONYMOUS';
    const now = new Date().toISOString();
    const item = normalizePrayer({
      id: `PR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      author_name: isAnonymous ? 'Anonymous Believer' : request.author_name.trim(),
      category: request.category,
      description: request.description.trim(),
      visibility: request.visibility,
      prayer_count: 0,
      is_answered: false,
      created_at: now,
      updated_at: now
    });
    soundFX?.playSuccessChime?.();
    await savePrayers([item, ...prayers]);
    setRequest({
      author_name: session?.name || session?.fullName || session?.user?.name || '',
      category: 'HEALING',
      description: '',
      visibility: 'PUBLIC'
    });
    setShowRequestModal(false);
  };

  const markPrayed = async (item) => {
    if (prayedIds.includes(item.id)) return;
    soundFX?.playClickPop?.();
    const updated = prayers.map((prayer) => prayer.id === item.id
      ? { ...prayer, prayer_count: prayer.prayer_count + 1, updated_at: new Date().toISOString() }
      : prayer);
    await savePrayers(updated);
    const ids = [...prayedIds, item.id];
    setPrayedIds(ids);
    localStorage.setItem(`graceos_prayed_request_ids:${storageUserKey}`, JSON.stringify(ids));
  };

  const toggleAnswered = async (item) => {
    await savePrayers(prayers.map((prayer) => prayer.id === item.id
      ? { ...prayer, is_answered: !prayer.is_answered, updated_at: new Date().toISOString() }
      : prayer));
  };

  return (
    <main className="mx-auto max-w-[1600px] pb-10 text-slate-200">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-2 text-amber-100"><HeartHandshake size={20} /></span>
            <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Prayer Wall &amp; Nation Intercession Desk</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />24/7 Church Watch
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">A continuous prayer watch for the church, the nation, and one another.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-cyan-950/10 backdrop-blur-xl sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200">Nation &amp; Church Intercession</p>
              <h2 className="mt-1 text-lg font-bold text-white">24/7 Church Watch</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-1.5 text-[10px] text-emerald-100">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" /></span>
              Live Intercessors: <strong>{activeWarriors.length}</strong>
            </div>
          </div>

          <IndiaMap selectedState={selectedState} onSelectState={setSelectedState} />

          <div className="rounded-2xl border border-cyan-200/10 bg-cyan-300/[0.045] p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 rounded-lg bg-cyan-300/10 p-1.5 text-cyan-100"><MapPin size={14} /></span>
              <div>
                <h3 className="text-xs font-bold text-white">{selectedState.name} Prayer Focus</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{selectedState.focus}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button key={tag} type="button" onClick={() => setSelectedState(INDIA_STATES.find((state) => (
                  tag === '#StateLeaders' ? state.id === 'delhi'
                    : tag === '#BorderPeace' ? state.id === 'punjab'
                      : tag === '#YouthAwakening' ? state.id === 'karnataka'
                        : state.id === 'tamil-nadu'
                )))} className="rounded-full border border-cyan-100/10 bg-slate-950/50 px-2.5 py-1 text-[9px] font-semibold text-cyan-100/80 transition hover:border-cyan-100/30 hover:text-cyan-50">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <article className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-slate-900/80 p-4">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <span className="rounded-xl border border-amber-200/15 bg-amber-200/10 p-2 text-amber-100"><Flame size={17} /></span>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold uppercase tracking-[.16em] text-amber-200">Active Church Corporate Burden · This Week</span>
                <h3 className="mt-1 text-sm font-bold text-white">{CORPORATE_BURDEN.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{CORPORATE_BURDEN.text}</p>
                <p className="mt-2 text-[10px] font-semibold text-amber-100">{CORPORATE_BURDEN.scripture}</p>
                <button type="button" onClick={() => setShowSlotDrawer(true)} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-[10px] font-bold text-slate-950 transition hover:bg-amber-200">
                  <Clock3 size={13} /> Join 1-Hour Chain Prayer <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-violet-950/10 backdrop-blur-xl sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-violet-200">Believer Prayer Wall</p>
              <h2 className="mt-1 text-lg font-bold text-white">Community Prayer Needs</h2>
            </div>
            <button type="button" onClick={() => setShowRequestModal(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-400 px-3 py-2 text-[10px] font-bold text-slate-950 transition hover:bg-violet-300">
              <Plus size={14} /> Submit Prayer Request
            </button>
          </div>

          <div className="flex gap-1 rounded-xl border border-white/10 bg-slate-900/80 p-1">
            {[
              ['ACTIVE', 'In prayer'],
              ['ANSWERED', 'Answered'],
              ['ALL', 'All visible']
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition ${filter === value ? 'bg-violet-300/15 text-violet-100' : 'text-slate-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>

          {visiblePrayers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/50 px-4 py-12 text-center">
              <Heart size={22} className="mx-auto text-slate-600" />
              <p className="mt-2 text-xs text-slate-400">No prayer requests in this view yet.</p>
              <button type="button" onClick={() => setShowRequestModal(true)} className="mt-3 text-[10px] font-bold text-violet-200 hover:text-white">Share a request</button>
            </div>
          ) : (
            <div className="max-h-[940px] space-y-3 overflow-y-auto pr-1">
              {visiblePrayers.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 transition hover:border-white/15">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-bold text-white">{item.author_name}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${categoryColor(item.category)}`}>{item.category}</span>
                        {item.visibility === 'PASTORAL' && <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/15 bg-amber-200/[0.08] px-2 py-0.5 text-[9px] font-bold text-amber-100"><LockKeyhole size={10} /> Pastoral only</span>}
                        {item.is_answered && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/15 bg-emerald-200/10 px-2 py-0.5 text-[9px] font-bold text-emerald-100"><CheckCircle2 size={10} /> Answered Praise Report</span>}
                      </div>
                      <p className="mt-1 text-[9px] text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">{item.description}</p>
                  {item.praise_report && <p className="mt-3 rounded-xl border border-emerald-200/10 bg-emerald-200/[0.05] p-3 text-[10px] italic text-emerald-100">{item.praise_report}</p>}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                    <span className="text-[10px] text-slate-400">{item.prayer_count} {item.prayer_count === 1 ? 'believer' : 'believers'} standing in agreement</span>
                    <div className="flex gap-2">
                      {canViewPastoral && (
                        <button type="button" onClick={() => toggleAnswered(item)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[9px] font-bold text-slate-300 hover:bg-white/5">
                          {item.is_answered ? 'Reopen' : 'Mark answered'}
                        </button>
                      )}
                      <button type="button" disabled={prayedIds.includes(item.id)} onClick={() => markPrayed(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/15 bg-rose-200/[0.08] px-2.5 py-1.5 text-[9px] font-bold text-rose-100 transition hover:bg-rose-200/15 disabled:cursor-default disabled:opacity-50">
                        <HandHeart size={12} />{prayedIds.includes(item.id) ? 'Prayed' : 'I Prayed'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {showSlotDrawer && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/70 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowSlotDrawer(false);
        }}>
          <aside role="dialog" aria-modal="true" aria-labelledby="slot-drawer-title" className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-200">Church prayer chain</p>
                <h2 id="slot-drawer-title" className="mt-1 text-base font-bold text-white">Commit one hour to pray</h2>
                <p className="mt-1 text-[10px] text-slate-400">Choose an available hour. Select your reserved hour again to release it.</p>
              </div>
              <button type="button" onClick={() => setShowSlotDrawer(false)} aria-label="Close prayer slots" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"><X size={16} /></button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200/10 bg-emerald-200/[0.05] p-3 text-[10px] text-emerald-100">
              <Users size={14} /> Live Intercessors: {activeWarriors.length}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: SLOT_COUNT }, (_, index) => {
                const ownSlot = ownSlotAt(index);
                const taken = slotTaken(index);
                const current = currentMinute >= index * SLOT_MINUTES && currentMinute < (index + 1) * SLOT_MINUTES;
                return (
                  <button key={index} type="button" disabled={taken} onClick={() => bookSlot(index)} aria-label={`${slotLabel(index)} ${ownSlot ? 'your slot' : taken ? 'reserved slot' : 'available slot'}`} className={`relative rounded-xl border px-2 py-3 text-[10px] font-mono transition disabled:cursor-not-allowed ${ownSlot ? 'border-violet-200/30 bg-violet-300/15 text-violet-100' : taken ? 'border-white/5 bg-white/[0.02] text-slate-600' : 'border-white/10 bg-slate-900 text-slate-300 hover:border-amber-200/30 hover:text-white'} ${current ? 'ring-1 ring-emerald-300/60' : ''}`}>
                    {slotLabel(index)}
                    {current && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Praying now</h3>
              {activeWarriors.length ? activeWarriors.map((warrior) => <p key={warrior.id} className="text-xs text-white">{warrior.author_name || 'Prayer Warrior'}</p>) : <p className="text-[10px] text-slate-500">No active hour at this time.</p>}
            </div>
          </aside>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowRequestModal(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="request-modal-title" className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 id="request-modal-title" className="text-base font-bold text-white">Submit Prayer Request</h2>
                <p className="mt-1 text-[10px] text-slate-400">Choose who can see your request.</p>
              </div>
              <button type="button" onClick={() => setShowRequestModal(false)} aria-label="Close request form" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={submitRequest} className="mt-4 space-y-3">
              {request.visibility !== 'ANONYMOUS' && (
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full name
                  <input value={request.author_name} onChange={(event) => setRequest({ ...request, author_name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs font-normal text-white outline-none focus:border-violet-200/30" placeholder="Your name" />
                </label>
              )}
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Category
                <select value={request.category} onChange={(event) => setRequest({ ...request, category: event.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs font-normal text-white outline-none">
                  {CATEGORIES.map((category) => <option key={category} value={category}>{category[0] + category.slice(1).toLowerCase()}</option>)}
                </select>
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Details
                <textarea required maxLength={2000} rows={4} value={request.description} onChange={(event) => setRequest({ ...request, description: event.target.value })} className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs font-normal leading-relaxed text-white outline-none focus:border-violet-200/30" placeholder="How can the church pray with you?" />
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  ['PUBLIC', 'Public to Wall', Globe2],
                  ['ANONYMOUS', 'Anonymous', Users],
                  ['PASTORAL', 'Pastoral Team Only', Shield]
                ].map(([value, label, Icon]) => (
                  <button key={value} type="button" onClick={() => setRequest({ ...request, visibility: value })} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[9px] font-bold transition ${request.visibility === value ? 'border-violet-200/30 bg-violet-200/10 text-violet-100' : 'border-white/10 bg-slate-900 text-slate-400 hover:text-white'}`}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>
              {request.visibility === 'PASTORAL' && <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-amber-100/80"><LockKeyhole size={12} className="mt-0.5 shrink-0" /> Only pastoral-care staff can see this request. Avoid sharing highly sensitive details.</p>}
              {error && <p role="alert" className="text-[10px] text-rose-300">{error}</p>}
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-violet-200"><Plus size={14} /> Submit request</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
