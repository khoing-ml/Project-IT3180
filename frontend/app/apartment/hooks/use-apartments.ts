"use client";

import { useState, useEffect, useCallback } from "react";
import { apartmentAPI, type Apartment } from "@/lib/apartmentApi";
import { useToast } from "../components/ui/use-toast";

interface UseApartmentsParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export function useApartments(params: UseApartmentsParams = {}) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  });
  const { toast } = useToast();

  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = params.search
        ? await apartmentAPI.search({
            q: params.search,
            page: params.page || 1,
            page_size: params.page_size || 10,
          })
        : await apartmentAPI.getAll({
            page: params.page || 1,
            page_size: params.page_size || 10,
          });

      setApartments(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch apartments";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [params.page, params.page_size, params.search, toast]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  const createApartment = async (data: Apartment) => {
    try {
      await apartmentAPI.create(data);
      toast({
        title: "Thành công",
        description: "Đã tạo căn hộ thành công",
      });
      await fetchApartments();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Failed to create apartment",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateApartment = async (aptId: string, data: Partial<Apartment>) => {
    try {
      await apartmentAPI.update(aptId, data);
      toast({
        title: "Thành công",
        description: "Đã cập nhật căn hộ thành công",
      });
      await fetchApartments();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Failed to update apartment",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteApartment = async (aptId: string) => {
    try {
      await apartmentAPI.delete(aptId);
      toast({
        title: "Thành công",
        description: "Đã xóa căn hộ thành công",
      });
      await fetchApartments();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Failed to delete apartment",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    apartments,
    loading,
    error,
    pagination,
    refetch: fetchApartments,
    createApartment,
    updateApartment,
    deleteApartment,
  };
}

