// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Local Storage-லிருந்து சமீபத்திய Key-களைப் பெறுதல்
export function getActiveSupabaseCredentials() {
  let rawUrl = '';
  let rawKey = '';

  if (typeof localStorage !== 'undefined') {
    for (const storageKey of ['graceos_unified_cloud_config', 'graceos_supabase_config']) {
      try {
        const rawConfig = localStorage.getItem(storageKey);
        if (!rawConfig) continue;

        const parsed = JSON.parse(rawConfig);
        if (!rawUrl && parsed.supabaseUrl) rawUrl = parsed.supabaseUrl;
        if (!rawKey && parsed.supabaseAnonKey) rawKey = parsed.supabaseAnonKey;
      } catch (err) {
        console.error(`[Supabase Config Parse Error: ${storageKey}]:`, err);
      }
    }
  }

  // 3. Fallback to Vite Env
  if (!rawUrl) rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
  if (!rawKey) {
    rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  }

  let url = String(rawUrl || '').trim();
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  url = url.replace(/\/+$/, '');

  return { url, key: String(rawKey || '').trim() };
}

let cachedClient = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase() {
  const { url, key } = getActiveSupabaseCredentials();

  if (!url || !key || !url.startsWith('http')) {
    console.warn('[Supabase Client] Valid URL or anon key is not configured.', {
      url,
      keyLength: key?.length || 0
    });
    return null;
  }

  // Credentials மாறினால் புதிய Client உருவாக்குதல்
  if (!cachedClient || lastUsedUrl !== url || lastUsedKey !== key) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    lastUsedUrl = url;
    lastUsedKey = key;
  }

  return cachedClient;
}

// Default export compatibility
export const supabase = {
  from: (table) => {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase Credentials இல்லை! Settings சென்று URL மற்றும் Key-ஐ பதிவு செய்யவும்.');
    }
    return client.from(table);
  }
};