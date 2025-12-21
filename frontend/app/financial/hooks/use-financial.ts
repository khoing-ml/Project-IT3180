"use client";

import { useState, useEffect, useCallback } from "react";
import { financialAPI } from "@/lib/financialApi";
import type {
  IncomeByApartment,
  IncomeByFloor,
  FinancialByFloor,
  ApartmentFinancialSummary,
  BuildingFinancialSummary,
} from "@/lib/financialApi";

export function useFinancial() {
  const [incomeByApartment, setIncomeByApartment] = useState<IncomeByApartment[]>([]);
  const [incomeByFloor, setIncomeByFloor] = useState<IncomeByFloor[]>([]);
  const [financialByFloor, setFinancialByFloor] = useState<FinancialByFloor[]>([]);
  const [debtApartments, setDebtApartments] = useState<ApartmentFinancialSummary[]>([]);
  const [buildingSummary, setBuildingSummary] = useState<BuildingFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [incomeApartmentRes, incomeFloorRes, financialFloorRes, debtRes, summaryRes] = await Promise.all([
        financialAPI.getIncomeByApartment({ page: 1, page_size: 100 }),
        financialAPI.getIncomeByFloor(),
        financialAPI.getFinancialByFloor(),
        financialAPI.getApartmentsInDebt({ page: 1, page_size: 100 }),
        financialAPI.getBuildingFinancialSummary(),
      ]);

      setIncomeByApartment(incomeApartmentRes.data);
      setIncomeByFloor(incomeFloorRes.data);
      setFinancialByFloor(financialFloorRes.data);
      setDebtApartments(debtRes.data);
      setBuildingSummary(summaryRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch financial data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    incomeByApartment,
    incomeByFloor,
    financialByFloor,
    debtApartments,
    buildingSummary,
    loading,
    error,
    refetch: fetchAll,
  };
}

