import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import AdminService from "@/pages/AdminService";
import AdminCustomerDetails from "@/pages/AdminCustomerDetails";
import ServiceCertificate from "@/pages/ServiceCertificate";
import PrintCertificate from "@/pages/PrintCertificate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import AdminServiceDebug from "@/pages/AdminServiceDebug";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <AdminRoute><Admin /></AdminRoute>,
      },
      {
        path: "admin/customer/:customerId",
        element: (
          <AdminRoute>
            <ErrorBoundary fallback={<div className="container mx-auto p-6">
              <h2 className="text-xl font-bold mb-4">Error Loading Customer</h2>
              <p>There was a problem loading the customer details. Please try again.</p>
              <Button onClick={() => window.location.href = "/admin"} className="mt-4">
                Return to Customers
              </Button>
            </div>}>
              <AdminCustomerDetails />
            </ErrorBoundary>
          </AdminRoute>
        ),
      },
      {
        path: "admin/service/certificate/:certificateId/print",
        element: <AdminRoute><PrintCertificate /></AdminRoute>,
      },
      {
        path: "admin/service/certificate/:certificateId",
        element: <AdminRoute><ServiceCertificate /></AdminRoute>,
      },
      {
        path: "admin/service/:customerId",
        element: <AdminRoute><AdminService /></AdminRoute>,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}

export default Router; 