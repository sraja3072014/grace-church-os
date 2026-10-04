// src/utils/vaultStore.js
import { isVaultConnected } from './vaultFS';
import { syncLocalVaultToCloud } from './cloudSyncEngine';

// ஆப் இயங்கும்போது அதிவேகமாக செயல்படுவதற்கான மெமரி கேச் (In-Memory RAM Cache)
const memoryCache = new Map();

/**
 * 1. கோர் டேபிள் பெயர்கள் (Core Storage Entity Keys)
 */
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
  ADVANCED_CONFIG: 'app_advanced_config'
};

/**
 * லோக்கல் ஹார்ட் டிஸ்க் (/database/tableName.json) அல்லது localStorage-லிருந்து வாசித்தல்
 */
export async function getVaultData(tableName, defaultFallback = []) {
  if (memoryCache.has(tableName)) {
    return memoryCache.get(tableName);
  }

  // 1. லோக்கல் ஹார்ட் டிஸ்க் ரூட் போல்டர் மவுண்ட் செய்யப்பட்டிருந்தால் அங்கிருந்து வாசித்தல்
  if (isVaultConnected() && window.__vaultRootDirHandle) {
    try {
      const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', { create: true });
      const fileHandle = await dbDir.getFileHandle(`${tableName}.json`, { create: false });
      const file = await fileHandle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);
      memoryCache.set(tableName, parsed);
      return parsed;
    } catch {
      // ஃபால்பேக் நிலைக்குச் செல்லுதல்
    }
  }

  // 2. LocalStorage Fallback
  try {
    const localKey = VAULT_KEYS[tableName.toUpperCase()] || tableName;
    const raw = localStorage.getItem(localKey);
    const parsed = raw ? JSON.parse(raw) : defaultFallback;
    memoryCache.set(tableName, parsed);
    return parsed;
  } catch {
    return defaultFallback;
  }
}

/**
 * லோக்கல் ஹார்ட் டிஸ்கில் (/database/tableName.json) மற்றும் LocalStorage-ல் எழுதுதல்
 */
