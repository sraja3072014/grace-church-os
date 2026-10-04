import { writeDatabaseFile, isVaultConnected } from './vaultFS';
import { syncLocalVaultToCloud } from './cloudSyncEngine';
import { supabase } from './supabaseClient';

const OFFLINE_QUEUE_PREFIX = 'offline_queue_';
const queueFlushes = new Map();

function enqueueOfflineRecord(tableName, payload) {
  const queueKey = `${OFFLINE_QUEUE_PREFIX}${tableName}`;
  const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
  if (!Array.isArray(queue)) {
    throw new Error(`Offline queue for ${tableName} is invalid.`);
  }

  queue.push(payload);
  localStorage.setItem(queueKey, JSON.stringify(queue));
}

export function flushOfflineQueue(tableName) {
  if (queueFlushes.has(tableName)) return queueFlushes.get(tableName);

  const flushTask = (async () => {
    if (typeof navigator === 'undefined' || !navigator.onLine) return false;

    const queueKey = `${OFFLINE_QUEUE_PREFIX}${tableName}`;
    try {
      while (true) {
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        if (!Array.isArray(queue) || queue.length === 0) {
          if (!Array.isArray(queue)) localStorage.removeItem(queueKey);
          return true;
        }

        const { error } = await supabase.from(tableName).upsert(queue[0]);
        if (error) {
          console.error(`[Cloud Queue] Could not sync ${tableName}:`, error);
          return false;
        }

        // Remove only the acknowledged item, preserving writes appended during the request.
        const latestQueue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        if (Array.isArray(latestQueue)) {
          latestQueue.shift();
          if (latestQueue.length > 0) {
            localStorage.setItem(queueKey, JSON.stringify(latestQueue));
          } else {
            localStorage.removeItem(queueKey);
          }
        }
      }
    } catch (err) {
      console.error(`[Cloud Queue] Failed to flush ${tableName}:`, err);
      return false;
    }
  })();

  queueFlushes.set(tableName, flushTask);
  return flushTask.finally(() => queueFlushes.delete(tableName));
}

async function pushDeltaToSupabase(tableName, payload) {
  try {
    const synced = await flushOfflineQueue(tableName);
    if (!synced) {
      enqueueOfflineRecord(tableName, payload);
      return false;
    }

    const { error } = await supabase.from(tableName).upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`[Cloud Sync] Failed to push ${tableName}; queued for retry:`, err);
    try {
      enqueueOfflineRecord(tableName, payload);
    } catch (queueError) {
      console.error(`[Cloud Sync] Could not queue ${tableName}:`, queueError);
    }
    return false;
  }
}

async function directSupabaseSave(tableName, payload) {
  const queueSynced = await flushOfflineQueue(tableName);
  if (!queueSynced) {
    throw new Error(`Pending ${tableName} records could not be synced first.`);
  }

  const { error } = await supabase.from(tableName).upsert(payload);
  if (error) throw error;
  return true;
}

export async function saveRecord(tableName, payload) {
  if (isVaultConnected()) {
    const diskSaved = await writeDatabaseFile(tableName, payload);
    if (!diskSaved) {
      console.warn(`[Local Vault] Could not write ${tableName}.json to the mounted drive.`);
    } else {
      console.log('[Local Vault] Saved directly to mounted physical disk.');
    }

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      void pushDeltaToSupabase(tableName, payload);
    }
    return diskSaved;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await directSupabaseSave(tableName, payload);
      console.log('[Cloud Direct] Saved straight to Supabase.');
      return true;
    } catch (err) {
      console.error(`[Cloud Direct] Failed to save ${tableName}; queued for retry:`, err);
      try {
        enqueueOfflineRecord(tableName, payload);
        return true;
      } catch (queueError) {
        console.error(`[Cloud Direct] Could not queue ${tableName}:`, queueError);
        return false;
      }
    }
  }

  try {
    enqueueOfflineRecord(tableName, payload);
    return true;
  } catch (err) {
    console.error(`[Offline Queue] Could not save ${tableName}:`, err);
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(OFFLINE_QUEUE_PREFIX))
      .forEach((key) => {
        void flushOfflineQueue(key.slice(OFFLINE_QUEUE_PREFIX.length));
      });
  });
}

