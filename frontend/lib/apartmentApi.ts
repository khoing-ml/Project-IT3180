import { supabase } from './supabase';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/* =======================
   Shared helpers
======================= */

async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error('No authentication token available');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

/* =======================
   Types
======================= */

export type ApartmentStatus = 'occupied' | 'vacant' | 'rented';

export interface Apartment {
  apt_id: string;
  floor?: number;
  area?: number;
  owner_name: string;
  owner_phone?: string;
  owner_email?: string;
  status?: ApartmentStatus;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/* =======================
   Apartment API
======================= */

export const apartmentAPI = {
  /** GET /api/apartments */
  getAll: async (params?: {
    page?: number;
    page_size?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.page_size)
      qs.append('page_size', params.page_size.toString());

    return apiRequest<{
      data: Apartment[];
      pagination: Pagination;
    }>(`/apartments${qs.toString() ? `?${qs}` : ''}`);
  },

  /** GET /api/apartments/search */
  search: async (params: {
    q: string;
    page?: number;
    page_size?: number;
  }) => {
    const qs = new URLSearchParams();
    qs.append('q', params.q);
    if (params.page) qs.append('page', params.page.toString());
    if (params.page_size)
      qs.append('page_size', params.page_size.toString());

    return apiRequest<{
      data: Apartment[];
      pagination: Pagination;
    }>(`/apartments/search?${qs}`);
  },

  /** GET /api/apartments/:apt_id */
  getById: async (aptId: string) => {
    return apiRequest<{ data: Apartment }>(`/apartments/${aptId}`);
  },

  /** POST /api/apartments */
  create: async (data: Apartment) => {
    return apiRequest<{
      message: string;
      data: Apartment;
    }>('/apartments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** PUT /api/apartments/:apt_id */
  update: async (aptId: string, data: Partial<Apartment>) => {
    return apiRequest<{
      message: string;
      data: Apartment;
    }>(`/apartments/${aptId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** DELETE /api/apartments/:apt_id */
  delete: async (aptId: string) => {
    return apiRequest<{ message: string }>(`/apartments/${aptId}`, {
      method: 'DELETE',
    });
  },
};
