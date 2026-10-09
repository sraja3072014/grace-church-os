// src/utils/vaultStore.js
import {
  isVaultConnected,
  isElectronRuntime,
  getMountedVaultPath,
  writeDatabaseFile,
  readDatabaseFile,
} from './vaultFS';
import { syncLocalVaultToCloud } from './cloudSyncEngine';

/* ------------------------------------------------------------------ *
 * In-memory RAM cache for fast reads during a session
 * ------------------------------------------------------------------ */
const memoryCache = new Map();

/* ------------------------------------------------------------------ *
 * 1. Core storage entity keys
 * ------------------------------------------------------------------ */
export const VAULT_KEYS = {
  CHURCH: 'graceos_main_church',
  MEMBERS: 'app_members_family_database',
  VISITORS: 'app_visitors_database',
  FINANCE: 'app_finance_transactions_ledger',
  EXPENSES: 'app_expenses_ledger',
  ATTENDANCE: 'graceos_attendance_logs',
  PRAYERS: 'graceos_prayer_wall_db',
  EVENTS: 'graceos_church_events_db',
  LOCALE: 'graceos_locale_config',
  ADVANCED_CONFIG: 'app_advanced_config',
  LEASE_VAULT: 'graceos_land_lease_vault',
};

const ELECTRON_VAULT_PATH_KEY = 'graceos_vault_folder_name';

/* ------------------------------------------------------------------ *
 * 2. Name resolution — callers may pass 'MEMBERS', 'members',
 *    or 'app_members_family_database'. All resolve to one slug.
 * ------------------------------------------------------------------ */
const TABLE_SLUGS = {
  CHURCH: 'church',
  MEMBERS: 'members',
  VISITORS: 'visitors',
  FINANCE: 'finance',
  EXPENSES: 'expenses',
  ATTENDANCE: 'attendance',
  PRAYERS: 'prayers',
  EVENTS: 'events',
  LOCALE: 'locale',
  ADVANCED_CONFIG: 'advanced_config',
  LEASE_VAULT: 'lease_vault',
};

export function resolveTableSlug(tableName) {
  if (!tableName) return 'unknown';
  const raw = String(tableName).trim();
  const upper = raw.toUpperCase();

  if (TABLE_SLUGS[upper]) return TABLE_SLUGS[upper];

  const matchedKey = Object.keys(VAULT_KEYS).find(
    (k) => VAULT_KEYS[k] === raw || k === upper || k === raw
  );
  if (matchedKey && TABLE_SLUGS[matchedKey]) return TABLE_SLUGS[matchedKey];

  return raw;
}

function resolveLocalStorageKey(tableName) {
  const raw = String(tableName);
  const upper = raw.toUpperCase();
  if (VAULT_KEYS[upper]) return VAULT_KEYS[upper];

  const byValue = Object.values(VAULT_KEYS).find((v) => v === raw);
  return byValue || raw;
}

/* ------------------------------------------------------------------ *
 * 3. Electron native-FS bridge helpers   ← FIX #5
 * ------------------------------------------------------------------ */
function getElectronVaultRoot() {
  return isElectronRuntime() ? getMountedVaultPath() : null;
}

/* ------------------------------------------------------------------ *
 * 4. getVaultData — Electron → FSA → localStorage
 * ------------------------------------------------------------------ */
export async function getVaultData(tableName, defaultFallback = []) {
  const slug = resolveTableSlug(tableName);

  if (memoryCache.has(slug)) return memoryCache.get(slug);

  // 1. Electron native filesystem (desktop app)
  const mountedPath = getElectronVaultRoot();
  if (typeof window !== 'undefined' && window.electronAPI?.readFile && mountedPath) {
    try {
      const diskData = await readDatabaseFile(slug, null);
      const hasDiskData = Array.isArray(diskData)
        ? diskData.length > 0
        : diskData !== null && diskData !== undefined && !!diskData;
      if (hasDiskData) {
        memoryCache.set(slug, diskData);
        return diskData;
      }
    } catch {
      /* fall through to browser or localStorage data */
    }
  }

  // 2. Browser File System Access API
  if (!isElectronRuntime() && isVaultConnected() && window.__vaultRootDirHandle) {
    try {
      const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', {
        create: true,
      });
      const fileHandle = await dbDir.getFileHandle(`${slug}.json`, { create: false });
      const file = await fileHandle.getFile();
      const parsed = JSON.parse(await file.text());
      memoryCache.set(slug, parsed);
      return parsed;
    } catch {
      /* fall through */
    }
  }

  // 3. localStorage fallback
  try {
    const localKey = resolveLocalStorageKey(tableName);
    const raw = localStorage.getItem(localKey);
    const parsed = raw ? JSON.parse(raw) : defaultFallback;
    memoryCache.set(slug, parsed);
    return parsed;
  } catch {
    return defaultFallback;
  }
}

