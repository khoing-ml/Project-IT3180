"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import {
  Users,
  BarChart3,
  FileText,
  Wrench,
  Building2,
  Car,
  Clipboard,
  MessageSquare,
  UserCog,
  ShieldCheck,
  Home as HomeIcon,
  DollarSign,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();

  const functionCards = [
    {
      icon: Users,
      title: "Danh sách hộ dân",
      description: "Quản lý thông tin các hộ dân trong chung cư",
      gradient: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      icon: BarChart3,
      title: "Thống kê thu chi",
      description: "Theo dõi chi tiết các khoản thu chi của chung cư",
      gradient: "from-green-500 to-green-600",
      shadowColor: "shadow-green-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      icon: FileText,
      title: "Lập hóa đơn",
      description: "Tạo và quản lý hóa đơn cho các hộ dân",
      gradient: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    },
    {
      icon: Wrench,
      title: "Quản lý sửa chữa",
      description: "Theo dõi và xử lý các yêu cầu sửa chữa, bảo trì",
      gradient: "from-orange-500 to-orange-600",
      shadowColor: "shadow-orange-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    },
    {
      icon: Building2,
      title: "Thông tin chung cư",
      description: "Cập nhật thông tin về tòa nhà và tiện ích",
      gradient: "from-cyan-500 to-cyan-600",
      shadowColor: "shadow-cyan-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    },
    {
      icon: Car,
      title: "Quản lý xe",
      description: "Đăng ký và quản lý phương tiện giao thông",
      gradient: "from-pink-500 to-pink-600",
      shadowColor: "shadow-pink-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    },
    {
      icon: Clipboard,
      title: "Danh sách công việc",
      description: "Lập kế hoạch và theo dõi tiến độ công việc",
      gradient: "from-indigo-500 to-indigo-600",
      shadowColor: "shadow-indigo-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      icon: MessageSquare,
      title: "Thông báo - Góp ý",
      description: "Gửi thông báo và tiếp nhận phản hồi từ cư dân",
      gradient: "from-teal-500 to-teal-600",
      shadowColor: "shadow-teal-500/50",
      requiredRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    },
    {
      icon: UserCog,
      title: "Quản lý nhân viên",
      description: "Quản lý thông tin và phân công nhân viên",
      gradient: "from-red-500 to-red-600",
      shadowColor: "shadow-red-500/50",
      requiredRoles: [UserRole.ADMIN],
    },
    {
      icon: ShieldCheck,
      title: "Phân quyền",
      description: "Thiết lập quyền truy cập cho các vai trò",
      gradient: "from-yellow-500 to-yellow-600",
      shadowColor: "shadow-yellow-500/50",
      requiredRoles: [UserRole.ADMIN],
    },
  ];

  const quickStats = [
    {
      icon: HomeIcon,
      label: "Tổng số căn hộ",
      value: "248",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      label: "Số cư dân",
      value: "235",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Clock,
      label: "Yêu cầu chờ xử lý",
      value: "12",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      icon: DollarSign,
      label: "Thu nhập tháng này",
      value: "1.2 tỷ",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-72 mr-4">
          <Header />
          
          <main className="p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Chào mừng {user?.fullName || 'bạn'} đến với BlueMoon
              </h1>
              <p className="text-slate-600">
                Hệ thống quản lý chung cư thông minh và hiện đại
                {user?.role === UserRole.ADMIN && " - Quản trị viên"}
                {user?.role === UserRole.MANAGER && " - Quản lý"}
                {user?.role === UserRole.USER && user?.apartmentNumber && ` - Căn hộ ${user.apartmentNumber}`}
              </p>
            </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-3 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                <p className="text-slate-800 text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Function Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {functionCards
              .filter((card) => hasPermission(card.requiredRoles))
              .map((card, index) => (
              <button
                key={index}
                onClick={() => {
                  if (card.title === "Quản lý xe") router.push("/vehicles");
                  if (card.title === "Lập hóa đơn") router.push("/bills");
                }}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div className={`relative bg-gradient-to-br ${card.gradient} rounded-xl p-4 w-fit mb-4 shadow-lg ${card.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="relative text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="relative text-slate-600 text-sm leading-relaxed">
                  {card.description}
                </p>

                {/* Hover Arrow */}
                <div className="relative mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium">Xem chi tiết</span>
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
