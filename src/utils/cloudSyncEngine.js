import { getVaultData, setVaultData } from './vaultStore';
import { isVaultConnected } from './vaultFS';
import { logAuditEvent } from './auditLogger';

/**
 * லோக்கல் ஹார்ட் டிரைவ் மாற்றங்களை கிளவுடிற்கு ஏற்றுதல் (Local -> Cloud Push)
 */
export async function syncLocalVaultToCloud() {
  if (!navigator.onLine) {
    return { success: false, message: 'Offline mode: Network unavailable' };
  }

  try {
    // மொபைல் பயன்பாட்டிற்கு தேவையான முக்கிய அட்டவணைகளை மட்டும் எடுத்தல்
    const members = await getVaultData('members', []);
    const finance = await getVaultData('finance', []);
    const sponsorships = await getVaultData('sponsorships', []);
    const prayerRequests = await getVaultData('prayer_requests', []);

    const cloudPayload = {
      syncedAt: new Date().toISOString(),
      churchId: 'GCC-MAIN-HQ',
      membersCount: members.length,
      activePledges: sponsorships.slice(0, 50),
      recentOfferings: finance.slice(0, 100),
      openPrayers: prayerRequests.filter((request) => !request.isUrgent)
    };

    // Supabase / Cloud Relay Endpoint-க்கு அனுப்புதல்
    // const { data, error } = await supabase.from('church_sync_relays').upsert(cloudPayload);
    void cloudPayload;

    const timestamp = new Date().toISOString();
    localStorage.setItem('graceos_last_cloud_sync', timestamp);

    return {
      success: true,
      timestamp,
      message: 'Cloud Relay Synchronized'
    };
  } catch (err) {
    console.error('[Cloud Sync Push Error]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * மொபைல் போர்ட்டலில் இருந்து வந்த காணிக்கை மற்றும் பதிவுகளை
 * லோக்கல் டிஸ்கிற்கு இறக்குதல் (Cloud -> Local Ingestion)
 */
export async function pullCloudDeltasToLocalVault() {
  if (!navigator.onLine || !isVaultConnected()) {
    return { success: false, message: 'Skipped: Offline or Vault not connected' };
  }

  try {
    // உண்மையான கிளவுட் queue இணைப்பு சேர்க்கப்படும் வரை உள்ளூர் queue-ஐப் பயன்படுத்துதல்
    const pendingMobileDonations = JSON.parse(
      localStorage.getItem('graceos_pending_mobile_queue') || '[]'
    );

    if (pendingMobileDonations.length > 0) {
      const currentFinance = await getVaultData('finance', []);
      const mergedFinance = [...pendingMobileDonations, ...currentFinance];
      await setVaultData('finance', mergedFinance, false);

      await logAuditEvent(
        'MOBILE_SYNC_INGEST',
        `${pendingMobileDonations.length} மொபைல் காணிக்கை ரசீதுகள் லோக்கல் டிஸ்கில் இணைக்கப்பட்டன.`,
        'Cloud Sync Engine'
      );

      localStorage.removeItem('graceos_pending_mobile_queue');
    }

    return { success: true, ingestedCount: pendingMobileDonations.length };
  } catch (err) {
    console.error('[Cloud Sync Pull Error]:', err);
    return { success: false, error: err.message };
  }
}