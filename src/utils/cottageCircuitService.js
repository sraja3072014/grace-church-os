// src/utils/cottageCircuitService.js
// ============================================================
// Service: Area-Wise Cluster Pastoral Circuits & Visits
// Dual-write: Supabase (Online) + VaultStore (Offline/Local Disk)
// ============================================================

import { getSupabase } from './supabaseClient';
import { getVaultData, setVaultData } from './vaultStore';

export const CIRCUIT_VAULT_KEY = 'cottage_area_circuits';
export const VISITS_VAULT_KEY = 'pastoral_visits';

/**
 * Generate standard circuit ID
 */
export function generateCircuitId() {
  return `CIRC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

/**
 * Calculate coverage percentage from target families
 */
export function calculateCoverage(targetFamilies = []) {
  if (!Array.isArray(targetFamilies) || targetFamilies.length === 0) return 0;
  const visitedCount = targetFamilies.filter(f => f.status === 'VISITED').length;
  return Math.round((visitedCount / targetFamilies.length) * 100);
}

/**
 * Default sample circuits when store is empty
 */
const DEFAULT_SAMPLE_CIRCUITS = [
  {
    id: 'CIRC-77102-KODU',
    scheduled_date: new Date().toISOString().slice(0, 10),
    time_slot: '06:30 PM',
    area_name: 'Koduvai',
    host_family_id: 'FAM-101',
    host_family_name: 'Stephen Victor Household',
    assigned_leader: 'Senior Pastor',
    summary_notes: 'Focus on sick elderly members & thanksgiving for university admissions',
    coverage_percentage: 50,
    status: 'IN_PROGRESS',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    target_family_ids: [
      {
        family_id: 'FAM-101',
        family_name: 'Stephen Victor Household',
        head_name: 'Bro. Stephen Victor',
        phone: '+91 98430 11223',
        address: '12, New Housing Unit, Koduvai',
        status: 'VISITED',
        prayer_notes: 'Prayed for elder mother health & peace',
        visited_at: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_host: true
      },
      {
        family_id: 'FAM-102',
        family_name: 'David Paul Household',
        head_name: 'Bro. David Paul',
        phone: '+91 98430 44556',
        address: '45, East Street, Koduvai',
        status: 'SCHEDULED',
        prayer_notes: 'Exam preparation for daughter',
        visited_at: null,
        is_host: false
      }
    ]
  }
];

/**
 * Fetch all circuits (combining VaultStore and Supabase if online)
 */
export async function fetchAreaCircuits() {
  // 1. Get from local vault first
  const localCircuits = await getVaultData(CIRCUIT_VAULT_KEY, DEFAULT_SAMPLE_CIRCUITS);
  const client = getSupabase();

  if (!client || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return Array.isArray(localCircuits) ? localCircuits : [];
  }

  // 2. Fetch from Supabase if online
  try {
    const { data: cloudCircuits, error } = await client
      .from('cottage_area_circuits')
      .select('*')
      .order('scheduled_date', { ascending: false });

    if (!error && Array.isArray(cloudCircuits) && cloudCircuits.length > 0) {
      // Merge with local using LWW
      const circuitMap = new Map();
      (localCircuits || []).forEach(c => circuitMap.set(c.id, c));
      cloudCircuits.forEach(c => {
        const local = circuitMap.get(c.id);
        if (!local || new Date(c.updated_at || 0) > new Date(local.updated_at || 0)) {
          circuitMap.set(c.id, {
            ...c,
            target_family_ids: Array.isArray(c.target_family_ids) ? c.target_family_ids : []
          });
        }
      });
      const merged = Array.from(circuitMap.values());
      await setVaultData(CIRCUIT_VAULT_KEY, merged, false);
      return merged;
    }
  } catch (err) {
    console.warn('[CircuitService] Supabase pull error, using local vault:', err?.message || err);
  }

  return Array.isArray(localCircuits) ? localCircuits : [];
}

/**
 * Save / Upsert a Circuit
 */
export async function saveAreaCircuit(circuit) {
  const now = new Date().toISOString();
  const coverage = calculateCoverage(circuit.target_family_ids);
  
  const record = {
    ...circuit,
    id: circuit.id || generateCircuitId(),
    coverage_percentage: coverage,
    updated_at: now,
    created_at: circuit.created_at || now,
    target_family_ids: Array.isArray(circuit.target_family_ids) ? circuit.target_family_ids : []
  };

  // 1. Update VaultStore
  const currentList = await getVaultData(CIRCUIT_VAULT_KEY, []);
  const existingIdx = currentList.findIndex(c => c.id === record.id);
  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = record;
  } else {
    updatedList = [record, ...currentList];
  }
  await setVaultData(CIRCUIT_VAULT_KEY, updatedList, true);

  // 2. Push to Supabase if connected
  const client = getSupabase();
  if (client && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const payload = {
        id: record.id,
        scheduled_date: record.scheduled_date,
        time_slot: record.time_slot || '07:00 PM',
        area_name: record.area_name,
        host_family_id: record.host_family_id || null,
        host_family_name: record.host_family_name || null,
        assigned_leader: record.assigned_leader || null,
        target_family_ids: record.target_family_ids,
        summary_notes: record.summary_notes || '',
        coverage_percentage: record.coverage_percentage,
        status: record.status || 'IN_PROGRESS',
        updated_at: now
      };
      await client.from('cottage_area_circuits').upsert([payload], { onConflict: 'id' });
    } catch (err) {
      console.warn('[CircuitService] Supabase upsert error:', err?.message || err);
    }
  }

  return record;
}

/**
 * Update a specific family's status inside a circuit, and automatically log the pastoral visit
 */
export async function updateCircuitFamilyStatus({
  circuitId,
  familyId,
  status, // 'SCHEDULED' | 'VISITED' | 'ABSENT'
  prayerNotes = '',
  visitedAt = null,
  leaderName = 'Senior Pastor'
}) {
  const currentList = await getVaultData(CIRCUIT_VAULT_KEY, []);
  const circuit = currentList.find(c => c.id === circuitId);
  if (!circuit) return null;

  const timestamp = status === 'VISITED' 
    ? (visitedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) 
    : null;

  let targetFam = null;

  const updatedTargets = (circuit.target_family_ids || []).map(f => {
    if (f.family_id === familyId) {
      targetFam = {
        ...f,
        status,
        prayer_notes: prayerNotes !== undefined ? prayerNotes : (f.prayer_notes || ''),
        visited_at: timestamp
      };
      return targetFam;
    }
    return f;
  });

  const updatedCircuit = {
    ...circuit,
    target_family_ids: updatedTargets,
    coverage_percentage: calculateCoverage(updatedTargets),
    updated_at: new Date().toISOString()
  };

  await saveAreaCircuit(updatedCircuit);

  // 🌟 Automatically log into pastoral_visits table
  if (targetFam) {
    await logPastoralVisitRecord({
      circuit_id: circuitId,
      family_id: familyId,
      family_name: targetFam.family_name || targetFam.head_name || 'Congregation Household',
      area_name: circuit.area_name,
      leader_name: leaderName || circuit.assigned_leader || 'Senior Pastor',
      status,
      prayer_notes: targetFam.prayer_notes || '',
      visited_at: status === 'VISITED' ? new Date().toISOString() : null
    });
  }

  return updatedCircuit;
}

/**
 * Log individual pastoral visit record
 */
export async function logPastoralVisitRecord(visit) {
  const now = new Date().toISOString();
  const visitId = `PV-${visit.circuit_id || 'IND'}-${visit.family_id}`;

  const visitRecord = {
    id: visitId,
    circuit_id: visit.circuit_id || null,
    family_id: visit.family_id,
    family_name: visit.family_name || '',
    area_name: visit.area_name || '',
    leader_name: visit.leader_name || 'Senior Pastor',
    status: visit.status || 'VISITED',
    prayer_notes: visit.prayer_notes || '',
    visited_at: visit.visited_at || (visit.status === 'VISITED' ? now : null),
    updated_at: now
  };

  // 1. VaultStore
  const allVisits = await getVaultData(VISITS_VAULT_KEY, []);
  const existingIdx = allVisits.findIndex(v => v.id === visitId);
  let updatedVisits;
  if (existingIdx >= 0) {
    updatedVisits = [...allVisits];
    updatedVisits[existingIdx] = visitRecord;
  } else {
    updatedVisits = [visitRecord, ...allVisits];
  }
  await setVaultData(VISITS_VAULT_KEY, updatedVisits, true);

  // 2. Supabase push if online
  const client = getSupabase();
  if (client && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await client.from('pastoral_visits').upsert([visitRecord], { onConflict: 'id' });
    } catch (err) {
      console.warn('[CircuitService] Pastoral visit push warning:', err?.message || err);
    }
  }

  return visitRecord;
}

/**
 * Delete a circuit
 */
export async function deleteAreaCircuit(circuitId) {
  const currentList = await getVaultData(CIRCUIT_VAULT_KEY, []);
  const filtered = currentList.filter(c => c.id !== circuitId);
  await setVaultData(CIRCUIT_VAULT_KEY, filtered, true);

  const client = getSupabase();
  if (client && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await client.from('cottage_area_circuits').delete().eq('id', circuitId);
    } catch (err) {
      console.warn('[CircuitService] Delete circuit warning:', err?.message || err);
    }
  }
  return true;
}

/**
 * Get member's pastoral visit history
 */
export async function getMemberPastoralHistory(familyId) {
  const allVisits = await getVaultData(VISITS_VAULT_KEY, []);
  return allVisits.filter(v => v.family_id === familyId);
}

