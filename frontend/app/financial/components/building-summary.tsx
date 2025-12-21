"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BuildingFinancialSummary } from "@/lib/financialApi";

interface BuildingSummaryProps {
  summary: BuildingFinancialSummary | null;
}

export function BuildingSummary({ summary }: BuildingSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!summary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan tài chính tòa nhà</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tổng thu nhập</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_income)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tổng nợ hiện tại</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.total_due_current)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nợ cũ</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.total_pre_debt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tỷ lệ nợ</p>
            <p className="text-2xl font-bold">{summary.debt_ratio}</p>
          </div>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Căn hộ có nợ: <span className="font-semibold">{summary.apartments_in_debt}</span> /{" "}
            <span className="font-semibold">{summary.total_apartments}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

