"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react" 
import { ApiCall } from "../../helper/api";
import { filterType } from "../../helper/type";
// Định nghĩa kiểu dữ liệu cho phương tiện
type VehicleType = {
  id: string;
  number: string;
  type: 'car' | 'motorbike' | 'bike';
  color: string;
  owner: string;
  apt_id: string;
};

// Dữ liệu giả lập - TẤT CẢ phương tiện trong hệ thống
const allVehicles: VehicleType[] = [
  { id: "1", number: "29A-12345", type: "car", color: "Đen", owner: "Nguyễn Văn A", apt_id: "A-101" },
  { id: "2", number: "29B-67890", type: "car", color: "Trắng", owner: "Nguyễn Văn A", apt_id: "A-101" },
  { id: "3", number: "29C-11111", type: "motorbike", color: "Đỏ", owner: "Trần Thị B", apt_id: "A-101" },
  { id: "4", number: "29D-22222", type: "car", color: "Xanh dương", owner: "Lê Văn C", apt_id: "B-205" },
  { id: "5", number: "29E-33333", type: "motorbike", color: "Đen", owner: "Phạm Thị D", apt_id: "A-303" },
  { id: "6", number: "29F-44444", type: "bike", color: "Xanh lá", owner: "Hoàng Văn E", apt_id: "C-102" },
  { id: "7", number: "30A-55555", type: "car", color: "Trắng", owner: "Trần Văn F", apt_id: "A-401" },
  { id: "8", number: "31B-44444", type: "motorbike", color: "Đỏ", owner: "Ngô Thị G", apt_id: "B-103" },
  { id: "9", number: "29D-33333", type: "car", color: "Xám", owner: "Vũ Văn H", apt_id: "C-205" },
];

const vehicleTypeLabels: Record<string, string> = {
  car: "Ô tô",
  motorbike: "Xe máy",
  bike: "Xe đạp",
}

export function SearchTab() {
  const api = new ApiCall();
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "",
    color: "",
    apt_id: "",
    owner: "",
  })
  const [searchResults, setSearchResults] = useState<VehicleType[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [totalResults, setTotalResults] = useState(0);
  // 1. STATES VÀ THÔNG SỐ PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5 // Kích thước trang cố định

  // 2. LOGIC TÍNH TOÁN PHÂN TRANG
 
  const totalPages = Math.ceil(totalResults / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  // Cắt mảng kết quả tìm kiếm để chỉ lấy dữ liệu của trang hiện tại

  const fetchResult = async() => {
    let filter: filterType = {};
    if(searchTerm) {
      filter.number = searchTerm;
    }
    if(filters.apt_id) {
      filter.apt_id = filters.apt_id;
    }
    if(filters.color) {
      filter.color = filters.color;
    }
    if(filters.type && filters.type != 'all') {
      filter.type = filters.type;
    }
    if(filters.owner) {
      filter.owner = filters.owner;
    }
    try {
      const results = await api.search_vehicles_with_filter(filter, currentPage, pageSize);
      setSearchResults(results.data);
      setTotalResults(results.total_docs);
      setHasSearched(true);
       // Rất quan trọng: Reset về trang 1 sau mỗi lần tìm kiếm
    }
    catch(error) {
      console.log(error.message);
    }
  }
  
  // 3. HÀM XỬ LÝ TÌM KIẾM
  const handleSearch = async() => {
    await fetchResult();
    setCurrentPage(1);
  }

  // 4. HÀM XỬ LÝ RESET
  const handleReset = () => {
    setSearchTerm("")
    setFilters({
      type: "",
      color: "",
      apt_id: "",
      owner: "",
    })
    setSearchResults([])
    setHasSearched(false)
    setCurrentPage(1) // Reset trang
  }

  // 5. HÀM XỬ LÝ CHUYỂN TRANG
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))

  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }
  
  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    fetchResult();
  },[currentPage, filters, searchTerm]);

  return (
    <div className="space-y-6">
      {/* KHỐI TÌM KIẾM VÀ BỘ LỌC */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Tìm kiếm phương tiện</CardTitle>
          <CardDescription className="text-gray-600">
            Nhập biển số xe và sử dụng bộ lọc để tìm kiếm thông tin xe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="number" className="text-gray-700">
              Biển số xe
            </Label>
            <div className="flex gap-2">
              <Input
                id="number"
                placeholder="Nhập biển số xe (VD: 29A-12345)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typeFilter" className="text-gray-700">
                Loại xe
              </Label>
              {/* Lọc theo Loại xe */}
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger id="typeFilter" className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="car">Ô tô</SelectItem>
                  <SelectItem value="motorbike">Xe máy</SelectItem>
                  <SelectItem value="bike">Xe đạp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorFilter" className="text-gray-700">
                Màu sắc
              </Label>
              {/* Lọc theo Màu sắc */}
              <Input
                id="colorFilter"
                placeholder="Màu sắc"
                value={filters.color}
                onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt_idFilter" className="text-gray-700">
                Căn hộ
              </Label>
              {/* Lọc theo Căn hộ */}
              <Input
                id="apt_idFilter"
                placeholder="VD: A-101"
                value={filters.apt_id}
                onChange={(e) => setFilters({ ...filters, apt_id: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerFilter" className="text-gray-700">
                Chủ sở hữu
              </Label>
              {/* Lọc theo Chủ sở hữu */}
              <Input
                id="ownerFilter"
                placeholder="Tên chủ xe"
                value={filters.owner}
                onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4" />
              Tìm kiếm
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 border-gray-300 hover:bg-gray-100 bg-transparent"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KHỐI KẾT QUẢ TÌM KIẾM VÀ PHÂN TRANG */}
      {hasSearched && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Kết quả tìm kiếm</CardTitle>
            <CardDescription className="text-gray-600">Tìm thấy {totalResults} phương tiện</CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="text-gray-600">Biển số xe</TableHead>
                    <TableHead className="text-gray-600">Loại xe</TableHead>
                    <TableHead className="text-gray-600">Màu sắc</TableHead>
                    <TableHead className="text-gray-600">Chủ sở hữu</TableHead>
                    <TableHead className="text-gray-600">Căn hộ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Render kết quả đã được phân trang (currentPagedResults) */}
                  {searchResults.map((vehicle) => ( 
                    <TableRow key={vehicle.number} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{vehicle.number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {vehicleTypeLabels[vehicle.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">{vehicle.color}</TableCell>
                      <TableCell className="text-gray-700">{vehicle.owner}</TableCell>
                      <TableCell className="text-gray-700">{vehicle.apt_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-600">Không tìm thấy phương tiện nào phù hợp</div>
            )}
            
            {/* PHẦN ĐIỀU KHIỂN PHÂN TRANG */}
            {totalResults > pageSize && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1} đến {Math.min(endIndex, totalResults)} trong tổng số {totalResults} kết quả
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Nút Quay lại */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="border-gray-300 hover:bg-gray-100 disabled:opacity-50 bg-transparent"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Các nút số trang */}
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

                        {/* Nút Kế tiếp */}
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}