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
const localVaultKeys = {
  members: 'app_members_family_database',
  visitors: 'app_visitors_database'
};

async function persistLocalVault(tableName, value) {
  await setVaultData(tableName, value, false);

  const storageKey = localVaultKeys[tableName];
  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue || JSON.stringify(JSON.parse(storedValue)) !== JSON.stringify(value)) {
    throw new Error(`The local ${tableName} record could not be verified after saving.`);
  }
}

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

const familyRecord = (visitor, memberId, familyId, timestamp, dependents = []) => {
  const primaryMember = {
    id: memberId,
    memberId,
    member_id: memberId,
    name: visitor.name || 'New Member',
    gender: genderValue(visitor.gender),
    phone: visitor.phone || '',
    email: visitor.email || '',
    area: visitor.area || '',
    address: visitor.address || '',
    campus: visitor.campus || 'Main',
    gps_coordinates: visitor.gps_coordinates || '',
    latitude: visitor.latitude || '',
    longitude: visitor.longitude || '',
    maps_url: visitor.maps_url || '',
    household_role: 'HEAD',
    joinDate: timestamp.slice(0, 10),
    status: 'Active',
    source: 'Visitor Conversion'
  };

  const primaryName = String(primaryMember.name).trim().toLowerCase();
  const primaryPhone = String(primaryMember.phone).trim();
  const genuineDependents = (Array.isArray(dependents) ? dependents : []).filter((dependent) => {
    const sameId = String(dependent?.id || dependent?.memberId || dependent?.member_id || '') === memberId;
    const samePhone = primaryPhone && String(dependent?.phone || '').trim() === primaryPhone;
    const sameName = String(dependent?.name || '').trim().toLowerCase() === primaryName;
    return !sameId && !(samePhone && sameName);
  });

  return {
    id: familyId,
    familyId,
    familyName: `${visitor.name || 'New Member'} Household`,
    area: visitor.area || '',
    address: visitor.address || '',
    campus: visitor.campus || 'Main',
    gps_coordinates: visitor.gps_coordinates || '',
    latitude: visitor.latitude || '',
    longitude: visitor.longitude || '',
    maps_url: visitor.maps_url || '',
    createdAt: timestamp,
    updatedAt: timestamp,
    updated_at: timestamp,
    headMember: primaryMember,
    members: genuineDependents
  };
};

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
    const householdMembers = [head, ...(Array.isArray(family.members) ? family.members : [])];
    return householdMembers.some((member) => (
      (phone && String(member?.phone || family.phone || '').trim() === phone)
      || (name && String(member?.name || family.name || '').trim().toLowerCase() === name)
    ));
  });
  if (duplicate) return { success: false, message: 'A member with the same name or phone already exists.' };

  const memberId = nextId(families, 'MEM-');
  const familyId = nextId(families, 'FAM-');
  const convertedAt = new Date().toISOString();
  const updatedVisitor = {
    ...visitor, pipeline_stage: 'CONVERTED', is_converted: true, converted_member_id: memberId, converted_at: convertedAt,
    funnelStage: 'CONVERTED', convertedMemberId: memberId, status: 'Converted to Member',
    updated_at: convertedAt, sync_pending: true
  };
  const updatedVisitors = visitors.map((item, itemIndex) => itemIndex === index ? updatedVisitor : item);
  const convertedFamily = familyRecord(
    visitor,
    memberId,
    familyId,
    convertedAt,
    additionalFamilyDetails.members
  );
  const memberRecord = {
    ...additionalFamilyDetails,
    ...convertedFamily,
    sync_pending: true
  };

  try {
    await persistLocalVault('members', [memberRecord, ...families]);
    await persistLocalVault('visitors', updatedVisitors);
  } catch (error) {
    let rollbackError = null;
    try {
      await persistLocalVault('members', families);
      await persistLocalVault('visitors', visitors);
    } catch (errorDuringRollback) {
      rollbackError = errorDuringRollback;
      console.error('[VisitorConversion] Local rollback failed:', rollbackError);
    }
    return {
      success: false,
      message: rollbackError
        ? `Local conversion failed and automatic rollback was incomplete: ${error.message}`
        : `Conversion was not saved to the local vault: ${error.message}`
    };
  }

  const supabase = getSupabase();
  let cloudSyncPending = !supabase || (typeof navigator !== 'undefined' && navigator.onLine === false);
  let cloudSyncError = null;
  if (!cloudSyncPending) {
    try {
      const { error: memberError } = await supabase.from('members').upsert(
        [convertVisitorToMemberPayload(visitor, memberId, familyId)],
        { onConflict: 'id' }
      );
      if (memberError) throw memberError;

      const { error: visitorError } = await supabase.from('visitors').upsert([{
        id: String(updatedVisitor.id || visitorId),
        name: updatedVisitor.name || 'Anonymous Visitor',
        phone: updatedVisitor.phone || '',
        area: updatedVisitor.area || '',
        address: updatedVisitor.address || '',
        campus: updatedVisitor.campus || 'Main',
        pipeline_stage: 'CONVERTED',
        is_converted: true,
        converted_member_id: memberId,
        converted_at: convertedAt,
        call_notes: updatedVisitor.call_notes || null,
        home_visit_date: updatedVisitor.home_visit_date || null,
        assigned_leader: updatedVisitor.assigned_leader || null,
        latitude: numberOrNull(updatedVisitor.latitude),
        longitude: numberOrNull(updatedVisitor.longitude),
        gps_coordinates: updatedVisitor.gps_coordinates || null,
        maps_url: updatedVisitor.maps_url || '',
        raw_payload: { ...updatedVisitor, sync_pending: false },
        updated_at: convertedAt
      }], { onConflict: 'id' });
      if (visitorError) throw visitorError;

      cloudSyncPending = false;
    } catch (error) {
      cloudSyncPending = true;
      cloudSyncError = error;
      console.error('[VisitorConversion] Cloud upsert failed; conversion remains queued locally:', error);
    }
  }

  const finalMemberRecord = { ...memberRecord, sync_pending: cloudSyncPending };
  const finalVisitor = { ...updatedVisitor, sync_pending: cloudSyncPending };
  const finalVisitors = updatedVisitors.map((item, itemIndex) => itemIndex === index ? finalVisitor : item);
  try {
    await persistLocalVault('members', [finalMemberRecord, ...families]);
    await persistLocalVault('visitors', finalVisitors);
  } catch (error) {
    console.error('[VisitorConversion] Could not verify local cloud-sync status:', error);
  }

  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('graceos_visitor_converted', { detail: { visitorId, memberId, name: visitor.name } }));
  return {
    success: true,
    memberId,
    familyId,
    name: visitor.name,
    sync_pending: cloudSyncPending,
    sync_error: cloudSyncError?.message || null,
    message: cloudSyncPending
      ? `Visitor converted locally as ${memberId}. Cloud synchronization is pending.`
      : `Visitor successfully welcomed as Full Member (ID: ${memberId})!`
  };
}