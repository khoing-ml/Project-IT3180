"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { FileText, Receipt, Search } from "lucide-react"
import { BillDetailDialog } from "./bill-detail-dialog"
import { EditBillDialog } from "./edit-bill-dialog"
import type { Bill } from "../types"
import Header from "../../../components/Header";
import { Input } from "../components/ui/input";
import { ApiCall } from "@/app/helper/api";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

// Mock data
const mockAdminBills: Bill[] = Array.from({ length: 25 }, (_, i) => ({
  apt_id: `A${String(i + 101).padStart(3, "0")}`,
  owner: `Nguyễn Văn ${String.fromCharCode(65 + (i % 26))}`,
  electric: Math.floor(Math.random() * 1000000) + 500000,
  water: Math.floor(Math.random() * 200000) + 100000,
  service: 500000,
  vehicles: Math.floor(Math.random() * 400000) + 200000,
  pre_debt: Math.floor(Math.random() * 1000000),
  total: 0,
})).map((bill) => ({
  ...bill,
  currentTotal: bill.electric + bill.water + bill.service + bill.vehicles,
}))

export function AdminBillsView() {
  const api = new ApiCall();

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [currentBills, setCurrentBills] = useState<Bill[]>([]);
  const [isLoadingBills, setLoadingBills] = useState(true);
  const [errorFetchBill, setErrorFetchBills] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const[totalToCollect, setTotalToCollect] = useState(0);
  const[totalCollected, setTotalCollected] = useState(0);

  const [searchApartment, setSearchApartment] = useState("");
  const [searchOwner, setSearchOwner] = useState("");

  const filteredBills = mockAdminBills.filter((bill) => {
    const matchApartment = bill.apt_id.toLowerCase().includes(searchApartment.toLowerCase())
    const matchOwner = bill.owner.toLowerCase().includes(searchOwner.toLowerCase())
    return matchApartment && matchOwner
  })

  const itemsPerPage = 10;

  const fetchBills = async() => {
    let filter: any = {};
    if(searchApartment) filter.apt_id = searchApartment;
    if(searchOwner) filter.owner = searchOwner;
    setLoadingBills(true);
    setErrorFetchBills(null);
    try {
      const res = await api.query_bill_with_filter(filter, currentPage, itemsPerPage);
      const bills = res.data;
      let total = 0;
      for(const bill of bills) {
        total = total + bill.electric + bill.water + bill.pre_debt + bill.vehicles + bill.service;
      }
      const collected = await api.get_total_collected();
      console.log("collect: ", collected);
      setTotalCollected(collected)
      setTotalToCollect(total);
      setCurrentBills(bills);
      setTotalPages(res.total_pages);
    }
    catch(error) {
      setErrorFetchBills(error.message);
      console.log("Fetch error: ", error.message);
    } finally {
      setLoadingBills(false);
    }
  }
 


  useEffect(() => {
    fetchBills();
  }, [currentPage, totalPages, searchApartment, searchOwner, totalCollected, totalToCollect]);

  const handleViewDetail = (bill: Bill) => {
    setSelectedBill(bill)
    setIsDetailOpen(true)
  }

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill)
    setIsEditOpen(true)
  }

  const handleResetBill = async(bill: Bill) => {
    try {
      await api.collect_bill(bill.apt_id, bill.electric + bill.water + bill.service + bill.vehicles + bill.pre_debt);
      await api.reset_bill(bill.apt_id);
      //setTotalCollected(bill.electric + bill.water + bill.service + bill.vehicles + bill.pre_debt);
      const resetBill: Bill = {
        ...bill,
        electric: 0,
        water: 0,
        service: 0,
        vehicles: 0,
        pre_debt: 0,
      }
      setSelectedBill(resetBill)
      await fetchBills();
    }
    catch(error) {
      console.log(error.message);
    }

    alert(`Đã reset hóa đơn cho căn hộ ${bill.apt_id}`)
  }

  const handleSaveEdit = async(updatedBill: Bill) => {
    try {

      const new_value: any = {};
      console.log(updatedBill.apt_id);
      if(updatedBill.water) new_value.water = updatedBill.water;
      if(updatedBill.electric) new_value.electric = updatedBill.electric;
      if(updatedBill.service) new_value.service = updatedBill.service;
      if(updatedBill.vehicles) new_value.vehicles = updatedBill.vehicles;
      if(updatedBill.pre_debt) new_value.pre_debt = updatedBill.pre_debt;
      console.log("new value: ", new_value);

      const res = await api.update_bill(updatedBill.apt_id, new_value);
      await fetchBills();
      setSelectedBill(updatedBill)
      setIsEditOpen(false)
      setIsDetailOpen(true)
    }
    catch(error) {
      console.log("Edit error: ", error.message);
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
          <Header />
          <div className="mx-auto max-w-7xl space-y-6">
    <div className="space-y-6">
    
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-500/20 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Tổng cần thu kỳ này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatCurrency(totalToCollect)}</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" />
              Tổng đã thu kỳ này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatCurrency(totalCollected)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Danh sách hóa đơn các căn hộ</CardTitle>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <Input
                placeholder="Tìm kiếm theo căn hộ..."
                value={searchApartment}
                onChange={(e) => {
                  setSearchApartment(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 text-gray-600"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <Input
                placeholder="Tìm kiếm theo chủ sở hữu..."
                value={searchOwner}
                onChange={(e) => {
                  setSearchOwner(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 text-gray-600"
              />
            </div>
          </div>
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
                    {formatCurrency(bill.electric + bill.pre_debt + bill.water + bill.service + bill.vehicles)}
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
      <BillDetailDialog
        bill={selectedBill}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        viewMode="admin"
        onEdit={handleEditBill}
        onReset={handleResetBill}
      />

      {/* Edit Bill Dialog */}
      <EditBillDialog
        bill={selectedBill}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setIsDetailOpen(true)
        }}
        onSave={handleSaveEdit}
      />
    </div>
          </div>
    </div>
  )
}
