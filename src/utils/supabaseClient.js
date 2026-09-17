import { createClient } from '@supabase/supabase-js';

const getCredentials = () => {
  try {
    const local = localStorage.getItem('graceos_supabase_config');
    const parsed = local ? JSON.parse(local) : {};
    
    const url = parsed.supabaseUrl || 
                import.meta.env.VITE_SUPABASE_URL || 
                'https://ximqamzipltgnqwbroko.supabase.co';

    const key = parsed.supabaseAnonKey || 
                import.meta.env.VITE_SUPABASE_ANON_KEY || 
                import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
                'sb_publishable_9jQ0KP3sH5Sxo1H6RFVG-w_78ZfRC4m';

    return { url, key };
  } catch {
    return { 
      url: 'https://ximqamzipltgnqwbroko.supabase.co', 
      key: 'sb_publishable_9jQ0KP3sH5Sxo1H6RFVG-w_78ZfRC4m' 
    };
  }
};

const { url, key } = getCredentials();

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// கோப்பின் அடியில் இதைச் சேர்க்கவும்:
if (typeof window !== 'undefined') {
  window.supabase = supabase;
}