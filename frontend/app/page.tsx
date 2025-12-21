"use client";

import Link from "next/link";
import { Wrench, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">BlueMoon</h1>
          </div>
          <p className="text-gray-600 ml-11">Hệ thống quản lý chung cư hiện đại</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Module 1: Quản lý sửa chữa */}
          <Link href="/maintenance">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
              <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Quản lý Sửa chữa</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Quản lý các yêu cầu sửa chữa từ cư dân. Theo dõi trạng thái, gán thợ sửa, 
                và quản lý chi phí sửa chữa cho các căn hộ.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Tạo yêu cầu sửa chữa mới</p>
                <p>✓ Theo dõi trạng thái công việc</p>
                <p>✓ Gán và quản lý thợ sửa</p>
                <p>✓ Quản lý chi phí</p>
              </div>
            </div>
          </Link>

          {/* Module 2: Thông tin chung cư */}
          <Link href="/building-info">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
              <div className="bg-cyan-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Thông tin Chung cư</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Quản lý thông tin tổng quan của chung cư. Cập nhật thông tin, quy định, 
                liên hệ quản lý, và các tiện ích chung.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Thông tin chung cư</p>
                <p>✓ Danh sách căn hộ</p>
                <p>✓ Quy định và nội quy</p>
                <p>✓ Tiện ích & liên hệ</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
