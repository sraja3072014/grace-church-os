// src/utils/vaultFS.js
/* ============================================================================
 * GraceOS — Local Vault Filesystem Layer
 * Supports BOTH:
 *   • Electron  → native IPC (window.electronAPI) writing to a real disk path
 *   • Browser   → File System Access API (window.__vaultRootDirHandle)
 * ========================================================================== */

export const VAULT_FOLDER_NAME_KEY = 'graceos_vault_folder_name';

export const DATABASE_DIR = 'database';
export const BACKUP_DIR = 'backup';
export const SCHEMA_FILE = 'schema_init.sql';

const HANDLE_DB_NAME = 'graceos_vault_handles';
const HANDLE_STORE = 'handles';
const HANDLE_ROOT_ID = 'rootDir';

/** Logical table → JSON file slug written under <vault>/database/ */
export const VAULT_TABLE_FILES = [
  'church',
  'members',
  'visitors',
  'finance',
  'expenses',
  'attendance',
  'prayers',
  'events',
  'locale',
  'advanced_config',
  'lease_vault',
];

/** Slugs whose seed value should be an object rather than an array. */
const OBJECT_TABLES = new Set(['church', 'locale', 'advanced_config']);

/** localStorage key each slug mirrors, used when seeding a fresh vault. */
const TABLE_LOCALSTORAGE_KEYS = {
  church: 'graceos_main_church',
  members: 'app_members_family_database',
  visitors: 'app_visitors_database',
  finance: 'app_finance_transactions_ledger',
  expenses: 'app_expenses_ledger',
  attendance: 'graceos_attendance_logs',
  prayers: 'graceos_prayer_wall_db',
  events: 'graceos_church_events_db',
  locale: 'graceos_locale_config',
  advanced_config: 'app_advanced_config',
  lease_vault: 'graceos_land_lease_vault',
};

/* ============================================================================
 * 1. Path helpers  (FIX #4a — safe Windows separator joining)
 * ========================================================================== */

export function isWindowsPath(p) {
  return /^[a-zA-Z]:[\\/]/.test(p) || /^\\\\/.test(p);
}

/**
 * joinPath('C:\\GraceOS', 'database', 'members.json')
 *   → 'C:\GraceOS\database\members.json'
 * joinPath('/home/grace', 'database')  → '/home/grace/database'
 * Never produces mixed separators, never doubles them.
 */
export function joinPath(...parts) {
  const clean = parts
    .filter((p) => p !== undefined && p !== null && String(p).trim() !== '')
    .map((p) => String(p));

  if (clean.length === 0) return '';

  const windows = isWindowsPath(clean[0]) || clean[0].includes('\\');
  const sep = windows ? '\\' : '/';

  let prefix = '';
  if (windows && /^\\\\/.test(clean[0])) prefix = '\\\\';      // UNC \\server\share
  else if (!windows && clean[0].startsWith('/')) prefix = '/'; // POSIX absolute

  const segments = [];
  for (const part of clean) {
    for (const piece of part.replace(/[\\/]+/g, sep).split(sep)) {
      if (!piece || piece === '.') continue;
      if (piece === '..' && segments.length && segments[segments.length - 1] !== '..') {
        segments.pop();
        continue;
      }
      segments.push(piece);
    }
  }

  return prefix + segments.join(sep);
}

export function basename(p) {
  return String(p || '').split(/[\\/]+/).filter(Boolean).pop() || '';
}

export function dirname(p) {
  const parts = String(p || '').split(/[\\/]+/).filter(Boolean);
  parts.pop();
  const sep = isWindowsPath(p) ? '\\' : '/';
  return parts.join(sep);
}

/* ============================================================================
 * 2. Runtime detection & connection state
 * ========================================================================== */

