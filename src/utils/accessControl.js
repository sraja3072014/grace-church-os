// src/utils/accessControl.js
import { getVaultData } from './vaultStore';

// AccessControlTab-ல் உள்ள defaultPermissions அமைப்பை இங்கும் வைத்திருக்கவும்
const DEFAULT_PERMISSIONS = {
  'Senior Pastor / Super Admin': { dashboard: true, members: true, finance: true, auditReports: true, branches: true, attendanceScan: true, sundaySchool: true, pastoralCare: true, settings: true },
  'Finance Officer': { dashboard: true, members: false, finance: true, auditReports: true, branches: false, attendanceScan: false, sundaySchool: false, pastoralCare: false, settings: false },
  'Sunday School Teacher': { dashboard: false, members: false, finance: false, auditReports: false, branches: false, attendanceScan: true, sundaySchool: true, pastoralCare: false, settings: false },
  'Youth Leader': { dashboard: false, members: false, finance: false, auditReports: false, branches: false, attendanceScan: true, sundaySchool: false, pastoralCare: true, settings: false }
};

// பயனர் அந்த மாட்யூலை அணுகலாமா எனப் பார்க்கும் செயல்பாடு
export function checkModulePermission(userRole, moduleKey) {
  if (!userRole) return false;
  // Super Admin-க்கு எப்போதும் முழு அனுமதி
  if (userRole.includes('Senior Pastor') || userRole.includes('Super Admin')) return true;

  // லோக்கல் ஸ்டோரேஜில் உள்ள AccessControlTab மேட்ரிக்ஸைப் படித்தல்
  const savedMatrix = localStorage.getItem('graceos_role_permissions');
  const permissions = savedMatrix ? JSON.parse(savedMatrix) : DEFAULT_PERMISSIONS;

  // அந்த ரோலுக்குரிய அனுமதியை சரிபார்த்தல்
  return permissions[userRole]?.[moduleKey] ?? false;
}

export const canAccessModule = checkModulePermission;