// ஆப்பில் உள்ள அனைத்து மாடியூல்களின் ஃபைல் வரைபடம் (Registry Map)
export const MODULE_STORAGE_REGISTRY = {
  // 1. Core Church & Settings
  CHURCH_PROFILE: { key: 'graceos_main_church', file: 'church_profile.json' },
  BRANCHES: { key: 'graceos_branches', file: 'branches_management.json' },
  LOCALE_SETTINGS: { key: 'graceos_locale_config', file: 'locale_settings.json' },
  THEME_CONFIG: { key: 'graceos_theme_config', file: 'theme_settings.json' },

  // 2. Main Ministries & Registers
  MEMBERS: { key: 'app_members_family_database', file: 'members_families.json' },
  VISITORS: { key: 'app_visitors_database', file: 'visitors_funnel.json' },
  ATTENDANCE: { key: 'app_attendance_master_ledger', file: 'attendance_ledger.json' },
  
  // 3. Finance & Accounts
  FINANCE_INCOME: { key: 'app_finance_transactions_ledger', file: 'finance_income_80g.json' },
  FINANCE_EXPENSE: { key: 'app_expenses_ledger', file: 'finance_expenses.json' },

  // 4. Church Operations & Events
  PRAYER_WALL: { key: 'app_prayer_requests_db', file: 'prayer_burdens.json' },
  EVENTS_HUB: { key: 'app_events_database', file: 'events_calendar.json' },
  REPORTS_AUDIT: { key: 'graceos_audits_cache', file: 'reports_audit.json' }
};

/**
 * 🌟 ஒரே நேரத்தில் பிரவுசரிலும், ஹார்ட் டிரைவ் /database/ பாத்திலும் எழுதும் ஃபங்ஷன்
 */
export async function persistModuleData(registryItem, dataPayload) {
  try {
    // 1. Browser LocalStorage Instant Write (UI Fast Response)
    localStorage.setItem(registryItem.key, JSON.stringify(dataPayload));

    // 2. 🌟 Physical Hard Drive /database/ Auto-Write
    if (isVaultConnected()) {
      await writeDatabaseFile(registryItem.file, dataPayload);
    }
    return true;
  } catch (err) {
    console.error(`Error saving data for ${registryItem.file}:`, err);
    return false;
  }
}

export async function commitDataChange(tableName, data, options = { syncCloudNow: false }) {
  // 1. LocalStorage-ல் உடனடி பேக்கப்
  const storageKey = tableName === 'members' 
    ? 'app_members_family_database' 
    : tableName === 'finance'
      ? 'app_finance_transactions_ledger'
      : `app_${tableName}_database`;

  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('LocalStorage write warning:', err);
  }

  // 2. மவுண்ட் செய்யப்பட்ட லோக்கல் ஹார்ட் டிரைவில் (/database/tableName.json) நேரடியாக எழுதுதல்
  if (isVaultConnected() && window.__vaultRootDirHandle) {
    try {
      const success = await writeDatabaseFile(tableName, data);
      if (success) {
        console.log(`[Disk Write] ✓ ${tableName}.json உங்கள் கம்ப்யூட்டர் டிரைவில் வெற்றிகரமாகப் பதிவானது.`);
      }
    } catch (err) {
      console.error(`[Disk Write Failed] ${tableName}.json எழுதுவதில் பிழை:`, err);
    }
  }

  // 3. கிளவுட் சின்க் (தேவைப்பட்டால்)
  if (options.syncCloudNow && navigator.onLine) {
    syncLocalVaultToCloud().catch(console.warn);
  }
}