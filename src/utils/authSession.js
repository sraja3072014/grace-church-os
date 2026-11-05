import { getVaultData, setVaultData } from './vaultStore';

export function sanitizeStaffRecords(staffRecords) {
  return (Array.isArray(staffRecords) ? staffRecords : []).map((staff) => {
    const safeStaff = { ...(staff || {}) };
    delete safeStaff.password;
    delete safeStaff.passcode;

    if (safeStaff.raw_payload && typeof safeStaff.raw_payload === 'object') {
      const safePayload = { ...safeStaff.raw_payload };
      delete safePayload.password;
      delete safePayload.passcode;
      safeStaff.raw_payload = safePayload;
    }

    return safeStaff;
  });
}

export async function sanitizeStaffVault() {
  const staffRecords = await getVaultData('staff', []);
  const sanitizedRecords = sanitizeStaffRecords(staffRecords);
  if (JSON.stringify(sanitizedRecords) !== JSON.stringify(staffRecords)) {
    await setVaultData('staff', sanitizedRecords, false);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('graceos_vault_staff');
  }
}

export async function buildAuthSession(authUser, supabase) {
  if (!authUser) return null;

  const metadata = authUser.user_metadata || {};
  const trustedAppRole = typeof authUser.app_metadata?.role === 'string'
    ? authUser.app_metadata.role.trim()
    : '';
  const normalizedTrustedRole = trustedAppRole.toLowerCase();
  const isTrustedAdminRole = [
    'admin',
    'pastor',
    'senior pastor / super admin'
  ].includes(normalizedTrustedRole);
  const selfAssignedRoles = new Set([
    'Sunday School Teacher',
    'Youth Leader',
    'Women Fellowship Lead',
    'Men Fellowship Lead',
    'Member'
  ]);
  const selfAssignedRole = selfAssignedRoles.has(metadata.role) ? metadata.role : '';
  let staffProfile = null;
  const { data, error } = await supabase
    .from('staff')
    .select('name, role, department, campus, phone, username')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.warn('[Auth] Could not load the staff profile:', error.message);
  } else {
    staffProfile = data;
  }

  const profileRole = staffProfile?.role || '';
  const normalizedProfileRole = String(profileRole).trim().toLowerCase();
  const isUntrustedAdminRole = normalizedProfileRole === 'admin'
    || normalizedProfileRole === 'pastor'
    || normalizedProfileRole.includes('senior pastor')
    || normalizedProfileRole.includes('super admin');

  return {
    id: authUser.id,
    authUserId: authUser.id,
    email: authUser.email || '',
    username: staffProfile?.username || metadata.username || authUser.email || '',
    name: staffProfile?.name || metadata.name || authUser.email || 'GraceOS User',
    role: isTrustedAdminRole
      ? 'Senior Pastor / Super Admin'
      : (trustedAppRole || (isUntrustedAdminRole ? '' : profileRole) || selfAssignedRole),
    department: staffProfile?.department || metadata.department || selfAssignedRole,
    campus: staffProfile?.campus || metadata.campus || 'Headquarters',
    phone: staffProfile?.phone || metadata.phone || '',
    activeCampus: staffProfile?.campus || metadata.campus || 'Headquarters'
  };
}

export function persistAuthSession(session) {
  if (!session) {
    localStorage.removeItem('graceos_auth_session');
    localStorage.removeItem('graceos_session');
    return;
  }

  const { password, ...safeSession } = session;
  localStorage.setItem('graceos_auth_session', JSON.stringify(safeSession));
  localStorage.setItem('graceos_session', JSON.stringify(safeSession));
}
