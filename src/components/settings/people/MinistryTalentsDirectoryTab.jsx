import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Megaphone,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { getVaultData, setVaultData } from '../../../utils/vaultStore';

const DEFAULT_TALENTS = [
  'Worship Team & Vocals',
  'Sunday School & Kids Ministry',
  'Youth Fellowship',
  "Women's Fellowship",
  "Men's Fellowship",
  'Prayer Team',
  'Instrumentalist (Keyboard / Drums / Guitar)',
  'Media, Sound & Live Broadcast',
  'Volunteer & Hospitality Desk'
];

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getMemberTalents = (member) => {
  const values = member?.ministryTalents || member?.ministry_talents || [];
  return Array.isArray(values) ? values.filter(Boolean) : [];
};

const getMemberPhone = (member) => member?.phone || member?.mobile || member?.contactPhone || '';

function flattenMembers(families) {
  if (!Array.isArray(families)) return [];

  return families.flatMap((family) => {
    const head = family?.headMember ? [{ ...family.headMember, familyName: family.familyName }] : [];
    const members = Array.isArray(family?.members)
      ? family.members.map((member) => ({ ...member, familyName: family.familyName }))
      : [];
    return [...head, ...members];
  });
}

function openWhatsApp(phone, message) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (!digits) return false;
  const formattedPhone = digits.length === 10 ? `91${digits}` : digits;
  window.open(
    `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`,
    '_blank'
  );
  return true;
}

