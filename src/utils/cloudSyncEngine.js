// src/utils/cloudSyncEngine.js
// ============================================================
// GraceOS Cloud Sync Engine — True Bidirectional (Pull + Push)
// Strategy: Last-Write-Wins (LWW) on `updated_at` per record.
// ============================================================
import { getSupabase } from './supabaseClient';
import { getVaultData, setVaultData } from './vaultStore';

// ── Internal state ────────────────────────────────────────────
let _realtimeChannel = null;
let _isBidirectionalSyncRunning = false;

// ── Visitor stage normalizer (unchanged from original) ────────
function normalizeVisitorStage(visitor) {
  if (visitor?.is_converted || visitor?.funnelStage === 'CONVERTED') return 'CONVERTED';
  if (['1ST_VISIT', 'LEADER_CALLED', 'HOME_VISITED', 'CONVERTED'].includes(visitor?.pipeline_stage))
    return visitor.pipeline_stage;
  if (['CONTACTED', 'calling_scheduled'].includes(visitor?.stage || visitor?.followUpStage))
    return 'LEADER_CALLED';
  if (['PRAYER_MEET', 'home_visit', 'COMMITTED', 'ready_for_membership'].includes(visitor?.stage || visitor?.followUpStage))
    return 'HOME_VISITED';
  return '1ST_VISIT';
}

// ── Timestamp comparison helper ───────────────────────────────
function isCloudNewer(cloudTs, localTs) {
  if (!localTs) return true;   // no local record → cloud wins
  if (!cloudTs) return false;  // no cloud ts → local wins
  return new Date(cloudTs) > new Date(localTs);
}

// ────────────────────────────────────────────────────────────────────────────
// mergeRecords()
// Merges cloud rows and local records using Last-Write-Wins on `updated_at`.
// Returns { toSaveLocally, toPushToCloud }
// ────────────────────────────────────────────────────────────────────────────
export function mergeRecords(localRecords, cloudRows, idKey = 'id') {
  const localMap = new Map();
  (Array.isArray(localRecords) ? localRecords : []).forEach((r) => {
    const k = String(r?.[idKey] ?? r?.id ?? '').trim();
    if (k) localMap.set(k, r);
  });

  const cloudMap = new Map();
  (Array.isArray(cloudRows) ? cloudRows : []).forEach((r) => {
    const k = String(r?.[idKey] ?? r?.id ?? '').trim();
    if (k) cloudMap.set(k, r);
  });

  const toSaveLocally = [];   // records that cloud has that are newer (or new)
  const toPushToCloud = [];   // records that local has that are newer (or new)

  // Walk all keys across both sides
  const allKeys = new Set([...localMap.keys(), ...cloudMap.keys()]);

  allKeys.forEach((k) => {
    const local = localMap.get(k);
    const cloud = cloudMap.get(k);

    if (!local && cloud) {
      // Cloud-only → pull it down
      toSaveLocally.push(cloud);
      return;
    }

    if (local && !cloud) {
      // Local-only → push it up
      toPushToCloud.push(local);
      return;
    }

    // Both sides have the record → compare timestamps
    const localTs  = local?.updated_at  || local?.updatedAt  || null;
    const cloudTs  = cloud?.updated_at  || cloud?.updatedAt  || null;

    if (isCloudNewer(cloudTs, localTs)) {
      toSaveLocally.push(cloud);
    } else {
      toPushToCloud.push(local);
    }
  });

  return { toSaveLocally, toPushToCloud };
}

// ────────────────────────────────────────────────────────────────────────────
// Module-level bidirectional sync helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Build a flat cloud-ready row for a single module record.
 * Returns null if the record is unusable.
 */