export function isElectronRuntime() {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

export function getVaultRootPath() {
  try {
    return localStorage.getItem(VAULT_FOLDER_NAME_KEY) || null;
  } catch {
    return null;
  }
}

/** Returns the currently mounted local vault path or directory name. */
export function getMountedVaultPath() {
  return getVaultRootPath();
}

export function setVaultRootPath(rootPath) {
  try {
    localStorage.setItem(VAULT_FOLDER_NAME_KEY, rootPath);
  } catch (err) {
    console.error('[VaultFS] Could not persist vault path:', err);
  }
}

export function isVaultConnected() {
  if (typeof window === 'undefined') return false;
  const isDesktopVaultConnected =
    !!(window.electronAPI?.writeFile && getVaultRootPath());
  return !!window.__vaultRootDirHandle || isDesktopVaultConnected;
}

/* ============================================================================
 * 3. SQL schema
 * ========================================================================== */

export const SCHEMA_INIT_SQL = `-- ============================================================================
-- GraceOS Local Vault — Initial Schema (schema_init.sql)
-- SQLite / D1 compatible DDL
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS church_info (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL DEFAULT '',
  branch       TEXT,
  address      TEXT,
  city         TEXT,
  state        TEXT,
  country      TEXT,
  pincode      TEXT,
  phone        TEXT,
  email        TEXT,
  website      TEXT,
  pastor_name  TEXT,
  established  TEXT,
  logo_url     TEXT,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS families (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  family_name  TEXT NOT NULL,
  head_member_id INTEGER,
  address      TEXT,
  city         TEXT,
  phone        TEXT,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (head_member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS members (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  member_code    TEXT UNIQUE,
  full_name      TEXT NOT NULL,
  gender         TEXT,
  date_of_birth  TEXT,
  marital_status TEXT,
  phone          TEXT,
  email          TEXT,
  address        TEXT,
  city           TEXT,
  photo_url      TEXT,
  family_id      INTEGER,
  role           TEXT DEFAULT 'MEMBER',
  status         TEXT DEFAULT 'ACTIVE',
  joined_date    TEXT,
  baptized       INTEGER DEFAULT 0,
  notes          TEXT,
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS visitors (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  invited_by    TEXT,
  visit_date    TEXT,
  follow_up     TEXT DEFAULT 'PENDING',
  prayer_request TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  txn_date     TEXT NOT NULL,
  txn_type     TEXT NOT NULL CHECK (txn_type IN ('INCOME','EXPENSE')),
  category     TEXT,
  fund         TEXT,
  amount       REAL NOT NULL DEFAULT 0,
  currency     TEXT DEFAULT 'INR',
  payment_mode TEXT,
  member_id    INTEGER,
  reference_no TEXT,
  description  TEXT,
  recorded_by  TEXT,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_date TEXT NOT NULL,
  category     TEXT,
  vendor       TEXT,
  amount       REAL NOT NULL DEFAULT 0,
  payment_mode TEXT,
  bill_no      TEXT,
  approved_by  TEXT,
  description  TEXT,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  service_date  TEXT NOT NULL,
  service_type  TEXT,
  member_id     INTEGER,
  status        TEXT DEFAULT 'PRESENT',
  check_in_time TEXT,
  remarks       TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  requester   TEXT,
  member_id   INTEGER,
  category    TEXT,
  request     TEXT NOT NULL,
  status      TEXT DEFAULT 'OPEN',
  prayed_on   TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  event_type  TEXT,
  start_date  TEXT,
  end_date    TEXT,
  venue       TEXT,
  description TEXT,
  in_charge   TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lease_vault (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  property_name TEXT NOT NULL,
  lessor        TEXT,
  lessee        TEXT,
  survey_no     TEXT,
  location      TEXT,
  lease_start   TEXT,
  lease_end     TEXT,
  lease_amount  REAL,
  document_path TEXT,
  notes         TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  password_hash TEXT,
  role          TEXT DEFAULT 'STAFF',
  is_active     INTEGER DEFAULT 1,
  last_login    TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  category   TEXT DEFAULT 'general',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_name       ON members (full_name);
CREATE INDEX IF NOT EXISTS idx_members_family     ON members (family_id);
CREATE INDEX IF NOT EXISTS idx_visitors_date      ON visitors (visit_date);
CREATE INDEX IF NOT EXISTS idx_finance_date       ON finance_records (txn_date);
CREATE INDEX IF NOT EXISTS idx_finance_type       ON finance_records (txn_type);
CREATE INDEX IF NOT EXISTS idx_expenses_date      ON expenses (expense_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date    ON attendance_logs (service_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member  ON attendance_logs (member_id);
CREATE INDEX IF NOT EXISTS idx_lease_start        ON lease_vault (lease_start);

INSERT OR IGNORE INTO settings (key, value, category) VALUES
  ('schema_version', '2.0.0',   'system'),
  ('vault_engine',   'GraceOS', 'system');
`;

// Legacy name used by older settings screens.
export const INIT_TABLES_SQL = SCHEMA_INIT_SQL;

/* ============================================================================
 * 4. Seeding helpers
 * ========================================================================== */

function readSeedData(slug) {
  try {
    const key = TABLE_LOCALSTORAGE_KEYS[slug];
    if (key) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed !== null && parsed !== undefined) return parsed;
      }
    }
  } catch {
    /* ignore and fall through to defaults */
  }
  return OBJECT_TABLES.has(slug) ? {} : [];
}

