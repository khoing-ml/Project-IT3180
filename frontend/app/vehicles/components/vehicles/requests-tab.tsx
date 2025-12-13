"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { request_type } from "../../helper/type";

const requests = [
  {
    id: "REQ-001",
    licensePlate: "29A-99999",
    type: "car",
    color: "Xanh dương",
    owner: "Lê Văn C",
    apartment: "B-205",
    status: "pending",
    createdAt: "2025-01-15T10:30:00",
    note: "",
  },
  {
    id: "REQ-002",
    licensePlate: "29B-88888",
    type: "motorbike",
    color: "Đen",
    owner: "Phạm Thị D",
    apartment: "A-303",
    status: "pending",
    createdAt: "2025-01-14T15:20:00",
    note: "",
  },
  {
    id: "REQ-003",
    licensePlate: "29C-77777",
    type: "bike",
    color: "Xanh lá",
    owner: "Hoàng Văn E",
    apartment: "C-102",
    status: "pending",
    createdAt: "2025-01-13T09:15:00",
    note: "",
  },
  {
    id: "REQ-004",
    licensePlate: "30A-55555",
    type: "car",
    color: "Trắng",
    owner: "Trần Văn F",
    apartment: "A-401",
    status: "pending",
    createdAt: "2025-01-12T14:45:00",
    note: "",
  },

]

const vehicleTypeLabels: Record<string, string> = {
  car: "Ô tô",
  motorbike: "Xe máy",
  bike: "Xe đạp",
}

type RequestDetailDialogProps = {
  request: (typeof requests)[0] | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
}

function RequestDetailDialog({ request, open, onOpenChange, onAccept, onReject }: RequestDetailDialogProps) { // tab yêu cầu 
  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Chi tiết yêu cầu</DialogTitle>
          <DialogDescription className="text-gray-600">Thông tin đầy đủ về yêu cầu đăng ký xe</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Mã yêu cầu</p>
              <p className="text-base font-semibold mt-1 text-gray-900">{request.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Biển số xe</p>
              <p className="text-base font-semibold mt-1 text-gray-900">{request.licensePlate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Loại xe</p>
              <Badge variant="outline" className="mt-1 border-gray-300 text-gray-700">
                {vehicleTypeLabels[request.type]}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Màu sắc</p>
              <p className="text-base mt-1 text-gray-700">{request.color}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Chủ sở hữu</p>
              <p className="text-base mt-1 text-gray-700">{request.owner}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Căn hộ</p>
              <p className="text-base mt-1 text-gray-700">{request.apartment}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600">Thời gian gửi</p>
            <p className="text-base mt-1 text-gray-700">{new Date(request.createdAt).toLocaleString("vi-VN")}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600">Trạng thái</p>
            <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-700">
              <Clock className="h-3 w-3 mr-1" />
              Chờ duyệt
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onReject(request.id)}
            className="gap-2 border-gray-300 hover:bg-gray-100"
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </Button>
          <Button onClick={() => onAccept(request.id)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <CheckCircle2 className="h-4 w-4" />
            Chấp nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RequestsTab() {
  const [selectedRequest, setSelectedRequest] = useState<(typeof requests)[0] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const totalPages = Math.ceil(requests.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentRequests = requests.slice(startIndex, endIndex)

  const handleViewDetails = (request: (typeof requests)[0]) => {
    setSelectedRequest(request)
    setDialogOpen(true)
  }

  const handleAccept = (id: string) => {
    console.log("[v0] Accepting request:", id)
    setDialogOpen(false)
  }

  const handleReject = (id: string) => {
    console.log("[v0] Rejecting request:", id)
    setDialogOpen(false)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <>
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Danh sách yêu cầu</CardTitle>
          <CardDescription className="text-gray-600">
            Các yêu cầu đăng ký xe mới từ cư dân, sắp xếp theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-gray-50">
                <TableHead className="text-gray-600">Mã yêu cầu</TableHead>
                <TableHead className="text-gray-600">Biển số xe</TableHead>
                <TableHead className="text-gray-600">Loại xe</TableHead>
                <TableHead className="text-gray-600">Chủ sở hữu</TableHead>
                <TableHead className="text-gray-600">Căn hộ</TableHead>
                <TableHead className="text-gray-600">Thời gian</TableHead>
                <TableHead className="text-gray-600">Trạng thái</TableHead>
                <TableHead className="text-right text-gray-600">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRequests.map((request) => (
                <TableRow key={request.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">{request.id}</TableCell>
                  <TableCell className="text-gray-700">{request.licensePlate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 text-gray-700">
                      {vehicleTypeLabels[request.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700">{request.owner}</TableCell>
                  <TableCell className="text-gray-700">{request.apartment}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      <Clock className="h-3 w-3 mr-1" />
                      Chờ duyệt
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1} đến {Math.min(endIndex, requests.length)} trong tổng số {requests.length} yêu
              cầu
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="border-gray-300 hover:bg-gray-100 disabled:opacity-50 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className={
                      currentPage === page
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:bg-gray-100 disabled:opacity-50 bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RequestDetailDialog
        request={selectedRequest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  )
}
