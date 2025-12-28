import { supabase } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Get authentication token from current session
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to extract useful error message fields from backend
    const body = await response.json().catch(() => null);
    const errMsg = (body && (body.error || body.message || body?.error_description)) || `Request failed with status ${response.status}`;
    throw new Error(errMsg);
  }

  return response.json();
}

// User Management API
export const userAPI = {
  /**
   * Get all users with pagination and filters
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'admin' | 'manager' | 'user';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const query = queryParams.toString();
    return apiRequest<{
      users: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/users${query ? `?${query}` : ''}`);
  },

  /**
   * Get user by ID
   */
  getById: async (id: string) => {
    return apiRequest<{ user: any }>(`/users/${id}`);
  },

  /**
   * Create new user
   */
  create: async (userData: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    role: 'admin' | 'manager' | 'user';
    apartment_number?: string;
  }) => {
    return apiRequest<{ message: string; user: any }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user
   */
  update: async (id: string, userData: {
    username?: string;
    full_name?: string;
    role?: 'admin' | 'manager' | 'user';
    apartment_number?: string;
    email?: string;
  }) => {
    return apiRequest<{ message: string; user: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user
   */
  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Reset user password
   */
  resetPassword: async (id: string, password: string) => {
    return apiRequest<{ message: string }>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};

// Visitor Management API
export const visitorAPI = {
  /**
   * Get all visitors (admin/manager see all, residents see own)
   */
  getAll: async () => {
    return apiRequest<any[]>('/visitors', {
      method: 'GET',
    });
  },

  /**
   * Get pending visitor requests (admin/manager only)
   */
  getPending: async () => {
    return apiRequest<any[]>('/visitors/pending', {
      method: 'GET',
    });
  },

  /**
   * Get visitor by ID
   */
  getById: async (id: string) => {
    return apiRequest<any>(`/visitors/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create new visitor request
   */
  create: async (visitorData: {
    visitor_name: string;
    visitor_phone?: string;
    visitor_email?: string;
    purpose: string;
    expected_arrival: string;
    expected_departure?: string;
    notes?: string;
  }) => {
    return apiRequest<any>('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitorData),
    });
  },

  /**
   * Update visitor status (admin/manager only)
   */
  updateStatus: async (id: string, status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled', notes?: string) => {
    return apiRequest<any>(`/visitors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  },

  /**
   * Cancel visitor request
   */
  cancel: async (id: string) => {
    return apiRequest<any>(`/visitors/${id}/cancel`, {
      method: 'PUT',
    });
  },

  /**
   * Delete visitor record (admin only)
   */
  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/visitors/${id}`, {
      method: 'DELETE',
    });
  },
};

// Access Card Management API
export const accessCardAPI = {
  /**
   * Get all access cards (admin/manager see all, residents see own)
   */
  getAll: async () => {
    return apiRequest<any[]>('/access-cards', {
      method: 'GET',
    });
  },

  /**
   * Get card by ID
   */
  getById: async (id: string) => {
    return apiRequest<any>(`/access-cards/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Get all cards for a resident (admin/manager only)
   */
  getByResident: async (residentId: string) => {
    return apiRequest<any[]>(`/access-cards/resident/${residentId}`, {
      method: 'GET',
    });
  },

  /**
   * Get cards by status (admin/manager only)
   */
  getByStatus: async (status: 'active' | 'inactive' | 'lost' | 'blocked') => {
    return apiRequest<any[]>(`/access-cards/status/${status}`, {
      method: 'GET',
    });
  },

  /**
   * Create new access card (admin/manager only)
   */
  create: async (cardData: {
    resident_id: string;
    card_number: string;
    card_type?: 'resident' | 'guest' | 'staff';
    expiry_date?: string;
    notes?: string;
  }) => {
    return apiRequest<any>('/access-cards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  },

  /**
   * Update card status (admin/manager only)
   */
  updateStatus: async (id: string, status: 'active' | 'inactive' | 'lost' | 'blocked', reason?: string) => {
    return apiRequest<any>(`/access-cards/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason_for_status: reason }),
    });
  },

  /**
   * Report card as lost
   */
  reportLost: async (id: string) => {
    return apiRequest<any>(`/access-cards/${id}/report-lost`, {
      method: 'PUT',
    });
  },

  /**
   * Delete card record (admin only)
   */
  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/access-cards/${id}`, {
      method: 'DELETE',
    });
  },
};

// Resident Management API
export const residentAPI = {
  // List residents by apartment id
  listByApartment: async (apt_id: string) => {
    const res = await apiRequest<any>(`/residents/apartment/${encodeURIComponent(apt_id)}`, { method: 'GET' });
    // backend may return either an array or an object { success, data }
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  // Create resident
  create: async (payload: {
    apt_id: string;
    full_name: string;
    phone?: string;
    email?: string;
    is_owner?: boolean;
  }) => {
    return apiRequest<any>('/residents', { method: 'POST', body: JSON.stringify(payload) });
  },

  // Delete resident (if deleting owner, send new_owner_id in body)
  delete: async (id: string, new_owner_id?: string) => {
    return apiRequest<{ message: string }>(`/residents/${id}`, { method: 'DELETE', body: JSON.stringify({ new_owner_id }) });
  }
  ,
  // List all residents in system
  listAll: async () => {
    const res = await apiRequest<any>('/residents/all', { method: 'GET' });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }
};

// Bill Configuration API
export const billsAPI = {
  /**
   * Create a new bill configuration (draft)
   */
  setupBills: async (period: string, services: any[]) => {
    return apiRequest<any>('/bills/setup', {
      method: 'POST',
      body: JSON.stringify({ period, services }),
    });
  },

  /**
   * Publish bill configuration and notify all clients
   */
  publishConfiguration: async (configId: string) => {
    return apiRequest<any>('/bills/publish', {
      method: 'POST',
      body: JSON.stringify({ configId }),
    });
  },

  /**
   * Get all bill configurations
   */
  getAllConfigurations: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiRequest<any>(`/bills/configs${params}`);
  },

  getAvailablePeriods: async () => {
    // This endpoint is safe to call without a user token (reads available periods),
    // so fetch it directly rather than requiring `apiRequest` which enforces auth.
    try {
      const res = await fetch(`${API_BASE_URL}/bills/periods`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const errMsg = (body && (body.error || body.message)) || `Request failed with status ${res.status}`;
        throw new Error(errMsg);
      }
      return res.json();
    } catch (e) {
      // propagate as error for caller to handle
      throw e;
    }
  },

  getPeriodSummary: async (period: string) => {
    const token = await getAuthToken();
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/bills/summary?period=${encodeURIComponent(period)}`, { method: 'GET', headers });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const errMsg = (body && (body.error || body.message)) || `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }
    return res.json();
  },

  /**
   * Get specific bill configuration
   */
  getConfiguration: async (configId: string) => {
    return apiRequest<any>(`/bills/config/${configId}`);
  },

  /**
   * Update bill configuration (draft only)
   */
  updateConfiguration: async (configId: string, period?: string, services?: any[]) => {
    return apiRequest<any>(`/bills/config/${configId}`, {
      method: 'PATCH',
      body: JSON.stringify({ period, services }),
    });
  },

  /**
   * Delete bill configuration (draft only)
   */
  deleteConfiguration: async (configId: string) => {
    return apiRequest<any>(`/bills/config/${configId}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Submit measured units for resident's apartment (water, parking, ...)
   */
  submitUnits: async (apt_id: string, units: { name: string; units: number }[], period?: string) => {
    return apiRequest<any>('/bills/submit-units', {
      method: 'POST',
      body: JSON.stringify({ apt_id, units, period }),
    });
  },
  /**
   * Submit measured units for multiple apartments in bulk
   * rows: [{ apt_id: string, services: { name: string, units: number }[] }]
   */
  submitBulk: async (rows: { apt_id: string; services: { name: string; units: number }[] }[], period?: string) => {
    return apiRequest<any>('/bills/submit-bills', {
      method: 'POST',
      body: JSON.stringify({ rows, period }),
    });
  },
};
