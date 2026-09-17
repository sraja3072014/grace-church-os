import { isVaultConnected } from './vaultFS';
import { syncLocalVaultToCloud } from './cloudSyncEngine';

// ஆப் இயங்கும்போது அதிவேகமாக செயல்படுவதற்கான மெமரி கேச் (In-Memory RAM Cache)
const memoryCache = new Map();

/**
 * லோக்கல் ஹார்ட் டிஸ்க் (/database/tableName.json) கோப்பிலிருந்து தரவை வாசித்தல்
 * @param {string} tableName - கோப்பின் பெயர் (எ.கா: 'members', 'finance')
 * @param {any} defaultFallback - கோப்பு இல்லாதபோது தரவேண்டிய இயல்புநிலை தரவு
 */
export async function getVaultData(tableName, defaultFallback = []) {
  // 1. தற்காலிக நினைவகத்தில் (RAM) ஏற்கனவே ஏற்றப்பட்டிருந்தால் உடனடியாகத் தருதல்
  if (memoryCache.has(tableName)) {
    return memoryCache.get(tableName);
  }

  // 2. லோக்கல் ஹார்ட் டிஸ்க் ரூட் போல்டர் மவுண்ட் செய்யப்பட்டிருந்தால் அங்கிருந்து வாசித்தல்
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
      // கோப்பு இன்னும் உருவாக்கப்படவில்லை என்றால் ஃபால்பேக் தரவை நினைவகத்தில் வைத்தல்
      memoryCache.set(tableName, defaultFallback);
      return defaultFallback;
    }
  }

  // 3. ஹார்ட் டிரைவ் மவுண்ட் செய்யப்படாத நேரங்களில் ஃபால்பேக்
  return defaultFallback;
}

/**
 * லோக்கல் ஹார்ட் டிஸ்கில் (/database/tableName.json) நேரடியாக எழுதுதல்
 * @param {string} tableName - கோப்பின் பெயர்
 * @param {any} data - எழுதப்பட வேண்டிய முழுமையான தரவு
 * @param {boolean} triggerCloudRelay - மொபைல் போர்ட்டலுக்காக கிளவுடிற்கு அனுப்ப வேண்டுமா
 */
export async function setVaultData(tableName, data, triggerCloudRelay = true) {
  // 1. நினைவகத்தை உடனுக்குடன் புதுப்பித்தல்
  memoryCache.set(tableName, data);

  // 2. லோக்கல் ஹார்ட் டிரைவ் கோப்பில் (.json) நேரடியாக எழுதுதல்
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

  // 3. கிளவுட் ரிலே (மொபைல் ஆப் மற்றும் போர்ட்டல் சின்க்ரோனைசேஷன்)
  if (triggerCloudRelay && navigator.onLine) {
    syncLocalVaultToCloud().catch(err => {
      console.warn('[Cloud Sync Notice] பின்னணி கிளவுட் ஒத்திசைவு நிலுவையில் உள்ளது:', err);
    });
  }
}

/**
 * மெமரி கேச்சை முழுமையாக மீட்டமைத்தல்
 */
export function clearVaultCache() {
  memoryCache.clear();
}