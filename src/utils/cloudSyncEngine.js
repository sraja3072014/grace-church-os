// src/utils/cloudSyncEngine.js
import { getSupabase } from './supabaseClient';
import { getVaultData } from './vaultStore';

function normalizeVisitorStage(visitor) {
  if (visitor?.is_converted || visitor?.funnelStage === 'CONVERTED') return 'CONVERTED';
  if (['1ST_VISIT', 'LEADER_CALLED', 'HOME_VISITED', 'CONVERTED'].includes(visitor?.pipeline_stage)) return visitor.pipeline_stage;
  if (['CONTACTED', 'calling_scheduled'].includes(visitor?.stage || visitor?.followUpStage)) return 'LEADER_CALLED';
  if (['PRAYER_MEET', 'home_visit', 'COMMITTED', 'ready_for_membership'].includes(visitor?.stage || visitor?.followUpStage)) return 'HOME_VISITED';
  return '1ST_VISIT';
}

export const syncVisitors = async (localVisitors = []) => {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('[CloudSync - Visitors] Supabase client not initialized. Skipping sync.');
    return { success: false, error: 'Supabase unconfigured', count: 0 };
  }

  try {
    const flatVisitorsPayload = (Array.isArray(localVisitors) ? localVisitors : []).map((v) => {
      const parsedLat = v.latitude ? parseFloat(v.latitude) : null;
      const parsedLng = v.longitude ? parseFloat(v.longitude) : null;
      const validCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
      const lat = validCoords ? parsedLat : null;
      const lng = validCoords ? parsedLng : null;
      const coords = v.gps_coordinates || (validCoords ? `${lat}, ${lng}` : null);
      const mapsUrl = v.maps_url || (validCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : '');

      return {
        id: String(v.id || `VIS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
        name: String(v.name || v.fullName || 'Anonymous Visitor').trim(),
        phone: String(v.phone || '').trim(),
        area: String(v.area || '').trim(),
        latitude: lat,
        longitude: lng,
        gps_coordinates: coords,
        maps_url: mapsUrl,
        pipeline_stage: v.is_converted ? 'CONVERTED' : (v.pipeline_stage || normalizeVisitorStage(v)),
        call_notes: v.call_notes || null,
        home_visit_date: v.home_visit_date || null,
        assigned_leader: v.assigned_leader || null,
        is_converted: Boolean(v.is_converted || v.pipeline_stage === 'CONVERTED'),
        converted_member_id: v.converted_member_id || v.convertedMemberId || null,
        converted_at: v.converted_at || v.convertedAt || null,
        raw_payload: v,
        updated_at: new Date().toISOString()
      };
    });

    if (flatVisitorsPayload.length > 0) {
      const { error } = await supabase
        .from('visitors')
        .upsert(flatVisitorsPayload, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('[CloudSync Error - Visitors Push]:', error.message || error);
        throw error;
      }
    }

    const { data: cloudVisitors, error: pullError } = await supabase
      .from('visitors')
      .select('*')
      .order('updated_at', { ascending: false });

    if (pullError) {
      console.error('[CloudSync Error - Visitors Pull]:', pullError.message || pullError);
      throw pullError;
    }

    console.log(`[CloudSync] ✓ ${flatVisitorsPayload.length} Visitors synced cleanly.`);
    return {
      success: true,
      count: flatVisitorsPayload.length,
      cloudData: cloudVisitors || []
    };
  } catch (err) {
    console.error('[CloudSync Error - Visitors]:', err);
    return {
      success: false,
      error: err.message || 'Unknown sync error',
      count: 0
    };
  }
};

export async function syncLocalVaultToCloud() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('[CloudSync] System is offline. Sync skipped.');
    return { success: false, reason: 'offline' };
  }

  console.log('[CloudSync] Starting bidirectional sync with Supabase...');

  // 🌟 1. Members
    try {
      const localMembers = await getVaultData('members', []);
      if (Array.isArray(localMembers) && localMembers.length > 0) {
        await syncMembers(supabase, localMembers);
      }
    } catch (err) {
    console.warn('[CloudSync Error - Members]:', err.message || err);
  }

  // 🌟 2. Finance
  try {
    const localFinance = await getVaultData('finance', []);
    if (Array.isArray(localFinance) && localFinance.length > 0) {
      const payload = localFinance.map((f, idx) => ({
        id: String(f.id || `FIN-${idx + 101}`),
        donor_name: f.donor || f.member || f.donor_name || 'Anonymous Believer',
        category: f.category || f.type || 'Tithe',
        amount: Number(f.amount || 0),
        record_date: f.date || f.record_date || new Date().toISOString().split('T')[0],
        raw_payload: f,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('finance').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      console.log(`[CloudSync] ✓ ${payload.length} Finance records synced.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Finance]:', err.message || err);
  }

// 🌟 3. Attendance (Clean Unique Sync)
  try {
    const localAttendance = await getVaultData('attendance', []);
    if (Array.isArray(localAttendance) && localAttendance.length > 0) {
      
      const uniqueAttendanceMap = new Map();

      localAttendance.forEach((a, idx) => {
        const memId = String(a.memberId || a.member_id || '').trim();
        const rDate = String(a.date || a.record_date || new Date().toISOString().split('T')[0]).trim();
        const sName = String(a.service || a.service_name || 'Sunday Service').trim();

        if (!memId) return;

        const uniqueKey = `${memId}_${rDate}_${sName}`;

        uniqueAttendanceMap.set(uniqueKey, {
          id: String(a.id || `ATT_${uniqueKey.replace(/[^a-zA-Z0-9_]/g, '_')}`),
          member_id: memId,
          member_name: String(a.name || a.memberName || 'Congregation Member'),
          service_name: sName,
          service_time: String(a.markedAt || a.time || a.serviceTime || '07:00 AM'),
          status: a.status || 'Present',
          record_date: rDate,
          raw_payload: a,
          updated_at: new Date().toISOString()
        });
      });

      const attendanceRows = Array.from(uniqueAttendanceMap.values());
      const chunkSize = 500;

      for (let i = 0; i < attendanceRows.length; i += chunkSize) {
        const chunk = attendanceRows.slice(i, i + chunkSize);

        const { error } = await supabase
          .from('attendance')
          .upsert(chunk, { onConflict: 'member_id,record_date,service_name' });

        if (error) throw error;
      }
      console.log(`[CloudSync] ✓ ${attendanceRows.length} Unique Attendance records pushed cleanly.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Attendance]:', err.message || err);
  }
  
  // 🌟 4. Main Church Profile
  try {
    let localChurch = await getVaultData('main_church', null);
    if (!localChurch || Object.keys(localChurch).length === 0) {
      localChurch = await getVaultData('church', {});
    }

    if (localChurch && Object.keys(localChurch).length > 0) {
      const churchPayload = [{
        id: 'MAIN_HQ',
        church_name: localChurch.churchName || localChurch.church_name || 'Grace Cathedral Church',
        address: localChurch.address || '',
        phone: localChurch.phone || '',
        email: localChurch.email || '',
        registration_no: localChurch.regNo || localChurch.registration_no || '',
        raw_payload: localChurch,
        updated_at: new Date().toISOString()
      }];

      const { error } = await supabase.from('main_church').upsert(churchPayload, { onConflict: 'id' });
      if (error) throw error;
      console.log('[CloudSync] ✓ Main Church Profile synced successfully.');
    }
  } catch (err) {
    console.warn('[CloudSync Error - Main Church]:', err.message || err);
  }

  // 🌟 5. Branches
  try {
    let localBranches = await getVaultData('branches', []);
    if (!Array.isArray(localBranches) || localBranches.length === 0) {
      try {
        localBranches = JSON.parse(localStorage.getItem('graceos_branches') || '[]');
      } catch {
        localBranches = [];
      }
    }

    if (Array.isArray(localBranches) && localBranches.length > 0) {
      const payload = localBranches.map((b, idx) => ({
        id: String(b.id || b.code || `BR-${idx + 1}`),
        code: b.code || `BR-${idx + 1}`,
        name: b.name || b.branchName || 'Branch Campus',
        location: b.location || '',
        raw_payload: b,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('branches').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      console.log(`[CloudSync] ✓ ${payload.length} Branches synced successfully.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Branches]:', err.message || err);
  }

  // 🌟 6. Events
  try {
    const localEvents = await getVaultData('events', []);
    if (Array.isArray(localEvents) && localEvents.length > 0) {
      const payload = localEvents.map((ev, idx) => ({
        id: String(ev.id || `EVT-${idx + 101}`),
        title: ev.title || 'Church Event',
        category: ev.category || 'SPECIAL',
        record_date: ev.date || new Date().toISOString().split('T')[0],
        venue: ev.venue || '',
        raw_payload: ev,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('events').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      console.log(`[CloudSync] ✓ ${payload.length} Events synced.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Events]:', err.message || err);
  }

  // 🌟 7. Expenses
  try {
    const localExpenses = await getVaultData('expenses', []);
    if (Array.isArray(localExpenses) && localExpenses.length > 0) {
      const payload = localExpenses.map((exp, idx) => ({
        id: String(exp.id || `EXP-${idx + 101}`),
        category: exp.category || 'General',
        amount: Number(exp.amount || 0),
        record_date: exp.date || new Date().toISOString().split('T')[0],
        raw_payload: exp,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      console.log(`[CloudSync] ✓ ${payload.length} Expenses synced.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Expenses]:', err.message || err);
  }

  // 🌟 8. Prayers
  try {
    const localPrayers = await getVaultData('prayers', []);
    if (Array.isArray(localPrayers) && localPrayers.length > 0) {
      const payload = localPrayers.map((pr, idx) => ({
        id: String(pr.id || `PR-${idx + 101}`),
        requester_name: pr.requester || pr.name || pr.requester_name || 'Anonymous',
        category: pr.category || 'HEALING',
        status: pr.status || 'PENDING',
        record_date: pr.date || new Date().toISOString().split('T')[0],
        raw_payload: pr,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('prayers').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      console.log(`[CloudSync] ✓ ${payload.length} Prayers synced.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Prayers]:', err.message || err);
  }

  // 🌟 9. Visitors
  try {
    const localVisitors = await getVaultData('visitors', []);
    const result = await syncVisitors(localVisitors);
    if (!result.success) {
      console.warn('[CloudSync Error - Visitors]:', result.error);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Visitors]:', err.message || err);
  }

// 🌟 10. Staff Sync
  try {
    const localStaff = await getVaultData('staff', []);
    if (Array.isArray(localStaff) && localStaff.length > 0) {
      const payload = localStaff.map((st, idx) => ({
        id: String(st.id || `STF-${idx + 101}`),
        name: st.name || 'Staff Member',
        username: st.username || '',
        role: st.role || 'Volunteer',
        phone: st.phone || '',
        email: st.email || '',
        campus: st.campus || 'Headquarters',
        status: st.status || 'Active',
        raw_payload: st,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('staff').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      console.log(`[CloudSync] ✓ ${payload.length} Staff records synced.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Staff]:', err.message || err);
  }
  
  // 🌟 11. Lease Vault (Properties)
  try {
    let localProps = await getVaultData('lease_vault', []);
    if (!Array.isArray(localProps) || localProps.length === 0) {
      localProps = await getVaultData('properties', []);
    }

    if (Array.isArray(localProps) && localProps.length > 0) {
      const payload = localProps.map((p, idx) => ({
        id: String(p.id || `PROP-${idx + 101}`),
        property_name: p.title || p.propertyName || p.property_name || 'Sanctuary Facility',
        ownership_type: p.ownershipType || p.ownership_type || 'RENTED',
        location: p.location || '',
        monthly_rent: Number(p.monthlyRent ?? p.monthly_rent ?? 0),
        advance_amount: Number(p.advanceDeposit ?? p.advance_amount ?? 0),
        landlord_name: p.landlordName || p.landlord_name || '',
        phone: p.landlordPhone || p.phone || '',
        doc_no: p.docNo || p.doc_no || '',
        survey_no: p.surveyNo || p.survey_no || '',
        patta_no: p.pattaNo || p.patta_no || '',
        raw_payload: p,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('lease_vault').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      console.log(`[CloudSync] ✓ ${payload.length} Lease Vault records synced.`);
    }
  } catch (err) {
    console.warn('[CloudSync Error - Lease Vault]:', err.message || err);
  }

  console.log('[CloudSync] All modules synced cleanly.');
  return { success: true };
}

export async function syncMembers(supabase, familiesList) {
  if (!familiesList || !Array.isArray(familiesList) || familiesList.length === 0) {
    return;
  }

  const flatMembersPayload = [];

  const getFamilyCode = (member, index) => {
    const existingCode = member.family_id || member.familyCode;
    if (existingCode) return existingCode;
    const role = String(member.roleInFamily || member.household_role || '').toLowerCase();
    if (role.includes('spouse') || role.includes('wife') || role.includes('husband')) return 'W1';
    if (role.includes('parent') || role.includes('elder') || role.includes('father') || role.includes('mother')) return `P${index + 1}`;
    return `C${index + 1}`;
  };

  familiesList.forEach((fam, famIdx) => {
    const familyId = String(fam.familyId || fam.family_id || fam.id || `FAM-${famIdx + 101}`);
    const familyName = fam.familyName || fam.family_name || `${fam.headMember?.name || fam.name || 'Member'} & Household`;
    const campus = fam.campus || fam.headMember?.campus || fam.branch || 'Headquarters';
    const area = fam.area || fam.headMember?.area || '';
    const address = fam.address || fam.headMember?.address || '';
    const gps = fam.gpsCoordinates || fam.gps_coordinates || fam.headMember?.gpsCoordinates || '';
    const latitude = fam.latitude || fam.headMember?.latitude || null;
    const longitude = fam.longitude || fam.headMember?.longitude || null;
    const gpsAddress = fam.gps_coordinates || fam.headMember?.gps_coordinates || '';
    const mapsUrl = fam.maps_url || fam.headMember?.maps_url || '';

    // 🌟 1. குடும்பத் தலைவரை (Head Member) சின்க் லிஸ்ட்டில் சேர்த்தல்
    if (fam.headMember) {
      const h = fam.headMember;
      const headName = h.name || fam.name || 'Family Head';
      const headId = h.houseId || h.memberId || `${familyId}-H`;

      flatMembersPayload.push({
        id: headId,
        family_id: familyId,
        family_name: familyName,
        head_name: headName,
        house_id: headId,
        household_role: 'HEAD',
         family_id: familyId,
        name: headName,
        gender: h.gender || 'Male',
        date_of_birth: h.dob && String(h.dob).trim() !== '' ? h.dob : null,
        age: h.age ? parseInt(h.age, 10) : null,
        blood_group: h.bloodGroup || null,
        phone: h.phone || h.mobile || '',
        email: h.email || '',
        campus: campus,
        area: area,
        address: address,
        gps_coordinates: gps,
        latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : null,
        longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : null,
        gps_coordinates: gpsAddress,
        maps_url: mapsUrl,
        // 🌟 Checkbox boolean மற்றும் Date சரிசெய்தல்:
        is_baptized: Boolean(h.isBaptized),
        baptism_date: (h.isBaptized && h.baptismDate && String(h.baptismDate).trim() !== '') ? h.baptismDate : null,
        is_anointed: Boolean(h.isAnointed),
        holy_spirit_baptism_date: (h.isAnointed && h.holySpiritBaptismDate && String(h.holySpiritBaptismDate).trim() !== '') ? h.holySpiritBaptismDate : null,
        wedding_anniversary: h.weddingAnniversary && String(h.weddingAnniversary).trim() !== '' ? h.weddingAnniversary : null,
        ministry_talents: Array.isArray(h.ministryTalents) ? h.ministryTalents : [],
        household_role: h.household_role || h.household_roleToHead || '',
        raw_payload: h,
        updated_at: new Date().toISOString()
      });
    }

    // 🌟 2. குடும்ப உறுப்பினர்களை (மனைவி, பிள்ளைகள் - Sub Members) சின்க் லிஸ்ட்டில் சேர்த்தல்
    if (Array.isArray(fam.members) && fam.members.length > 0) {
      fam.members.forEach((m, idx) => {
        if (!m || !m.name) return;
        const subRole = m.roleInFamily || 'Member';
        const familyCode = getFamilyCode(m, idx);
        const suffix = familyCode;
        const subId = m.houseId || m.memberId || `${familyId}-${suffix}`;

        flatMembersPayload.push({
          id: subId,
          family_id: familyId,
          family_name: familyName,
          head_name: fam.headMember?.name || fam.head_name || fam.headName || fam.name || '',
          house_id: subId,
          household_role: subRole,
          family_id: familyCode,
          name: m.name,
          gender: m.gender || (subRole.includes('Wife') ? 'Female' : 'Male'),
          date_of_birth: m.dob && String(m.dob).trim() !== '' ? m.dob : null,
          age: m.age ? parseInt(m.age, 10) : null,
          blood_group: m.bloodGroup || null,
          // சொந்த போன் இல்லையென்றால் குடும்பத் தலைவரின் போன் எண்:
          phone: m.phone || fam.headMember?.phone || fam.phone || '',
          email: m.email || '',
          campus: campus,
          area: area,
          address: address,
          gps_coordinates: gps,
          latitude: Number.isFinite(Number(m.latitude || latitude)) ? Number(m.latitude || latitude) : null,
          longitude: Number.isFinite(Number(m.longitude || longitude)) ? Number(m.longitude || longitude) : null,
          gps_coordinates: m.gps_coordinates || gpsAddress,
          maps_url: m.maps_url || mapsUrl,
          // 🌟 சப்-மெம்பரின் ஞானஸ்நானம் & அபிஷேகம்:
          is_baptized: Boolean(m.isBaptized),
          baptism_date: (m.isBaptized && m.baptismDate && String(m.baptismDate).trim() !== '') ? m.baptismDate : null,
          is_anointed: Boolean(m.isAnointed),
          holy_spirit_baptism_date: (m.isAnointed && m.holySpiritBaptismDate && String(m.holySpiritBaptismDate).trim() !== '') ? m.holySpiritBaptismDate : null,
          wedding_anniversary: m.weddingAnniversary && String(m.weddingAnniversary).trim() !== '' ? m.weddingAnniversary : null,
          ministry_talents: Array.isArray(m.ministryTalents) ? m.ministryTalents : [],
          household_role: m.household_role || m.household_roleToHead || '',
          raw_payload: m,
          updated_at: new Date().toISOString()
        });
      });
    }

    // 🌟 Standalone member fallback (if no headMember and no members array)
    if (!fam.headMember && (!Array.isArray(fam.members) || fam.members.length === 0)) {
      const headName = fam.name || fam.head_name || fam.headName || 'Member';
      const headId = fam.id || fam.memberId || fam.houseId || `${familyId}-H`;

      flatMembersPayload.push({
        id: headId,
        family_id: familyId,
        family_name: familyName,
        head_name: headName,
        house_id: headId,
        household_role: 'HEAD',
         family_id: familyId,
        name: headName,
        gender: fam.gender || 'Male',
        date_of_birth: fam.dob && String(fam.dob).trim() !== '' ? fam.dob : (fam.date_of_birth || null),
        age: fam.age ? parseInt(fam.age, 10) : null,
        blood_group: fam.bloodGroup || fam.blood_group || null,
        phone: fam.phone || fam.mobile || '',
        email: fam.email || '',
        campus: campus,
        area: area,
        address: address,
        gps_coordinates: gps,
        latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : null,
        longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : null,
        gps_coordinates: gpsAddress,
        maps_url: mapsUrl,
        is_baptized: Boolean(fam.isBaptized || fam.is_baptized),
        baptism_date: ((fam.isBaptized || fam.is_baptized) && (fam.baptismDate || fam.baptism_date) && String(fam.baptismDate || fam.baptism_date).trim() !== '') ? (fam.baptismDate || fam.baptism_date) : null,
        is_anointed: Boolean(fam.isAnointed || fam.is_anointed),
        holy_spirit_baptism_date: ((fam.isAnointed || fam.is_anointed) && (fam.holySpiritBaptismDate || fam.holy_spirit_baptism_date) && String(fam.holySpiritBaptismDate || fam.holy_spirit_baptism_date).trim() !== '') ? (fam.holySpiritBaptismDate || fam.holy_spirit_baptism_date) : null,
        wedding_anniversary: (fam.weddingAnniversary || fam.wedding_anniversary) && String(fam.weddingAnniversary || fam.wedding_anniversary).trim() !== '' ? (fam.weddingAnniversary || fam.wedding_anniversary) : null,
        ministry_talents: Array.isArray(fam.ministryTalents || fam.ministry_talents) ? (fam.ministryTalents || fam.ministry_talents) : [],
        household_role: fam.household_role || fam.household_role_to_head || '',
        raw_payload: fam,
        updated_at: new Date().toISOString()
      });
    }
  });

  // 🌟 3. Supabase-க்கு மொத்தமாக Upsert செய்தல்
  if (flatMembersPayload.length > 0) {
    const { error } = await supabase
      .from('members')
      .upsert(flatMembersPayload, { onConflict: 'id' });

    if (error) {
      console.error('[CloudSync Error - Members]:', error.message);
      throw error;
    } else {
      console.log(`[CloudSync] ✓ ${flatMembersPayload.length} Members (Heads & Sub-members) synced cleanly to Supabase.`);
    }
  }
}