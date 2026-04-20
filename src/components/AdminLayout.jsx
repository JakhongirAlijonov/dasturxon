import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { UtensilsCrossed, Tag, LogOut, Menu, X, ChefHat } from "lucide-react";

export default function AdminLayout({ children, activePage, onNavigate }) {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { key: "dishes", label: t("admin.dishes"), icon: UtensilsCrossed },
    { key: "categories", label: t("admin.categories"), icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — only shows when sidebarOpen is true on mobile */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-60 bg-blue-900 z-30 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <ChefHat size={18} className="text-blue-900" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Dasturxon</p>
                <p className="text-blue-300 text-xs truncate max-w-28">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-blue-300 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
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
                    : "text-blue-200 hover:text-white hover:bg-blue-800"
                }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-blue-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-blue-300 hover:text-white hover:bg-blue-800 transition"
          >
            <LogOut size={17} />
            {t("admin.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col min-h-screen">
        {/* Top bar — always visible */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <span className="font-semibold text-gray-800 text-sm capitalize">
              {activePage === "dishes"
                ? t("admin.dishes")
                : t("admin.categories")}
            </span>
          </div>
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <ChefHat size={15} className="text-blue-900" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
