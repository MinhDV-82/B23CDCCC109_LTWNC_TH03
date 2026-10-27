export type Role = 'guest' | 'user' | 'admin';

export type Action =
  | 'view_deadline'
  | 'complete_deadline'
  | 'create_deadline'
  | 'delete_deadline';

const PERMISSION_MATRIX: Record<Role, Record<Action, boolean>> = {
  guest: {
    view_deadline: true,
    complete_deadline: false,
    create_deadline: false,
    delete_deadline: false,
  },
  user: {
    view_deadline: true,
    complete_deadline: true,
    create_deadline: false,
    delete_deadline: false,
  },
  admin: {
    view_deadline: true,
    complete_deadline: true,
    create_deadline: true,
    delete_deadline: true,
  },
};

const VALID_ROLES = new Set<string>(['guest', 'user', 'admin']);
const VALID_ACTIONS = new Set<string>([
  'view_deadline',
  'complete_deadline',
  'create_deadline',
  'delete_deadline',
]);

/**
 * Single source of truth for authorization across the entire application.
 * Checks whether a given role has permission to perform an action.
 */
export function can(role: Role | string | undefined | null, action: Action | string | undefined | null): boolean {
  if (role === undefined || role === null) {
    // Unauthenticated user is treated as guest
    role = 'guest';
  }

  // Runtime safety validation for unexpected strings
  if (!VALID_ROLES.has(role)) {
    return false;
  }

  if (!action || !VALID_ACTIONS.has(action)) {
    return false;
  }

  const roleRules = PERMISSION_MATRIX[role as Role];
  if (!roleRules) {
    return false;
  }

  return Boolean(roleRules[action as Action]);
}
