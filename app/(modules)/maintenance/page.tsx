"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface MaintenanceRequest {
  id: string;
  apartment: string;
  resident: string;
  phone: string;
  issue: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  date: string;
  assignedTo?: string;
  cost?: number;
  notes?: string;
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    apartment: "",
    resident: "",
    phone: "",
    issue: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/maintenance");
        const data = await response.json();
        setRequests(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        // Use mock data if backend is not available
        setRequests([
          {
            id: "M001",
            apartment: "A101",
            resident: "Nguyễn Văn A",
            phone: "0912345678",
            issue: "Vòi nước bồn tắm bị rò rỉ",
            status: "in-progress",
            priority: "high",
            date: "2025-12-19",
            assignedTo: "Thợ Minh",
            cost: 250000,
            notes: "Thay van"
          }
        ]);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAddRequest = async () => {
    if (!formData.apartment || !formData.resident || !formData.issue) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const newRequest = await response.json();
      setRequests([...requests, newRequest]);
      setFormData({ apartment: "", resident: "", phone: "", issue: "", priority: "medium" });
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể tạo yêu cầu. Backend có thể không chạy.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              Quản lý Sửa chữa
            </h1>
            <p className="text-gray-600 mt-1">Quản lý yêu cầu sửa chữa từ cư dân</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Yêu cầu mới
          </button>
        </div>
      </div>

      {/* Form Thêm yêu cầu */}
      {showForm && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo yêu cầu sửa chữa mới</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Số căn hộ"
                value={formData.apartment}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Tên cư dân"
                value={formData.resident}
                onChange={(e) => setFormData({ ...formData, resident: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="low">Mức độ thấp</option>
                <option value="medium">Mức độ trung bình</option>
                <option value="high">Mức độ cao</option>
              </select>
              <textarea
                placeholder="Mô tả vấn đề"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                className="border border-gray-300 rounded px-3 py-2 md:col-span-2"
                rows={3}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddRequest}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition"
              >
                Tạo yêu cầu
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách yêu cầu */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Căn hộ</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cư dân</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vấn đề</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ưu tiên</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Chi phí</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{request.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{request.apartment}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>{request.resident}</div>
                        <div className="text-xs text-gray-500">{request.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{request.issue}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                          {request.status === "pending" && "Chờ xử lý"}
                          {request.status === "in-progress" && "Đang xử lý"}
                          {request.status === "completed" && "Hoàn thành"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(request.priority)}`}>
                          {request.priority === "low" && "Thấp"}
                          {request.priority === "medium" && "Trung bình"}
                          {request.priority === "high" && "Cao"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{request.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Tổng yêu cầu</div>
                <div className="text-3xl font-bold text-gray-800">{requests.length}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Chờ xử lý</div>
                <div className="text-3xl font-bold text-yellow-600">{requests.filter(r => r.status === "pending").length}</div>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Đang xử lý</div>
                <div className="text-3xl font-bold text-blue-600">{requests.filter(r => r.status === "in-progress").length}</div>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Hoàn thành</div>
                <div className="text-3xl font-bold text-green-600">{requests.filter(r => r.status === "completed").length}</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
