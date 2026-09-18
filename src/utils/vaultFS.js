// src/utils/vaultFS.js
// GraceOS Web Storage & Snapshot Cache (Pure Web & Vercel Safe)

const VAULT_ROOT_KEY = 'graceos_vault_root';
const VAULT_CACHE_KEY = 'graceos_web_vault_data';

const safeJsonParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const resolvePath = (root, child) => {
  const normalizedRoot = root.endsWith('\\') || root.endsWith('/') ? root.slice(0, -1) : root;
  return `${normalizedRoot}/${child.startsWith('\\') || child.startsWith('/') ? child.slice(1) : child}`;
};

export const isVaultConnected = () => {
  return true;
};

export const initVaultFolder = async () => {
  const root = localStorage.getItem(VAULT_ROOT_KEY) || 'Web Cloud Storage';
  localStorage.setItem(VAULT_ROOT_KEY, root);
  return root;
};

export const selectVaultFolder = async () => {
  const fallback = window.prompt(
    'Enter GraceOS Vault Storage Name:',
    localStorage.getItem(VAULT_ROOT_KEY) || 'GraceOS Web Vault'
  );
  if (fallback) {
    localStorage.setItem(VAULT_ROOT_KEY, fallback);
    return fallback;
  }
  return localStorage.getItem(VAULT_ROOT_KEY) || 'Web Storage';
};

export const writeDatabaseFile = async (fileName, payload) => {
  try {
    const existing = safeJsonParse(localStorage.getItem(VAULT_CACHE_KEY), {});
    existing[fileName] = {
      payload,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(existing));
    return resolvePath('WebStorage', fileName);
  } catch (err) {
    console.warn('Vault write fallback error:', err);
    return null;
  }
};

export const readDatabaseFile = async (fileName) => {
  try {
    const existing = safeJsonParse(localStorage.getItem(VAULT_CACHE_KEY), {});
    return existing[fileName]?.payload || null;
  } catch {
    return null;
  }
};

export const createBackupSnapshot = async (payload) => {
  const timestamp = new Date();
  const fileName = `backup_${timestamp.toISOString().slice(0, 10).replace(/-/g, '_')}_${Date.now().toString().slice(-4)}.json`;
  await writeDatabaseFile(fileName, payload);
  return fileName;
};

export const readVaultSnapshot = async (snapshotName) => {
  return await readDatabaseFile(snapshotName);
};