function buildCloudRow(moduleKey, record, idx) {
  if (!record || typeof record !== 'object') return null;

  const now = new Date().toISOString();
  // Preserve existing updated_at if already stamped; only set new if missing
  const updatedAt = record.updated_at || now;

  switch (moduleKey) {
    case 'finance':
      return {
        id: String(record.id || `FIN-${idx + 101}`),
        donor_name: record.donor || record.member || record.donor_name || 'Anonymous Believer',
        ...(record.phone || record.donor_phone ? { donor_phone: record.phone || record.donor_phone } : {}),
        ...(record.member_id || record.memberId ? { member_id: record.member_id || record.memberId } : {}),
        category: record.category || record.type || 'Tithe',
        amount: Number(record.amount || 0),
        ...(record.mode || record.paymentMode || record.payment_mode
          ? { payment_mode: record.mode || record.paymentMode || record.payment_mode }
          : {}),
        ...(record.transaction_reference || record.utr
          ? { transaction_reference: record.transaction_reference || record.utr }
          : {}),
        ...(record.status ? { status: record.status } : {}),
        receipt_no: record.receipt_no || record.receiptNo || String(record.id || ''),
        ...(record.campus ? { campus: record.campus } : {}),
        record_date: record.date || record.record_date || now.split('T')[0],
        raw_payload: record,
        updated_at: updatedAt,
      };

    case 'attendance': {
      const memId  = String(record.memberId || record.member_id || '').trim();
      const rDate  = String(record.date || record.record_date || now.split('T')[0]).trim();
      const sName  = String(record.service || record.service_name || 'Sunday Service').trim();
      if (!memId) return null;
      return {
        id: String(record.id || `ATT_${memId}_${rDate}_${sName}`.replace(/[^a-zA-Z0-9_]/g, '_')),
        member_id: memId,
        member_name: String(record.name || record.memberName || 'Congregation Member'),
        service_name: sName,
        service_time: String(record.markedAt || record.time || record.serviceTime || '07:00 AM'),
        status: record.status || 'Present',
        record_date: rDate,
        raw_payload: record,
        updated_at: updatedAt,
      };
    }

    case 'visitors': {
      const parsedLat = record.latitude ? parseFloat(record.latitude) : null;
      const parsedLng = record.longitude ? parseFloat(record.longitude) : null;
      const validCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
      const lat = validCoords ? parsedLat : null;
      const lng = validCoords ? parsedLng : null;
      return {
        id: String(record.id || `VIS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
        name: String(record.name || record.fullName || 'Anonymous Visitor').trim(),
        phone: String(record.phone || '').trim(),
        area: String(record.area || '').trim(),
        latitude: lat,
        longitude: lng,
        gps_coordinates: record.gps_coordinates || (validCoords ? `${lat}, ${lng}` : null),
        maps_url: record.maps_url || (validCoords
          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
          : ''),
        pipeline_stage: record.is_converted ? 'CONVERTED' : (record.pipeline_stage || normalizeVisitorStage(record)),
        call_notes: record.call_notes || null,
        home_visit_date: record.home_visit_date || null,
        assigned_leader: record.assigned_leader || null,
        is_converted: Boolean(record.is_converted || record.pipeline_stage === 'CONVERTED'),
        converted_member_id: record.converted_member_id || record.convertedMemberId || null,
        converted_at: record.converted_at || record.convertedAt || null,
        raw_payload: record,
        updated_at: updatedAt,
      };
    }

    case 'expenses':
      return {
        id: String(record.id || `EXP-${idx + 101}`),
        category: record.category || 'General',
        amount: Number(record.amount || 0),
        record_date: record.date || record.record_date || now.split('T')[0],
        raw_payload: record,
        updated_at: updatedAt,
      };

    case 'prayers': {
      const visibility = String(record.visibility || '').toUpperCase();
      const legacyConfidential = record.is_confidential ?? record.isConfidential ?? record.isPrivate;
      const isPastoral = visibility === 'PASTORAL'
        || legacyConfidential === true
        || legacyConfidential === 1
        || String(legacyConfidential).toLowerCase() === 'true';
      const isAnonymous = visibility === 'ANONYMOUS' || record.is_anonymous === true;
      const category = String(record.category || 'GENERAL').toUpperCase();
      const status = String(record.status || '').toUpperCase();
      const canonicalCategory = ['NATION', 'HEALING', 'FAMILY', 'JOB', 'SPIRITUAL', 'DELIVERANCE', 'GENERAL'].includes(category)
        ? category
        : 'GENERAL';
      const canonicalStatus = status === 'ANSWERED' || record.is_answered === true ? 'ANSWERED' : 'ACTIVE';
      return {
        id: String(record.id || `PR-${idx + 101}`),
        user_id: record.user_id || record.member_id || record.memberId || null,
        author_name: isAnonymous ? 'Anonymous Believer' : record.author_name || record.requester_name || record.requester || record.name || 'Anonymous Believer',
        category: canonicalCategory,
        description: record.description || record.request_text || record.request || record.details || '',
        visibility: isPastoral ? 'PASTORAL' : isAnonymous ? 'ANONYMOUS' : 'PUBLIC',
        prayer_count: Math.max(0, Number(record.prayer_count ?? record.prayerCount) || 0),
        is_answered: canonicalStatus === 'ANSWERED',
        created_at: record.created_at || record.createdAt || record.date || now,
        raw_payload: record,
        updated_at: updatedAt,
      };
    }

    case 'prayer_slots':
      return {
        id: String(record.id || `PS-${idx + 101}`),
        user_id: String(record.user_id || record.userId || ''),
        author_name: record.author_name || record.name || 'Prayer Warrior',
        slot_date: record.date || record.slot_date || now.split('T')[0],
        start_minute: Math.max(0, Number(record.start_minute) || 0),
        duration_minutes: Math.max(30, Number(record.duration_minutes) || 60),
        status: record.status === 'CANCELLED' ? 'CANCELLED' : 'ACTIVE',
        created_at: record.created_at || now,
        raw_payload: record,
        updated_at: updatedAt,
      };

    case 'events':
      return {
        id: String(record.id || `EVT-${idx + 101}`),
        title: record.title || 'Church Event',
        category: record.category || 'SPECIAL',
        record_date: record.date || record.record_date || now.split('T')[0],
        venue: record.venue || '',
        raw_payload: record,
        updated_at: updatedAt,
      };

    case 'staff':
      return {
        id: String(record.id || `STF-${idx + 101}`),
        name: record.name || 'Staff Member',
        username: record.username || '',
        role: record.role || 'Volunteer',
        phone: record.phone || '',
        email: record.email || '',
        campus: record.campus || 'Headquarters',
        status: record.status || 'Active',
        raw_payload: record,
        updated_at: updatedAt,
      };

    case 'branches':
      return {
        id: String(record.id || record.code || `BR-${idx + 1}`),
        code: record.code || `BR-${idx + 1}`,
        name: record.name || record.branchName || 'Branch Campus',
        location: record.location || '',
        raw_payload: record,
        updated_at: updatedAt,
      };

    case 'lease_vault':
      return {
        id: String(record.id || `PROP-${idx + 101}`),
        property_name: record.title || record.propertyName || record.property_name || 'Sanctuary Facility',
        ownership_type: record.ownershipType || record.ownership_type || 'RENTED',
        location: record.location || '',
        monthly_rent: Number(record.monthlyRent ?? record.monthly_rent ?? 0),
        advance_amount: Number(record.advanceDeposit ?? record.advance_amount ?? 0),
        landlord_name: record.landlordName || record.landlord_name || '',
        phone: record.landlordPhone || record.phone || '',
        doc_no: record.docNo || record.doc_no || '',
        survey_no: record.surveyNo || record.survey_no || '',
        patta_no: record.pattaNo || record.patta_no || '',
        raw_payload: record,
        updated_at: updatedAt,
      };

    case 'main_church':
      return {
        id: 'MAIN_HQ',
        church_name: record.churchName || record.church_name || 'Grace Cathedral Church',
        address: record.address || '',
        phone: record.phone || '',
        email: record.email || '',
        registration_no: record.regNo || record.registration_no || '',
        raw_payload: record,
        updated_at: updatedAt,
      };

    default:
      return {
        id: String(record.id || `REC-${idx + 101}`),
        raw_payload: record,
        updated_at: updatedAt,
      };
  }
}

/**
 * Restore a raw_payload-wrapped cloud row back into the local vault format.
 */
function restoreLocalRecord(row) {
  if (!row) return null;
  if (row.raw_payload && typeof row.raw_payload === 'object') {
    // Merge the flat cloud columns back so local record also has updated_at, id, etc.
    return { ...row.raw_payload, id: row.id, updated_at: row.updated_at };
  }
  return row;
}

// ────────────────────────────────────────────────────────────────────────────
// syncModuleBidirectional()
// Core engine: Pull → LWW Merge → Save Locally + Push Delta to cloud
// ────────────────────────────────────────────────────────────────────────────
export async function syncModuleBidirectional(supabase, moduleKey, table, onConflictCol = 'id') {
  // ── 1. Fetch cloud records ──────────────────────────────────
  const { data: cloudRows, error: pullErr } = await supabase
    .from(table)
    .select('*')
    .order('updated_at', { ascending: false });

  if (pullErr) {
    console.warn(`[CloudSync] Pull error for ${table}:`, pullErr.message);
    // Non-fatal: proceed with local-only push
  }

  // ── 2. Fetch local records ──────────────────────────────────
  let localRecords = await getVaultData(moduleKey, []);

  // Branches may live in localStorage under a different key
  if (moduleKey === 'branches' && (!Array.isArray(localRecords) || localRecords.length === 0)) {
    try {
      localRecords = JSON.parse(localStorage.getItem('graceos_branches') || '[]');
    } catch { localRecords = []; }
  }

  // main_church is a single object — wrap in array for uniform handling
  const isSingleObject = moduleKey === 'main_church';
  if (isSingleObject && !Array.isArray(localRecords)) {
    localRecords = localRecords && Object.keys(localRecords).length > 0 ? [localRecords] : [];
  }

  if (!Array.isArray(localRecords)) localRecords = [];

  // ── 3. LWW Merge ───────────────────────────────────────────
  const { toSaveLocally, toPushToCloud } = mergeRecords(
    localRecords.map((r) => ({
      ...r,
      id: String(r?.id || r?.familyId || r?.code || ''),
      updated_at: r?.updated_at || null,
    })),
    cloudRows || [],
    'id'
  );

  // ── 4. Save cloud-newer records locally ────────────────────
  if (toSaveLocally.length > 0) {
    const restoredLocal = toSaveLocally.map(restoreLocalRecord).filter(Boolean);

    // Merge into full local array (don't wipe records not in the delta)
    const localById = new Map(localRecords.map((r) => [String(r?.id || r?.familyId || r?.code || ''), r]));
    restoredLocal.forEach((r) => {
      const k = String(r?.id || '');
      if (k) localById.set(k, r);
    });

    const mergedLocal = Array.from(localById.values());
    const toStore = isSingleObject ? (mergedLocal[0] || {}) : mergedLocal;

    await setVaultData(moduleKey, toStore, false /* no recursive cloud trigger */);

    // Mirror specific localStorage keys that legacy components read directly
    if (moduleKey === 'members')    localStorage.setItem('app_members_family_database',       JSON.stringify(toStore));
    if (moduleKey === 'visitors')   localStorage.setItem('app_visitors_database',             JSON.stringify(toStore));
    if (moduleKey === 'finance')    localStorage.setItem('app_finance_transactions_ledger',   JSON.stringify(toStore));
    if (moduleKey === 'attendance') localStorage.setItem('graceos_attendance_logs',           JSON.stringify(toStore));

    console.log(`[CloudSync] ↓ Pulled ${restoredLocal.length} newer records into local [${moduleKey}].`);
  }

  // ── 5. Push local-newer records to cloud ───────────────────
  if (toPushToCloud.length > 0) {
    // For members, delegate to the full flat-map push which handles HEAD / sub-members
    if (moduleKey === 'members') {
      await syncMembers(supabase, toPushToCloud);
    } else {
      // Build cloud rows, deduplicate by id, chunk-upload
      const cloudReadyRows = toPushToCloud
        .map((r, idx) => buildCloudRow(moduleKey, r, idx))
        .filter(Boolean);

      // For attendance, deduplicate by composite key before upsert
      const dedupedRows = moduleKey === 'attendance'
        ? Array.from(
            new Map(cloudReadyRows.map((r) => [`${r.member_id}_${r.record_date}_${r.service_name}`, r])).values()
          )
        : cloudReadyRows;

      const conflictCol = moduleKey === 'attendance'
        ? 'member_id,record_date,service_name'
        : onConflictCol;

      if (moduleKey === 'prayers' || moduleKey === 'prayer_slots') {
        for (const row of dedupedRows) {
          const functionName = moduleKey === 'prayers' ? 'sync_prayer' : 'sync_prayer_slot';
          const { error } = await supabase.rpc(functionName, { record_payload: row });
          if (error) console.warn(`[CloudSync] ${moduleKey} sync error for ${row.id}:`, error.message);
        }
      } else {
        const CHUNK = 500;
        for (let i = 0; i < dedupedRows.length; i += CHUNK) {
          const chunk = dedupedRows.slice(i, i + CHUNK);
          const { error } = await supabase.from(table).upsert(chunk, { onConflict: conflictCol });
          if (error) console.warn(`[CloudSync] Push chunk error for ${table}:`, error.message);
        }
      }

      console.log(`[CloudSync] ↑ Pushed ${dedupedRows.length} local records to cloud [${table}].`);
    }
  }

  return {
    pulled: toSaveLocally.length,
    pushed: toPushToCloud.length,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// executeBidirectionalSync()
// Full 2-way sync across all modules.
// Replaces syncLocalVaultToCloud() as the canonical sync function.
// ────────────────────────────────────────────────────────────────────────────
export async function executeBidirectionalSync() {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('[CloudSync] Supabase not configured. Skipping sync.');
    return { success: false, reason: 'unconfigured' };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('[CloudSync] Offline. Sync skipped.');
    return { success: false, reason: 'offline' };
  }

  if (_isBidirectionalSyncRunning) {
    console.log('[CloudSync] Sync already in progress. Skipping duplicate run.');
    return { success: false, reason: 'already_running' };
  }

  _isBidirectionalSyncRunning = true;
  console.log('[CloudSync] ⟳ Starting bidirectional sync…');

  const results = {};

  const MODULE_TABLE_MAP = [
    { key: 'members',     table: 'members'     },
    { key: 'finance',     table: 'finance'     },
    { key: 'attendance',  table: 'attendance'  },
    { key: 'visitors',    table: 'visitors'    },
    { key: 'expenses',    table: 'expenses'    },
    { key: 'prayers',     table: 'prayers'     },
    { key: 'prayer_slots', table: 'prayer_chain_slots' },
    { key: 'events',      table: 'events'      },
    { key: 'staff',       table: 'staff'       },
    { key: 'branches',    table: 'branches'    },
    { key: 'lease_vault', table: 'lease_vault' },
    { key: 'main_church', table: 'main_church' },
  ];

  for (const { key, table } of MODULE_TABLE_MAP) {
    try {
      const res = await syncModuleBidirectional(supabase, key, table);
      results[key] = res;
    } catch (err) {
      console.warn(`[CloudSync] Error syncing [${key}]:`, err?.message || err);
      results[key] = { error: err?.message };
    }
  }

  _isBidirectionalSyncRunning = false;
  console.log('[CloudSync] ✓ Bidirectional sync complete.', results);

  // Notify any listening components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('graceos_vault_updated', { detail: results }));
  }

  return { success: true, results };
}

/**
 * Backward-compatible alias — existing call-sites that use
 * `syncLocalVaultToCloud()` continue to work unchanged.
 */
export const syncLocalVaultToCloud = executeBidirectionalSync;

// ────────────────────────────────────────────────────────────────────────────
// setupRealtimeSyncListener()
// Subscribe to Supabase Realtime postgres_changes events.
// On any INSERT / UPDATE / DELETE from another device, trigger a silent
// bidirectional sync and dispatch `graceos_vault_updated` so React re-renders.
// ────────────────────────────────────────────────────────────────────────────
export function setupRealtimeSyncListener() {
  const supabase = getSupabase();
  if (!supabase || typeof window === 'undefined') {
    console.warn('[CloudSync] Cannot set up realtime — Supabase not configured or not in browser.');
    return () => {};
  }

  // Clean up any previous subscription
  if (_realtimeChannel) {
    try { supabase.removeChannel(_realtimeChannel); } catch { /* ignore */ }
    _realtimeChannel = null;
  }

  const REALTIME_TABLES = ['members', 'attendance', 'finance', 'visitors', 'prayers', 'prayer_chain_slots'];

  let debounceTimer = null;

  function triggerSilentSync(eventMeta) {
    // Debounce rapid consecutive realtime events (e.g. bulk import)
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log('[CloudSync][Realtime] Remote change detected — triggering background sync.', eventMeta);
      try {
        await executeBidirectionalSync();
      } catch (err) {
        console.warn('[CloudSync][Realtime] Background sync error:', err?.message);
      }
      // Dispatch custom DOM event so active React components can re-render
      window.dispatchEvent(
        new CustomEvent('graceos_vault_updated', {
          detail: { source: 'realtime', ...eventMeta },
        })
      );
    }, 800); // 800 ms debounce window
  }

  // Build a single multiplexed channel that watches all critical tables
  const channel = supabase.channel('graceos_realtime_bidir_sync');

  REALTIME_TABLES.forEach((table) => {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        triggerSilentSync({
          table,
          event: payload.eventType,
          record: payload.new || payload.old || {},
        });
      }
    );
  });

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('[CloudSync][Realtime] ✓ Realtime sync channel active for:', REALTIME_TABLES.join(', '));
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.warn('[CloudSync][Realtime] Channel status:', status);
    }
  });

  _realtimeChannel = channel;

  // Return cleanup function
  return () => {
    clearTimeout(debounceTimer);
    if (_realtimeChannel) {
      try { supabase.removeChannel(_realtimeChannel); } catch { /* ignore */ }
      _realtimeChannel = null;
    }
    console.log('[CloudSync][Realtime] Realtime listener detached.');
  };
}

// ────────────────────────────────────────────────────────────────────────────
// syncMembers() — Full flat-payload push for member families (unchanged logic)
// ────────────────────────────────────────────────────────────────────────────
export async function syncMembers(supabase, familiesList) {
  if (!familiesList || !Array.isArray(familiesList) || familiesList.length === 0) return;

  const flatMembersPayload = [];

  const getFamilyCode = (member, index) => {
    const existingCode = member.family_id || member.familyCode;
    if (existingCode) return existingCode;
    const role = String(member.roleInFamily || member.household_role || '').toLowerCase();
    if (role.includes('spouse') || role.includes('wife') || role.includes('husband')) return 'W1';
    if (role.includes('parent') || role.includes('elder') || role.includes('father') || role.includes('mother')) return `P${index + 1}`;
    return `C${index + 1}`;
  };

  const now = new Date().toISOString();

  familiesList.forEach((fam, famIdx) => {
    const familyId   = String(fam.familyId || fam.family_id || fam.id || `FAM-${famIdx + 101}`);
    const familyName = fam.familyName || fam.family_name || `${fam.headMember?.name || fam.name || 'Member'} & Household`;
    const campus     = fam.campus || fam.headMember?.campus || fam.branch || 'Headquarters';
    const area       = fam.area   || fam.headMember?.area   || '';
    const address    = fam.address || fam.headMember?.address || '';
    const gpsAddress = fam.gps_coordinates   || fam.headMember?.gps_coordinates || '';
    const latitude   = fam.latitude   || fam.headMember?.latitude  || null;
    const longitude  = fam.longitude  || fam.headMember?.longitude || null;
    const mapsUrl    = fam.maps_url   || fam.headMember?.maps_url  || '';

    // 1. Head member
    if (fam.headMember) {
      const h       = fam.headMember;
      const headName = h.name || fam.name || 'Family Head';
      const headId   = h.houseId || h.memberId || `${familyId}-H`;

      flatMembersPayload.push({
        id:               headId,
        family_id:        familyId,
        family_name:      familyName,
        head_name:        headName,
        house_id:         headId,
        household_role:   h.household_role || h.household_roleToHead || 'HEAD',
        name:             headName,
        gender:           h.gender || 'Male',
        date_of_birth:    h.dob && String(h.dob).trim() ? h.dob : null,
        age:              h.age ? parseInt(h.age, 10) : null,
        blood_group:      h.bloodGroup || null,
        phone:            h.phone || h.mobile || '',
        email:            h.email || '',
        campus,
        area,
        address,
        latitude:         Number.isFinite(Number(latitude)) ? Number(latitude) : null,
        longitude:        Number.isFinite(Number(longitude)) ? Number(longitude) : null,
        gps_coordinates:  gpsAddress,
        maps_url:         mapsUrl,
        is_baptized:      Boolean(h.isBaptized),
        baptism_date:     (h.isBaptized && h.baptismDate && String(h.baptismDate).trim()) ? h.baptismDate : null,
        is_anointed:      Boolean(h.isAnointed),
        holy_spirit_baptism_date: (h.isAnointed && h.holySpiritBaptismDate && String(h.holySpiritBaptismDate).trim()) ? h.holySpiritBaptismDate : null,
        wedding_anniversary: h.weddingAnniversary && String(h.weddingAnniversary).trim() ? h.weddingAnniversary : null,
        ministry_talents: Array.isArray(h.ministryTalents) ? h.ministryTalents : [],
        raw_payload:      h,
        updated_at:       h.updated_at || now,
      });
    }

    // 2. Sub-members
    if (Array.isArray(fam.members) && fam.members.length > 0) {
      fam.members.forEach((m, idx) => {
        if (!m || !m.name) return;
        const subRole    = m.roleInFamily || 'Member';
        const familyCode = getFamilyCode(m, idx);
        const subId      = m.houseId || m.memberId || `${familyId}-${familyCode}`;

        flatMembersPayload.push({
          id:               subId,
          family_id:        familyId,
          family_name:      familyName,
          head_name:        fam.headMember?.name || fam.head_name || fam.headName || fam.name || '',
          house_id:         subId,
          household_role:   subRole,
          name:             m.name,
          gender:           m.gender || (subRole.includes('Wife') ? 'Female' : 'Male'),
          date_of_birth:    m.dob && String(m.dob).trim() ? m.dob : null,
          age:              m.age ? parseInt(m.age, 10) : null,
          blood_group:      m.bloodGroup || null,
          phone:            m.phone || fam.headMember?.phone || fam.phone || '',
          email:            m.email || '',
          campus,
          area,
          address,
          latitude:         Number.isFinite(Number(m.latitude || latitude)) ? Number(m.latitude || latitude) : null,
          longitude:        Number.isFinite(Number(m.longitude || longitude)) ? Number(m.longitude || longitude) : null,
          gps_coordinates:  m.gps_coordinates || gpsAddress,
          maps_url:         m.maps_url || mapsUrl,
          is_baptized:      Boolean(m.isBaptized),
          baptism_date:     (m.isBaptized && m.baptismDate && String(m.baptismDate).trim()) ? m.baptismDate : null,
          is_anointed:      Boolean(m.isAnointed),
          holy_spirit_baptism_date: (m.isAnointed && m.holySpiritBaptismDate && String(m.holySpiritBaptismDate).trim()) ? m.holySpiritBaptismDate : null,
          wedding_anniversary: m.weddingAnniversary && String(m.weddingAnniversary).trim() ? m.weddingAnniversary : null,
          ministry_talents: Array.isArray(m.ministryTalents) ? m.ministryTalents : [],
          raw_payload:      m,
          updated_at:       m.updated_at || now,
        });
      });
    }

    // 3. Standalone member fallback
    if (!fam.headMember && (!Array.isArray(fam.members) || fam.members.length === 0)) {
      const headName = fam.name || fam.head_name || fam.headName || 'Member';
      const headId   = fam.id || fam.memberId || fam.houseId || `${familyId}-H`;

      flatMembersPayload.push({
        id:               headId,
        family_id:        familyId,
        family_name:      familyName,
        head_name:        headName,
        house_id:         headId,
        household_role:   'HEAD',
        name:             headName,
        gender:           fam.gender || 'Male',
        date_of_birth:    (fam.dob || fam.date_of_birth) && String(fam.dob || fam.date_of_birth).trim() ? (fam.dob || fam.date_of_birth) : null,
        age:              fam.age ? parseInt(fam.age, 10) : null,
        blood_group:      fam.bloodGroup || fam.blood_group || null,
        phone:            fam.phone || fam.mobile || '',
        email:            fam.email || '',
        campus,
        area,
        address,
        latitude:         Number.isFinite(Number(latitude)) ? Number(latitude) : null,
        longitude:        Number.isFinite(Number(longitude)) ? Number(longitude) : null,
        gps_coordinates:  gpsAddress,
        maps_url:         mapsUrl,
        is_baptized:      Boolean(fam.isBaptized || fam.is_baptized),
        baptism_date:     ((fam.isBaptized || fam.is_baptized) && (fam.baptismDate || fam.baptism_date) && String(fam.baptismDate || fam.baptism_date).trim()) ? (fam.baptismDate || fam.baptism_date) : null,
        is_anointed:      Boolean(fam.isAnointed || fam.is_anointed),
        holy_spirit_baptism_date: ((fam.isAnointed || fam.is_anointed) && (fam.holySpiritBaptismDate || fam.holy_spirit_baptism_date) && String(fam.holySpiritBaptismDate || fam.holy_spirit_baptism_date).trim()) ? (fam.holySpiritBaptismDate || fam.holy_spirit_baptism_date) : null,
        wedding_anniversary: (fam.weddingAnniversary || fam.wedding_anniversary) && String(fam.weddingAnniversary || fam.wedding_anniversary).trim() ? (fam.weddingAnniversary || fam.wedding_anniversary) : null,
        ministry_talents: Array.isArray(fam.ministryTalents || fam.ministry_talents) ? (fam.ministryTalents || fam.ministry_talents) : [],
        raw_payload:      fam,
        updated_at:       fam.updated_at || now,
      });
    }
  });

  if (flatMembersPayload.length > 0) {
    const CHUNK = 500;
    for (let i = 0; i < flatMembersPayload.length; i += CHUNK) {
      const chunk = flatMembersPayload.slice(i, i + CHUNK);
      const { error } = await supabase.from('members').upsert(chunk, { onConflict: 'id' });
      if (error) {
        console.error('[CloudSync Error - Members]:', error.message);
        throw error;
      }
    }
    console.log(`[CloudSync] ✓ ${flatMembersPayload.length} Members (Heads & Sub-members) pushed to Supabase.`);
  }
}

// ── Legacy alias kept for any external callers ────────────────
export const syncVisitors = async (localVisitors = []) => {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase unconfigured', count: 0 };
  try {
    const res = await syncModuleBidirectional(supabase, 'visitors', 'visitors');
    return { success: true, count: res.pushed, cloudData: [] };
  } catch (err) {
    return { success: false, error: err.message || 'Unknown sync error', count: 0 };
  }
};
