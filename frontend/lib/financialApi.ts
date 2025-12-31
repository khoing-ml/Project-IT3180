import { supabase } from './supabase';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/* =======================
   Helpers
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

export interface IncomeByApartment {
  apt_id: string;
  owner_name?: string;
  total_paid: number;
}

export interface IncomeByFloor {
  floor: number | null;
  total_paid: number;
}

export interface FinancialByFloor {
  floor: number | null;
  display: string;
  total_paid: number;
  total_due_current: number;
  current_pre_debt: number;
  collection_rate: string;
}

export interface ApartmentFinancialSummary {
  apt_id: string;
  new_charges_current: number;
  pre_debt: number;
  total_due_current: number;
  total_paid_all_time: number;
  current_remaining_debt: number;
  payments: any[];
}

export interface BuildingFinancialSummary {
  total_income: number;
  total_due_current: number;
  total_pre_debt: number;
  apartments_in_debt: number;
  total_apartments: number;
  debt_ratio: string;
}

export interface IncomeByPeriod {
  period: string;
  total_income: number;
  total_charges?: number;
  total_debt?: number;
  payment_count: number;
  bill_count?: number;
}

export interface FeeBreakdown {
  electric: number;
  water: number;
  service: number;
  vehicles: number;
  total: number;
}

export interface PeriodComparison {
  period1: PeriodSummary;
  period2: PeriodSummary;
  comparison: {
    income_change: number;
    income_change_percent: string;
    charges_change: number;
    debt_change: number;
  };
}

export interface PeriodSummary {
  period: string;
  total_income: number;
  total_charges: number;
  total_debt: number;
  collection_rate: string;
  bill_count: number;
  payment_count: number;
}

export interface CollectionRate {
  period: string;
  collection_rate: number;
  total_income: number;
  total_charges: number;
}

/* =======================
   Financial API
======================= */

export const financialAPI = {
  /** GET /api/payments/income-by-apartment */
  getIncomeByApartment: async (params?: {
    page?: number;
    page_size?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.page_size)
      qs.append('page_size', params.page_size.toString());

    return apiRequest<{
      data: IncomeByApartment[];
    }>(`/payments/income-by-apartment${qs.toString() ? `?${qs}` : ''}`);
  },

  /** GET /api/payments/income-by-floor */
  getIncomeByFloor: async () => {
    return apiRequest<{
      data: IncomeByFloor[];
    }>('/payments/income-by-floor');
  },

  /** GET /api/payments/financial-by-floor */
  getFinancialByFloor: async () => {
    return apiRequest<{
      data: FinancialByFloor[];
    }>('/payments/financial-by-floor');
  },

  /** GET /api/payments/debt-apartments */
  getApartmentsInDebt: async (params?: {
    page?: number;
    page_size?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', params.page.toString());
    if (params?.page_size)
      qs.append('page_size', params.page_size.toString());

    return apiRequest<{
      data: ApartmentFinancialSummary[];
    }>(`/payments/debt-apartments${qs.toString() ? `?${qs}` : ''}`);
  },

  /** GET /api/payments/apartments/:apt_id/financial-summary */
  getApartmentFinancialSummary: async (aptId: string) => {
    return apiRequest<{
      data: ApartmentFinancialSummary;
    }>(`/payments/apartments/${aptId}/financial-summary`);
  },

  /** GET /api/payments/building-summary */
  getBuildingFinancialSummary: async () => {
    return apiRequest<{
      data: BuildingFinancialSummary;
    }>('/payments/building-summary');
  },

  /** GET /api/payments/income-by-period */
  getIncomeByPeriod: async (startPeriod: string, endPeriod: string) => {
    return apiRequest<{
      data: IncomeByPeriod[];
    }>(`/payments/income-by-period?start_period=${startPeriod}&end_period=${endPeriod}`);
  },

  /** GET /api/payments/fee-breakdown */
  getFeeBreakdown: async (period?: string) => {
    const url = period 
      ? `/payments/fee-breakdown?period=${period}`
      : '/payments/fee-breakdown';
    return apiRequest<{
      data: FeeBreakdown;
    }>(url);
  },

  /** GET /api/payments/compare-periods */
  comparePeriodsFinancial: async (period1: string, period2: string) => {
    return apiRequest<{
      data: PeriodComparison;
    }>(`/payments/compare-periods?period1=${period1}&period2=${period2}`);
  },

  /** GET /api/payments/collection-rate */
  getCollectionRateByPeriod: async (startPeriod: string, endPeriod: string) => {
    return apiRequest<{
      data: CollectionRate[];
    }>(`/payments/collection-rate?start_period=${startPeriod}&end_period=${endPeriod}`);
  },

  /** GET /api/payments/period-summary/:period */
  getPeriodSummary: async (period: string) => {
    return apiRequest<{
      data: PeriodSummary;
    }>(`/payments/period-summary/${period}`);
  },
};
