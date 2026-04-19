import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout({ children, activePage, onNavigate }) {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { key: "dishes", label: t("admin.dishes"), icon: UtensilsCrossed },
    { key: "categories", label: t("admin.categories"), icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-30
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold text-yellow-400">Dasturxon</h1>
          <p className="text-blue-300 text-xs mt-1 truncate">{user?.email}</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                ${
                  activePage === item.key
                    ? "bg-yellow-400 text-blue-900"
                    : "text-blue-200 hover:bg-blue-800"
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-blue-300 hover:bg-blue-800 transition"
          >
            <LogOut size={18} />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-800">
            {t("admin.dashboard")}
          </h2>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
