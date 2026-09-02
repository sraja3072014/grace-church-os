const DB_NAME = 'graceos_assets_db';
const STORE_NAME = 'wallpapers';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveLargeWallpaper = async (base64Data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(base64Data, 'active_custom_wallpaper');
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
};

export const getLargeWallpaper = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get('active_custom_wallpaper');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
};

export const deleteLargeWallpaper = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete('active_custom_wallpaper');
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
};