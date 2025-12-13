"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Search, X } from "lucide-react"

// Mock data - all vehicles in the system
const allVehicles = [
  {
    id: "1",
    licensePlate: "29A-12345",
    type: "car",
    color: "Đen",
    owner: "Nguyễn Văn A",
    apartment: "A-101",
  },
  {
    id: "2",
    licensePlate: "29B-67890",
    type: "car",
    color: "Trắng",
    owner: "Nguyễn Văn A",
    apartment: "A-101",
  },
  {
    id: "3",
    licensePlate: "29C-11111",
    type: "motorbike",
    color: "Đỏ",
    owner: "Trần Thị B",
    apartment: "A-101",
  },
  {
    id: "4",
    licensePlate: "29D-22222",
    type: "car",
    color: "Xanh dương",
    owner: "Lê Văn C",
    apartment: "B-205",
  },
  {
    id: "5",
    licensePlate: "29E-33333",
    type: "motorbike",
    color: "Đen",
    owner: "Phạm Thị D",
    apartment: "A-303",
  },
  {
    id: "6",
    licensePlate: "29F-44444",
    type: "bike",
    color: "Xanh lá",
    owner: "Hoàng Văn E",
    apartment: "C-102",
  },
]

const vehicleTypeLabels: Record<string, string> = {
  car: "Ô tô",
  motorbike: "Xe máy",
  bike: "Xe đạp",
}

export function SearchTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "",
    color: "",
    apartment: "",
    owner: "",
  })
  const [searchResults, setSearchResults] = useState<typeof allVehicles>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    console.log("[v0] Searching with:", { searchTerm, filters })
    setHasSearched(true)

    // Filter vehicles based on search criteria
    let results = allVehicles

    if (searchTerm) {
      results = results.filter((v) => v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filters.type) {
      results = results.filter((v) => v.type === filters.type)
    }

    if (filters.color) {
      results = results.filter((v) => v.color.toLowerCase().includes(filters.color.toLowerCase()))
    }

    if (filters.apartment) {
      results = results.filter((v) => v.apartment.toLowerCase().includes(filters.apartment.toLowerCase()))
    }

    if (filters.owner) {
      results = results.filter((v) => v.owner.toLowerCase().includes(filters.owner.toLowerCase()))
    }

    setSearchResults(results)
  }

  const handleReset = () => {
    setSearchTerm("")
    setFilters({
      type: "",
      color: "",
      apartment: "",
      owner: "",
    })
    setSearchResults([])
    setHasSearched(false)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Tìm kiếm phương tiện</CardTitle>
          <CardDescription className="text-gray-600">
            Nhập biển số xe và sử dụng bộ lọc để tìm kiếm thông tin xe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="licensePlate" className="text-gray-700">
              Biển số xe
            </Label>
            <div className="flex gap-2">
              <Input
                id="licensePlate"
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
              <Input
                id="colorFilter"
                placeholder="Màu sắc"
                value={filters.color}
                onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartmentFilter" className="text-gray-700">
                Căn hộ
              </Label>
              <Input
                id="apartmentFilter"
                placeholder="VD: A-101"
                value={filters.apartment}
                onChange={(e) => setFilters({ ...filters, apartment: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerFilter" className="text-gray-700">
                Chủ sở hữu
              </Label>
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

      {hasSearched && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Kết quả tìm kiếm</CardTitle>
            <CardDescription className="text-gray-600">Tìm thấy {searchResults.length} phương tiện</CardDescription>
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
                  {searchResults.map((vehicle) => (
                    <TableRow key={vehicle.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{vehicle.licensePlate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {vehicleTypeLabels[vehicle.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">{vehicle.color}</TableCell>
                      <TableCell className="text-gray-700">{vehicle.owner}</TableCell>
                      <TableCell className="text-gray-700">{vehicle.apartment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-600">Không tìm thấy phương tiện nào phù hợp</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
