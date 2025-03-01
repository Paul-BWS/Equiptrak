import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import { AdminPage } from "@/pages/AdminPage";
import { AdminCustomerDetails } from "@/pages/AdminCustomerDetails";
import { EquipmentTypes } from "@/pages/EquipmentTypes";
import AdminService from "@/pages/AdminService";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceCertificate from "@/pages/ServiceCertificate";
import ServiceCertificatePage from "@/pages/ServiceCertificatePage";
import EditServicePage from "@/pages/EditServicePage";
import QRCodePrintPage from "@/pages/QRCodePrintPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/certificate/:recordId" element={<ServiceCertificatePage />} />
              <Route path="/certificate/:recordId/qr" element={<QRCodePrintPage />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/customer/:customerId" element={<AdminCustomerDetails />} />
                <Route path="/admin/customer/:customerId/equipment-types" element={<EquipmentTypes />} />
                <Route path="/admin/service/:customerId" element={<AdminService />} />
                <Route path="/admin/service/:recordId/edit" element={<EditServicePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;