// electron/main.cjs
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */
const isDev = !app.isPackaged;
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
const PROD_ENTRY = path.join(__dirname, '..', 'dist', 'index.html');
const MAX_LOAD_ATTEMPTS = 30;
const LOAD_RETRY_DELAY_MS = 500;

let mainWindow = null;

/* ------------------------------------------------------------------ *
 * Single-instance guard
 * ------------------------------------------------------------------ */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function resolvePayloadPath(payload, key = 'filePath') {
  if (payload === null || payload === undefined) return null;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    const candidate = payload[key] ?? payload.filePath ?? payload.dirPath ?? payload.path;
    return typeof candidate === 'string' && candidate.trim() ? candidate : null;
  }
  return null;
}

async function loadRendererWithRetry(win) {
  if (!win || win.isDestroyed()) return false;

  const target = isDev ? DEV_SERVER_URL : pathToFileURL(PROD_ENTRY).href;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
    if (win.isDestroyed()) return false;

    try {
      await win.loadURL(target);
      console.log(`[GraceOS] Renderer loaded on attempt ${attempt}`);
      return true;
    } catch (err) {
      lastError = err;
      console.warn(
        `[GraceOS] load attempt ${attempt}/${MAX_LOAD_ATTEMPTS} failed: ${err && err.message}`
      );
      if (attempt < MAX_LOAD_ATTEMPTS) await delay(LOAD_RETRY_DELAY_MS);
    }
  }

  if (isDev && DEV_SERVER_URL !== 'http://localhost:5173') {
    try {
      await win.loadURL('http://localhost:5173');
      console.log('[GraceOS] Connected on fallback port 5173');
      return true;
    } catch (err) {
      lastError = err;
    }
  }

  console.error('[GraceOS] Unable to load renderer:', lastError);
  try {
    await win.loadURL(
      'data:text/html;charset=utf-8,' +
        encodeURIComponent(
          `<html><body style="font-family:Segoe UI,sans-serif;background:#0b1220;color:#e5e7eb;padding:40px">
             <h2>GraceOS could not reach the renderer</h2>
             <p>Vite (${DEV_SERVER_URL}) did not start in time.</p>
             <pre style="color:#f87171">${String(lastError && lastError.message)}</pre>
           </body></html>`
        )
    );
  } catch { /* nothing else we can do */ }

  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    frame: true,
    backgroundColor: '#07050d',
    title: 'GraceOS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

function registerIpcHandlers() {
  ipcMain.handle('dialog:openDirectory', async () => {
    try {
      const parent = mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined;
      const result = await dialog.showOpenDialog(parent, {
        title: 'Select GraceOS Vault Folder',
        buttonLabel: 'Use this folder',
        properties: ['openDirectory', 'createDirectory'],
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return null;
      }
      return result.filePaths[0];
    } catch (err) {
      console.error('[IPC dialog:openDirectory]', err);
      return null;
    }
  });

  ipcMain.handle('fs:createDir', async (_event, payload) => {
    try {
      const dirPath = resolvePayloadPath(payload, 'dirPath');
      if (!dirPath) return { success: false, error: 'No directory path provided' };

      fs.mkdirSync(dirPath, { recursive: true });
      return { success: true, path: dirPath };
    } catch (err) {
      console.error('[IPC fs:createDir]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:writeFile', async (_event, payloadOrPath, maybeContent) => {
    try {
      let filePath;
      let content;

      if (payloadOrPath && typeof payloadOrPath === 'object' && !Buffer.isBuffer(payloadOrPath)) {
        filePath = payloadOrPath.filePath ?? payloadOrPath.path;
        content = payloadOrPath.content ?? payloadOrPath.data ?? '';
      } else {
        filePath = payloadOrPath;
        content = maybeContent ?? '';
      }

      if (typeof filePath !== 'string' || !filePath.trim()) {
        return { success: false, error: 'No file path provided' };
      }

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const serialized = typeof content === 'string'
        ? content
        : content instanceof Buffer
          ? content
          : JSON.stringify(content, null, 2);
      fs.writeFileSync(filePath, serialized, 'utf8');
      return {
        success: true,
        path: filePath,
        bytes: Buffer.byteLength(String(serialized), 'utf8'),
      };
    } catch (err) {
      console.error('[IPC fs:writeFile]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:readFile', async (_event, payloadOrPath) => {
    try {
      const filePath = resolvePayloadPath(payloadOrPath, 'filePath');
      if (!filePath) return { success: false, error: 'No file path provided' };

      if (!fs.existsSync(filePath)) {
        return { success: true, exists: false, path: filePath, content: null };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return { success: true, exists: true, path: filePath, content };
    } catch (err) {
      console.error('[IPC fs:readFile]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('fs:exists', async (_event, payloadOrPath) => {
    const target = resolvePayloadPath(payloadOrPath, 'filePath');
    return { success: true, exists: !!target && fs.existsSync(target) };
  });

  ipcMain.handle('shell:openPath', async (_event, payloadOrPath) => {
    const target = resolvePayloadPath(payloadOrPath, 'filePath');
    if (!target) return { success: false, error: 'No path provided' };
    const result = await shell.openPath(target);
    return { success: result === '', error: result || null };
  });
}

if (gotTheLock) {
  app.whenReady().then(async () => {
    registerIpcHandlers();
    const win = createWindow();
    await loadRendererWithRetry(win);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        const next = createWindow();
        void loadRendererWithRetry(next);
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (err) => {
  console.error('[GraceOS] Uncaught main-process exception:', err);
});