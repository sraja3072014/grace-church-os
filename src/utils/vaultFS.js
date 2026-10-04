// src/utils/vaultFS.js

const IDB_NAME = 'graceos_vault_db';
const IDB_STORE = 'handles';

/**
 * 1. IndexedDB மூலம் Folder Handle-ஐ நிரந்தரமாகச் சேமித்தல்
 */
function openHandleDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(IDB_STORE)) {
        request.result.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStoredHandle(handle) {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(handle, 'root_vault_handle');
  } catch (err) {
    console.warn('Failed to persist handle in IndexedDB:', err);
  }
}

export async function getStoredHandle() {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(IDB_STORE, 'readonly');
    return new Promise((resolve) => {
      const req = tx.objectStore(IDB_STORE).get('root_vault_handle');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * 2. ரீட்/ரைட் பெர்மிஷன் சரிபார்த்தல் & கோருதல்
 */
export async function verifyPermission(fileHandle, readWrite = true) {
  if (!fileHandle) return false;
  const options = {};
  if (readWrite) options.mode = 'readwrite';
  try {
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await fileHandle.requestPermission(options)) === 'granted') {
      return true;
    }
  } catch (err) {
    console.warn('Permission query error:', err);
  }
  return false;
}

/**
 * 3. SQL DDL ஸ்கிரிப்ட் மற்றும் ஆரம்ப டேபிள்களைத் தயாரிக்கும் இன்ஜின்
 */
const SQL_SCHEMA_BLUEPRINT = `-- ====================================================================
-- GraceOS Church Operating System - Database Schema (SQLite / PostgreSQL)
-- Auto-Generated on Vault Folder Mount
-- ====================================================================

-- 1. விசுவாசிகள் அட்டவணை (Members Table)
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32),
  email VARCHAR(128),
  family_role VARCHAR(64),
  family_name VARCHAR(255),
  area VARCHAR(128),
  dob DATE,
  education VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. நிதி வரவு-செலவு அட்டவணை (Finance Transactions & 80G Ledger)
CREATE TABLE IF NOT EXISTS finance_records (
  id VARCHAR(64) PRIMARY KEY,
  donor_name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_mode VARCHAR(32),
  transaction_date DATE NOT NULL,
  recorded_by VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. வருகைப் பதிவு அட்டவணை (Attendance Check-In Logs)
CREATE TABLE IF NOT EXISTS attendance_logs (
  id VARCHAR(64) PRIMARY KEY,
  member_id VARCHAR(64),
  service_title VARCHAR(128),
  checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  method VARCHAR(32) DEFAULT 'QR_SCAN'
);

-- 4. பார்வையாளர்கள் அட்டவணை (Visitors Funnel Desk)
CREATE TABLE IF NOT EXISTS visitors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32),
  visited_date DATE,
  purpose VARCHAR(255),
  status VARCHAR(64) DEFAULT 'New'
);

-- 5. ஜெப விண்ணப்பங்கள் (Prayer Wall Requests)
CREATE TABLE IF NOT EXISTS prayer_requests (
  id VARCHAR(64) PRIMARY KEY,
  requester_name VARCHAR(255),
  prayer_text TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT FALSE,
  status VARCHAR(64) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

/**
 * 4. ஆரம்ப கோப்புகள் மற்றும் SQL டேபிள்களை மவுண்ட் ஆன ஃபோல்டரில் எழுதுதல்
 */
async function initializeDatabaseFolder(dirHandle) {
  try {
    const dbDir = await dirHandle.getDirectoryHandle('database', { create: true });
    await dirHandle.getDirectoryHandle('backup', { create: true });

    // 1. schema_init.sql உருவாக்குதல்
    const sqlFile = await dbDir.getFileHandle('schema_init.sql', { create: true });
    const sqlWriter = await sqlFile.createWritable();
    await sqlWriter.write(SQL_SCHEMA_BLUEPRINT);
    await sqlWriter.close();

    // 2. முக்கிய லைவ் டேபிள் கோப்புகளை லோக்கலில் துவக்குதல் (ஏற்கனவே இல்லையென்றால்)
    const tables = [
      { name: 'members', defaultData: JSON.parse(localStorage.getItem('app_members_family_database') || '[]') },
      { name: 'finance', defaultData: JSON.parse(localStorage.getItem('app_finance_transactions_ledger') || '[]') },
      { name: 'visitors', defaultData: JSON.parse(localStorage.getItem('app_visitors_database') || '[]') },
      { name: 'prayers', defaultData: JSON.parse(localStorage.getItem('app_prayers_database') || '[]') },
      { name: 'attendance', defaultData: JSON.parse(localStorage.getItem('app_attendance_database') || '[]') }
    ];

    for (const tbl of tables) {
      const file = await dbDir.getFileHandle(`${tbl.name}.json`, { create: true });
      const currentFile = await file.getFile();
      if (currentFile.size === 0) {
        const writer = await file.createWritable();
        await writer.write(JSON.stringify(tbl.defaultData, null, 2));
        await writer.close();
      }
    }

    console.log('[VaultFS] Folder Linked & SQL Schema Initialized successfully! ✓');
  } catch (err) {
    console.error('[VaultFS] Error during database folder initialization:', err);
  }
}

/**
 * 5. பயனர் லோக்கல் ஃபோல்டரைத் தேர்ந்தெடுத்து லிங்க் செய்யும் முதன்மை முறை (Goal 1)
 */
export async function selectVaultFolder() {
  if (!('showDirectoryPicker' in window)) {
    alert('Your browser does not support local disk mounting. Please use Google Chrome or Microsoft Edge.');
    return null;
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });

    const hasPerm = await verifyPermission(dirHandle, true);
    if (!hasPerm) {
      alert('Read/Write permission was not granted for this folder.');
      return null;
    }

    window.__vaultRootDirHandle = dirHandle;
    await saveStoredHandle(dirHandle);
    localStorage.setItem('graceos_vault_folder_name', dirHandle.name);

    await initializeDatabaseFolder(dirHandle);

    return dirHandle.name;
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error selecting folder:', err);
    }
    return null;
  }
}

/**
 * 6. ஆப் திறக்கும் போது தானாக இணைப்பை மீட்டெடுத்தல்
 */
export async function initVaultFolder() {
  try {
    const savedHandle = await getStoredHandle();
    if (savedHandle) {
      const hasPerm = await verifyPermission(savedHandle, true);
      if (hasPerm) {
        window.__vaultRootDirHandle = savedHandle;
        return savedHandle.name;
      }
    }
  } catch (e) {
    console.warn('Init vault folder fallback:', e);
  }
  return localStorage.getItem('graceos_vault_folder_name') || null;
}

export function isVaultConnected() {
  return !!window.__vaultRootDirHandle;
}

/**
 * 7. நேரடி டேட்டாபேஸ் கோப்பு ரைட்டர் (Immediate JSON Writer)
 */
export async function writeDatabaseFile(tableName, data) {
  if (!window.__vaultRootDirHandle) return false;
  try {
    const hasPerm = await verifyPermission(window.__vaultRootDirHandle, true);
    if (!hasPerm) return false;

    const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', { create: true });
    const fileHandle = await dbDir.getFileHandle(`${tableName}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return true;
  } catch (err) {
    console.error(`[writeDatabaseFile] Error writing ${tableName}.json:`, err);
    return false;
  }
}

export async function readDatabaseFile(tableName, defaultFallback = []) {
  if (!window.__vaultRootDirHandle) return defaultFallback;
  try {
    const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', { create: false });
    const fileHandle = await dbDir.getFileHandle(`${tableName}.json`, { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return defaultFallback;
  }
}

/**
 * 8. பேக்கப் ஸ்னாப்ஷாட் நேரடியாக எழுதுதல்
 */
export async function createBackupSnapshot(fullPayload) {
  if (!window.__vaultRootDirHandle) return null;

  try {
    const hasPerm = await verifyPermission(window.__vaultRootDirHandle, true);
    if (!hasPerm) return null;

    const backupDir = await window.__vaultRootDirHandle.getDirectoryHandle('backup', { create: true });
    const now = new Date();
    const dateTag = now.toISOString().slice(0, 10).replace(/-/g, '_');
    const timeTag = Date.now().toString().slice(-4);
    const fileName = `backup_snapshot_${dateTag}_${timeTag}.json`;

    const fileHandle = await backupDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(fullPayload, null, 2));
    await writable.close();

    return fileName;
  } catch (err) {
    console.error('Failed to write backup snapshot to physical disk:', err);
    return null;
  }
}