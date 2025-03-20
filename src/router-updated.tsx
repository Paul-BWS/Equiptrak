import { createBrowserRouter, RouterProvider, useRouteError, isRouteErrorResponse } from "react-router-dom";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import AdminService from "@/pages/AdminService";
import AdminCustomerDetails from "@/pages/AdminCustomerDetails";
import ServiceCertificate from "@/pages/ServiceCertificate";
import PrintCertificate from "@/pages/PrintCertificate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRouteFixed } from "@/components/AdminRouteFixed";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import AdminServiceDebug from "@/pages/AdminServiceDebug";
import AdminUserCreate from "@/pages/AdminUserCreate";
import SqlUserCreator from "@/pages/SqlUserCreator";
import TestPage from "@/pages/TestPage";
import CompanyDashboard from "@/pages/CompanyDashboard";
import { CustomerSimple } from "@/pages/CustomerSimple";
import { CompanySimple } from "@/pages/CompanySimple";
import AdminEquipment from "@/pages/AdminEquipment";
import { EquipmentTypes } from "@/pages/EquipmentTypes";
import { UserEquipment } from "@/pages/UserEquipment";
import { CompanyAllEquipment } from "@/pages/CompanyAllEquipment";
import CompressorList from "@/pages/CompressorList";
import SpotWelderList from "@/pages/SpotWelderList";
import RivetToolList from "@/pages/RivetToolList";
import LolerList from "@/pages/LolerList";
import PostgresTestPage from "@/pages/PostgresTestPage";
import DatabaseMigration from "@/pages/DatabaseMigration";
import NotFound from "@/pages/NotFound";

// Custom error boundary component
function ErrorPage() {
  const error = useRouteError();
  console.error("Route error:", error);
  
  let errorMessage = "An unexpected error occurred";
  let statusText = "Error";
  let status = "500";
  
  if (isRouteErrorResponse(error)) {
    statusText = error.statusText;
    status = String(error.status);
    errorMessage = error.data?.message || "Something went wrong";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-red-600 mb-2">{status} - {statusText}</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <div className="flex flex-col gap-4">
          <Button onClick={() => window.location.href = "/"} className="w-full">
            Go to Home Page
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "admin-login",
        element: <AdminLogin />,
      },
      {
        path: "dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "dashboard/company/:companyId",
        element: <ProtectedRoute><CompanyDashboard /></ProtectedRoute>,
      },
      {
        path: "dashboard/company-simple",
        element: <ProtectedRoute><CompanySimple /></ProtectedRoute>,
      },
      {
        path: "dashboard/equipment",
        element: <ProtectedRoute><UserEquipment /></ProtectedRoute>,
      },
      {
        path: "dashboard/company-equipment",
        element: <ProtectedRoute><CompanyAllEquipment /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <AdminRouteFixed><Admin /></AdminRouteFixed>,
      },
      {
        path: "admin/users/create",
        element: <AdminRouteFixed><AdminUserCreate /></AdminRouteFixed>,
      },
      {
        path: "admin/users/sql-creator",
        element: <SqlUserCreator />,
      },
      {
        path: "test",
        element: <TestPage />,
      },
      {
        path: "postgres-test",
        element: <PostgresTestPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "database-migration",
        element: <AdminRouteFixed><DatabaseMigration /></AdminRouteFixed>,
        errorElement: <ErrorPage />,
      },
      {
        path: "admin/customer-simple",
        element: <AdminRouteFixed><CustomerSimple /></AdminRouteFixed>,
      },
      {
        path: "admin/customer/:customerId",
        element: (
          <AdminRouteFixed>
            <ErrorBoundary fallback={<div className="container mx-auto p-6">
              <h2 className="text-xl font-bold mb-4">Error Loading Customer</h2>
              <p>There was a problem loading the customer details. Please try again.</p>
              <Button onClick={() => window.location.href = "/admin"} className="mt-4">
                Return to Customers
              </Button>
            </div>}>
              <AdminCustomerDetails />
            </ErrorBoundary>
          </AdminRouteFixed>
        ),
      },
      {
        path: "admin/service/certificate/:certificateId/print",
        element: <AdminRouteFixed><PrintCertificate /></AdminRouteFixed>,
      },
      {
        path: "admin/service/certificate/:certificateId",
        element: <AdminRouteFixed><ServiceCertificate /></AdminRouteFixed>,
      },
      {
        path: "admin/service/:customerId",
        element: <AdminRouteFixed><AdminService /></AdminRouteFixed>,
      },
      {
        path: "admin/equipment",
        element: <AdminRouteFixed><AdminEquipment /></AdminRouteFixed>,
      },
      {
        path: "admin/customer/:customerId/equipment-types",
        element: <AdminRouteFixed><EquipmentTypes /></AdminRouteFixed>,
      },
      {
        path: "admin/customer/:customerId/compressor-list",
        element: <AdminRouteFixed><CompressorList /></AdminRouteFixed>,
      },
      {
        path: "admin/customer/:customerId/spotwelder-list",
        element: <AdminRouteFixed><SpotWelderList /></AdminRouteFixed>,
      },
      {
        path: "admin/customer/:customerId/rivet-tool-list",
        element: <AdminRouteFixed><RivetToolList /></AdminRouteFixed>,
      },
      {
        path: "admin/customer/:customerId/loler-list",
        element: <AdminRouteFixed><LolerList /></AdminRouteFixed>,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}

export default Router; 