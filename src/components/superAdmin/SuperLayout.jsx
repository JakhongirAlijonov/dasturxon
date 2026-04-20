import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Store, Users, LogOut, Menu, X, Shield } from "lucide-react";

export default function SuperLayout({ children, activePage, onNavigate }) {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { key: "restaurants", label: "Restaurants", icon: Store },
    { key: "admins", label: "Admins", icon: Users },
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

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-60 bg-gray-900 z-30 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-gray-900" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Super Admin</p>
                <p className="text-gray-400 text-xs truncate max-w-28">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white transition"
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
                    ? "bg-yellow-400 text-gray-900"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <span className="font-semibold text-gray-800 text-sm capitalize">
              {activePage}
            </span>
          </div>
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <Shield size={15} className="text-gray-900" />
          </div>
        </header>

        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