/* ------------------------------------------------------------------ *
 * 5. setVaultData — memory + Electron + FSA + localStorage + cloud
 * ------------------------------------------------------------------ */
export async function setVaultData(tableName, data, triggerCloudRelay = true) {
  const slug = resolveTableSlug(tableName);
  memoryCache.set(slug, data);

  // 1. LocalStorage mirror first for immediate local durability and fallback.
  try {
    localStorage.setItem(resolveLocalStorageKey(tableName), JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error(`[VaultStore] localStorage write failed for ${slug}:`, err);
  }

  // 2. Electron native filesystem (primary in the desktop app)
  if (typeof window !== 'undefined' && window.electronAPI?.writeFile && getElectronVaultRoot()) {
    try {
      await writeDatabaseFile(slug, data);
    } catch (err) {
      console.error(`[VaultStore] Electron write failed for ${slug}.json:`, err);
    }
  }

  // 3. Browser File System Access API
  if (!isElectronRuntime() && isVaultConnected() && window.__vaultRootDirHandle) {
    try {
      const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', {
        create: true,
      });
      const fileHandle = await dbDir.getFileHandle(`${slug}.json`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (err) {
      console.error(`[VaultStore] FSA write failed for ${slug}.json:`, err);
    }
  }

  // 4. Optional cloud relay; avoid delaying the local write on network work.
  if (triggerCloudRelay && typeof navigator !== 'undefined' && navigator.onLine) {
    void syncLocalVaultToCloud().catch((err) => {
      console.warn('[VaultStore] Cloud sync skipped:', err && err.message);
    });
  }

  return true;
}

export function clearVaultCache() {
  memoryCache.clear();
}

/* ------------------------------------------------------------------ *
 * 6. Download helper
 * ------------------------------------------------------------------ */
function formatDateStamp(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}`;
}

function downloadTextFile(text, fileName, mimeType) {
  try {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('[VaultStore] Download failed:', err);
  }
}

/* ------------------------------------------------------------------ *
 * 7. Full JSON vault export / restore
 * ------------------------------------------------------------------ */
export const localFileStore = {
  async exportFullJSONVault() {
    const payload = {};
    for (const key of Object.keys(VAULT_KEYS)) {
      payload[VAULT_KEYS[key]] = await getVaultData(key, []);
    }

    const bundle = {
      version: '2.0.0',
      engine: 'GraceOS Local Vault',
      exportedAt: new Date().toISOString(),
      data: payload,
    };

    downloadTextFile(
      JSON.stringify(bundle, null, 2),
      `GraceOS_LocalVault_${formatDateStamp()}.json`,
      'application/json'
    );

    return bundle;
  },

  async restoreFromJSONFile(fileOrObject) {
    let bundle = fileOrObject;

    if (fileOrObject instanceof File || fileOrObject instanceof Blob) {
      bundle = JSON.parse(await fileOrObject.text());
    }

    const payload = bundle && bundle.data ? bundle.data : bundle;
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid GraceOS vault backup file.');
    }

    for (const key of Object.keys(payload)) {
      await setVaultData(key, payload[key], false);
    }

    clearVaultCache();
    window.dispatchEvent(new Event('storage'));

    return { success: true, keys: Object.keys(payload) };
  },
};

/* ------------------------------------------------------------------ *
 * 8. SQL dump
 * ------------------------------------------------------------------ */
export const sqlFileStore = {
  sanitize(value) {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value === 'boolean') return value ? '1' : '0';
    return `'${String(value).replace(/'/g, "''")}'`;
  },

  async generateSQLDump() {
    const church = await getVaultData('CHURCH', {});
    const members = await getVaultData('MEMBERS', []);
    const finance = await getVaultData('FINANCE', []);
    const attendance = await getVaultData('ATTENDANCE', []);

    const lines = [];
    lines.push('-- ============================================================');
    lines.push('-- GraceOS Database Dump');
    lines.push(`-- Church : ${(church && church.name) || 'Unknown'}`);
    lines.push(`-- Created: ${new Date().toISOString()}`);
    lines.push('-- ============================================================');
    lines.push('');

    lines.push('CREATE TABLE IF NOT EXISTS members (');
    lines.push('  id INTEGER PRIMARY KEY AUTOINCREMENT,');
    lines.push('  member_code TEXT,');
    lines.push('  full_name TEXT NOT NULL,');
    lines.push('  gender TEXT,');
    lines.push('  phone TEXT,');
    lines.push('  email TEXT,');
    lines.push('  address TEXT,');
    lines.push('  status TEXT');
    lines.push(');');
    lines.push('');

    lines.push('CREATE TABLE IF NOT EXISTS finance_records (');
    lines.push('  id INTEGER PRIMARY KEY AUTOINCREMENT,');
    lines.push('  txn_date TEXT,');
    lines.push('  txn_type TEXT,');
    lines.push('  category TEXT,');
    lines.push('  amount REAL,');
    lines.push('  payment_mode TEXT,');
    lines.push('  description TEXT');
    lines.push(');');
    lines.push('');

    lines.push('CREATE TABLE IF NOT EXISTS attendance_logs (');
    lines.push('  id INTEGER PRIMARY KEY AUTOINCREMENT,');
    lines.push('  service_date TEXT,');
    lines.push('  service_type TEXT,');
    lines.push('  member_id INTEGER,');
    lines.push('  status TEXT');
    lines.push(');');
    lines.push('');

    for (const m of Array.isArray(members) ? members : []) {
      lines.push(
        'INSERT INTO members (member_code, full_name, gender, phone, email, address, status) VALUES (' +
          [
            this.sanitize(m.member_code ?? m.memberCode),
            this.sanitize(m.full_name ?? m.name),
            this.sanitize(m.gender),
            this.sanitize(m.phone),
            this.sanitize(m.email),
            this.sanitize(m.address),
            this.sanitize(m.status ?? 'ACTIVE'),
          ].join(', ') +
          ');'
      );
    }
    lines.push('');

    for (const f of Array.isArray(finance) ? finance : []) {
      lines.push(
        'INSERT INTO finance_records (txn_date, txn_type, category, amount, payment_mode, description) VALUES (' +
          [
            this.sanitize(f.txn_date ?? f.date),
            this.sanitize(f.txn_type ?? f.type),
            this.sanitize(f.category),
            this.sanitize(Number(f.amount) || 0),
            this.sanitize(f.payment_mode ?? f.mode),
            this.sanitize(f.description ?? f.notes),
          ].join(', ') +
          ');'
      );
    }
    lines.push('');

    for (const a of Array.isArray(attendance) ? attendance : []) {
      lines.push(
        'INSERT INTO attendance_logs (service_date, service_type, member_id, status) VALUES (' +
          [
            this.sanitize(a.service_date ?? a.date),
            this.sanitize(a.service_type ?? a.service),
            this.sanitize(Number(a.member_id ?? a.memberId) || null),
            this.sanitize(a.status ?? 'PRESENT'),
          ].join(', ') +
          ');'
      );
    }

    return lines.join('\n');
  },

  async exportToSQLFile() {
    const sql = await this.generateSQLDump();
    const fileName = `GraceOS_Database_Dump_${formatDateStamp()}.sql`;
    downloadTextFile(sql, fileName, 'application/sql');
    return { success: true, fileName, sql };
  },
};

export const ELECTRON_VAULT_KEY = ELECTRON_VAULT_PATH_KEY;

export default {
  VAULT_KEYS,
  getVaultData,
  setVaultData,
  clearVaultCache,
  resolveTableSlug,
  localFileStore,
  sqlFileStore,
};
