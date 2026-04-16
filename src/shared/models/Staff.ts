import type { Tables } from '../../types/database';

// Roles are managed within this app via app_users.
// 'player' maps to a student gameplay account; 'teacher' and 'admin' are staff.
export type AppRole = 'player' | 'teacher' | 'admin';

export type AppUser = Tables<'app_users'>;

export type ExternalSystemLink = Tables<'external_system_links'>;
