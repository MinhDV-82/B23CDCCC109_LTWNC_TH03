import { can, Role, Action } from '@/lib/permissions';

describe('Permissions Matrix - can(role, action)', () => {
  describe('Guest role (Unauthenticated / Public visitors)', () => {
    it('should ALLOW viewing deadlines', () => {
      expect(can('guest', 'view_deadline')).toBe(true);
    });

    it('should FORBID completing deadlines', () => {
      expect(can('guest', 'complete_deadline')).toBe(false);
    });

    it('should FORBID creating deadlines', () => {
      expect(can('guest', 'create_deadline')).toBe(false);
    });

    it('should FORBID deleting deadlines', () => {
      expect(can('guest', 'delete_deadline')).toBe(false);
    });
  });

  describe('User role (Logged-in Student)', () => {
    it('should ALLOW viewing deadlines', () => {
      expect(can('user', 'view_deadline')).toBe(true);
    });

    it('should ALLOW completing deadlines', () => {
      expect(can('user', 'complete_deadline')).toBe(true);
    });

    it('should FORBID creating deadlines', () => {
      expect(can('user', 'create_deadline')).toBe(false);
    });

    it('should FORBID deleting deadlines', () => {
      expect(can('user', 'delete_deadline')).toBe(false);
    });
  });

  describe('Admin role (Class Monitor / Administrator)', () => {
    it('should ALLOW viewing deadlines', () => {
      expect(can('admin', 'view_deadline')).toBe(true);
    });

    it('should ALLOW completing deadlines', () => {
      expect(can('admin', 'complete_deadline')).toBe(true);
    });

    it('should ALLOW creating deadlines', () => {
      expect(can('admin', 'create_deadline')).toBe(true);
    });

    it('should ALLOW deleting deadlines', () => {
      expect(can('admin', 'delete_deadline')).toBe(true);
    });
  });

  describe('Unauthenticated users (undefined / null)', () => {
    it('should treat undefined as guest (allow view, deny others)', () => {
      expect(can(undefined, 'view_deadline')).toBe(true);
      expect(can(undefined, 'complete_deadline')).toBe(false);
      expect(can(undefined, 'create_deadline')).toBe(false);
      expect(can(undefined, 'delete_deadline')).toBe(false);
    });

    it('should treat null as guest (allow view, deny others)', () => {
      expect(can(null, 'view_deadline')).toBe(true);
      expect(can(null, 'complete_deadline')).toBe(false);
      expect(can(null, 'create_deadline')).toBe(false);
      expect(can(null, 'delete_deadline')).toBe(false);
    });
  });

  describe('Invalid or malicious inputs (Security & Runtime safety)', () => {
    it('should return false for invalid roles', () => {
      expect(can('hacker' as Role, 'view_deadline')).toBe(false);
      expect(can('superadmin' as Role, 'create_deadline')).toBe(false);
      expect(can('root' as Role, 'delete_deadline')).toBe(false);
      expect(can('' as Role, 'view_deadline')).toBe(false);
    });

    it('should return false for invalid actions', () => {
      expect(can('admin', 'drop_database' as Action)).toBe(false);
      expect(can('admin', 'manage_users' as Action)).toBe(false);
      expect(can('user', 'execute_code' as Action)).toBe(false);
      expect(can('admin', '' as Action)).toBe(false);
      expect(can('admin', null as unknown as Action)).toBe(false);
    });

    it('should return false when both role and action are invalid', () => {
      expect(can('random_role' as Role, 'random_action' as Action)).toBe(false);
    });
  });
});