/* ============================================================================
 * 5. ELECTRON: initialise a real folder on disk   ← FIX #4b
 * ========================================================================== */

export async function initializeElectronVault(rootPath) {
  const api = window.electronAPI;
  if (!api) return { success: false, error: 'electronAPI unavailable' };
  if (!rootPath) return { success: false, error: 'No vault root path supplied' };

  const dbDir = joinPath(rootPath, DATABASE_DIR);
  const backupDir = joinPath(rootPath, BACKUP_DIR);

  // 1. recursively create <vault>/database and <vault>/backup
  await api.createDir(dbDir);
  await api.createDir(backupDir);

  // 2. always (re)write the schema DDL
  await api.writeFile(joinPath(dbDir, SCHEMA_FILE), SCHEMA_INIT_SQL);

  // 3. seed JSON tables (never overwrite existing user data)
  for (const slug of VAULT_TABLE_FILES) {
    const filePath = joinPath(dbDir, `${slug}.json`);
    const existing = await api.readFile(filePath);
    const existingText =
      typeof existing === 'string' ? existing : existing && existing.content;

    if (existingText && String(existingText).trim().length > 0) continue;

    await api.writeFile(filePath, JSON.stringify(readSeedData(slug), null, 2));
  }

  // 4. drop a manifest in /backup so the folder is never empty
  await api.writeFile(
    joinPath(backupDir, 'vault_manifest.json'),
    JSON.stringify(
      {
        engine: 'GraceOS',
        vaultVersion: '2.0.0',
        createdAt: new Date().toISOString(),
        rootPath,
        tables: VAULT_TABLE_FILES,
      },
      null,
      2
    )
  );

  return { success: true, path: rootPath, mode: 'electron' };
}

async function selectVaultFolderElectron() {
  const api = window.electronAPI;
  if (!api?.selectDirectory || !api?.writeFile) return null;

  try {
    const result = await api.selectDirectory();
    const selectedPath =
      typeof result === 'string'
        ? result
        : result && result.success !== false
          ? result.path || result.filePath || null
          : null;

    if (typeof selectedPath !== 'string' || !selectedPath) return null;

    const initialized = await initializeElectronVault(selectedPath);
    if (!initialized?.success) return null;

    setVaultRootPath(selectedPath);
    try {
      window.dispatchEvent(
        new CustomEvent('graceos:vault-connected', {
          detail: { path: selectedPath, mode: 'electron' },
        })
      );
    } catch { /* noop */ }

    return selectedPath;
  } catch (err) {
    console.error('[Electron Vault Init Error]:', err);
    return null;
  }
}

/* ============================================================================
 * 6. BROWSER: File System Access API
 * ========================================================================== */

function openHandleDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(HANDLE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function persistDirectoryHandle(handle) {
  try {
    const db = await openHandleDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      tx.objectStore(HANDLE_STORE).put(handle, HANDLE_ROOT_ID);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('[VaultFS] Could not persist directory handle:', err);
  }
}

async function loadDirectoryHandle() {
  try {
    const db = await openHandleDb();
    const handle = await new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readonly');
      const req = tx.objectStore(HANDLE_STORE).get(HANDLE_ROOT_ID);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return handle;
  } catch {
    return null;
  }
}

async function verifyPermission(handle, readWrite = true) {
  if (!handle || !handle.queryPermission) return false;
  const opts = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  if ((await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

export async function initializeBrowserVault(rootHandle) {
  const dbDir = await rootHandle.getDirectoryHandle(DATABASE_DIR, { create: true });
  await rootHandle.getDirectoryHandle(BACKUP_DIR, { create: true });

  // schema_init.sql
  const schemaHandle = await dbDir.getFileHandle(SCHEMA_FILE, { create: true });
  const schemaWritable = await schemaHandle.createWritable();
  await schemaWritable.write(SCHEMA_INIT_SQL);
  await schemaWritable.close();

  // seed JSON tables (never clobber existing data)
  for (const slug of VAULT_TABLE_FILES) {
    try {
      const existingHandle = await dbDir.getFileHandle(`${slug}.json`, { create: false });
      const existingFile = await existingHandle.getFile();
      const text = await existingFile.text();
      if (text && text.trim().length > 0) continue;
    } catch {
      /* file missing → create it below */
    }
    const handle = await dbDir.getFileHandle(`${slug}.json`, { create: true });
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(readSeedData(slug), null, 2));
    await writable.close();
  }

  return { success: true, mode: 'browser' };
}

async function selectVaultFolderBrowser() {
  if (typeof window.showDirectoryPicker !== 'function') {
    return {
      success: false,
      error: 'File System Access API not supported in this browser.',
    };
  }

  let rootHandle;
  try {
    rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
  } catch (err) {
    return { success: false, canceled: true, error: err && err.message };
  }

  if (!(await verifyPermission(rootHandle, true))) {
    return { success: false, error: 'Write permission denied for the selected folder.' };
  }

  window.__vaultRootDirHandle = rootHandle;
  await persistDirectoryHandle(rootHandle);
  await initializeBrowserVault(rootHandle);

  try {
    localStorage.setItem(VAULT_FOLDER_NAME_KEY, rootHandle.name);
  } catch { /* noop */ }

  try {
    window.dispatchEvent(
      new CustomEvent('graceos:vault-connected', {
        detail: { path: rootHandle.name, mode: 'browser' },
      })
    );
  } catch { /* noop */ }

  return { success: true, canceled: false, mode: 'browser', path: rootHandle.name };
}

/* ============================================================================
 * 7. Public API
 * ========================================================================== */

export async function selectVaultFolder() {
  if (isElectronRuntime()) return selectVaultFolderElectron();
  const result = await selectVaultFolderBrowser();
  return result?.success && typeof result.path === 'string' ? result.path : null;
}

/** Re-attach to a previously chosen vault (browser sessions / app restart). */
export async function restoreVaultConnection() {
  if (isElectronRuntime()) {
    const root = getVaultRootPath();
    if (!root) return { success: false };
    // Re-seed anything that may have been deleted manually.
    await initializeElectronVault(root);
    return { success: true, path: root, mode: 'electron' };
  }

  const handle = await loadDirectoryHandle();
  if (handle && (await verifyPermission(handle, true))) {
    window.__vaultRootDirHandle = handle;
    return { success: true, path: handle.name, mode: 'browser' };
  }
  return { success: false };
}

/** Generic relative-path writer used by feature modules. */
export async function writeVaultFile(relativePath, content) {
  const segments = String(relativePath).split(/[\\/]+/).filter(Boolean);

  if (isElectronRuntime()) {
    const root = getVaultRootPath();
    if (!root) return { success: false, error: 'Vault folder not mounted' };
    return window.electronAPI.writeFile(joinPath(root, ...segments), content);
  }

  if (window.__vaultRootDirHandle) {
    try {
      const fileName = segments.pop();
      let dir = window.__vaultRootDirHandle;
      for (const seg of segments) dir = await dir.getDirectoryHandle(seg, { create: true });
      const fileHandle = await dir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
      await writable.close();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'No vault mounted' };
}

/** Generic relative-path reader. */
export async function readVaultFile(relativePath) {
  const segments = String(relativePath).split(/[\\/]+/).filter(Boolean);

  if (isElectronRuntime()) {
    const root = getVaultRootPath();
    if (!root) return null;
    const res = await window.electronAPI.readFile(joinPath(root, ...segments));
    const text = typeof res === 'string' ? res : res && res.content;
    return text || null;
  }

  if (window.__vaultRootDirHandle) {
    try {
      const fileName = segments.pop();
      let dir = window.__vaultRootDirHandle;
      for (const seg of segments) dir = await dir.getDirectoryHandle(seg, { create: false });
      const fileHandle = await dir.getFileHandle(fileName, { create: false });
      const file = await fileHandle.getFile();
      return await file.text();
    } catch {
      return null;
    }
  }

  return null;
}

/** Write a supplied backup payload, or snapshot the mounted JSON tables by default. */
export async function createBackupSnapshot(payload) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '_');
  const suffix = Date.now().toString().slice(-4);
  let snapshot = payload;

  if (snapshot === undefined) {
    snapshot = {};
    for (const slug of VAULT_TABLE_FILES) {
      const raw = await readVaultFile(`${DATABASE_DIR}/${slug}.json`);
      if (raw) {
        try { snapshot[slug] = JSON.parse(raw); } catch { snapshot[slug] = raw; }
      }
    }
  }

  const fileName = `${BACKUP_DIR}/backup_snapshot_${stamp}_${suffix}.json`;
  const result = await writeVaultFile(fileName, JSON.stringify(snapshot, null, 2));
  if (!result?.success) {
    throw new Error(result?.error || 'Unable to write the backup snapshot.');
  }

  return basename(fileName);
}

export function disconnectVault() {
  try { localStorage.removeItem(VAULT_FOLDER_NAME_KEY); } catch { /* noop */ }
  if (typeof window !== 'undefined') window.__vaultRootDirHandle = null;
}

/* ============================================================================
 * 8. Legacy / back-compat named exports
 * ========================================================================== */

/* ---- path accessors ---- */
export const getVaultPath = () => getVaultRootPath();
export const getVaultFolderPath = () => getVaultRootPath();
export const getVaultFolderName = () => getVaultRootPath();
export const getVaultDir = () => getVaultRootPath();
export const setMountedVaultPath = (rootPath) => setVaultRootPath(rootPath);

/* ---- connection state ---- */
export const isVaultMounted = () => isVaultConnected();
export const hasVaultConnection = () => isVaultConnected();
export const isElectron = () => isElectronRuntime();

/* ---- folder picker / lifecycle ---- */
export const pickVaultFolder = () => selectVaultFolder();
export const chooseVaultFolder = () => selectVaultFolder();
export const openVaultFolder = () => selectVaultFolder();
export const mountVault = () => selectVaultFolder();
export const unmountVault = () => disconnectVault();

/** Restore a previous connection and return its path for older callers. */
export async function initVaultFolder() {
  const result = await restoreVaultConnection();
  return result?.success ? result.path : null;
}

/** Mode-agnostic structure bootstrap (works in Electron and browser). */
export async function ensureVaultStructure(rootOrHandle) {
  if (isElectronRuntime()) {
    return initializeElectronVault(rootOrHandle || getVaultRootPath());
  }
  const handle = rootOrHandle ||
    (typeof window !== 'undefined' ? window.__vaultRootDirHandle : null);
  if (!handle) return { success: false, error: 'No vault handle provided' };
  return initializeBrowserVault(handle);
}

export const initVaultStructure = (root) => ensureVaultStructure(root);
export const ensureVaultFolders = (root) => ensureVaultStructure(root);
export const initVaultFolders = (root) => ensureVaultStructure(root);

/* ---- file IO ---- */
export const readVaultJSON = (relativePath) => readVaultFile(relativePath);
export const writeVaultJSON = (relativePath, data) => writeVaultFile(relativePath, data);
export const saveVaultJSON = (relativePath, data) => writeVaultFile(relativePath, data);
export const loadVaultJSON = (relativePath) => readVaultFile(relativePath);

export async function writeDatabaseFile(fileName, data) {
  const jsonFileName = String(fileName).endsWith('.json') ? String(fileName) : `${fileName}.json`;
  const result = await writeVaultFile(joinPath(DATABASE_DIR, jsonFileName), data);
  return !!result?.success;
}

export async function readDatabaseFile(fileName, fallback = []) {
  const jsonFileName = String(fileName).endsWith('.json') ? String(fileName) : `${fileName}.json`;
  const content = await readVaultFile(joinPath(DATABASE_DIR, jsonFileName));
  if (content === null || content === undefined) return fallback;
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

/* ---- browser directory handles ---- */
export const getMountedVaultHandle = () =>
  (typeof window !== 'undefined' ? window.__vaultRootDirHandle || null : null);

export const getVaultRootHandle = getMountedVaultHandle;

/* ---- backup ---- */
export const snapshotVault = () => createBackupSnapshot();
export const backupVault = () => createBackupSnapshot();

/* Back-compat aliases so existing imports keep working */
export const initializeVault = initializeElectronVault;
export const initializeVaultStructure = initializeElectronVault;
export const initializeVaultFolders = initializeElectronVault;
export const saveVaultFile = writeVaultFile;
export const loadVaultFile = readVaultFile;

export default {
  isVaultConnected,
  isElectronRuntime,
  selectVaultFolder,
  restoreVaultConnection,
  createBackupSnapshot,
  writeVaultFile,
  readVaultFile,
  disconnectVault,
  getVaultRootPath,
  setVaultRootPath,
  joinPath,
};
