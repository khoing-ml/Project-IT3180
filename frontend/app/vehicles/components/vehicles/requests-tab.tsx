"use client"

import { useEffect, useState } from "react"
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
import { request_type } from "../../../helper/type";
import { ApiCall } from "../../../helper/api";

const requests: request_type[] = [
  {
    number: "",
    apt_id: "",
    owner: "",
    created_at: "",
    color: "",
    type: ""
  }
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
  onAccept: (id: request_type) => void
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
              <p className="text-sm font-medium text-gray-600">Biển số xe</p>
              <p className="text-base font-semibold mt-1 text-gray-900">{request.number}</p>
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
              <p className="text-base mt-1 text-gray-700">{request.apt_id}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600">Thời gian gửi</p>
            <p className="text-base mt-1 text-gray-700">{new Date(request.created_at).toLocaleString("vi-VN")}</p>
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
            onClick={() => onReject(request.number)}
            className="gap-2 border-gray-300 hover:bg-gray-100"
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </Button>
          <Button onClick={() => onAccept(request)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <CheckCircle2 className="h-4 w-4" />
            Chấp nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RequestsTab() {
  const api = new ApiCall();

  const [selectedRequest, setSelectedRequest] = useState<(typeof requests)[0] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRequests, setTotalRequest] = useState(0);
  const [currentRequests, setCurrentRequests] = useState<request_type[]>([])
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorFetch, setError] = useState<string | null>(null);
 
  
  const pageSize = 5
  const totalPages = Math.ceil(totalRequests / pageSize);
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const fetchRequests = async() => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.query_all_request(currentPage, pageSize);
      setTotalRequest(res.total_docs);
      setCurrentRequests(res.data);
    }
    catch(error) {
      setError(error.message);
      console.log("Fetch err: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  const deleteRequests = async(number: string) => {
    try {
      const res = await api.delete_request(number);
    }
    catch(error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchRequests();
  },[currentPage])


  const handleViewDetails = (request: (typeof requests)[0]) => {
    setSelectedRequest(request)
    setDialogOpen(true)
  }

  const handleAccept = async(request: request_type) => {
    try {
      const res = await api.accept_request(request);
      await deleteRequests(request.number);
      await fetchRequests();
    }
    catch(error) {
      console.log(error.message);
    }
    setDialogOpen(false)
  }

  const handleReject = async(id: string) => {
    console.log("[v0] Rejecting request:", id)
    try {
      const res = await api.delete_request(id);
      await fetchRequests();
    }
    catch(error) {
      console.log(error.message);
    }
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
      {isLoading && (
                      <Card className="p-6 text-center text-blue-600">
                          Đang tải danh sách yêu cầu...
                      </Card>
      )}
      
      {errorFetch && !isLoading && (
                      <Card className="p-6 text-center text-red-600 border-red-200 bg-red-50">
                          Lỗi: {errorFetch}
                          <Button onClick={fetchRequests} variant="link" className="ml-2">
                              Thử lại
                          </Button>
                      </Card>
      )}
      {!isLoading && !errorFetch && (
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
                  <TableRow key={request.number} className="border-gray-200 hover:bg-gray-50">

                    <TableCell className="text-gray-700">{request.number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {vehicleTypeLabels[request.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{request.owner}</TableCell>
                    <TableCell className="text-gray-700">{request.apt_id}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(request.created_at).toLocaleDateString("vi-VN")}
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
            {currentRequests.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            Không có yêu cầu nào.
                        </div>
            )}

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
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Sau
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      )}
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
