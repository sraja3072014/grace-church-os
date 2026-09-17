const VAULT_ROOT_KEY = 'graceos_vault_root';

// செயலி தற்போது Tauri டெஸ்க்டாப்பில் இயங்குகிறதா என அறிதல்
const isTauri = typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__);

// Rollup பில்டில் இருந்து பேக்கேஜ் பெயரை மறைக்க:
const TAURI_FS_PKG = '@tauri-apps/plugin-fs';
const TAURI_DIALOG_PKG = '@tauri-apps/plugin-dialog';

const safeJsonParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const resolvePath = (root, child) => {
  const normalizedRoot = root.endsWith('\\') || root.endsWith('/') ? root.slice(0, -1) : root;
  return `${normalizedRoot}${child.startsWith('\\') || child.startsWith('/') ? child : `\\${child}`}`;
};

const ensureVaultStructure = async (rootFolder) => {
  if (!rootFolder) return null;

  const databasePath = resolvePath(rootFolder, 'database');
  const backupPath = resolvePath(rootFolder, 'backup');

  if (isTauri) {
    try {
      const fs = await import(/* @vite-ignore */ TAURI_FS_PKG);
      await fs.mkdir(databasePath, { recursive: true });
      await fs.mkdir(backupPath, { recursive: true });
      return rootFolder;
    } catch {
      return rootFolder;
    }
  }

  return rootFolder;
};

export const initVaultFolder = async () => {
  try {
    const root = localStorage.getItem(VAULT_ROOT_KEY);
    if (!root) return null;
    return await ensureVaultStructure(root);
  } catch {
    return null;
  }
};

export const selectVaultFolder = async () => {
  if (isTauri) {
    try {
      const { open } = await import(/* @vite-ignore */ TAURI_DIALOG_PKG);
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select GraceOS Vault Root Folder',
        defaultPath: localStorage.getItem(VAULT_ROOT_KEY) || 'D:\\'
      });

      if (selected && typeof selected === 'string') {
        localStorage.setItem(VAULT_ROOT_KEY, selected);
        await ensureVaultStructure(selected);
        return selected;
      }
    } catch {
      // Fallback below
    }
  }

  const fallback = window.prompt('Enter GraceOS Vault Root Directory:', localStorage.getItem(VAULT_ROOT_KEY) || 'D:\\GraceOS');
  if (fallback) {
    localStorage.setItem(VAULT_ROOT_KEY, fallback);
    await ensureVaultStructure(fallback);
    return fallback;
  }

  return null;
};

export const isVaultConnected = () => {
  try {
    return Boolean(localStorage.getItem(VAULT_ROOT_KEY));
  } catch {
    return false;
  }
};

export const writeDatabaseFile = async (fileName, payload) => {
  const rootFolder = localStorage.getItem(VAULT_ROOT_KEY);
  if (!rootFolder) return null;

  const databaseDir = resolvePath(rootFolder, 'database');
  const filePath = resolvePath(databaseDir, fileName);

  if (isTauri) {
    try {
      const fs = await import(/* @vite-ignore */ TAURI_FS_PKG);
      await fs.mkdir(databaseDir, { recursive: true });
      await fs.writeTextFile(filePath, JSON.stringify(payload, null, 2));
      return filePath;
    } catch {
      // Fallback to cache below
    }
  }

  localStorage.setItem('graceos_vault_database_cache', JSON.stringify({
    fileName,
    filePath,
    payload,
    timestamp: new Date().toISOString()
  }));
  return filePath;
};

export const readDatabaseFile = async (fileName) => {
  const rootFolder = localStorage.getItem(VAULT_ROOT_KEY);
  if (!rootFolder) return null;

  const filePath = resolvePath(resolvePath(rootFolder, 'database'), fileName);

  if (isTauri) {
    try {
      const fs = await import(/* @vite-ignore */ TAURI_FS_PKG);
      const raw = await fs.readTextFile(filePath);
      return safeJsonParse(raw, null);
    } catch {
      return null;
    }
  }

  const cached = localStorage.getItem('graceos_vault_database_cache');
  if (cached) {
    const parsed = safeJsonParse(cached, null);
    if (parsed && parsed.fileName === fileName) {
      return parsed.payload;
    }
  }
  return null;
};

export const createBackupSnapshot = async (payload) => {
  const rootFolder = localStorage.getItem(VAULT_ROOT_KEY);
  if (!rootFolder) return null;

  const backupDir = resolvePath(rootFolder, 'backup');
  const timestamp = new Date();
  const fileName = `backup_snapshot_${timestamp.toISOString().slice(0, 10).replace(/-/g, '_')}_${Date.now().toString().slice(-4)}.json`;
  const filePath = resolvePath(backupDir, fileName);

  if (isTauri) {
    try {
      const fs = await import(/* @vite-ignore */ TAURI_FS_PKG);
      await fs.mkdir(backupDir, { recursive: true });
      await fs.writeTextFile(filePath, JSON.stringify(payload, null, 2));
      return fileName;
    } catch {
      // Fallback
    }
  }

  localStorage.setItem('graceos_vault_snapshot_cache', JSON.stringify({
    fileName,
    filePath,
    payload,
    timestamp: timestamp.toISOString()
  }));
  return fileName;
};

export const readVaultSnapshot = async (snapshotName) => {
  const rootFolder = localStorage.getItem(VAULT_ROOT_KEY);
  if (!rootFolder) return null;

  const filePath = resolvePath(resolvePath(rootFolder, 'backup'), snapshotName);

  if (isTauri) {
    try {
      const fs = await import(/* @vite-ignore */ TAURI_FS_PKG);
      const raw = await fs.readTextFile(filePath);
      return safeJsonParse(raw, null);
    } catch {
      return null;
    }
  }

  const cached = localStorage.getItem('graceos_vault_snapshot_cache');
  if (cached) {
    const parsed = safeJsonParse(cached, null);
    if (parsed && parsed.fileName === snapshotName) {
      return parsed.payload;
    }
  }
  return null;
};