export async function setVaultData(tableName, data, triggerCloudRelay = true) {
  memoryCache.set(tableName, data);

  // 1. LocalStorage-ல் சேமித்தல்
  const localKey = VAULT_KEYS[tableName.toUpperCase()] || tableName;
  try {
    localStorage.setItem(localKey, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error(`[VaultStore Error] LocalStorage-ல் எழுதுவதில் பிழை:`, err);
  }

  // 2. மவுண்ட் செய்யப்பட்ட ஹார்ட் டிஸ்க்கில் எழுதுதல்
  if (isVaultConnected() && window.__vaultRootDirHandle) {
    try {
      const dbDir = await window.__vaultRootDirHandle.getDirectoryHandle('database', { create: true });
      const fileHandle = await dbDir.getFileHandle(`${tableName}.json`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (err) {
      console.error(`[VaultStore Error] ${tableName}.json கோப்பில் எழுதுவதில் பிழை:`, err);
    }
  }

  // 3. கிளவுட் ரிலே
  if (triggerCloudRelay && navigator.onLine) {
    syncLocalVaultToCloud().catch(err => {
      console.warn('[Cloud Sync Notice] பின்னணி கிளவுட் ஒத்திசைவு நிலுவையில் உள்ளது:', err);
    });
  }
}

export function clearVaultCache() {
  memoryCache.clear();
}

/**
 * 2. Local File Store Engine (முழுமையான JSON பேக்கப் எக்ஸ்போர்ட் & இம்போர்ட்)
 */
export const localFileStore = {
  async exportFullJSONVault(customFileName) {
    const backupData = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      engine: 'GraceOS Dual-Tree Local Vault',
      data: {}
    };

    for (const [entityKey, storageKey] of Object.entries(VAULT_KEYS)) {
      backupData.data[entityKey] = await getVaultData(entityKey.toLowerCase(), JSON.parse(localStorage.getItem(storageKey) || '[]'));
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    const fileName = customFileName || `GraceOS_LocalVault_${dateStr}.json`;
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },

  async restoreFromJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const payload = parsed.data || parsed;

          for (const [key, val] of Object.entries(payload)) {
            const tableKey = key.toLowerCase();
            await setVaultData(tableKey, val, false);
          }

          clearVaultCache();
          window.dispatchEvent(new Event('storage'));
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
};

/**
 * 3. SQL File Store Engine (SQLite / PostgreSQL Schema & Dump Generator)
 */
export const sqlFileStore = {
  sanitize(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  },

  async generateSQLDump() {
    const church = await getVaultData('church', {});
    const members = await getVaultData('members', []);
    const finance = await getVaultData('finance', []);
    const expenses = await getVaultData('expenses', []);
    const attendance = await getVaultData('attendance', []);
    const visitors = await getVaultData('visitors', []);

    let sql = `-- =========================================================\n`;
    sql += `-- GraceOS Automated SQL Storage Dump (Offline Archive)\n`;
    sql += `-- Church: ${church.churchName || 'Grace Central Cathedral'}\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `-- =========================================================\n\n`;

    // 1. Members Table DDL & DML
    sql += `CREATE TABLE IF NOT EXISTS members (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  full_name VARCHAR(255) NOT NULL,\n`;
    sql += `  phone VARCHAR(32),\n`;
    sql += `  email VARCHAR(128),\n`;
    sql += `  family_role VARCHAR(64),\n`;
    sql += `  branch_name VARCHAR(128),\n`;
    sql += `  joined_date DATE\n`;
    sql += `);\n\n`;

    members.forEach(m => {
      const id = this.sanitize(m.id || Math.random().toString(36).substr(2, 9));
      const name = this.sanitize(m.fullName || m.name || 'Member');
      const phone = this.sanitize(m.phone || '');
      const email = this.sanitize(m.email || '');
      const role = this.sanitize(m.familyRole || m.role || 'Member');
      const branch = this.sanitize(m.branch || church.activeCampus || 'Headquarters');
      const date = this.sanitize(m.joinedDate || new Date().toISOString().slice(0, 10));

      sql += `INSERT INTO members (id, full_name, phone, email, family_role, branch_name, joined_date) VALUES (${id}, ${name}, ${phone}, ${email}, ${role}, ${branch}, ${date});\n`;
    });
    sql += `\n`;

    // 2. Finance Records DDL & DML
    sql += `CREATE TABLE IF NOT EXISTS finance_records (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  donor_name VARCHAR(255),\n`;
    sql += `  amount DECIMAL(12, 2) NOT NULL,\n`;
    sql += `  category VARCHAR(64),\n`;
    sql += `  payment_mode VARCHAR(32),\n`;
    sql += `  transaction_date DATE\n`;
    sql += `);\n\n`;

    finance.forEach(f => {
      const id = this.sanitize(f.id || Math.random().toString(36).substr(2, 9));
      const donor = this.sanitize(f.donorName || f.contributor || 'Anonymous');
      const amount = Number(f.amount || 0).toFixed(2);
      const category = this.sanitize(f.category || 'Tithe');
      const mode = this.sanitize(f.paymentMode || f.mode || 'Cash');
      const date = this.sanitize(f.date || new Date().toISOString().slice(0, 10));

      sql += `INSERT INTO finance_records (id, donor_name, amount, category, payment_mode, transaction_date) VALUES (${id}, ${donor}, ${amount}, ${category}, ${mode}, ${date});\n`;
    });
    sql += `\n`;

    // 3. Attendance Logs DDL & DML
    sql += `CREATE TABLE IF NOT EXISTS attendance_logs (\n`;
    sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
    sql += `  member_id VARCHAR(64),\n`;
    sql += `  service_title VARCHAR(128),\n`;
    sql += `  checkin_time TIMESTAMP\n`;
    sql += `);\n\n`;

    attendance.forEach(a => {
      const id = this.sanitize(a.id || Math.random().toString(36).substr(2, 9));
      const memId = this.sanitize(a.memberId || '');
      const title = this.sanitize(a.serviceTitle || a.service || 'Sunday Service');
      const time = this.sanitize(a.timestamp || new Date().toISOString());

      sql += `INSERT INTO attendance_logs (id, member_id, service_title, checkin_time) VALUES (${id}, ${memId}, ${title}, ${time});\n`;
    });
    sql += `\n`;

    return sql;
  },

  async exportToSQLFile(customFileName) {
    const dump = await this.generateSQLDump();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    const fileName = customFileName || `GraceOS_Database_Dump_${dateStr}.sql`;
    const blob = new Blob([dump], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
};