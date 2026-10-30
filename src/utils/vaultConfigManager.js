// src/utils/vaultConfigManager.js

const CONFIG_VAULT_KEY = 'grace_os_vault_credentials';

// உள்ளூர் சேமிப்பகத்திலிருந்து கான்பிகரேஷனை எடுத்தல்
export const readVaultConfig = async () => {
  try {
    // 1. உள்ளூர் கோப்பு முறைமை அல்லது உள்ளூர் பெட்டகத்தில் இருந்து எடுத்தல்
    const rawData = localStorage.getItem(CONFIG_VAULT_KEY);
    if (!rawData) return null;

    // எளிய Base64 மறைகுறியீடு நீக்கம் (Obfuscation)
    const decoded = JSON.parse(atob(rawData));
    if (decoded.url && decoded.anonKey) {
      return decoded;
    }
  } catch (err) {
    console.error('[VaultConfig] கான்பிகரேஷன் படிப்பதில் பிழை:', err);
  }
  return null;
};

// புதிய URL & Key-ஐ உள்ளூர் சேமிப்பகத்தில் பாதுகாப்பாக எழுதுதல்
export const writeVaultConfig = async (url, anonKey) => {
  try {
    const payload = JSON.stringify({
      url: url.trim(),
      anonKey: anonKey.trim(),
      configuredAt: new Date().toISOString()
    });
    
    // கோப்பிலோ அல்லது உள்ளூர் வோல்ட்டிலோ என்கோட் செய்து சேமித்தல்
    localStorage.setItem(CONFIG_VAULT_KEY, btoa(payload));
    return true;
  } catch (err) {
    console.error('[VaultConfig] சேமிப்பதில் பிழை:', err);
    return false;
  }
};

// உள்ளூர் சேமிப்பகத்தில் இருந்து நீக்குதல் (Disconnect)
export const clearVaultConfig = () => {
  localStorage.removeItem(CONFIG_VAULT_KEY);
};