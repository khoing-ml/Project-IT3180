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
import { Badge } from "../components/ui/badge";
import { FinancialByFloor } from "@/lib/financialApi";

interface FinancialByFloorProps {
  data: FinancialByFloor[];
  loading?: boolean;
}

export function FinancialByFloorTable({ data, loading }: FinancialByFloorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tài chính theo tầng</CardTitle>
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
                <TableHead>Tầng</TableHead>
                <TableHead className="text-right">Đã thanh toán</TableHead>
                <TableHead className="text-right">Nợ hiện tại</TableHead>
                <TableHead className="text-right">Nợ cũ</TableHead>
                <TableHead className="text-right">Tỷ lệ thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.display}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(item.total_paid)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    {formatCurrency(item.total_due_current)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(item.current_pre_debt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{item.collection_rate}</Badge>
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

