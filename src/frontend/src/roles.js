export const ROLES = {
  super_admin: {
    key: 'super_admin',
    label: 'Super Admin',
    description: 'Owns role access, invites, storage operations, and health visibility.',
    permissions: ['manage_roles', 'invite_users', 'upload', 'sync', 'delete', 'download', 'view_files', 'view_health'],
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    description: 'Runs day-to-day storage operations across AWS and Azure.',
    permissions: ['upload', 'sync', 'delete', 'download', 'view_files', 'view_health'],
  },
  viewer: {
    key: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to files, downloads, and provider health.',
    permissions: ['download', 'view_files', 'view_health'],
  },
};

export const roleLabel = role => ROLES[role]?.label ?? 'Viewer';
export const canRole = (role, permission) => !!ROLES[role]?.permissions.includes(permission);
