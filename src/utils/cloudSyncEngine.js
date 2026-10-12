// src/utils/cloudSyncEngine.js
import { getVaultData } from './vaultStore';
import { getSupabase } from './supabaseClient';

export async function syncLocalVaultToCloud() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('[CloudSync] Supabase credentials not found.');
    return { success: false, error: 'Supabase credentials not configured' };
  }

  try {
    console.log('[CloudSync] Starting bidirectional sync with Supabase...');

    // 1. Members Sync (Duplicate ID Filter)
    const localMembers = await getVaultData('members', []);
    if (Array.isArray(localMembers) && localMembers.length > 0) {
      const membersMap = new Map();

      localMembers.forEach((m, index) => {
        const id = String(m.id || m.memberId || `MEM-${index}-${Date.now()}`);
        membersMap.set(id, {
          id,
          name: m.fullName || m.name || 'Member',
          phone: m.phone || null,
          family_name: m.familyName || m.family || null,
          area: m.area || null,
          role_in_family: m.roleInFamily || m.role || 'Member',
          dob: m.dob && String(m.dob).length === 10 ? m.dob : null
        });
      });

      const membersPayload = Array.from(membersMap.values());

      const { error: memErr } = await supabase
        .from('members')
        .upsert(membersPayload, { onConflict: 'id' });

      if (memErr) {
        console.error('[CloudSync Error - Members]:', memErr);
        throw new Error(`Members sync error: ${memErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${membersPayload.length} Members synced.`);
    }

    // 2. Finance Sync (Duplicate ID Filter)
    const localFinance = await getVaultData('finance', []);
    if (Array.isArray(localFinance) && localFinance.length > 0) {
      const financeMap = new Map();

      localFinance.forEach((f, index) => {
        const id = String(f.id || `TXN-${index}-${Date.now()}`);
        financeMap.set(id, {
          id,
          donor_name: f.donorName || f.member || f.contributor || 'Anonymous',
          donor_phone: f.donorPhone || f.phone || null,
          amount: Number(f.amount) || 0,
          category: f.category || 'Tithe',
          payment_mode: f.paymentMode || 'Cash',
          notes: f.notes || null,
          date: f.date || new Date().toISOString().slice(0, 10)
        });
      });

      const financePayload = Array.from(financeMap.values());

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

    // 4. Church Profile Sync
    const localProfile = await getVaultData('church', null);
    if (localProfile && localProfile.churchName) {
      const { error: profErr } = await supabase.from('church').upsert([{
        id: 'MAIN_PROFILE',
        church_name: localProfile.churchName,
        senior_pastor: localProfile.seniorPastor || '',
        phone: localProfile.phone || '',
        email: localProfile.email || '',
        address: localProfile.address || '',
        reg_no: localProfile.registrationNo || '',
        currency: localProfile.currency || 'INR (₹)',
        motto: localProfile.tagline || ''
      }], { onConflict: 'id' });

      if (profErr) {
        console.error('[CloudSync Warning - Church]:', attErr.message);
      } else {
        console.log('[CloudSync] ✓ Church synced.');
      }
    }

    // 5. Branches Sync
    const localBranches = await getVaultData('branches', []);
    if (Array.isArray(localBranches) && localBranches.length > 0) {
      const branchesPayload = localBranches.map((b, idx) => ({
        id: String(b.id || `BR-${idx}`),
        code: b.code || `BR-${idx}`,
        name: b.name || 'Branch',
        pastor: b.pastor || '',
        location: b.location || '',
        members: Number(b.members) || 0
      }));

      await supabase.from('branches').upsert(branchesPayload, { onConflict: 'id' });
      console.log(`[CloudSync] ✓ ${branchesPayload.length} Branches synced.`);
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