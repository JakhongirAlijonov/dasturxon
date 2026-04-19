import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SuperDashboard from "./pages/SuperDashboard";
import MenuPage from "./pages/MenuPage";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Restaurant admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["restaurant_admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Super admin only */}
          <Route
            path="/super"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <SuperDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/menu/:restaurantId" element={<MenuPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
