"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/types/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { FinancialCards } from "./components/financial-cards";
import { BuildingSummary } from "./components/building-summary";
import { IncomeByApartmentTable } from "./components/income-by-apartment";
import { IncomeByFloorTable } from "./components/income-by-floor";
import { FinancialByFloorTable } from "./components/financial-by-floor";
import { DebtApartmentsTable } from "./components/debt-apartments";
import { useFinancial } from "./hooks/use-financial";
import { BarChart3 } from "lucide-react";

export default function FinancialPage() {
  const {
    incomeByApartment,
    incomeByFloor,
    financialByFloor,
    debtApartments,
    buildingSummary,
    loading,
    error,
  } = useFinancial();

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-72 mr-4">
          <Header />
          <main className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Thống kê thu chi / Tài chính tòa nhà</CardTitle>
                    <CardDescription>
                      Theo dõi chi tiết các khoản thu chi và tình hình tài chính của chung cư
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FinancialCards summary={buildingSummary} loading={loading} />
                  
                  <BuildingSummary summary={buildingSummary} />

                  <Tabs defaultValue="income-apartment" className="w-full">
                    <TabsList>
                      <TabsTrigger value="income-apartment">Thu nhập theo căn hộ</TabsTrigger>
                      <TabsTrigger value="income-floor">Thu nhập theo tầng</TabsTrigger>
                      <TabsTrigger value="financial-floor">Tài chính theo tầng</TabsTrigger>
                      <TabsTrigger value="debt">Căn hộ có nợ</TabsTrigger>
                    </TabsList>
                    <TabsContent value="income-apartment" className="mt-4">
                      <IncomeByApartmentTable data={incomeByApartment} loading={loading} />
                    </TabsContent>
                    <TabsContent value="income-floor" className="mt-4">
                      <IncomeByFloorTable data={incomeByFloor} loading={loading} />
                    </TabsContent>
                    <TabsContent value="financial-floor" className="mt-4">
                      <FinancialByFloorTable data={financialByFloor} loading={loading} />
                    </TabsContent>
                    <TabsContent value="debt" className="mt-4">
                      <DebtApartmentsTable data={debtApartments} loading={loading} />
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
