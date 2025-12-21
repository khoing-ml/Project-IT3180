export interface Visitor {
  id: string;
  resident_id: string;
  visitor_name: string;
  visitor_phone?: string;
  visitor_email?: string;
  purpose: string;
  expected_arrival: string;
  expected_departure?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  resident?: {
    id: string;
    username: string;
    full_name: string;
    apartment_number?: string;
    email: string;
  };
  approver?: {
    id: string;
    username: string;
    full_name: string;
  };
}

export interface AccessCard {
  id: string;
  resident_id: string;
  card_number: string;
  card_type: 'resident' | 'guest' | 'staff';
  status: 'active' | 'inactive' | 'lost' | 'blocked';
  issued_date: string;
  issued_by?: string;
  expiry_date?: string;
  reason_for_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  resident?: {
    id: string;
    username: string;
    full_name: string;
    apartment_number?: string;
    email: string;
  };
  issuer?: {
    id: string;
    username: string;
    full_name: string;
  };
}
