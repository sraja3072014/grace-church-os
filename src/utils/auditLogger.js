import { getVaultData, setVaultData } from './vaultStore';

/**
 * கணினி தணிக்கைப் பதிவை (Audit Log) லோக்கல் ஹார்ட் டிஸ்கில் பாதுகாப்பாகப் பதிவு செய்தல்
 * @param {string} action - நிகழ்வின் பெயர் (எ.கா: 'MEMBER_REGISTERED', 'OFFERING_RECEIVED', 'PAYROLL_DISBURSED')
 * @param {string} details - நிகழ்வின் விரிவான தகவல்
 * @param {string} actor - செய்த பயனர் / ஊழியர் (எ.கா: session.username)
 * @param {string} severity - 'INFO' | 'WARN' | 'CRITICAL'
 */
export async function logAuditEvent(action, details, actor = 'System Admin', severity = 'INFO') {
  const newLogEntry = {
    id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: new Date().toISOString().slice(0, 10),
    action,
    details,
    actor,
    severity,
    node: 'Host Server Local Disk'
  };

  try {
    const existingLogs = await getVaultData('audit_logs', []);
    // புதிய பதிவை முன்னால் வைத்து, அதிகபட்சம் 5,000 தணிக்கை பதிவுகளைப் பராமரித்தல்
    const updatedLogs = [newLogEntry, ...existingLogs.slice(0, 4999)];
    await setVaultData('audit_logs', updatedLogs, false); // தணிக்கை லாக் கிளவுடிற்கு செல்ல வேண்டியதில்லை; லோக்கலிலேயே இருக்கும்
  } catch (err) {
    console.error('[Audit Logger Error] Failed to write audit event:', err);
  }
}