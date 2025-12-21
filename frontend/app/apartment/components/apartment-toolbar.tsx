"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Plus, RefreshCw } from "lucide-react";

interface ApartmentToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  onRefresh: () => void;
}

export function ApartmentToolbar({
  search,
  onSearchChange,
  onAddClick,
  onRefresh,
}: ApartmentToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã căn hộ, tên chủ hộ, số điện thoại..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
        <Button size="sm" onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm căn hộ
        </Button>
      </div>
    </div>
  );
}

