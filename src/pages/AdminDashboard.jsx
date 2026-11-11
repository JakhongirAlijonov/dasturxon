import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import DishesManager from "../components/admin/DishesManager";
import CategoriesManager from "../components/admin/CategoriesManager";
import StatisticsPage from "../components/admin/StatisticsPage";

export default function AdminDashboard() {
  const [page, setPage] = useState("dishes");

  return (
    <AdminLayout activePage={page} onNavigate={setPage}>
      {page === "dishes" && <DishesManager />}
      {page === "categories" && <CategoriesManager />}
      {page === "statistics" && <StatisticsPage />}
    </AdminLayout>
  );
}
