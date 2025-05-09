import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CompanyDetails from "@/pages/CompanyDetails";
import AdminDashboard from "@/pages/AdminDashboard";
import { Layout } from "@/components/Layout";
import EquipmentTypes from "@/pages/EquipmentTypes";
import CompressorList from "@/pages/CompressorList";
import SpotWelderList from "@/pages/SpotWelderList";
import AddSpotWelderPage from "@/pages/AddSpotWelderPage";
import EditSpotWelderPage from "@/pages/EditSpotWelderPage";
import SpotWelderCertificatePage from "@/pages/SpotWelderCertificatePage";
import { CompanyAllEquipment } from "@/pages/CompanyAllEquipment";
import ServiceCertificate from "@/pages/ServiceCertificate";
import ServicePage from "@/pages/Service";
import ProductsList from "@/pages/ProductsList";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import WorkOrdersList from "@/pages/WorkOrdersList";
import WorkOrderPage from "@/pages/WorkOrderPage";
import EquipmentListPage from "@/pages/EquipmentList";
import LiftServiceList from "@/pages/LiftServiceList";
import LiftServiceForm from "@/pages/LiftServiceForm";
import LiftCertificate from "@/pages/LiftCertificate";
import ServiceInspectionDetailsPage from "@/pages/ServiceInspectionDetailsPage";
import AdminReminders from "@/pages/AdminReminders";
import CompressorsPage from "@/pages/CompressorsPage";
import AddCompressorPage from "@/pages/AddCompressorPage";
import QRCodePrintPage from "@/pages/QRCodePrintPage";
import ServiceForm from "@/pages/ServiceForm";

// Create a client
const queryClient = new QueryClient();

// Root redirect component
const RootRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? "/admin" : "/dashboard"} replace />;
};

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'user' }) => {
  const { user, isLoading } = useAuth();
  console.log('ProtectedRoute - User:', user?.email, 'Role:', user?.role, 'Required Role:', requiredRole);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requiredRole) {
    if (user.role !== requiredRole) {
      console.log('ProtectedRoute - Wrong role, redirecting to appropriate dashboard');
      // Redirect admin to admin dashboard, users to user dashboard
      return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="equiptrak-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="w-full max-w-[100vw] overflow-x-hidden">
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route element={<Layout />}>
                  <Route path="/" element={<RootRedirect />} />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin-reminders" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminReminders />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="user">
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/company/:id" element={
                    <ProtectedRoute>
                      <CompanyDetails />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/equipment-types" element={
                    <ProtectedRoute>
                      <EquipmentTypes />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/compressors" element={
                    <ProtectedRoute>
                      <CompressorList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/compressors" element={
                    <ProtectedRoute>
                      <CompressorsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/equipment-list" element={
                    <ProtectedRoute requiredRole="admin">
                      <EquipmentListPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/spot-welders" element={
                    <ProtectedRoute>
                      <SpotWelderList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/add-spot-welder" element={
                    <ProtectedRoute>
                      <AddSpotWelderPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/edit-spot-welder/:id" element={
                    <ProtectedRoute>
                      <EditSpotWelderPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/spot-welder-certificate/:id" element={
                    <ProtectedRoute>
                      <SpotWelderCertificatePage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/company/:id/equipment" element={
                    <ProtectedRoute>
                      <CompanyAllEquipment />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/products" element={
                    <ProtectedRoute requiredRole="admin">
                      <ProductsList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/products/:productId" element={
                    <ProtectedRoute requiredRole="admin">
                      <ProductDetailsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-certificate/:id" element={
                    <ProtectedRoute>
                      <ServiceCertificate />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-certificate/:id/qr" element={
                    <ProtectedRoute>
                      <QRCodePrintPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service" element={
                    <ProtectedRoute>
                      <ServicePage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service/new" element={
                    <ProtectedRoute>
                      <ServiceForm />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service/edit/:id" element={
                    <ProtectedRoute>
                      <ServiceForm />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/work-orders" element={
                    <ProtectedRoute>
                      <WorkOrdersList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/work-orders/new" element={
                    <ProtectedRoute>
                      <WorkOrderPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/work-orders/:id" element={
                    <ProtectedRoute>
                      <WorkOrderPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/work-orders/:id/:companyId" element={
                    <ProtectedRoute>
                      <WorkOrderPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/lift-service" element={
                    <ProtectedRoute>
                      <LiftServiceList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/lift-service/new" element={
                    <ProtectedRoute>
                      <LiftServiceForm />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/lift-service/edit/:id" element={
                    <ProtectedRoute>
                      <LiftServiceForm />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/lift-certificate/:id" element={
                    <ProtectedRoute>
                      <LiftCertificate />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-inspection/details" element={
                    <ProtectedRoute>
                      <ServiceInspectionDetailsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-inspection/details/:id" element={
                    <ProtectedRoute>
                      <ServiceInspectionDetailsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/compressor-certificate/:id" element={
                    <ProtectedRoute>
                      <ServiceCertificate />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/add-compressor" element={
                    <ProtectedRoute>
                      <AddCompressorPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/qr-print/spot-welder/:id" element={
                    <ProtectedRoute>
                      <QRCodePrintPage />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App; 