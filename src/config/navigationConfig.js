export const ROLE_KEYS = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  LEADER: 'LEADER',
  MEMBER: 'MEMBER'
};

export const ROLE_LABELS = {
  [ROLE_KEYS.SUPER_ADMIN]: 'Senior Pastor / Super Admin',
  [ROLE_KEYS.FINANCE_OFFICER]: 'Finance Officer',
  [ROLE_KEYS.LEADER]: [
    'Youth Leader',
    'Sunday School Teacher',
    'Women Fellowship Lead',
    'Men Fellowship Lead'
  ],
  [ROLE_KEYS.MEMBER]: 'Member'
};

const ALL_ROLE_KEYS = Object.values(ROLE_KEYS);
const FINANCE_ROLES = [ROLE_KEYS.SUPER_ADMIN, ROLE_KEYS.FINANCE_OFFICER];
const PERSONAL_GIVING_ROLES = [ROLE_KEYS.LEADER, ROLE_KEYS.MEMBER];

export const NAVIGATION_MODULES = [
  { id: 'dashboard', label: 'Dashboard', permittedRoles: ALL_ROLE_KEYS },
  { id: 'attendance', label: 'Attendance', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'members', label: 'Members', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'visitors', label: 'Visitors', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'ministries', label: 'Ministries', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'prayer', label: 'Prayer', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'events', label: 'Events', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'livestream', label: 'Live Stream', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  {
    id: 'finance',
    label: 'Finance',
    permittedRoles: ALL_ROLE_KEYS,
    requiresModulePermission: true,
    personalLabel: 'My Giving'
  },
  { id: 'broadcast', label: 'Broadcast', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'reports', label: 'Reports', permittedRoles: ALL_ROLE_KEYS, requiresModulePermission: true },
  { id: 'settings', label: 'Settings', permittedRoles: ALL_ROLE_KEYS }
];

export const FINANCE_SUB_TABS = [
  { id: 'donations', label: 'Income & Tithes', permittedRoles: FINANCE_ROLES },
  { id: 'expenses', label: 'Expense Vouchers', permittedRoles: FINANCE_ROLES },
  { id: 'receipts_80g', label: '80G Generator', permittedRoles: FINANCE_ROLES },
  { id: 'sponsorships', label: 'Fellowship & Sponsorships', permittedRoles: FINANCE_ROLES },
  { id: 'equipment', label: 'Equipment', permittedRoles: [ROLE_KEYS.SUPER_ADMIN] },
  { id: 'analytics', label: 'Audit & Analytics', permittedRoles: FINANCE_ROLES },
  { id: 'payroll', label: 'Staff Payroll', permittedRoles: [ROLE_KEYS.SUPER_ADMIN] },
  { id: 'agm_audit', label: 'AGM Annual Audit', permittedRoles: [ROLE_KEYS.SUPER_ADMIN] }
];

const normalizeRole = (role) => String(role || '').trim().toLowerCase().replace(/\s+/g, ' ');

export function resolveRoleKey(role) {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return null;

  if (
    normalizedRole === 'super_admin'
    || normalizedRole.includes('senior pastor')
    || normalizedRole.includes('super admin')
  ) return ROLE_KEYS.SUPER_ADMIN;

  if (normalizedRole === 'finance_officer' || normalizedRole === 'finance officer') {
    return ROLE_KEYS.FINANCE_OFFICER;
  }

  if (
    normalizedRole === 'leader'
    || ROLE_LABELS[ROLE_KEYS.LEADER].some((label) => normalizeRole(label) === normalizedRole)
  ) return ROLE_KEYS.LEADER;

  if (normalizedRole === 'member') return ROLE_KEYS.MEMBER;
  return null;
}

export function getFinanceSubTabsForRole(role) {
  const roleKey = resolveRoleKey(role);
  return FINANCE_SUB_TABS.filter((tab) => tab.permittedRoles.includes(roleKey));
}

export function isFinanceDeskRole(role) {
  return FINANCE_ROLES.includes(resolveRoleKey(role));
}

export function isPersonalGivingRole(role) {
  return PERSONAL_GIVING_ROLES.includes(resolveRoleKey(role));
}
