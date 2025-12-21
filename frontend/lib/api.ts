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
async function apiRequest<T>(
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
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
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

