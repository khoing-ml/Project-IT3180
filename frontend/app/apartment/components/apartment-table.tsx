"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Loader2 } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface ApartmentTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
}

export function ApartmentTable<T>({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
}: ApartmentTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render
                      ? col.render(row)
                      : (row as any)[col.key] ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total_pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  pagination.page > 1 &&
                  onPageChange?.(pagination.page - 1)
                }
                className={
                  pagination.page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from(
              { length: pagination.total_pages },
              (_, i) => i + 1
            )
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.total_pages ||
                  Math.abs(p - pagination.page) <= 1
              )
              .map((page, i, arr) => (
                <div key={page} className="flex items-center gap-1">
                  {i > 0 && page - arr[i - 1] > 1 && (
                    <span className="px-2">...</span>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      isActive={page === pagination.page}
                      onClick={() => onPageChange?.(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                </div>
              ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  pagination.page < pagination.total_pages &&
                  onPageChange?.(pagination.page + 1)
                }
                className={
                  pagination.page === pagination.total_pages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