export default function MinistryTalentsDirectoryTab() {
  const [talents, setTalents] = useState(DEFAULT_TALENTS);
  const [families, setFamilies] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState(DEFAULT_TALENTS[0]);
  const [newTalent, setNewTalent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDirectory() {
      const [savedTalents, savedFamilies] = await Promise.all([
        getVaultData('ministry_talents_catalog', DEFAULT_TALENTS),
        getVaultData('members', [])
      ]);

      if (!isMounted) return;
      const configuredTalents = Array.isArray(savedTalents) && savedTalents.length > 0
        ? savedTalents
        : DEFAULT_TALENTS;
      setTalents(configuredTalents);
      setFamilies(Array.isArray(savedFamilies) ? savedFamilies : []);
      setSelectedTalent(configuredTalents[0] || '');
    }

    loadDirectory();
    return () => {
      isMounted = false;
    };
  }, []);

  const members = useMemo(() => flattenMembers(families), [families]);

  const groupedCounts = useMemo(() => talents.reduce((counts, talent) => {
    const talentKey = normalizeText(talent);
    counts[talent] = members.filter((member) => (
      getMemberTalents(member).some((memberTalent) => normalizeText(memberTalent) === talentKey)
    )).length;
    return counts;
  }, {}), [members, talents]);

  const selectedMembers = useMemo(() => {
    const selectedKey = normalizeText(selectedTalent);
    const query = normalizeText(searchQuery);

    return members.filter((member) => {
      const hasTalent = getMemberTalents(member).some(
        (memberTalent) => normalizeText(memberTalent) === selectedKey
      );
      const searchableText = [member.name, member.familyName, getMemberPhone(member), member.email]
        .filter(Boolean)
        .map(normalizeText)
        .join(' ');
      return hasTalent && (!query || searchableText.includes(query));
    });
  }, [members, searchQuery, selectedTalent]);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(''), 2800);
  };

  const saveTalents = async (nextTalents) => {
    const orderedTalents = [...new Set(nextTalents.map((talent) => talent.trim()).filter(Boolean))];
    setTalents(orderedTalents);
    await setVaultData('ministry_talents_catalog', orderedTalents, true);
    if (!orderedTalents.includes(selectedTalent)) setSelectedTalent(orderedTalents[0] || '');
  };

  const handleAddTalent = async (event) => {
    event.preventDefault();
    const talent = newTalent.trim();
    if (!talent || talents.some((item) => normalizeText(item) === normalizeText(talent))) return;
    await saveTalents([...talents, talent]);
    setSelectedTalent(talent);
    setNewTalent('');
    showToast('Ministry talent added to the directory.');
  };

  const handleRemoveTalent = async (talent) => {
    if (!window.confirm(`Remove “${talent}” from the ministry directory? Existing member selections will remain unchanged.`)) return;
    await saveTalents(talents.filter((item) => item !== talent));
    showToast('Ministry talent removed from the directory.');
  };

  const notifyGroup = () => {
    if (selectedMembers.length === 0) {
      showToast('No members are currently assigned to this ministry.');
      return;
    }

    const defaultMessage = `Hello ${selectedTalent} team,\n\nThis is a ministry communication from Grace Church.\n\n${selectedMembers.length} member${selectedMembers.length === 1 ? '' : 's'} are currently assigned to this ministry.\n\nMessage from the church office:`;
    const finalMessage = message.trim() || defaultMessage;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(finalMessage)}`, '_blank');
  };

  const notifyMember = (member) => {
    const finalMessage = message.trim() || `Hello ${member.name || 'there'}, this is a message from Grace Church regarding the ${selectedTalent} ministry.`;
    if (!openWhatsApp(getMemberPhone(member), finalMessage)) {
      showToast('This member does not have a usable phone number.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl relative select-none">
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Ministry &amp; Talents Directory</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Manage ministry categories, see the members assigned to each area, and prepare targeted ministry communications.
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono whitespace-nowrap">
          {members.length} members indexed
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.8fr)] gap-4">
        <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Manage Ministry Areas</h5>
              <p className="text-[10px] text-slate-500 mt-1">These labels are available for member registration.</p>
            </div>
            <span className="text-[10px] text-cyan-300 font-mono">{talents.length} areas</span>
          </div>

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {talents.map((talent) => (
              <div key={talent} className={`flex items-center gap-2 rounded-xl border p-2 transition ${selectedTalent === talent ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/[0.06] bg-black/20'}`}>
                <button type="button" onClick={() => setSelectedTalent(talent)} className="flex-1 text-left text-xs text-slate-200 hover:text-white cursor-pointer">
                  <span className="font-semibold">{talent}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{groupedCounts[talent] || 0} member{groupedCounts[talent] === 1 ? '' : 's'}</span>
                </button>
                <button type="button" onClick={() => handleRemoveTalent(talent)} className="p-1.5 text-slate-500 hover:text-rose-300 cursor-pointer" title={`Remove ${talent}`}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTalent} className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.08]">
            <input value={newTalent} onChange={(event) => setNewTalent(event.target.value)} placeholder="Add a ministry area..." className="min-w-0 flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
            <button type="submit" className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer" title="Add ministry area">
              <Plus size={15} />
            </button>
          </form>
        </section>

        <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h5 className="text-sm font-bold text-white">{selectedTalent || 'Select a ministry area'}</h5>
              <p className="text-[10px] text-slate-500 mt-1">Members who selected this ministry during registration.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search members..." className="w-44 bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-[11px] text-white focus:outline-none focus:border-cyan-400" />
              </label>
              <button type="button" onClick={notifyGroup} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold cursor-pointer" title="Open a group notification composer">
                <Megaphone size={13} /> Notify group
              </button>
            </div>
          </div>

          <div className="mb-4">
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Optional notification message for this ministry..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 resize-y" />
            <p className="text-[10px] text-slate-500 mt-1">Group notifications open WhatsApp’s share composer. Individual actions open a direct member chat.</p>
          </div>

          <div className="border border-white/[0.06] rounded-xl overflow-hidden">
            {selectedMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No members match this ministry and search.</div>
            ) : (
              <div className="divide-y divide-white/[0.06] max-h-[420px] overflow-y-auto">
                {selectedMembers.map((member, index) => (
                  <div key={member.memberId || member.id || `${member.name}-${index}`} className="flex items-center justify-between gap-3 p-3 hover:bg-white/[0.03]">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{member.name || 'Unnamed member'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{member.familyName || 'Individual member'} {getMemberPhone(member) ? `• ${getMemberPhone(member)}` : '• No phone number'}</p>
                    </div>
                    <button type="button" onClick={() => notifyMember(member)} disabled={!getMemberPhone(member)} className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold cursor-pointer">
                      <Send size={12} /> Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-[10px] text-slate-400 flex items-start gap-2">
        <X size={13} className="text-cyan-400 mt-0.5 shrink-0" />
        Removing a category only removes it from the settings catalog. Existing member selections are preserved so historical registration data is not altered.
      </div>
    </div>
  );
}