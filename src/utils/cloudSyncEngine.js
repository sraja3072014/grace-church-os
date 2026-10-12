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
    let localProfile = await getVaultData('church_profile', null);
    if (!localProfile) {
      const lsProfile = localStorage.getItem('graceos_main_church');
      if (lsProfile) localProfile = JSON.parse(lsProfile);
    }

    if (localProfile && (localProfile.churchName || localProfile.church_name)) {
      const profilePayload = {
        id: 'MAIN_PROFILE',
        church_name: localProfile.churchName || localProfile.church_name || 'Grace City Church',
        senior_pastor: localProfile.seniorPastor || localProfile.senior_pastor || '',
        phone: localProfile.phone || '',
        email: localProfile.email || '',
        address: localProfile.address || '',
        reg_no: localProfile.registrationNo || localProfile.trustRegNo || localProfile.reg_no || '',
        currency: localProfile.currency || 'INR (₹)',
        motto: localProfile.motto || localProfile.tagline || ''
      };

      const { error: profErr } = await supabase
        .from('church_profile')
        .upsert([profilePayload], { onConflict: 'id' });

      if (profErr) {
        console.error('[CloudSync Error - Church Profile]:', profErr);
        throw new Error(`Church profile sync error: ${profErr.message}`);
      }
      console.log('[CloudSync] ✓ Church Profile synced successfully.');
    }

    // 5. Branches Sync
    let localBranches = await getVaultData('branches', []);
    if (!Array.isArray(localBranches) || localBranches.length === 0) {
      const lsBranches = localStorage.getItem('graceos_branches');
      if (lsBranches) localBranches = JSON.parse(lsBranches);
    }

    if (Array.isArray(localBranches) && localBranches.length > 0) {
      const branchMap = new Map();

      localBranches.forEach((b, idx) => {
        const branchId = String(b.id || b.code || `BR-${idx}`);
        branchMap.set(branchId, {
          id: branchId,
          code: b.code || `BR-${idx}`,
          name: b.name || 'Branch Campus',
          pastor: b.pastor || '',
          location: b.location || '',
          members: Number(b.members) || 0
        });
      });

      const branchesPayload = Array.from(branchMap.values());
      const { error: brErr } = await supabase
        .from('branches')
        .upsert(branchesPayload, { onConflict: 'id' });

      if (brErr) {
        console.error('[CloudSync Error - Branches]:', brErr);
        throw new Error(`Branches sync error: ${brErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${branchesPayload.length} Branches synced successfully.`);
    }

    // 6. Events Sync
    const localEvents = await getVaultData('events', []);
    if (Array.isArray(localEvents) && localEvents.length > 0) {
      const eventsPayload = localEvents.map((ev, index) => ({
        id: String(ev.id || `EV-${index}-${Date.now()}`),
        title: ev.title || 'Church Event',
        date: ev.date || new Date().toISOString().slice(0, 10),
        time: ev.time || '',
        venue: ev.venue || '',
        coordinator: ev.coordinator || '',
        description: ev.description || ''
      }));

      const { error: eventsErr } = await supabase
        .from('events')
        .upsert(eventsPayload, { onConflict: 'id' });

      if (eventsErr) {
        console.error('[CloudSync Error - Events]:', eventsErr);
        throw new Error(`Events sync error: ${eventsErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${eventsPayload.length} Events synced.`);
    }

    // 7. Expenses Sync
    const localExpenses = await getVaultData('expenses', []);
    if (Array.isArray(localExpenses) && localExpenses.length > 0) {
      const expensesPayload = localExpenses.map((ex, index) => ({
        id: String(ex.id || `EXP-${index}-${Date.now()}`),
        category: ex.category || 'General',
        amount: Number(ex.amount) || 0,
        spent_by: ex.spentBy || ex.spent_by || '',
        payment_mode: ex.paymentMode || ex.payment_mode || 'Cash',
        notes: ex.notes || '',
        date: ex.date || new Date().toISOString().slice(0, 10)
      }));

      const { error: expensesErr } = await supabase
        .from('expenses')
        .upsert(expensesPayload, { onConflict: 'id' });

      if (expensesErr) {
        console.error('[CloudSync Error - Expenses]:', expensesErr);
        throw new Error(`Expenses sync error: ${expensesErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${expensesPayload.length} Expenses synced.`);
    }

    // 8. Prayers Sync
    const localPrayers = await getVaultData('prayers', []);
    if (Array.isArray(localPrayers) && localPrayers.length > 0) {
      const prayersPayload = localPrayers.map((pr, index) => ({
        id: String(pr.id || `PR-${index}-${Date.now()}`),
        requester_name: pr.requesterName || pr.requester || pr.name || 'Anonymous',
        phone: pr.phone || '',
        request: pr.request || '',
        status: pr.status || 'Pending',
        category: pr.category || 'Personal',
        date: pr.date || new Date().toISOString().slice(0, 10)
      }));

      const { error: prayersErr } = await supabase
        .from('prayers')
        .upsert(prayersPayload, { onConflict: 'id' });

      if (prayersErr) {
        console.error('[CloudSync Error - Prayers]:', prayersErr);
        throw new Error(`Prayers sync error: ${prayersErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${prayersPayload.length} Prayers synced.`);
    }

    // 9. Visitors Sync
    const localVisitors = await getVaultData('visitors', []);
    if (Array.isArray(localVisitors) && localVisitors.length > 0) {
      const visitorsPayload = localVisitors.map((visitor, index) => ({
        id: String(visitor.id || `VIS-${index}-${Date.now()}`),
        name: visitor.name || visitor.fullName || 'Visitor',
        phone: visitor.phone || '',
        address: visitor.address || visitor.area || '',
        visited_date: visitor.visitedDate || visitor.visitDate || visitor.date || new Date().toISOString().slice(0, 10),
        referred_by: visitor.referredBy || visitor.invitedBy || '',
        notes: visitor.notes || ''
      }));

      const { error: visitorsErr } = await supabase
        .from('visitors')
        .upsert(visitorsPayload, { onConflict: 'id' });

      if (visitorsErr) {
        console.error('[CloudSync Error - Visitors]:', visitorsErr);
        throw new Error(`Visitors sync error: ${visitorsErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${visitorsPayload.length} Visitors synced.`);
    }

    // 10. Lease Vault Sync (complete field mapping)
    let localLease = await getVaultData('lease_vault', []);
    if (!Array.isArray(localLease) || localLease.length === 0) {
      localLease = await getVaultData('properties', []);
    }

    if (Array.isArray(localLease) && localLease.length > 0) {
      const leasePayload = localLease.map((item, index) => {
        const id = String(item.id || `LSE-${index}-${Date.now()}`);
        return {
          id,
          property_name: item.propertyName || item.title || item.name || 'Church Property',
          ownership_type: item.ownershipType || 'RENTED',
          category: item.category || 'SANCTUARY',
          branch: item.branch || 'Main Campus',
          location: item.location || '',
          land_area: item.landArea || '',
          landlord_name: item.landlordName || '',
          phone: item.phone || item.landlordPhone || '',
          monthly_rent: Number(item.monthlyRent) || 0,
          advance_amount: Number(item.advanceDeposit || item.advanceAmount) || 0,
          lease_start: item.leaseStartDate || item.leaseStart || '',
          lease_end: item.leaseExpiryDate || item.leaseEnd || '',
          eb_consumer_no: item.ebConsumerNo || '',
          doc_no: item.docNo || '',
          survey_no: item.surveyNo || '',
          patta_no: item.pattaNo || '',
          notes: item.notes || item.termsAndConditions || ''
        };
      });

      const { error: leaseErr } = await supabase
        .from('lease_vault')
        .upsert(leasePayload, { onConflict: 'id' });

      if (leaseErr) {
        console.error('[CloudSync Error - Lease Vault]:', leaseErr);
        throw new Error(`Lease vault sync error: ${leaseErr.message}`);
      }
      console.log(`[CloudSync] ✓ ${leasePayload.length} Lease records synced.`);
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