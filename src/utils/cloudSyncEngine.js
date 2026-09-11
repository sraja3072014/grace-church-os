import { createClient } from '@supabase/supabase-js';

// Supabase Environment Credentials (LocalStorage அல்லது .env மூலம் பெறலாம்)
const getSupabaseConfig = () => {
  try {
    const raw = localStorage.getItem('graceos_supabase_config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const syncLocalVaultToCloud = async () => {
  const config = getSupabaseConfig();
  if (!config || !config.url || !config.anonKey) {
    return { success: false, reason: 'SUPABASE_NOT_CONFIGURED' };
  }

  // இணைய இணைப்பு உள்ளதா எனச் சரிபார்த்தல்
  if (!navigator.onLine) {
    return { success: false, reason: 'OFFLINE' };
  }

  const supabase = createClient(config.url, config.anonKey);

  try {
    // 1. விசுவாசிகள் தரவு ஒத்திசைவு
    const families = JSON.parse(localStorage.getItem('app_members_family_database') || '[]');
    if (families.length > 0) {
      await supabase.from('families').upsert(
        families.map(f => ({
          family_id: f.familyId,
          family_name: f.familyName,
          area: f.area,
          data_payload: f,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'family_id' }
      );
    }

    // 2. நிதி மற்றும் 80G லெட்ஜர் ஒத்திசைவு
    const ledger = JSON.parse(localStorage.getItem('app_finance_transactions_ledger') || '[]');
    if (ledger.length > 0) {
      await supabase.from('finance_ledger').upsert(
        ledger.map(tx => ({
          receipt_id: tx.id,
          donor_name: tx.member || tx.donor,
          amount: tx.amount,
          category: tx.category,
          date: tx.date,
          created_at: new Date().toISOString()
        })),
        { onConflict: 'receipt_id' }
      );
    }

    // 3. ஒத்திசைவு நேரத்தைப் பதிவு செய்தல்
    const syncTimestamp = new Date().toISOString();
    localStorage.setItem('graceos_last_cloud_sync', syncTimestamp);

    return { success: true, timestamp: syncTimestamp };
  } catch (error) {
    console.error('Supabase Auto-Sync Error:', error);
    return { success: false, reason: error.message };
  }
};