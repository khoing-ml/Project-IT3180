"use client";

import { ColumnDef } from "@tanstack/react-table";
import { type Apartment } from "@/lib/apartmentApi";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

export const getStatusBadge = (status?: string) => {
  switch (status) {
    case "occupied":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Đã có người ở
        </Badge>
      );
    case "vacant":
      return (
        <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
          Trống
        </Badge>
      );
    case "rented":
      return (
        <Badge variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white border-orange-600">
          Cho thuê
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">-</Badge>
      );
  }
};

export const apartmentColumns = (
  onEdit: (apartment: Apartment) => void,
  onDelete: (apartment: Apartment) => void
): ColumnDef<Apartment>[] => [
  {
    accessorKey: "apt_id",
    header: "Mã căn hộ",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("apt_id")}</div>;
    },
  },
  {
    accessorKey: "floor",
    header: "Tầng",
    cell: ({ row }) => {
      const floor = row.getValue("floor") as number | undefined;
      return <div>{floor ? `Tầng ${floor}` : "-"}</div>;
    },
  },
  {
    accessorKey: "area",
    header: "Diện tích (m²)",
    cell: ({ row }) => {
      const area = row.getValue("area") as number | undefined;
      return <div>{area ? `${area} m²` : "-"}</div>;
    },
  },
  {
    accessorKey: "owner_name",
    header: "Chủ hộ",
    cell: ({ row }) => {
      return <div>{row.getValue("owner_name") || "-"}</div>;
    },
  },
  {
    accessorKey: "owner_phone",
    header: "Số điện thoại",
    cell: ({ row }) => {
      return <div>{row.getValue("owner_phone") || "-"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | undefined;
      return getStatusBadge(status);
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const apartment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(apartment)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(apartment)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

