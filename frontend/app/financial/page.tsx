"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/types/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Badge } from "./components/ui/badge";
import { BarChart3, Loader2, DollarSign, TrendingUp, AlertCircle, Percent, RefreshCw } from "lucide-react";
import { financialAPI } from "@/lib/financialApi";
import type {
  IncomeByApartment,
  IncomeByFloor,
  FinancialByFloor,
  ApartmentFinancialSummary,
  BuildingFinancialSummary,
} from "@/lib/financialApi";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function FinancialPage() {
  const [incomeByApartment, setIncomeByApartment] = useState<IncomeByApartment[]>([]);
  const [incomeByFloor, setIncomeByFloor] = useState<IncomeByFloor[]>([]);
  const [financialByFloor, setFinancialByFloor] = useState<FinancialByFloor[]>([]);
  const [debtApartments, setDebtApartments] = useState<ApartmentFinancialSummary[]>([]);
  const [buildingSummary, setBuildingSummary] = useState<BuildingFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [incomeApartmentRes, incomeFloorRes, financialFloorRes, debtRes, summaryRes] = await Promise.all([
        financialAPI.getIncomeByApartment({ page: 1, page_size: 100 }),
        financialAPI.getIncomeByFloor(),
        financialAPI.getFinancialByFloor(),
        financialAPI.getApartmentsInDebt({ page: 1, page_size: 100 }),
        financialAPI.getBuildingFinancialSummary(),
      ]);

      setIncomeByApartment(incomeApartmentRes?.data ?? []);
      setIncomeByFloor(incomeFloorRes?.data ?? []);
      setFinancialByFloor(financialFloorRes?.data ?? []);
      setDebtApartments(debtRes?.data ?? []);
      setBuildingSummary(summaryRes?.data ?? null);
    } catch (error: any) {
      console.error("Fetch error:", error.message);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load only
  useEffect(() => {
    fetchAll();
  }, []);

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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">Thống kê thu chi / Tài chính tòa nhà</CardTitle>
                      </div>
                    </div>
                    <Button onClick={fetchAll} className="gap-2 bg-green-600 hover:bg-green-700">
                      <RefreshCw className="h-4 w-4" />
                      Tải lại dữ liệu
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Summary Cards */}
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : buildingSummary ? (
                    <>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card className="border-green-500/20 bg-gradient-to-br from-green-600 to-green-700 text-white">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <DollarSign className="h-5 w-5" />
                              Tổng thu nhập
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-4xl font-bold">{formatCurrency(buildingSummary.total_income)}</div>
                          </CardContent>
                        </Card>
                        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <TrendingUp className="h-5 w-5" />
                              Tổng phải thu
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-4xl font-bold">{formatCurrency(buildingSummary.total_due_current)}</div>
                          </CardContent>
                        </Card>
                        <Card className="border-red-500/20 bg-gradient-to-br from-red-600 to-red-700 text-white">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <AlertCircle className="h-5 w-5" />
                              Tổng nợ
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-4xl font-bold">{formatCurrency(buildingSummary.total_pre_debt)}</div>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Percent className="h-5 w-5" />
                              Tỷ lệ nợ
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-4xl font-bold">{buildingSummary.debt_ratio}</div>
                            <p className="text-sm mt-2 opacity-90">
                              {buildingSummary.apartments_in_debt} / {buildingSummary.total_apartments} căn hộ
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Tabs */}
                      <Tabs defaultValue="income-apartment" className="w-full">
                        <TabsList className="bg-slate-900 border border-slate-800">
                          <TabsTrigger value="income-apartment" className="data-[state=active]:bg-slate-800">
                            Thu nhập theo căn hộ
                          </TabsTrigger>
                          <TabsTrigger value="income-floor" className="data-[state=active]:bg-slate-800">
                            Thu nhập theo tầng
                          </TabsTrigger>
                          <TabsTrigger value="financial-floor" className="data-[state=active]:bg-slate-800">
                            Tài chính theo tầng
                          </TabsTrigger>
                          <TabsTrigger value="debt" className="data-[state=active]:bg-slate-800">
                            Căn hộ có nợ
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="income-apartment" className="mt-4">
                          <Card className="bg-white border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-gray-900">Thu nhập theo căn hộ</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {incomeByApartment.length === 0 ? (
                                <div className="text-center py-12 text-gray-600">Không có dữ liệu</div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                                      <TableHead className="font-semibold text-gray-700">Mã căn hộ</TableHead>
                                      <TableHead className="font-semibold text-gray-700">Chủ hộ</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Tổng đã thanh toán</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {incomeByApartment.map((item) => (
                                      <TableRow key={item.apt_id} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">{item.apt_id}</TableCell>
                                        <TableCell className="text-gray-900">{item.owner_name || "-"}</TableCell>
                                        <TableCell className="text-right font-semibold text-green-600">
                                          {formatCurrency(item.total_paid)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="income-floor" className="mt-4">
                          <Card className="bg-white border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-gray-900">Thu nhập theo tầng</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {incomeByFloor.length === 0 ? (
                                <div className="text-center py-12 text-gray-600">Không có dữ liệu</div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                                      <TableHead className="font-semibold text-gray-700">Tầng</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Tổng đã thanh toán</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {incomeByFloor.map((item, index) => (
                                      <TableRow key={index} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">
                                          {item.floor !== null ? `Tầng ${item.floor}` : "Không xác định"}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-green-600">
                                          {formatCurrency(item.total_paid)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="financial-floor" className="mt-4">
                          <Card className="bg-white border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-gray-900">Tài chính theo tầng</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {financialByFloor.length === 0 ? (
                                <div className="text-center py-12 text-gray-600">Không có dữ liệu</div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                                      <TableHead className="font-semibold text-gray-700">Tầng</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Đã thanh toán</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Nợ hiện tại</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Nợ cũ</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Tỷ lệ thu</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {financialByFloor.map((item, index) => (
                                      <TableRow key={index} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">{item.display}</TableCell>
                                        <TableCell className="text-right text-green-600">
                                          {formatCurrency(item.total_paid)}
                                        </TableCell>
                                        <TableCell className="text-right text-orange-600">
                                          {formatCurrency(item.total_due_current)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                          {formatCurrency(item.current_pre_debt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Badge variant="outline">{item.collection_rate}</Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="debt" className="mt-4">
                          <Card className="bg-white border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-gray-900">Căn hộ có nợ</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {debtApartments.length === 0 ? (
                                <div className="text-center py-12 text-gray-600">Không có căn hộ nào có nợ</div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                                      <TableHead className="font-semibold text-gray-700">Mã căn hộ</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Phí mới</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Nợ cũ</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Tổng nợ</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Đã thanh toán</TableHead>
                                      <TableHead className="text-right font-semibold text-gray-700">Còn nợ</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {debtApartments.map((item) => (
                                      <TableRow key={item.apt_id} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">{item.apt_id}</TableCell>
                                        <TableCell className="text-right text-gray-900">
                                          {formatCurrency(item.new_charges_current)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                          {formatCurrency(item.pre_debt)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-orange-600">
                                          {formatCurrency(item.total_due_current)}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600">
                                          {formatCurrency(item.total_paid_all_time)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Badge className="bg-red-500 hover:bg-red-600 text-white">
                                            {formatCurrency(item.current_remaining_debt)}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-600">Không có dữ liệu</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
