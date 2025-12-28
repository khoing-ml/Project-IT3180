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
import Sidebar from "../../../components/Sidebar";
import BackButton from "../../../components/BackButton";
import SubmitBillsModal from "../../../components/SubmitBillsModal";
import { billsAPI } from '@/lib/api';
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

  const [showSubmitModal, setShowSubmitModal] = useState(false);

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
  const [filterPeriod, setFilterPeriod] = useState<string | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

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
    if(filterPeriod) filter.period = filterPeriod;
    setLoadingBills(true);
    setErrorFetchBills(null);
    try {
      const res = await api.query_bill_with_filter(filter, currentPage, itemsPerPage);
      const bills = res.data;
      // If a period filter is active, rely on server summary for totals (accurate across all apartments)
      if (filterPeriod) {
        try {
          const summary = await billsAPI.getPeriodSummary(filterPeriod);
          setTotalToCollect(Number(summary.total_due || 0));
          setTotalCollected(Number(summary.total_received || 0));
        } catch (e) {
          console.warn('Failed to fetch period summary', e);
          // fallback: compute totals from current page only
          let total = 0;
          for(const bill of bills) {
            total = total + Number(bill.electric || 0) + Number(bill.water || 0) + Number(bill.pre_debt || 0) + Number(bill.vehicles || 0) + Number(bill.service || 0);
          }
          setTotalToCollect(total);
        }
      } else {
        // No period selected: compute totals from current page (or set 0)
        let total = 0;
        for(const bill of bills) {
          total = total + Number(bill.electric || 0) + Number(bill.water || 0) + Number(bill.pre_debt || 0) + Number(bill.vehicles || 0) + Number(bill.service || 0);
        }
        setTotalToCollect(total);
        try {
          const collected = await api.get_total_collected();
          setTotalCollected(collected)
        } catch (e) {
          console.warn('Failed to fetch overall collected', e);
        }
      }
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
  }, [currentPage, totalPages, searchApartment, searchOwner, totalCollected, totalToCollect, filterPeriod]);

  // load available periods
  useEffect(() => {
    (async () => {
      try {
        const resp = await billsAPI.getAvailablePeriods();
        const periods = resp?.periods || [];
        setAvailablePeriods(periods);
      } catch (e) {
        console.error('Failed to load periods', e);
      }
    })();
  }, []);

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
      // Mark bill as paid (backend records payment and updates totals)
      await api.reset_bill(bill.apt_id, bill.period);
      // Refresh list and aggregates
      await fetchBills();
    }
    catch(error) {
      console.log(error.message);
    }

    alert(`Đã đánh dấu là 'Đã thu' cho căn hộ ${bill.apt_id} (kỳ ${bill.period || '-'})`)
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
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-72 p-6">
        <Header />
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <BackButton />
            <div className="flex items-center gap-3">
              <a
                href="/admin/bills-setup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
              >
                ⚙️ Cấu hình giá dịch vụ
              </a>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
              >
                🚰 Gửi số liệu
              </button>
            </div>
            <SubmitBillsModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} period={filterPeriod} />
          </div>
          
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
              <div className="mt-4 grid gap-4 md:grid-cols-3">
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
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Chọn kỳ:</label>
                <select
                  value={filterPeriod ?? ''}
                  onChange={(e) => { setFilterPeriod(e.target.value || null); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded text-gray-900"
                >
                  <option value="">-- Chọn kỳ --</option>
                  {availablePeriods.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {filterPeriod && (
                  <button className="ml-2 px-3 py-2 text-sm bg-gray-200 rounded" onClick={() => setFilterPeriod(null)}>
                    Xóa
                  </button>
                )}
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Căn hộ</TableHead>
                  <TableHead className="font-semibold text-gray-700">Chủ sở hữu</TableHead>
                  <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-gray-700">Kỳ</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Tổng số tiền</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBills.map((bill) => (
                <TableRow key={`${bill.apt_id}-${bill.period || 'none'}`} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">{bill.apt_id}</TableCell>
                  <TableCell className="text-gray-900">{bill.owner}</TableCell>
                  <TableCell className="text-sm">
                    {bill.paid ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Đã thu</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Chưa thu</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700 text-sm">{bill.period ?? '-'}</TableCell>
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
    </div>
  )
}
