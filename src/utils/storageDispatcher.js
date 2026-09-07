import { writeDatabaseFile, isVaultConnected } from './vaultFS';

// ஆப்பில் உள்ள அனைத்து மாடியூல்களின் ஃபைல் வரைபடம் (Registry Map)
export const MODULE_STORAGE_REGISTRY = {
  // 1. Core Church & Settings
  CHURCH_PROFILE: { key: 'graceos_main_church', file: 'church_profile.json' },
  BRANCHES: { key: 'graceos_branches', file: 'branches_management.json' },
  LOCALE_SETTINGS: { key: 'graceos_locale_config', file: 'locale_settings.json' },
  THEME_CONFIG: { key: 'graceos_theme_config', file: 'theme_settings.json' },

  // 2. Main Ministries & Registers
  MEMBERS: { key: 'app_members_family_database', file: 'members_families.json' },
  VISITORS: { key: 'app_visitors_database', file: 'visitors_funnel.json' },
  ATTENDANCE: { key: 'app_attendance_master_ledger', file: 'attendance_ledger.json' },
  
  // 3. Finance & Accounts
  FINANCE_INCOME: { key: 'app_finance_transactions_ledger', file: 'finance_income_80g.json' },
  FINANCE_EXPENSE: { key: 'app_expenses_ledger', file: 'finance_expenses.json' },

  // 4. Church Operations & Events
  PRAYER_WALL: { key: 'app_prayer_requests_db', file: 'prayer_burdens.json' },
  EVENTS_HUB: { key: 'app_events_database', file: 'events_calendar.json' },
  REPORTS_AUDIT: { key: 'graceos_audits_cache', file: 'reports_audit.json' }
};

/**
 * 🌟 ஒரே நேரத்தில் பிரவுசரிலும், ஹார்ட் டிரைவ் /database/ பாத்திலும் எழுதும் ஃபங்ஷன்
 */
export async function persistModuleData(registryItem, dataPayload) {
  try {
    // 1. Browser LocalStorage Instant Write (UI Fast Response)
    localStorage.setItem(registryItem.key, JSON.stringify(dataPayload));

    // 2. 🌟 Physical Hard Drive /database/ Auto-Write
    if (isVaultConnected()) {
      await writeDatabaseFile(registryItem.file, dataPayload);
    }
    return true;
  } catch (err) {
    console.error(`Error saving data for ${registryItem.file}:`, err);
    return false;
  }
}