import { useState } from "react";
import SuperLayout from "../components/superAdmin/SuperLayout";
import RestaurantsManager from "../components/superadmin/RestaurantsManager";
import AdminsManager from "../components/superadmin/AdminsManager";

export default function SuperDashboard() {
  const [page, setPage] = useState("restaurants");

  return (
    <SuperLayout activePage={page} onNavigate={setPage}>
      {page === "restaurants" && <RestaurantsManager />}
      {page === "admins" && <AdminsManager />}
    </SuperLayout>
  );
}
