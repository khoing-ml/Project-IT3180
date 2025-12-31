"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PeriodComparison } from "@/lib/financialApi";

interface ComparisonCardProps {
  data: PeriodComparison;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function ComparisonCard({ data }: ComparisonCardProps) {
  const { period1, period2, comparison } = data;

  const renderTrend = (change: number, changePercent: string) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <TrendingUp className="h-5 w-5" />
          <span className="font-semibold">+{changePercent}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <TrendingDown className="h-5 w-5" />
          <span className="font-semibold">{changePercent}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Minus className="h-5 w-5" />
        <span className="font-semibold">0%</span>
      </div>
    );
  };

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <span className="inline-block w-1 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></span>
          So Sánh Tài Chính Giữa Các Kỳ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Kỳ trước</p>
              <p className="text-xl font-bold text-blue-700">{period1.period}</p>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Thu nhập</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(period1.total_income)}</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Phí phải thu</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(period1.total_charges)}</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Tỷ lệ thu</p>
                <p className="text-lg font-semibold text-gray-900">{period1.collection_rate}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="space-y-6 w-full">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 mb-2 text-center">Thay đổi thu nhập</p>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(comparison.income_change)}</p>
                  {renderTrend(comparison.income_change, comparison.income_change_percent)}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700 mb-2 text-center">Thay đổi phí</p>
                <p className="text-xl font-bold text-gray-900 text-center">{formatCurrency(comparison.charges_change)}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-700 mb-2 text-center">Thay đổi nợ</p>
                <p className="text-xl font-bold text-gray-900 text-center">{formatCurrency(comparison.debt_change)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Kỳ sau</p>
              <p className="text-xl font-bold text-purple-700">{period2.period}</p>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Thu nhập</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(period2.total_income)}</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Phí phải thu</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(period2.total_charges)}</p>
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Tỷ lệ thu</p>
                <p className="text-lg font-semibold text-gray-900">{period2.collection_rate}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
