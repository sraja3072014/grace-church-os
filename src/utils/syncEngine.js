// src/utils/syncEngine.js
import { getSupabase } from './supabaseClient';
import { getVaultData, setVaultData } from './vaultStore';

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
    const { data, error } = await client
      .from(target.table)
      .select('*');

    if (error) throw error;
    if (!Array.isArray(data)) return { success: true, count: 0 };

    const restoredRecords = data.map(row => restoreFromCloud(moduleKey, row));

    if (moduleKey === 'main_church') {
      const singleConfig = restoredRecords[0] || {};
      await setVaultData(moduleKey, singleConfig, false);
      localStorage.setItem('graceos_main_church', JSON.stringify(singleConfig));
    } else {
      await setVaultData(moduleKey, restoredRecords, false);
      // Synchronize direct fallback keys for legacy components
      if (moduleKey === 'members') localStorage.setItem('app_members_family_database', JSON.stringify(restoredRecords));
      if (moduleKey === 'visitors') localStorage.setItem('app_visitors_database', JSON.stringify(restoredRecords));
      if (moduleKey === 'finance') localStorage.setItem('app_finance_transactions_ledger', JSON.stringify(restoredRecords));
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