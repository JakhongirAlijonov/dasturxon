import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SuperDashboard = lazy(() => import("./pages/SuperDashboard"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-gold text-sm font-light tracking-widest uppercase">
          Dasturxon
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/menu/:restaurantId" element={<MenuPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["restaurant_admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
