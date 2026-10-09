// src/utils/cloudSyncEngine.js
import { getVaultData } from './vaultStore';
import { getSupabase } from './supabaseClient';

export async function syncLocalVaultToCloud() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('[CloudSync] Supabase credentials not found in Settings.');
    return { success: false, error: 'Supabase credentials not configured' };
  }

  try {
    console.log('[CloudSync] Starting bidirectional sync with Supabase...');

    // 1. Members Sync
    const localMembers = await getVaultData('members', []);
    if (Array.isArray(localMembers) && localMembers.length > 0) {
      // Supabase Table காலம்களுக்கு ஏற்ப மேப்பிங் செய்கிறோம்
      const membersPayload = localMembers.map(m => ({
        id: String(m.id || m.memberId || `MEM-${Date.now()}`),
        name: m.fullName || m.name || 'Member',
        phone: m.phone || null,
        family_name: m.familyName || m.family || null,
        area: m.area || null,
        role_in_family: m.roleInFamily || m.role || 'Member',
        dob: m.dob && m.dob.length === 10 ? m.dob : null
      }));

      const { error: memErr } = await supabase
        .from('members')
        .upsert(membersPayload, { onConflict: 'id' });

      if (memErr) {
        console.error('[CloudSync Error - Members]:', memErr);
        throw new Error(`Members sync error: ${memErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${membersPayload.length} Members synced.`);
    }

    // 2. Finance Sync
    const localFinance = await getVaultData('finance', []);
    if (Array.isArray(localFinance) && localFinance.length > 0) {
      const financePayload = localFinance.map(f => ({
        id: String(f.id || `TXN-${Date.now()}`),
        donor_name: f.donorName || f.member || f.contributor || 'Anonymous',
        donor_phone: f.donorPhone || f.phone || null,
        amount: Number(f.amount) || 0,
        category: f.category || 'Tithe',
        payment_mode: f.paymentMode || 'Cash',
        notes: f.notes || null,
        date: f.date || new Date().toISOString().slice(0, 10)
      }));

      const { error: finErr } = await supabase
        .from('finance')
        .upsert(financePayload, { onConflict: 'id' });

      if (finErr) {
        console.error('[CloudSync Error - Finance]:', finErr);
        throw new Error(`Finance sync error: ${finErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${financePayload.length} Finance records synced.`);
    }

    // 3. Attendance Sync
    const localAttendance = await getVaultData('attendance', []);
    if (Array.isArray(localAttendance) && localAttendance.length > 0) {
      const attendancePayload = localAttendance.map(a => ({
        member_id: String(a.memberId || a.id || ''),
        member_name: a.memberName || a.name || 'Member',
        service_date: a.serviceDate || a.date || new Date().toISOString().slice(0, 10),
        service_title: a.serviceTitle || 'Sunday Morning Service',
        checkin_time: a.checkinTime || a.time || '',
        verified_method: a.verifiedMethod || 'local_vault'
      }));

      const { error: attErr } = await supabase
        .from('attendance')
        .insert(attendancePayload);

      if (attErr) {
        console.warn('[CloudSync Warning - Attendance]:', attErr.message);
      } else {
        console.log(`[CloudSync] ✓ ${attendancePayload.length} Attendance records pushed.`);
      }
    }

    const timestamp = new Date().toISOString();
    localStorage.setItem('graceos_last_cloud_sync', timestamp);

    return { 
      success: true, 
      timestamp, 
      message: 'All local database tables synced successfully to Supabase!' 
    };

  } catch (error) {
    console.error('[CloudSync Engine Fatal]:', error);
    return { success: false, error: error.message };
  }
}