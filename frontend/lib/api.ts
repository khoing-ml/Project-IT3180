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
