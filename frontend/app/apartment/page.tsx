"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/types/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { ApartmentTable } from "./components/apartment-table";
import { ApartmentToolbar } from "./components/apartment-toolbar";
import { ApartmentDialog } from "./components/apartment-dialog";
import { apartmentColumns } from "./components/apartment-columns";
import { useApartments } from "./hooks/use-apartments";
import { type Apartment } from "@/lib/apartmentApi";
import { Building2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { Toaster } from "./components/ui/toaster";

export default function ApartmentPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  const {
    apartments,
    loading,
    pagination,
    createApartment,
    updateApartment,
    deleteApartment,
    refetch,
  } = useApartments({
    page,
    page_size: 10,
    search: search || undefined,
  });

  const handleAdd = () => {
    setSelectedApartment(null);
    setDialogOpen(true);
  };

  const handleEdit = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setDialogOpen(true);
  };

  const handleDelete = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedApartment) {
      await deleteApartment(selectedApartment.apt_id);
      setDeleteDialogOpen(false);
      setSelectedApartment(null);
    }
  };

  const handleSubmit = async (data: Apartment) => {
    if (selectedApartment) {
      await updateApartment(selectedApartment.apt_id, data);
    } else {
      await createApartment(data);
    }
    setDialogOpen(false);
    setSelectedApartment(null);
  };

  const columns = apartmentColumns(handleEdit, handleDelete);

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-72 mr-4">
          <Header />
          <main className="p-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Danh sách hộ dân / căn hộ</CardTitle>
                    <CardDescription>
                      Quản lý thông tin các căn hộ và chủ hộ trong chung cư
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ApartmentToolbar
                  search={search}
                  onSearchChange={setSearch}
                  onAddClick={handleAdd}
                  onRefresh={refetch}
                />
                <ApartmentTable
                  columns={columns}
                  data={apartments}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={setPage}
                />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <ApartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        apartment={selectedApartment}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa căn hộ{" "}
              <strong>{selectedApartment?.apt_id}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </ProtectedRoute>
  );
}
