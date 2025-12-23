"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/types/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Badge } from "./components/ui/badge";
import { Building2, Search, Plus, Edit, Trash2, Loader2, RefreshCw } from "lucide-react";
import { apartmentAPI, type Apartment } from "@/lib/apartmentApi";
import { ApartmentDialog } from "./components/apartment-dialog";
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

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "occupied":
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">Đã có người ở</Badge>;
    case "vacant":
      return <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">Trống</Badge>;
    case "rented":
      return <Badge variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600">Cho thuê</Badge>;
    default:
      return <Badge variant="secondary">-</Badge>;
  }
};

export default function ApartmentPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  const itemsPerPage = 10;

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const response = search
        ? await apartmentAPI.search({
            q: search,
            page: currentPage,
            page_size: itemsPerPage,
          })
        : await apartmentAPI.getAll({
            page: currentPage,
            page_size: itemsPerPage,
          });

      setApartments(response?.data ?? []);
      setTotalPages(response?.pagination?.total_pages ?? 1);
    } catch (error: any) {
      console.error("Fetch error:", error.message);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when page changes
  useEffect(() => {
    fetchApartments();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchApartments();
  };

  const handleRefresh = () => {
    setSearch("");
    setCurrentPage(1);
    fetchApartments();
  };

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
      try {
        await apartmentAPI.delete(selectedApartment.apt_id);
        setDeleteDialogOpen(false);
        setSelectedApartment(null);
        await fetchApartments();
        alert(`Đã xóa căn hộ ${selectedApartment.apt_id}`);
      } catch (error: any) {
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  const handleSubmit = async (data: Apartment) => {
    try {
      if (selectedApartment) {
        await apartmentAPI.update(selectedApartment.apt_id, data);
        alert("Đã cập nhật căn hộ thành công");
      } else {
        await apartmentAPI.create(data);
        alert("Đã tạo căn hộ thành công");
      }
      setDialogOpen(false);
      setSelectedApartment(null);
      await fetchApartments();
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="ml-72 mr-4">
          <Header />
          <main className="p-6">
            <div className="space-y-6">
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Danh sách hộ dân / căn hộ</CardTitle>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                      <Input
                        placeholder="Tìm kiếm theo mã căn hộ, tên chủ hộ, số điện thoại..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-9 text-gray-600"
                      />
                    </div>
                    <Button onClick={handleSearch} className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Search className="h-4 w-4" />
                      Tìm kiếm
                    </Button>
                    <Button onClick={handleRefresh} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Tải lại
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : apartments.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">Không có dữ liệu</div>
                  ) : (
                    <>
                      <div className="mb-4 flex justify-end">
                        <Button onClick={handleAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4" />
                          Thêm căn hộ
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold text-gray-700">Mã căn hộ</TableHead>
                            <TableHead className="font-semibold text-gray-700">Tầng</TableHead>
                            <TableHead className="font-semibold text-gray-700">Chủ hộ</TableHead>
                            <TableHead className="font-semibold text-gray-700">Số điện thoại</TableHead>
                            <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {apartments.map((apartment) => (
                            <TableRow key={apartment.apt_id} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                              <TableCell className="font-medium text-gray-900">{apartment.apt_id}</TableCell>
                              <TableCell className="text-gray-900">{apartment.floor ? `Tầng ${apartment.floor}` : "-"}</TableCell>
                              <TableCell className="text-gray-900">{apartment.owner_name || "-"}</TableCell>
                              <TableCell className="text-gray-900">{apartment.owner_phone || "-"}</TableCell>
                              <TableCell>{getStatusBadge(apartment.status)}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(apartment)}
                                    className="gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Sửa
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(apartment)}
                                    className="gap-1 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Xóa
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Trang {currentPage} / {totalPages}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const prevPage = currentPage - 1;
                                if (prevPage >= 1) {
                                  setCurrentPage(prevPage);
                                }
                              }}
                              disabled={currentPage === 1}
                            >
                              Trước
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const nextPage = currentPage + 1;
                                if (nextPage <= totalPages) {
                                  setCurrentPage(nextPage);
                                }
                              }}
                              disabled={currentPage === totalPages}
                            >
                              Sau
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
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
            <AlertDialogAction onClick={handleDeleteConfirm}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
