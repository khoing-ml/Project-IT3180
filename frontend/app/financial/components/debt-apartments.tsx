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
import { ApartmentFinancialSummary } from "@/lib/financialApi";

interface DebtApartmentsProps {
  data: ApartmentFinancialSummary[];
  loading?: boolean;
}

export function DebtApartmentsTable({ data, loading }: DebtApartmentsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Căn hộ có nợ</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Không có căn hộ nào có nợ</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã căn hộ</TableHead>
                <TableHead className="text-right">Phí mới</TableHead>
                <TableHead className="text-right">Nợ cũ</TableHead>
                <TableHead className="text-right">Tổng nợ</TableHead>
                <TableHead className="text-right">Đã thanh toán</TableHead>
                <TableHead className="text-right">Còn nợ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.apt_id}>
                  <TableCell className="font-medium">{item.apt_id}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.new_charges_current)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(item.pre_debt)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-orange-600">
                    {formatCurrency(item.total_due_current)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(item.total_paid_all_time)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">
                      {formatCurrency(item.current_remaining_debt)}
                    </Badge>
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

