export interface Resident {
  id: string;
  apt_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  is_owner?: boolean;
  created_at?: string;
}
