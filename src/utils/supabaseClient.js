// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

let cachedClient = null;
let lastUrl = '';
let lastKey = '';

/**
 * Settings பக்கத்தில் பயனரால் சேமிக்கப்பட்ட Supabase விவரங்களைப் பெற்று கிளையன்ட்டை வழங்கும்
 */
export function getSupabase() {
  try {
    const savedConfig = localStorage.getItem('graceos_unified_cloud_config') 
      || localStorage.getItem('graceos_supabase_config');

    if (!savedConfig) {
      return null;
    }

    const parsed = JSON.parse(savedConfig);
    const supabaseUrl = (parsed.supabaseUrl || '').trim();
    const supabaseAnonKey = (parsed.supabaseAnonKey || '').trim();

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('xyzcompany')) {
      return null;
    }

    if (cachedClient && lastUrl === supabaseUrl && lastKey === supabaseAnonKey) {
      return cachedClient;
    }

    lastUrl = supabaseUrl;
    lastKey = supabaseAnonKey;
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
    return cachedClient;
  } catch (err) {
    console.error('[SupabaseClient] Error initializing client from settings:', err);
    return null;
  }
}

/**
 * SettingsHub மற்றும் AdvancedBackupCloudHub எதிர்பார்க்கும் ஃபங்ஷன்
 */
export function initSupabaseFromVault() {
  return getSupabase();
}

/**
 * அமைப்புகள் மாற்றப்படும்போது கேச் செய்யப்பட்ட கிளையன்ட்டைப் புதுப்பிக்க
 */
export function resetSupabaseClient() {
  cachedClient = null;
  lastUrl = '';
  lastKey = '';
}

/**
 * Return the configured Supabase client or fail explicitly.
 * Callers should use getSupabase() when an offline/unconfigured state is valid,
 * and requireSupabase() when the operation cannot proceed without Supabase.
 */
export function requireSupabase() {
  const client = getSupabase();

  if (!client) {
    throw new Error('Supabase is not configured in Settings.');
  }

  return client;
}