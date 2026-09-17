import { syncLocalVaultToCloud, pullCloudDeltasToLocalVault } from '../../utils/cloudSyncEngine';

const runSync = async () => {
  if (!navigator.onLine) return;
  setIsSyncing(true);
  
  // 1. லோக்கல் மாற்றங்களை கிளவுடிற்கு ஏற்றுதல்
  const pushRes = await syncLocalVaultToCloud();
  
  // 2. மொபைல் போர்ட்டல் வழியே விசுவாசிகள் செலுத்திய காணிக்கைகளை லோக்கல் டிஸ்கிற்கு இறக்குதல்
  await pullCloudDeltasToLocalVault();
  
  setIsSyncing(false);
  if (pushRes.success) {
    setLastSync(pushRes.timestamp);
  }
};