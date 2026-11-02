import { getVaultData, setVaultData } from './vaultStore';
import { getSupabase } from './supabaseClient';

const nextId = (records, prefix) => {
  const max = (Array.isArray(records) ? records : []).reduce((highest, record) => {
    const values = [record?.id, record?.memberId, record?.member_id, record?.familyId, record?.family_id];
    return Math.max(highest, ...values.map((value) => {
      const match = String(value || '').match(new RegExp(`^${prefix}(\\d+)$`));
      return match ? Number(match[1]) : 0;
    }));
  }, 0);
  return `${prefix}${String(Math.max(max + 1, 1)).padStart(4, '0')}`;
};

const genderValue = (value) => String(value || '').trim().toLowerCase() === 'female' || String(value || '').trim().toLowerCase() === 'f' ? 'Female' : 'Male';
const numberOrNull = (value) => Number.isFinite(Number(value)) ? Number(value) : null;

export const convertVisitorToMemberPayload = (visitor, memberId, familyId) => ({
  id: memberId,
  member_id: memberId,
  family_id: familyId,
  household_role: 'HEAD',
  name: String(visitor.name || visitor.full_name || 'New Member').trim(),
  gender: genderValue(visitor.gender),
  phone: String(visitor.phone || '').trim(),
  email: String(visitor.email || '').trim(),
  area: String(visitor.area || '').trim(),
  address: String(visitor.address || '').trim(),
  campus: String(visitor.campus || 'Main').trim(),
  gps_coordinates: visitor.gps_coordinates || null,
  latitude: numberOrNull(visitor.latitude),
  longitude: numberOrNull(visitor.longitude),
  maps_url: String(visitor.maps_url || '').trim(),
  raw_payload: visitor,
  updated_at: new Date().toISOString(),
});

const familyRecord = (visitor, memberId, familyId, timestamp) => ({
  id: familyId,
  familyId,
  familyName: `${visitor.name || 'New Member'} Household`,
  area: visitor.area || '', address: visitor.address || '', campus: visitor.campus || 'Main',
  gps_coordinates: visitor.gps_coordinates || '', latitude: visitor.latitude || '', longitude: visitor.longitude || '', maps_url: visitor.maps_url || '',
  createdAt: timestamp, updatedAt: timestamp,
  headMember: {
    memberId, name: visitor.name || 'New Member', gender: genderValue(visitor.gender), phone: visitor.phone || '', email: visitor.email || '',
    area: visitor.area || '', address: visitor.address || '', campus: visitor.campus || 'Main', gps_coordinates: visitor.gps_coordinates || '',
    latitude: visitor.latitude || '', longitude: visitor.longitude || '', maps_url: visitor.maps_url || '', household_role: 'HEAD',
    joinDate: timestamp.slice(0, 10), status: 'Active', source: 'Visitor Conversion',
  },
  members: [{ memberId, name: visitor.name || 'New Member', household_role: 'HEAD', phone: visitor.phone || '', email: visitor.email || '' }],
});

export async function convertVisitorToMember(visitorId, additionalFamilyDetails = {}) {
  const visitors = await getVaultData('visitors', []);
  const families = await getVaultData('members', []);
  const index = visitors.findIndex((item) => String(item.id || item.visitorId) === String(visitorId));
  if (index < 0) return { success: false, message: 'Visitor record was not found.' };
  const visitor = visitors[index];
  if (visitor.is_converted || visitor.pipeline_stage === 'CONVERTED' || visitor.funnelStage === 'CONVERTED') return { success: false, message: 'Visitor is already converted.' };

  const name = String(visitor.name || '').trim().toLowerCase();
  const phone = String(visitor.phone || '').trim();
  const duplicate = families.some((family) => {
    const head = family.headMember || family;
    return (phone && String(head.phone || family.phone || '').trim() === phone) || (name && String(head.name || family.name || '').trim().toLowerCase() === name);
  });
  if (duplicate) return { success: false, message: 'A member with the same name or phone already exists.' };

  const memberId = nextId(families, 'MEM-');
  const familyId = nextId(families, 'FAM-');
  const convertedAt = new Date().toISOString();
  const updatedVisitor = {
    ...visitor, pipeline_stage: 'CONVERTED', is_converted: true, converted_member_id: memberId, converted_at: convertedAt,
    funnelStage: 'CONVERTED', convertedMemberId: memberId, status: 'Converted to Member',
  };
  const updatedVisitors = visitors.map((item, itemIndex) => itemIndex === index ? updatedVisitor : item);
  const memberRecord = { ...familyRecord(visitor, memberId, familyId, convertedAt), ...additionalFamilyDetails };

  // Commit both local snapshots before network work. This keeps the offline vault consistent.
  await setVaultData('members', [memberRecord, ...families], false);
  await setVaultData('visitors', updatedVisitors, false);

  const supabase = getSupabase();
  if (supabase && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
    const { error: memberError } = await supabase.from('members').upsert([convertVisitorToMemberPayload(visitor, memberId, familyId)], { onConflict: 'id' });
    if (memberError) throw memberError;
    const { error: visitorError } = await supabase.from('visitors').upsert([{
      id: String(updatedVisitor.id || visitorId), name: updatedVisitor.name || 'Anonymous Visitor', phone: updatedVisitor.phone || '',
      area: updatedVisitor.area || '', address: updatedVisitor.address || '', campus: updatedVisitor.campus || 'Main', pipeline_stage: 'CONVERTED',
      is_converted: true, converted_member_id: memberId, converted_at: convertedAt, call_notes: updatedVisitor.call_notes || null,
      home_visit_date: updatedVisitor.home_visit_date || null, assigned_leader: updatedVisitor.assigned_leader || null,
      latitude: numberOrNull(updatedVisitor.latitude), longitude: numberOrNull(updatedVisitor.longitude), gps_coordinates: updatedVisitor.gps_coordinates || null,
      maps_url: updatedVisitor.maps_url || '', raw_payload: updatedVisitor, updated_at: convertedAt,
    }], { onConflict: 'id' });
    if (visitorError) throw visitorError;
  }

  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('graceos_visitor_converted', { detail: { visitorId, memberId, name: visitor.name } }));
  return { success: true, memberId, familyId, name: visitor.name, message: `Visitor successfully welcomed as Full Member (ID: ${memberId})!` };
}