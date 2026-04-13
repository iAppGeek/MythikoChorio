// Staff roles are managed within this app via app_users.
// There is no dependency on any external school system schema.
export type AppRole = 'player' | 'teacher' | 'admin';

export type AppUser = {
  id: string; // mirrors auth.users(id)
  role: AppRole;
  display_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

// A link connecting an app_user to a record in an external school system.
// system_name: e.g. 'hshb', 'arbor', 'bromcom', 'sims'
// external_id: the primary key in that system (stored as text)
export type ExternalSystemLink = {
  id: string;
  app_user_id: string;
  system_name: string;
  external_id: string;
  linked_by: string | null;
  linked_at: string;
  notes: string | null;
};
