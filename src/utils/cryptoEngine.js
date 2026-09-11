/**
 * GraceOS - Native Web Cryptography Engine (AES-GCM 256-bit)
 * Zero external packages needed. Runs natively in all modern browsers.
 */

// பாஸ்வர்டில் இருந்து 256-பிட் கீ தயாரிக்கும் முறை
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// 1. 🌟 முழு டேட்டாவையும் கடவுச்சொல் மூலம் என்க்ரிப்ட் செய்தல்
export async function encryptDataPayload(payloadObj, password) {
  try {
    const enc = new TextEncoder();
    const dataBytes = enc.encode(JSON.stringify(payloadObj));

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBytes
    );

    const combined = {
      format: 'GRACEOS_ENCRYPTED_VAULT_V2',
      salt: Array.from(salt),
      iv: Array.from(iv),
      cipher: Array.from(new Uint8Array(encrypted))
    };

    return JSON.stringify(combined);
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Encryption process failed.');
  }
}

// 2. 🌟 .godb கோப்பிலிருந்து பாஸ்வர்டு கொடுத்து தரவை மீட்டெடுத்தல்
export async function decryptDataPayload(encryptedJsonString, password) {
  try {
    const parsed = JSON.parse(encryptedJsonString);
    if (parsed.format !== 'GRACEOS_ENCRYPTED_VAULT_V2') {
      throw new Error('Invalid or corrupted GraceOS backup file.');
    }

    const salt = new Uint8Array(parsed.salt);
    const iv = new Uint8Array(parsed.iv);
    const cipherBytes = new Uint8Array(parsed.cipher);

    const key = await deriveKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      cipherBytes
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    throw new Error('Incorrect password or corrupted file.');
  }
}