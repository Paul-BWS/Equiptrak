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
import CompaniesListMobilePage from "@/pages/CompaniesListMobilePage";
import { CompanyDetailsMobile } from "@/components/mobile/CompanyDetailsMobile";
import ContactsPage from "@/pages/mobile/ContactsPage";
import ContactDetailsPage from "@/pages/mobile/ContactDetailsPage";

// Create a client
const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const RootRedirect = () => {
  const { user } = useAuth();
  const isMobile = window.innerWidth <= 768;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isMobile) {
    return <Navigate to="/mobile/companies" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user } = useAuth();
  console.log('ProtectedRoute - Checking auth for role:', requiredRole);

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute - Wrong role, redirecting to appropriate dashboard');
    return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

function App() {
  console.log("App component - Initializing");
  
  return (
    <Router>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="equiptrak-theme"
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="min-h-screen w-full max-w-[100vw] bg-background text-foreground antialiased">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RootRedirect />} />

                {/* Mobile Routes */}
                <Route path="/mobile/companies" element={
                  <ProtectedRoute>
                    <div className="bg-background">
                      <CompaniesListMobilePage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/mobile/companies/:id" element={
                  <ProtectedRoute>
                    <div className="bg-background">
                      <CompanyDetailsMobile />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/mobile/company/:id" element={
                  <ProtectedRoute>
                    <div className="bg-background">
                      <CompanyDetailsMobile />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/mobile/company/:id/contacts" element={
                  <ProtectedRoute>
                    <div className="bg-background">
                      <ContactsPage />
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/mobile/company/:id/contacts/:contactId" element={
                  <ProtectedRoute>
                    <div className="bg-background">
                      <ContactDetailsPage />
                    </div>
                  </ProtectedRoute>
                } />

                {/* Desktop Routes */}
                <Route element={<Layout />}>
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
                  
                  <Route path="/equipment-list" element={
                    <ProtectedRoute>
                      <EquipmentListPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/company/:id/equipment" element={
                    <ProtectedRoute>
                      <CompanyAllEquipment />
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
                  
                  <Route path="/service-certificate/:id" element={
                    <ProtectedRoute>
                      <ServiceCertificate />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-inspection/:id" element={
                    <ProtectedRoute>
                      <ServiceInspectionDetailsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/products" element={
                    <ProtectedRoute>
                      <ProductsList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/products/:id" element={
                    <ProtectedRoute>
                      <ProductDetailsPage />
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
                  
                  <Route path="/compressors" element={
                    <ProtectedRoute>
                      <CompressorsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/compressors/new" element={
                    <ProtectedRoute>
                      <AddCompressorPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/qr-code/:id" element={
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