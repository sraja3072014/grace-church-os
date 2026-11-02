// src/utils/syncEngine.js
import { getSupabase } from './supabaseClient';
import { getVaultData, setVaultData } from './vaultStore';
import { syncMembers } from './cloudSyncEngine';

/**
 * 10 Core Tables & Vault Keys Mapping
 */
export const SYNC_MODULES = [
  { key: 'members', table: 'members', primaryKey: 'familyId' },
  { key: 'attendance', table: 'attendance', primaryKey: 'id' },
  { key: 'finance', table: 'finance', primaryKey: 'id' },
  { key: 'expenses', table: 'expenses', primaryKey: 'id' },
  { key: 'visitors', table: 'visitors', primaryKey: 'id' },
  { key: 'prayers', table: 'prayers', primaryKey: 'id' },
  { key: 'events', table: 'events', primaryKey: 'id' },
  { key: 'staff', table: 'staff', primaryKey: 'id' },
  { key: 'main_church', table: 'main_church', primaryKey: 'id' },
  { key: 'branches', table: 'branches', primaryKey: 'id' }
];

const TABLE_CANDIDATES = {
  members: ['members'],
  finance: ['finance'],
  attendance: ['attendance']
};

let isSyncRunning = false;

/**
 * Checks internet connectivity and Supabase initialization
 */
export function isOnlineAndReady() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  const client = getSupabase();
  return Boolean(client);
}

/**
 * Normalizes Local JSON/Array Records into Cloud Compatible Rows
 */
function normalizeForCloud(moduleKey, record) {
  if (!record || typeof record !== 'object') return null;

  // Single-Object modules (Church Profile)
  if (moduleKey === 'main_church') {
    return {
      id: record.id || 'MAIN_HQ',
      church_name: record.churchName || record.church_name || 'Grace Cathedral Church',
      address: record.address || '',
      phone: record.phone || '',
      email: record.email || '',
      registration_no: record.regNo || record.registration_no || '',
      raw_payload: record,
      updated_at: new Date().toISOString()
    };
  }

  // Members / Households (Preserves Nested Tree Payload)
  if (moduleKey === 'members') {
    return {
      id: String(record.familyId || record.id || `FAM-${Date.now()}`),
      family_id: record.familyId || '',
      family_name: record.familyName || '',
      head_name: record.headMember?.name || record.headName || '',
      phone: record.headMember?.phone || record.phone || '',
      campus: record.headMember?.campus || record.campus || 'Headquarters',
      raw_payload: record,
      updated_at: new Date().toISOString()
    };
  }

  // Generic List Modules
  const recordId = String(record.id || record.code || `REC-${Date.now()}`);
  return {
    id: recordId,
    raw_payload: record,
    updated_at: new Date().toISOString(),
    ...(record.date ? { record_date: record.date } : {}),
    ...(record.amount ? { amount: Number(record.amount) } : {})
  };
}

/**
 * Restores Vault/UI Object format from Cloud Row
 */
function restoreFromCloud(moduleKey, row) {
  if (!row) return null;
  // If stored as raw JSON document envelope
  if (row.raw_payload && typeof row.raw_payload === 'object') {
    return row.raw_payload;
  }
  return row;
}

function unwrapCloudRow(row) {
  if (!row || typeof row !== 'object') return {};
  if (row.raw_payload && typeof row.raw_payload === 'object') {
    return { ...row.raw_payload, ...row };
  }
  return row;
}

function normalizeCloudMember(row) {
  const value = unwrapCloudRow(row);
  const role = value.role || value.household_role || value.roleInFamily || '';
  return {
    ...value,
    memberId: value.memberId || value.member_id || value.id,
    name: value.name || value.full_name || value.fullName || value.head_name || 'Family Member',
    familyId: String(value.familyId || value.family_id || value.house_id || value.id || ''),
    familyName: value.familyName || value.family_name || '',
    roleInFamily: role || 'Member',
    family_id: value.family_id || value.familyCode || '',
    gender: value.gender || '',
    household_role: value.household_role || value.household_role_to_head || '',
    spiritual_profile: value.spiritual_profile || value.spiritualProfile || {},
    spiritualProfile: value.spiritualProfile || value.spiritual_profile || {},
    phone: value.phone || value.mobile || '',
    email: value.email || ''
  };
}

