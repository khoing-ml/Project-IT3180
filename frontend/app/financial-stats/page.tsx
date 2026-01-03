"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/types/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/bills/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import RevenueManagement from "./components/RevenueManagement";
import DebtControl from "./components/DebtControl";
import SettlementReport from "./components/SettlementReport";

export default function FinancialStatsPage() {
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Thống kê tài chính
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Quản lý doanh thu, kiểm soát nợ và báo cáo quyết toán
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                  <TabsTrigger value="revenue" className="text-sm">
                    📈 Quản lý doanh thu
                  </TabsTrigger>
                  <TabsTrigger value="debt" className="text-sm">
                    ⚠️ Kiểm soát nợ đọng
                  </TabsTrigger>
                  <TabsTrigger value="settlement" className="text-sm">
                    📊 Báo cáo quyết toán
                  </TabsTrigger>
                </TabsList>

                {/* Module 3.1: Quản lý doanh thu */}
                <TabsContent value="revenue">
                  <RevenueManagement />
                </TabsContent>

                {/* Module 3.2: Kiểm soát nợ đọng */}
                <TabsContent value="debt">
                  <DebtControl />
                </TabsContent>

                {/* Module 3.3: Báo cáo quyết toán */}
                <TabsContent value="settlement">
                  <SettlementReport />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
