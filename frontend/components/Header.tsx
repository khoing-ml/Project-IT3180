"use client";

import { Menu, Search, Moon, Sun, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import NotificationPanel from "./NotificationPanel";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Quản trị viên";
      case UserRole.MANAGER:
        return "Quản lý";
      case UserRole.USER:
        return "Cư dân";
      default:
        return "Người dùng";
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Admin";
      case UserRole.MANAGER:
        return "Manager";
      case UserRole.USER:
        return "User";
      default:
        return "";
    }
  };

  return (
    <header className="sticky top-4 mx-4 mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl px-8 py-4 shadow-2xl border border-slate-700/50 backdrop-blur-xl bg-opacity-95 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <Menu className="w-6 h-6 text-slate-300" />
          </button>
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-200 placeholder:text-slate-500 hover:bg-slate-800"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Panel */}
          <NotificationPanel />

          {/* Theme Toggle */}
          <button className="relative p-2.5 hover:bg-slate-800 rounded-xl transition-all group">
            <div className="relative w-5 h-5">
              <Sun className="w-5 h-5 text-slate-300 group-hover:text-yellow-400 transition-all absolute inset-0 rotate-0 scale-100 group-hover:rotate-90" />
              <Moon className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-all absolute inset-0 rotate-90 scale-0 group-hover:rotate-0 group-hover:scale-100" />
            </div>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-200">
                {user?.fullName || "Người dùng"}
              </p>
              <p className="text-xs text-slate-400">
                {user ? getRoleBadge(user.role) : "Guest"}
              </p>
            </div>
            <button className="relative group">
              <div className="w-10 h-10 rounded-full ring-2 ring-slate-700 group-hover:ring-blue-500 transition-all overflow-hidden">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=3B82F6&color=fff&bold=true`}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-500/10 rounded-xl transition-all group border border-transparent hover:border-red-500/30"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5 text-slate-300 group-hover:text-red-400 transition-colors" />
              <span className="hidden sm:inline text-sm font-medium text-slate-300 group-hover:text-red-400 transition-colors">
                Đăng xuất
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
