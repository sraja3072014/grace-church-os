import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getVaultData } from '../utils/vaultStore';

export function useAutoCloudSync() {
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
  const [lastSyncedAt, setLastSyncedAt] = useState(() => localStorage.getItem('graceos_last_cloud_sync') || null);
  const isRunningRef = useRef(false);

  const performSync = async () => {
    // இணைய இணைப்பு மற்றும் Supabase உள்ளமைவைச் சரிபார்த்தல்
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    if (!supabase) {
      setSyncStatus('idle');
      return;
    }

    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setSyncStatus('syncing');

    try {
      // 1. உள்ளூர் உறுப்பினர்கள் விவரங்களை Supabase members டேபிளுக்கு அனுப்புதல்
      const localMembers = await getVaultData('members', []);
      if (Array.isArray(localMembers) && localMembers.length > 0) {
        const payloadMembers = localMembers.flatMap(fam => {
          const head = fam.headMember ? [{
            family_id: fam.id?.toString() || 'FAM-1',
            full_name: fam.headMember.name || 'Member',
            phone: fam.headMember.phone || '',
            role: 'HEAD',
            campus: fam.area || 'Headquarters'
          }] : [];

          const otherMembers = (fam.members || []).map(m => ({
            family_id: fam.id?.toString() || 'FAM-1',
            full_name: m.name || 'Family Member',
            phone: m.phone || '',
            role: m.relation || 'MEMBER',
            campus: fam.area || 'Headquarters'
          }));

          return [...head, ...otherMembers];
        });

        if (payloadMembers.length > 0) {
          await supabase.from('members').upsert(payloadMembers, { onConflict: 'full_name,phone', ignoreDuplicates: false });
        }
      }

      // 2. நிதி மற்றும் தசமபாகங்களை finance_ledger டேபிளுக்கு அனுப்புதல்
      const localFinance = await getVaultData('finance', []);
      if (Array.isArray(localFinance) && localFinance.length > 0) {
        const payloadFinance = localFinance.map(tx => ({
          receipt_no: tx.receiptNo || tx.id?.toString() || `RCP-${Date.now()}`,
          donor_name: tx.donorName || tx.name || 'Anonymous Believer',
          donor_phone: tx.phone || '',
          category: tx.category || 'Tithe',
          amount: Number(tx.amount) || 0,
          payment_mode: tx.mode || 'UPI',
          is_80g_exempt: Boolean(tx.is80G),
          campus: tx.campus || 'Headquarters'
        }));

        await supabase.from('finance_ledger').upsert(payloadFinance, { onConflict: 'receipt_no', ignoreDuplicates: true });
      }

      // 3. ஜெபக் குறிப்புகளை prayer_requests டேபிளுக்கு அனுப்புதல்
      const localPrayers = await getVaultData('prayers', []);
      if (Array.isArray(localPrayers) && localPrayers.length > 0) {
        const payloadPrayers = localPrayers.map(p => ({
          requester_name: p.requester || 'Believer',
          phone: p.phone || '',
          petition: p.petition || p.request || '',
          status: p.status || 'UNDER_PRAYER'
        }));

        await supabase.from('prayer_requests').upsert(payloadPrayers, { onConflict: 'requester_name,petition', ignoreDuplicates: true });
      }

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(now);
      localStorage.setItem('graceos_last_cloud_sync', now);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Cloud auto-sync background error:', err);
      setSyncStatus('error');
    } finally {
      isRunningRef.current = false;
    }
  };

  useEffect(() => {
    // ஆப் தொடங்கிய 3 வினாடிகளில் முதல் சின்க் இயங்கும்
    const initialTimer = setTimeout(() => {
      performSync();
    }, 3000);

    // இணைய இணைப்பு மீண்டும் வரும் போது தானாக சின்க் ஆகும்
    const handleOnline = () => performSync();
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // அமைக்கப்பட்ட இடைவெளியில் (Default: ஒவ்வொரு 10 நிமிடங்களுக்கும்)
    const interval = setInterval(performSync, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { syncStatus, lastSyncedAt, triggerManualSync: performSync };
}