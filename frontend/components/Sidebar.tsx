"use client";

import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  Inbox, 
  List, 
  Archive,
  DollarSign,
  Calendar,
  ClipboardList,
  Users,
  Receipt,
  BarChart3,
  UsersRound,
  Table,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Package, label: "Products", active: false },
    { icon: Heart, label: "Favorites", active: false },
    { icon: Inbox, label: "Inbox", active: false },
    { icon: List, label: "Order Lists", active: false },
    { icon: Archive, label: "Product Stock", active: false },
  ];

  const pageItems = [
    { icon: DollarSign, label: "Pricing", active: false },
    { icon: Calendar, label: "Calendar", active: false },
    { icon: ClipboardList, label: "To-Do", active: false },
    { icon: Users, label: "Contact", active: false },
    { icon: Receipt, label: "Invoice", active: false },
    { icon: BarChart3, label: "UI Elements", active: false },
    { icon: UsersRound, label: "Team", active: false },
    { icon: Table, label: "Table", active: false },
  ];

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-y-auto shadow-2xl z-50 border border-slate-700/50">
      <div className="p-6">
        {/* Logo Section */}
        <div className="mb-10 pb-6 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-blue-400 font-bold text-xl">Blue</span>
                <span className="text-white font-bold text-xl">Moon</span>
              </div>
              <span className="text-slate-400 text-xs">Quản lý chung cư</span>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {/* Main Menu Items */}
          <div className="mb-6">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  item.active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full"></div>
                )}
                <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`} />
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                {item.active && (
                  <ChevronRight className="w-4 h-4 opacity-70" />
                )}
              </button>
            ))}
          </div>

          {/* Pages Section */}
          <div className="pt-4">
            <div className="flex items-center gap-2 px-4 pb-3">
              <div className="h-px flex-1 bg-slate-700"></div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pages
              </p>
              <div className="h-px flex-1 bg-slate-700"></div>
            </div>

            {pageItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  item.active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full"></div>
                )}
                <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`} />
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                {item.active && (
                  <ChevronRight className="w-4 h-4 opacity-70" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
