"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { IncomeByApartment } from "@/lib/financialApi";

interface IncomeByApartmentProps {
  data?: IncomeByApartment[];
  loading?: boolean;
}

export function IncomeByApartmentTable({
  data = [],
  loading = false,
}: IncomeByApartmentProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thu nhập theo căn hộ</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã căn hộ</TableHead>
                <TableHead>Chủ hộ</TableHead>
                <TableHead className="text-right">
                  Tổng đã thanh toán
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.apt_id}>
                  <TableCell className="font-medium">
                    {item.apt_id}
                  </TableCell>
                  <TableCell>{item.owner_name || "-"}</TableCell>
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
  );
}