function rebuildFamilyHierarchy(rows) {
  const families = new Map();
  rows.map(normalizeCloudMember).forEach((member, index) => {
    const familyId = member.familyId || `FAM-${index + 1}`;
    let family = families.get(familyId);
    if (!family) {
      family = {
        id: familyId,
        familyId,
        familyName: member.familyName || `${member.name} & Household`,
        headMember: null,
        members: []
      };
      families.set(familyId, family);
    }

    const isHead = String(member.family_id).toUpperCase() === 'H' ||
      String(member.household_role).toUpperCase() === 'HEAD' ||
      /head/i.test(String(member.roleInFamily)) ||
      String(member.role || '').toUpperCase() === 'HEAD' ||
      String(member.id) === String(member.familyId);
    const cleanMember = {
      ...member,
      memberId: member.memberId || member.id,
      roleInFamily: isHead ? 'Head of Family' : (member.roleInFamily || 'Member')
    };
    if (isHead && !family.headMember) family.headMember = cleanMember;
    else family.members.push(cleanMember);
  });

  return Array.from(families.values()).map(family => {
    if (!family.headMember && family.members.length) {
      family.headMember = family.members.shift();
      family.headMember.roleInFamily = 'Head of Family';
    }
    return family;
  });
}

async function selectFirstAvailable(client, tables) {
  for (const table of tables) {
    const { data, error } = await client.from(table).select('*');
    if (!error && Array.isArray(data)) return { table, data };
  }
  return { table: null, data: [] };
}

