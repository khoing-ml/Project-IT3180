"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Receipt, AlertCircle } from "lucide-react"
import { BillDetailDialog } from "./bill-detail-dialog"
import type { Bill } from "../types";
import Header from "../../../components/Header";
import { ApiCall } from "@/app/helper/api"
import { useAuth } from "@/contexts/AuthContext";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

const getCurrentDate = () => {
  const date = new Date()
  return `25/${date.getMonth() + 1}/${date.getFullYear()}`
}

export function UserBillsView() {
  const api = new ApiCall();
  const { user } = useAuth();

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [currentBills, setCurrentBill] = useState<Bill[]>([]);
  const [isLoadingBills, setLoadingBills] = useState(true);
  const [errorFetchBill, setErrorFetchBills] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);

  const itemsPerPage = 10
  

  const fetchAllBills = async() => {
    setLoadingBills(true);
    setErrorFetchBills(null);
    try {
      const res = await api.query_all_bill(user?.username, itemsPerPage, currentPage);
      const bills = res.data;
      let total = 0;
      for(const bill of bills) {
        total = total + bill.electric + bill.water + bill.pre_debt + bill.vehicles + bill.service;
      }
      setTotalDebt(total);
      setCurrentBill(bills);
      setTotalPages(res.total_pages);
    }
    catch(error) {
      setErrorFetchBills(error.message);
      console.log("Fetch error: ", error);
    } finally {
      setLoadingBills(false);
    }
  }

  useEffect(() => {
    fetchAllBills();
  },[user, currentPage, totalPages, totalDebt])

  const handleViewDetail = (bill: Bill) => {
    setSelectedBill(bill)
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <Header />
    <div className="mx-auto max-w-7xl space-y-6">
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" />
              Tổng nợ kỳ này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatCurrency(totalDebt)}</div>
            <p className="mt-2 flex items-center gap-1 text-sm text-blue-100">
              <AlertCircle className="h-4 w-4" />
              Hóa đơn được tính đến ngày {getCurrentDate()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Danh sách hóa đơn của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Căn hộ</TableHead>
                <TableHead className="font-semibold text-gray-700">Chủ sở hữu</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Tổng số tiền</TableHead>
                <TableHead className="text-center font-semibold text-gray-700">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBills.map((bill) => (
                <TableRow key={bill.apt_id} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">{bill.apt_id}</TableCell>
                  <TableCell className="text-gray-900">{bill.owner}</TableCell>
                  <TableCell className="text-right font-semibold text-gray-900">
                    {formatCurrency(bill.water + bill.electric + bill.pre_debt + bill.service + bill.vehicles)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetail(bill)}>
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Detail Dialog */}
      <BillDetailDialog bill={selectedBill} isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} viewMode="user" />
    </div>
    </div>
  </div>
  )
}
