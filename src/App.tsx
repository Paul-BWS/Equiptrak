import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
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
import SpotWelderList from "@/pages/SpotWelderList";
import CompressorListPage from "@/pages/CompressorListPage";
import LolerList from "@/pages/LolerList";
import RivetToolList from "@/pages/RivetToolList";
import PersonnelList from "@/pages/PersonnelList";
import EquipmentListPage from "@/pages/EquipmentList";
import WorkOrdersList from "@/pages/WorkOrdersList";
import ProductsList from "@/pages/ProductsList";
import SuppliersList from "@/pages/SuppliersList";
import TestUserPage from './pages/TestUserPage';
import UserManagementPage from './pages/UserManagementPage';
import TestServerConnection from '@/pages/TestServerConnection';
import { useEffect } from 'react';
import { refreshSession } from '@/integrations/supabase/client';

const queryClient = new QueryClient();

// Simple Home component
function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Home Page</h1>
      <p>Welcome to EquipTrack</p>
      <div>
        <Link to="/company/0cd307a7-c938-49da-b005-17746587ca8a">Go to Company Dashboard</Link>
      </div>
    </div>
  );
}

// Simple Company Dashboard component
function CompanyDashboard() {
  const { companyId } = useParams();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Company Dashboard</h1>
      <p>Company ID: {companyId}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

function App() {
  // Check and refresh session on app load and periodically
  useEffect(() => {
    // Refresh on load
    refreshSession();
    
    // Set up periodic refresh (every 30 minutes)
    const refreshInterval = setInterval(() => {
      refreshSession();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/company/:companyId" element={<CompanyDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/certificate/:recordId" element={<ServiceCertificatePage />} />
              <Route path="/certificate/:recordId/qr" element={<QRCodePrintPage />} />
              <Route path="/test-server" element={<TestServerConnection />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/customer/:customerId" element={<AdminCustomerDetails />} />
                <Route path="/admin/customer/:customerId/equipment-types" element={<EquipmentTypes />} />
                <Route path="/admin/customer/:customerId/equipment/spot-welder" element={<SpotWelderList />} />
                <Route path="/admin/customer/:customerId/equipment/compressor" element={<CompressorListPage />} />
                <Route path="/admin/customer/:customerId/equipment/loler" element={<LolerList />} />
                <Route path="/admin/customer/:customerId/equipment/rivet" element={<RivetToolList />} />
                <Route path="/admin/spot-welder/:id" element={<SpotWelderList />} />
                <Route path="/admin/service/:customerId" element={<AdminService />} />
                <Route path="/admin/service/:recordId/edit" element={<EditServicePage />} />
                <Route path="/admin/personnel" element={<PersonnelList />} />
                <Route path="/admin/equipment" element={<EquipmentListPage />} />
                <Route path="/admin/work-orders" element={<WorkOrdersList />} />
                <Route path="/admin/products" element={<ProductsList />} />
                <Route path="/admin/suppliers" element={<SuppliersList />} />
                <Route path="/test-user" element={<TestUserPage />} />
                <Route path="/user-management" element={<UserManagementPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;