export async function hydrateCloudData() {
  const client = getSupabase();
  if (!client || !isOnlineAndReady()) return { success: false, reason: 'offline_or_unconfigured' };

  try {
    const [memberResult, financeResult, attendanceResult] = await Promise.all([
      selectFirstAvailable(client, TABLE_CANDIDATES.members),
      selectFirstAvailable(client, TABLE_CANDIDATES.finance),
      selectFirstAvailable(client, TABLE_CANDIDATES.attendance)
    ]);

    const families = rebuildFamilyHierarchy(memberResult.data);
    const finance = financeResult.data.map(row => {
      const value = unwrapCloudRow(row);
      return { ...value, amount: Number(value.amount) || 0, date: value.date || value.record_date || value.txn_date };
    });
    const attendance = attendanceResult.data.map(row => {
      const value = unwrapCloudRow(row);
      return {
        ...value,
        memberId: value.memberId || value.member_id,
        date: value.date || value.record_date || value.service_date,
        service: value.service || value.service_name || value.service_type
      };
    });

    await setVaultData('members', families, false);
    await setVaultData('finance', finance, false);
    await setVaultData('attendance', attendance, false);
    localStorage.setItem('app_members_family_database', JSON.stringify(families));
    localStorage.setItem('app_finance_transactions_ledger', JSON.stringify(finance));
    localStorage.setItem('graceos_attendance_logs', JSON.stringify(attendance));
    localStorage.setItem('graceos_cloud_hydrated_at', new Date().toISOString());

    return { success: true, counts: { members: families.length, finance: finance.length, attendance: attendance.length } };
  } catch (error) {
    console.warn('[SyncEngine] Initial cloud hydration failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * PUSH: Local Vault to Supabase Cloud
 */
export async function pushModuleToCloud(moduleKey) {
  const client = getSupabase();
  if (!client || !isOnlineAndReady()) return { success: false, reason: 'offline' };

  const target = SYNC_MODULES.find(m => m.key === moduleKey);
  if (!target) return { success: false, reason: 'unknown_module' };

  try {
    let localData = await getVaultData(moduleKey, []);
    
    // Convert single config object to array for batch upsert
    if (moduleKey === 'main_church') {
      localData = Array.isArray(localData) ? localData : [localData];
    } else if (!Array.isArray(localData)) {
      localData = [];
    }

    if (localData.length === 0) return { success: true, count: 0 };

    if (moduleKey === 'members') {
      await syncMembers(client, localData);
      return { success: true, count: localData.length };
    }

    const cloudRows = localData
      .map(item => normalizeForCloud(moduleKey, item))
      .filter(Boolean);

    const { error } = await client
      .from(target.table)
      .upsert(cloudRows, { onConflict: 'id' });

    if (error) throw error;

    return { success: true, count: cloudRows.length };
  } catch (err) {
    console.warn(`[SyncEngine] Push failed for ${moduleKey}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * PULL: Supabase Cloud to Local Vault
 */
export async function pullModuleFromCloud(moduleKey) {
  const client = getSupabase();
  if (!client || !isOnlineAndReady()) return { success: false, reason: 'offline' };

  const target = SYNC_MODULES.find(m => m.key === moduleKey);
  if (!target) return { success: false, reason: 'unknown_module' };

  try {
    const result = await selectFirstAvailable(client, TABLE_CANDIDATES[moduleKey] || [target.table]);
    const data = result.data;
    if (!Array.isArray(data)) return { success: true, count: 0 };

    const restoredRecords = data.map(row => restoreFromCloud(moduleKey, row));

    if (moduleKey === 'members') {
      const nested = rebuildFamilyHierarchy(data);
      await setVaultData(moduleKey, nested, false);
      localStorage.setItem('app_members_family_database', JSON.stringify(nested));
      return { success: true, count: nested.length };
    }

    if (moduleKey === 'main_church') {
      const singleConfig = restoredRecords[0] || {};
      await setVaultData(moduleKey, singleConfig, false);
      localStorage.setItem('graceos_main_church', JSON.stringify(singleConfig));
    } else {
      await setVaultData(moduleKey, restoredRecords, false);
      // Synchronize direct fallback keys for legacy components
      if (moduleKey === 'members') localStorage.setItem('app_members_family_database', JSON.stringify(restoredRecords));
      if (moduleKey === 'visitors') localStorage.setItem('app_visitors_database', JSON.stringify(restoredRecords));
      if (moduleKey === 'finance') {
        const normalizedFinance = restoredRecords.map(row => ({ ...row, amount: Number(row.amount) || 0 }));
        await setVaultData(moduleKey, normalizedFinance, false);
        localStorage.setItem('app_finance_transactions_ledger', JSON.stringify(normalizedFinance));
      }
      if (moduleKey === 'events') localStorage.setItem('app_events_database', JSON.stringify(restoredRecords));
    }

    return { success: true, count: restoredRecords.length };
  } catch (err) {
    console.warn(`[SyncEngine] Pull failed for ${moduleKey}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * FULL BIDIRECTIONAL SYNC (Pull Cloud First, then Push Local Delta)
 */
export async function runFullTwoWaySync(onProgress) {
  if (isSyncRunning) return { status: 'already_running' };
  if (!isOnlineAndReady()) {
    return { status: 'offline', message: 'No internet connection or Supabase unconfigured.' };
  }

  isSyncRunning = true;
  const syncResults = {};

  try {
    for (let i = 0; i < SYNC_MODULES.length; i++) {
      const mod = SYNC_MODULES[i];
      if (onProgress) onProgress(mod.key, i + 1, SYNC_MODULES.length);

      // 1. Pull latest records from cloud to prevent overwrite
      const pullRes = await pullModuleFromCloud(mod.key);
      
      // 2. Push any pending local mutations up to cloud
      const pushRes = await pushModuleToCloud(mod.key);

      syncResults[mod.key] = {
        pulled: pullRes.count || 0,
        pushed: pushRes.count || 0,
        ok: pullRes.success && pushRes.success
      };
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('graceos_full_sync_completed', { detail: syncResults }));
    }

    return { status: 'completed', results: syncResults };
  } catch (error) {
    console.error('[SyncEngine] Two-way sync exception:', error);
    return { status: 'error', error: error.message };
  } finally {
    isSyncRunning = false;
  }
}

/**
 * Setup Realtime Supabase Listeners for Live Multi-Device Updates
 */
export function initializeRealtimeSyncEngine() {
  const client = getSupabase();
  if (!client || typeof window === 'undefined') return () => {};

  const channels = SYNC_MODULES.map(mod => {
    return client
      .channel(`realtime_${mod.table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: mod.table }, async () => {
        // Silently pull fresh updates into local storage
        await pullModuleFromCloud(mod.key);
        window.dispatchEvent(new CustomEvent('graceos_realtime_data_update', { detail: { module: mod.key } }));
      })
      .subscribe();
  });

  return () => {
    channels.forEach(ch => client.removeChannel(ch));
  };
}