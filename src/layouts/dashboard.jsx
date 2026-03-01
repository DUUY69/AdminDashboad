import { Routes, Route } from "react-router-dom";
import {
  Sidenav,
  DashboardNavbar,
  Footer,
} from "@/widgets/layout";
import { dashboardRoutesConfig, getDashboardRoutesForRole } from "@/routes";
import { useMaterialTailwindController, useAuth } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const { currentUser } = useAuth();
  const menuItems = getDashboardRoutesForRole(currentUser?.role);

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        menuItems={menuItems}
        brandName="Cafe - Đặt hàng NCC"
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80 pb-8">
        <DashboardNavbar />
        <Routes>
          {dashboardRoutesConfig.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer brandName="Multi-Supplier Order" brandLink="#" routes={[]} />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
